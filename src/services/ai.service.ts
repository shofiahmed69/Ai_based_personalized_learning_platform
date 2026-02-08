import { env } from '../config/env';
import * as gemini from './gemini.service';
import * as groq from './groq.service';

/**
 * Unified AI service: uses Groq when configured, else Gemini.
 * Set GROQ_API_KEY in .env for Groq.
 * Set AI_PROVIDER=groq or AI_PROVIDER=gemini to override auto-detection.
 */
export function isAIConfigured(): boolean {
  if (env.aiProvider === 'groq') return groq.isGroqConfigured();
  if (env.aiProvider === 'gemini') return gemini.isGeminiConfigured();
  return groq.isGroqConfigured() || gemini.isGeminiConfigured();
}

export function getAIProvider(): 'groq' | 'gemini' | null {
  if (env.aiProvider === 'groq' && groq.isGroqConfigured()) return 'groq';
  if (env.aiProvider === 'gemini' && gemini.isGeminiConfigured()) return 'gemini';
  if (groq.isGroqConfigured()) return 'groq';
  if (gemini.isGeminiConfigured()) return 'gemini';
  return null;
}

/**
 * Chat completion via Groq or Gemini, depending on config.
 */
export async function chatCompletion(messages: { role: string; content: string }[]): Promise<{
  content: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number; model: string };
}> {
  const provider = getAIProvider();
  if (provider === 'groq') return groq.chatCompletion(messages);
  if (provider === 'gemini') return gemini.chatCompletion(messages);
  throw new Error(
    'No AI provider configured. Set GROQ_API_KEY or GEMINI_API_KEY in .env.'
  );
}

/**
 * Summarize text using the configured AI provider.
 */
export async function summarize(fullText: string, title?: string): Promise<string> {
  const provider = getAIProvider();
  const maxChars = provider === 'groq' ? 10000 : 12000;
  const truncated = fullText.slice(0, maxChars);
  const prompt = title
    ? `Summarize the following document titled "${title}" in 2–4 clear sentences. Focus on the main ideas and key points.\n\n---\n\n${truncated}`
    : `Summarize the following document in 2–4 clear sentences. Focus on the main ideas and key points.\n\n---\n\n${truncated}`;
  const { content } = await chatCompletion([{ role: 'user', content: prompt }]);
  return content.trim();
}
