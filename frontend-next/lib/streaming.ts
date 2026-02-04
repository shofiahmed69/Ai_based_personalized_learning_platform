const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface StreamDone {
  sources?: unknown[];
  memories_used?: unknown[];
  groq_usage?: unknown;
}

/**
 * Returns true if backend supports SSE for chat. When false, UI should POST message then refetch.
 */
export function hasStreamingEndpoint(): boolean {
  return false;
}

/**
 * Opens SSE stream for conversation messages. Use when hasStreamingEndpoint() is true.
 * Yields token events then a final done event.
 */
export async function* streamConversationTokens(
  _conversationId: string,
  _getAccessToken: () => string | null
): AsyncGenerator<
  { type: 'token'; data: string } | { type: 'done'; data: StreamDone },
  void,
  unknown
> {
  // Backend has no SSE yet — yield nothing; caller refetches after POST
  if (false) yield { type: 'token', data: '' };
}
