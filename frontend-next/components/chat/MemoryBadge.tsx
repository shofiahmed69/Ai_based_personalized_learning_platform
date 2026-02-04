import type { MemoryUsedRef } from '@/lib/types';

export function MemoryBadge({ memory }: { memory: MemoryUsedRef }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
      🧠 {memory.key}: {memory.value}
    </span>
  );
}
