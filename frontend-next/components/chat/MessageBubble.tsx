'use client';

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import type { ConversationMessage } from '@/lib/types';
import { SourceCitation } from './SourceCitation';
import { MemoryBadge } from './MemoryBadge';
import 'highlight.js/styles/github-dark.css';

export function MessageBubble({ message }: { message: ConversationMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-violet-500 text-white'
            : 'border border-gray-800 bg-gray-800 text-gray-100'
        }`}
      >
        <span className="mb-1 block text-xs font-medium opacity-80">{message.role}</span>
        {message.role === 'assistant' ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        )}
        {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
          <div className="mt-2 border-t border-gray-700 pt-2">
            <p className="text-xs font-medium text-gray-400">Sources</p>
            <div className="mt-1 space-y-1">
              {message.sources.map((s, i) => (
                <SourceCitation key={i} citation={s} />
              ))}
            </div>
          </div>
        )}
        {message.role === 'assistant' && message.memories_used && message.memories_used.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.memories_used.map((m, i) => (
              <MemoryBadge key={i} memory={m} />
            ))}
          </div>
        )}
        {message.role === 'assistant' && message.groq_usage && (
          <p className="mt-1 text-xs text-gray-500">
            tokens: {message.groq_usage.prompt_tokens} + {message.groq_usage.completion_tokens} · {message.groq_usage.model}
          </p>
        )}
      </div>
    </div>
  );
}
