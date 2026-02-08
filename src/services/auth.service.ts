import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { query, getClient } from '../config/database';
import { AppError } from '../utils/AppError';

const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  password: string;
  display_name?: string;
  preferred_language?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    display_name: string | null;
    preferred_language: string;
    created_at: Date;
    updated_at?: Date;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await query<{ id: string }>(
    'SELECT id FROM users WHERE email = $1',
    [input.email]
  );
  if (existing.length > 0) {
    throw new AppError('User already exists with this email', 409, 'CONFLICT');
  }
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const preferredLanguage = input.preferred_language ?? 'en';

  const users = await query<{ id: string; email: string; display_name: string | null; preferred_language: string; created_at: Date; updated_at: Date }>(
    `INSERT INTO users (email, password_hash, display_name, preferred_language)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, display_name, preferred_language, created_at, updated_at`,
    [input.email, passwordHash, input.display_name ?? null, preferredLanguage]
  );
  const user = users[0];
  if (!user) throw new AppError('Registration failed', 500);

  const tokens = await createTokens(user.id, input.email);
  return { user, ...tokens };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const users = await query<{
    id: string;
    email: string;
    password_hash: string;
    display_name: string | null;
    preferred_language: string;
    created_at: Date;
    updated_at: Date;
  }>(
    'SELECT id, email, password_hash, display_name, preferred_language, created_at, updated_at FROM users WHERE email = $1 AND is_active = true',
    [input.email]
  );
  const user = users[0];
  if (!user || !user.password_hash) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }
  let valid: boolean;
  try {
    valid = await bcrypt.compare(input.password, user.password_hash);
  } catch {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }
  if (!valid) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  await query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [user.id]
  );

  const tokens = await createTokens(user.id, user.email);
  return {
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      preferred_language: user.preferred_language,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    ...tokens,
  };
}

async function createTokens(
  userId: string,
  email: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}> {
  const accessToken = jwt.sign(
    { userId, email, type: 'access' } as const,
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
  );
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  try {
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  } catch (err) {
    const code = (err as { code?: string }).code;
    const msg = (err as Error).message ?? '';
    if (code === '42P01' || msg.includes('does not exist')) {
      throw new AppError(
        'Database schema incomplete. Run: npm run db:setup (or psql $DATABASE_URL -f scripts/migrate-refresh-tokens.sql)',
        503,
        'SERVICE_UNAVAILABLE'
      );
    }
    throw err;
  }

  return {
    accessToken,
    refreshToken,
    expiresIn: env.jwtExpiresIn,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<AuthResult> {
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const rows = await query<{
    user_id: string;
    email: string;
    display_name: string | null;
    preferred_language: string;
    created_at: Date;
  }>(
    `SELECT u.id AS user_id, u.email, u.display_name, u.preferred_language, u.created_at
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1 AND rt.expires_at > NOW() AND rt.revoked_at IS NULL AND u.is_active = true`,
    [tokenHash]
  );
  const row = rows[0];
  if (!row) {
    throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
  }
  const client = await getClient();
  try {
    await client.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1',
      [tokenHash]
    );
    const tokens = await createTokens(row.user_id, row.email);
    return {
      user: {
        id: row.user_id,
        email: row.email,
        display_name: row.display_name,
        preferred_language: row.preferred_language,
        created_at: row.created_at,
      },
      ...tokens,
    };
  } finally {
    client.release();
  }
}
