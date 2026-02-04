'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border-t border-gray-800 p-4"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message…"
        className="flex-1 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-gray-100 placeholder:text-gray-500 focus:border-violet-500 focus:outline-none"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-lg bg-violet-500 p-2 text-white hover:bg-violet-600 disabled:opacity-50"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
}
