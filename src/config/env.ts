import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (works when running from repo root or from dist/)
const projectRoot = path.resolve(__dirname, '..', '..');
dotenv.config({ path: path.join(projectRoot, '.env') });
dotenv.config(); // fallback: cwd

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  /** Google Gemini API key for chat and summarization. Set in .env as GEMINI_API_KEY. */
  geminiApiKey: (process.env.GEMINI_API_KEY ?? '').trim(),
  /** YouTube Data API key for learning course video search. Set in .env as YOUTUBE_API_KEY. */
  youtubeApiKey: (process.env.YOUTUBE_API_KEY ?? '').trim(),
} as const;

if (env.nodeEnv === 'production' && env.jwtSecret === 'dev-secret-change-me') {
  console.warn(
    'WARNING: Using default JWT_SECRET in production! Please set a secure JWT_SECRET in your .env file.'
  );
}
