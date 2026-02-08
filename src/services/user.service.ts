import { query } from '../config/database';
import { AppError } from '../utils/AppError';

export interface UpdateProfileInput {
  display_name?: string;
  avatar_url?: string;
  preferred_language?: 'en' | 'bn';
}

export async function getProfile(userId: string) {
  const rows = await query<{
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    preferred_language: string;
    created_at: Date;
    updated_at: Date;
    last_login_at: Date | null;
  }>(
    `SELECT id, email, display_name, avatar_url, preferred_language, created_at, updated_at, last_login_at
     FROM users WHERE id = $1 AND is_active = true`,
    [userId]
  );
  const user = rows[0];
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (input.display_name !== undefined) {
    updates.push(`display_name = $${i++}`);
    values.push(input.display_name);
  }
  if (input.avatar_url !== undefined) {
    updates.push(`avatar_url = $${i++}`);
    values.push(input.avatar_url);
  }
  if (input.preferred_language !== undefined) {
    updates.push(`preferred_language = $${i++}`);
    values.push(input.preferred_language);
  }
  if (updates.length === 0) return getProfile(userId);
  values.push(userId);
  const rows = await query<{
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    preferred_language: string;
    created_at: Date;
    updated_at: Date;
  }>(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${i} AND is_active = true
     RETURNING id, email, display_name, avatar_url, preferred_language, created_at, updated_at`,
    values
  );
  const user = rows[0];
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
}
