import Groq from 'groq-sdk';
import { env } from '../config/env';

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

/**
 * Groq API integration for chat completions using groq-sdk.
 * Set GROQ_API_KEY in .env to enable.
 */
export function isGroqConfigured(): boolean {
  return Boolean(env.groqApiKey && env.groqApiKey.trim().length > 0);
}

function getClient(): Groq {
  if (!isGroqConfigured()) {
    throw new Error(
      'GROQ_API_KEY is not set. Add it to your .env file to use Groq chat and summarization.'
    );
  }
  return new Groq({ apiKey: env.groqApiKey });
}

/**
 * Chat completion via Groq API (non-streaming for backend storage).
 * Uses llama-3.3-70b-versatile by default for reliable chat responses.
 */
export async function chatCompletion(messages: { role: string; content: string }[]): Promise<{
  content: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number; model: string };
}> {
  const groq = getClient();
  const model = env.groqModel || DEFAULT_MODEL;

  const groqMessages = messages.map((m) => ({
    role: m.role as 'system' | 'user' | 'assistant',
    content: m.content,
  }));

  const completion = await groq.chat.completions.create({
    model,
    messages: groqMessages,
    temperature: 0.7,
    max_completion_tokens: 1024,
    top_p: 1,
    stream: false,
  });

  const text = completion.choices?.[0]?.message?.content ?? '';
  const usage = completion.usage
    ? {
        prompt_tokens: completion.usage.prompt_tokens ?? 0,
        completion_tokens: completion.usage.completion_tokens ?? 0,
        total_tokens: completion.usage.total_tokens ?? 0,
        model: completion.model ?? model,
      }
    : undefined;

  return { content: text, usage };
}
