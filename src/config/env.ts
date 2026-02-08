import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (works when running from repo root or from dist/)
// override: true ensures .env values take precedence over stale shell env vars
const projectRoot = path.resolve(__dirname, '..', '..');
dotenv.config({ path: path.join(projectRoot, '.env'), override: true });
dotenv.config({ override: true }); // fallback: cwd

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  /** Google Gemini API key for chat and summarization. Set in .env as GEMINI_API_KEY. */
  geminiApiKey: (process.env.GEMINI_API_KEY ?? '').trim(),
  /** Groq API key for chat and summarization. Set in .env as GROQ_API_KEY. */
  groqApiKey: (process.env.GROQ_API_KEY ?? '').trim(),
  /** Groq model (default: llama-3.3-70b-versatile). */
  groqModel: (process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile').trim(),
  /** AI provider: 'groq' | 'gemini'. Leave empty to auto-detect (Groq preferred if configured). */
  aiProvider: ((process.env.AI_PROVIDER ?? '').trim().toLowerCase() || '') as '' | 'groq' | 'gemini',
  /** YouTube Data API key for learning course video search. Set in .env as YOUTUBE_API_KEY. */
  youtubeApiKey: (process.env.YOUTUBE_API_KEY ?? '').trim(),
} as const;
