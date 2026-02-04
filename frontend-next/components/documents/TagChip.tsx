import Link from 'next/link';
import type { Tag } from '@/lib/types';

export function TagChip({ tag }: { tag: Tag }) {
  return (
    <Link
      href={`/knowledge-graph?tag=${tag.slug}`}
      className="inline-flex rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300 hover:bg-gray-700 hover:text-violet-400"
    >
      {tag.name}
    </Link>
  );
}
