import app from './app';
import { env } from './config/env';
import { getPool, closePool } from './config/database';
import { isGeminiConfigured } from './services/gemini.service';

const server = app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port} (${env.nodeEnv})`);
  const geminiOk = isGeminiConfigured();
  console.log(
    `Gemini API: ${geminiOk ? 'configured (key from .env)' : 'NOT configured (set GEMINI_API_KEY in .env)'}`
  );
  if (geminiOk && process.env.NODE_ENV !== 'production') {
    console.log('  → Get key from https://aistudio.google.com/apikey (use AI Studio, not Cloud Console)');
  }
  getPool()
    .query('SELECT 1')
    .then(() => console.log('Database connected'))
    .catch((err: Error) => console.error('Database connection failed:', err.message));
});

function shutdown() {
  server.close(() => {
    closePool()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
