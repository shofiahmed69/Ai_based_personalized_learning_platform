import app from './app';
import { env } from './config/env';
import { getPool, closePool } from './config/database';
import { isAIConfigured, getAIProvider } from './services/ai.service';

const server = app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port} (${env.nodeEnv})`);
  const aiOk = isAIConfigured();
  const provider = getAIProvider();
  if (aiOk && provider) {
    console.log(`AI: ${provider === 'ollama' ? 'Ollama (llama3.2)' : 'Gemini'} configured`);
  } else {
    console.log('AI: NOT configured. Set OLLAMA_BASE_URL (run ollama pull llama3.2) or GEMINI_API_KEY');
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
