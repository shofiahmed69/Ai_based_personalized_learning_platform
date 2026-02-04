'use client';

import type { Memory, MemoryType } from '@/lib/types';

const TYPE_STYLES: Record<MemoryType, string> = {
  preference: 'bg-violet-500/20 text-violet-400',
  context: 'bg-blue-500/20 text-blue-400',
  interest: 'bg-emerald-500/20 text-emerald-400',
  correction: 'bg-amber-500/20 text-amber-400',
  fact: 'bg-gray-500/20 text-gray-400',
};

export function MemoryList({
  memories,
  onDeactivate,
}: {
  memories: Memory[];
  onDeactivate: (id: string) => void;
}) {
  return (
    <ul className="space-y-4">
      {memories.map((mem) => (
        <li
          key={mem.id}
          className="rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-lg shadow-black/20"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[mem.type] ?? 'bg-gray-800 text-gray-400'}`}
            >
              {mem.type}
            </span>
            {!mem.is_active && (
              <span className="text-xs text-gray-500">Inactive</span>
            )}
          </div>
          <p className="mt-2 font-medium text-gray-100">{mem.key}</p>
          <p className="mt-0.5 text-sm text-gray-400">{mem.value}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-violet-500"
                style={{ width: `${(mem.confidence ?? 0) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {mem.last_used_at
                ? new Date(mem.last_used_at).toLocaleDateString()
                : 'Never used'}
            </span>
          </div>
          {mem.is_active && (
            <button
              type="button"
              onClick={() => onDeactivate(mem.id)}
              className="mt-2 text-xs text-gray-500 hover:text-red-400"
            >
              Deactivate
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
