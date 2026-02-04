'use client';

import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import type { ConversationMessage } from '@/lib/types';

interface ChatWindowProps {
  messages: ConversationMessage[];
  streamingContent: string | null;
  isLoading?: boolean;
}

export function ChatWindow({ messages, streamingContent, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {streamingContent && (
          <MessageBubble
            message={{
              id: 'streaming',
              conversation_id: '',
              role: 'assistant',
              content: streamingContent,
              sources: null,
              memories_used: null,
              groq_usage: null,
              created_at: new Date().toISOString(),
            }}
          />
        )}
        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-gray-800 bg-gray-800 px-4 py-2 text-gray-400">
              Thinking…
            </div>
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
