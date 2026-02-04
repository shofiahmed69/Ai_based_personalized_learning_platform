'use client';

import { useState } from 'react';
import { useMemories, useDeactivateMemory } from '@/hooks/useMemories';
import type { MemoryType } from '@/lib/types';
import { MemoryList } from '@/components/memories/MemoryList';
import { EmptyState } from '@/components/shared/EmptyState';

const TYPES: { value: MemoryType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'preference', label: 'Preference' },
  { value: 'context', label: 'Context' },
  { value: 'interest', label: 'Interest' },
  { value: 'correction', label: 'Correction' },
  { value: 'fact', label: 'Fact' },
];

export default function MemoriesPage() {
  const [type, setType] = useState<MemoryType | 'ALL'>('ALL');
  const { data: memories, isLoading } = useMemories(type === 'ALL' ? undefined : type);
  const deactivate = useDeactivateMemory();

  const list = memories ?? [];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-100">Memories</h1>
      <p className="mb-6 text-gray-400">
        What the system has learned about you. Memories are used to personalize responses.
      </p>

      <div className="mb-4 flex flex-wrap gap-1">
        {TYPES.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setType(tab.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              type === tab.value
                ? 'bg-violet-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-800" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title="No memories yet"
          description="Memories are created automatically from your conversations and preferences."
        />
      ) : (
        <MemoryList memories={list} onDeactivate={(id) => deactivate.mutate(id)} />
      )}
    </div>
  );
}
