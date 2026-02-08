import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { isAIConfigured } from './services/ai.service';
import { getPool } from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import documentRoutes from './routes/document.routes';
import tagRoutes from './routes/tag.routes';
import conversationRoutes from './routes/conversation.routes';
import memoryRoutes from './routes/memory.routes';
import searchRoutes from './routes/search.routes';
import learningRoutes from './routes/learning.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Health and config checks (no auth)
app.get('/health', async (_req, res) => {
  let database: 'connected' | 'disconnected' = 'disconnected';
  try {
    await getPool().query('SELECT 1');
    database = 'connected';
  } catch {
    // leave database as disconnected
  }
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    database,
  });
});

app.get('/api/config', (_req, res) => {
  res.json({
    groq_configured: isAIConfigured(), // AI configured (Groq or Gemini)
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/learning', learningRoutes);

app.use(errorHandler);

export default app;
