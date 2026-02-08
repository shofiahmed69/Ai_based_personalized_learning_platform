import { env } from '../config/env';

const DEFAULT_BASE = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2';

/**
 * Ollama API integration for chat completions.
 * Set OLLAMA_BASE_URL (default localhost:11434) to enable.
 * Model: llama3.2 by default (OLLAMA_MODEL).
 */
export function isOllamaConfigured(): boolean {
  const base = (env.ollamaBaseUrl ?? DEFAULT_BASE).trim();
  return base.length > 0;
}

function getBaseUrl(): string {
  return (env.ollamaBaseUrl ?? DEFAULT_BASE).replace(/\/$/, '');
}

function getModel(): string {
  return (env.ollamaModel ?? DEFAULT_MODEL).trim() || DEFAULT_MODEL;
}

export interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  model: string;
}

/**
 * Chat completion via Ollama /api/chat.
 * Returns { content, usage } for compatibility with the rest of the app.
 */
export async function chatCompletion(messages: { role: string; content: string }[]): Promise<{
  content: string;
  usage?: ChatUsage;
}> {
  if (!isOllamaConfigured()) {
    throw new Error(
      'Ollama is not configured. Set OLLAMA_BASE_URL in .env (e.g. http://localhost:11434) and run `ollama pull llama3.2`.'
    );
  }

  // Ollama expects messages with role "user" | "assistant" | "system"
  const ollamaMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }));

  const url = `${getBaseUrl()}/api/chat`;
  const timeoutMs = env.ollamaTimeoutMs > 0 ? env.ollamaTimeoutMs : 120000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: getModel(),
        messages: ollamaMessages,
        stream: false,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        `Ollama timed out after ${timeoutMs / 1000}s. Try smaller documents or increase OLLAMA_TIMEOUT_MS.`
      );
    }
    throw err;
  }
  clearTimeout(timeoutId);

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 404) {
      throw new Error(
        `Ollama model "${getModel()}" not found. Run: ollama pull ${getModel()}`
      );
    }
    throw new Error(`Ollama API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    message?: { content?: string };
    prompt_eval_count?: number;
    eval_count?: number;
  };

  const content = data.message?.content ?? '';
  const usage: ChatUsage = {
    prompt_tokens: data.prompt_eval_count ?? 0,
    completion_tokens: data.eval_count ?? 0,
    total_tokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
    model: getModel(),
  };

  return { content, usage };
}
