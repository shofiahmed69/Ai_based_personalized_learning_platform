import { query } from '../config/database';
import { AppError } from '../utils/AppError';

export type MemoryType = 'preference' | 'context' | 'interest' | 'correction' | 'fact';

export interface CreateMemoryInput {
  type: MemoryType;
  key: string;
  value: string;
  source_conversation?: string;
  confidence?: number;
}

export async function create(userId: string, input: CreateMemoryInput) {
  const confidence = Math.min(1, Math.max(0, input.confidence ?? 0.9));
  const rows = await query<{
    id: string;
    type: string;
    key: string;
    value: string;
    confidence: number;
    created_at: Date;
  }>(
    `INSERT INTO memories (user_id, type, key, value, source_conversation, confidence)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, type, key, value, confidence, created_at`,
    [
      userId,
      input.type,
      input.key.trim(),
      input.value.trim(),
      input.source_conversation ?? null,
      confidence,
    ]
  );
  const memory = rows[0];
  if (!memory) throw new AppError('Failed to create memory', 500);
  return memory;
}

export async function listByUser(userId: string, type?: MemoryType) {
  if (type) {
    return query<{
      id: string;
      type: string;
      key: string;
      value: string;
      confidence: number;
      is_active: boolean;
      created_at: Date;
    }>(
      'SELECT id, type, key, value, confidence, is_active, created_at FROM memories WHERE user_id = $1 AND type = $2 AND is_active = true ORDER BY created_at DESC',
      [userId, type]
    );
  }
  return query<{
    id: string;
    type: string;
    key: string;
    value: string;
    confidence: number;
    is_active: boolean;
    created_at: Date;
  }>(
    'SELECT id, type, key, value, confidence, is_active, created_at FROM memories WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
    [userId]
  );
}

export async function getById(memoryId: string, userId: string) {
  const rows = await query<{
    id: string;
    type: string;
    key: string;
    value: string;
    confidence: number;
    source_conversation: string | null;
    created_at: Date;
  }>(
    'SELECT id, type, key, value, confidence, source_conversation, created_at FROM memories WHERE id = $1 AND user_id = $2',
    [memoryId, userId]
  );
  const memory = rows[0];
  if (!memory) throw new AppError('Memory not found', 404, 'NOT_FOUND');
  return memory;
}

export async function deactivate(memoryId: string, userId: string) {
  const rows = await query(
    'UPDATE memories SET is_active = false, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id',
    [memoryId, userId]
  );
  if (rows.length === 0) throw new AppError('Memory not found', 404, 'NOT_FOUND');
}
