import { query } from '../config/database';
import { AppError } from '../utils/AppError';
import { chatCompletion, isGeminiConfigured } from './gemini.service';

export type MessageRole = 'user' | 'assistant' | 'system';

const MAX_HISTORY_MESSAGES = 20;
const SYSTEM_PROMPT = `You are a helpful assistant for an AI Knowledge Base. Answer the user concisely. If they ask about documents or content, suggest they search or refer to their uploaded documents.`;

export async function createConversation(userId: string, title?: string) {
  const rows = await query<{
    id: string;
    title: string | null;
    created_at: Date;
  }>(
    'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING id, title, created_at',
    [userId, title ?? null]
  );
  const conv = rows[0];
  if (!conv) throw new AppError('Failed to create conversation', 500);
  return conv;
}

export async function listConversations(userId: string, limit = 20) {
  return query<{
    id: string;
    title: string | null;
    created_at: Date;
    updated_at: Date;
  }>(
    'SELECT id, title, created_at, updated_at FROM conversations WHERE user_id = $1 AND is_active = true ORDER BY updated_at DESC LIMIT $2',
    [userId, limit]
  );
}

export async function getConversation(conversationId: string, userId: string) {
  const rows = await query<{
    id: string;
    title: string | null;
    created_at: Date;
    updated_at: Date;
  }>(
    'SELECT id, title, created_at, updated_at FROM conversations WHERE id = $1 AND user_id = $2',
    [conversationId, userId]
  );
  const conv = rows[0];
  if (!conv) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
  return conv;
}

export async function getMessages(conversationId: string, userId: string, limit = 50) {
  const conv = await getConversation(conversationId, userId);
  const messages = await query<{
    id: string;
    role: string;
    content: string;
    sources: unknown;
    memories_used: unknown;
    groq_usage: unknown;
    created_at: Date;
  }>(
    `SELECT id, role, content, sources, memories_used, groq_usage, created_at
     FROM conversation_messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [conversationId, limit]
  );
  return { conversation: conv, messages };
}

export async function addMessage(
  conversationId: string,
  userId: string,
  role: MessageRole,
  content: string,
  options?: { sources?: unknown; memories_used?: unknown; groq_usage?: unknown }
) {
  await getConversation(conversationId, userId);
  const rows = await query<{
    id: string;
    role: string;
    content: string;
    created_at: Date;
  }>(
    `INSERT INTO conversation_messages (conversation_id, role, content, sources, memories_used, groq_usage)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, role, content, created_at`,
    [
      conversationId,
      role,
      content,
      options?.sources ? JSON.stringify(options.sources) : null,
      options?.memories_used ? JSON.stringify(options.memories_used) : null,
      options?.groq_usage ? JSON.stringify(options.groq_usage) : null,
    ]
  );
  const msg = rows[0];
  if (!msg) throw new AppError('Failed to add message', 500);
  return msg;
}

/**
 * Generate an assistant reply using Gemini and append it to the conversation.
 * Call after adding a user message. Returns the assistant message or null if Gemini is not configured.
 */
export async function generateAndAddAssistantReply(
  conversationId: string,
  userId: string
): Promise<{ id: string; role: string; content: string; created_at: Date } | null> {
  if (!isGeminiConfigured()) return null;
  const { messages } = await getMessages(conversationId, userId, MAX_HISTORY_MESSAGES);
  const geminiMessages: { role: string; content: string }[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];
  const { content, usage } = await chatCompletion(geminiMessages);
  const assistant = await addMessage(conversationId, userId, 'assistant', content, {
    groq_usage: usage ?? undefined,
  });
  return assistant;
}

export async function updateConversationTitle(conversationId: string, userId: string, title: string) {
  const rows = await query(
    'UPDATE conversations SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING id, title',
    [title, conversationId, userId]
  );
  if (rows.length === 0) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
  return rows[0];
}

export async function archiveConversation(conversationId: string, userId: string) {
  const rows = await query(
    'UPDATE conversations SET is_active = false WHERE id = $1 AND user_id = $2 RETURNING id',
    [conversationId, userId]
  );
  if (rows.length === 0) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
}
