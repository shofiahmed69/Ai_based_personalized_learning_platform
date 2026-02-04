import { env } from '../config/env';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-2.0-flash';

/**
 * Gemini API integration for chat and summarization.
 * Set GEMINI_API_KEY in .env to enable.
 */
export function isGeminiConfigured(): boolean {
  return Boolean(env.geminiApiKey && env.geminiApiKey.trim().length > 0);
}

function getApiKey(): string {
  if (!isGeminiConfigured()) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to your .env file to use Gemini chat and summarization.'
    );
  }
  return env.geminiApiKey;
}

/** Map Gemini contents format to API (role "user" | "model", parts with text). */
interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

/** systemInstruction is Content with parts only (no role). */
interface GeminiSystemInstruction {
  parts: Array<{ text: string }>;
}

/**
 * Chat completion via Gemini generateContent.
 * Returns { content, usage } so callers can store usage (e.g. for display).
 */
export async function chatCompletion(messages: { role: string; content: string }[]): Promise<{
  content: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number; model: string };
}> {
  if (!isGeminiConfigured()) {
    throw new Error('GEMINI_API_KEY is not set. Cannot call chat API.');
  }

  const contents: GeminiContent[] = [];
  let systemInstruction: GeminiSystemInstruction | undefined;

  for (const m of messages) {
    if (m.role === 'system') {
      // API expects systemInstruction as Content with parts only (no role)
      systemInstruction = { parts: [{ text: m.content }] };
      continue;
    }
    const role = m.role === 'assistant' ? 'model' : 'user';
    contents.push({ role, parts: [{ text: m.content }] });
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.3,
    },
  };
  if (systemInstruction) {
    body.systemInstruction = systemInstruction;
  }

  const url = `${GEMINI_BASE}/models/${DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(getApiKey())}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) {
      throw new Error(
        `Gemini API key invalid or rejected (401). Get a key from https://aistudio.google.com/apikey (not Cloud Console). Raw: ${err.slice(0, 200)}`
      );
    }
    if (res.status === 403) {
      throw new Error(
        `Gemini API access denied (403). Check key restrictions and region. Raw: ${err.slice(0, 200)}`
      );
    }
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    };
  };

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const usage = data.usageMetadata
    ? {
        prompt_tokens: data.usageMetadata.promptTokenCount ?? 0,
        completion_tokens: data.usageMetadata.candidatesTokenCount ?? 0,
        total_tokens: data.usageMetadata.totalTokenCount ?? 0,
        model: DEFAULT_MODEL,
      }
    : undefined;

  return { content: text, usage };
}

/**
 * Summarize document text using Gemini. Returns a short summary (2–4 sentences).
 */
export async function summarizeWithGemini(fullText: string, title?: string): Promise<string> {
  const truncated = fullText.slice(0, 12000);
  const prompt = title
    ? `Summarize the following document titled "${title}" in 2–4 clear sentences. Focus on the main ideas and key points.\n\n---\n\n${truncated}`
    : `Summarize the following document in 2–4 clear sentences. Focus on the main ideas and key points.\n\n---\n\n${truncated}`;
  const { content } = await chatCompletion([{ role: 'user', content: prompt }]);
  return content.trim();
}
