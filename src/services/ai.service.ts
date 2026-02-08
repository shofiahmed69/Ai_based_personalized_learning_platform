import { env } from '../config/env';
import * as gemini from './gemini.service';
import * as ollama from './ollama.service';

/**
 * Unified AI service: uses Ollama (llama3.2) when configured, else Gemini.
 * Set OLLAMA_BASE_URL (default http://localhost:11434) and run `ollama pull llama3.2` for Ollama.
 * Set AI_PROVIDER=ollama or AI_PROVIDER=gemini to override auto-detection.
 */
export function isAIConfigured(): boolean {
  if (env.aiProvider === 'ollama') return ollama.isOllamaConfigured();
  if (env.aiProvider === 'gemini') return gemini.isGeminiConfigured();
  return ollama.isOllamaConfigured() || gemini.isGeminiConfigured();
}

export function getAIProvider(): 'ollama' | 'gemini' | null {
  if (env.aiProvider === 'ollama' && ollama.isOllamaConfigured()) return 'ollama';
  if (env.aiProvider === 'gemini' && gemini.isGeminiConfigured()) return 'gemini';
  if (ollama.isOllamaConfigured()) return 'ollama';
  if (gemini.isGeminiConfigured()) return 'gemini';
  return null;
}

/**
 * Chat completion via Ollama or Gemini, depending on config.
 */
export async function chatCompletion(messages: { role: string; content: string }[]): Promise<{
  content: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number; model: string };
}> {
  const provider = getAIProvider();
  if (provider === 'ollama') return ollama.chatCompletion(messages);
  if (provider === 'gemini') return gemini.chatCompletion(messages);
  throw new Error(
    'No AI provider configured. Set OLLAMA_BASE_URL (and run ollama pull llama3.2) or GEMINI_API_KEY in .env.'
  );
}

/**
 * Summarize text using the configured AI provider.
 * Uses smaller input for Ollama (4k chars) to speed up local summarization.
 */
export async function summarize(fullText: string, title?: string): Promise<string> {
  const provider = getAIProvider();
  const maxChars = provider === 'ollama' ? 4000 : 12000;
  const truncated = fullText.slice(0, maxChars);
  const prompt = title
    ? `Summarize the following document titled "${title}" in 2–4 clear sentences. Focus on the main ideas and key points.\n\n---\n\n${truncated}`
    : `Summarize the following document in 2–4 clear sentences. Focus on the main ideas and key points.\n\n---\n\n${truncated}`;
  const { content } = await chatCompletion([{ role: 'user', content: prompt }]);
  return content.trim();
}
