import type { DocumentStatus } from '@/lib/types';

const STYLES: Record<DocumentStatus, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400',
  EXTRACTING: 'bg-violet-500/20 text-violet-400',
  CHUNKING: 'bg-violet-500/20 text-violet-400',
  INDEXED: 'bg-emerald-500/20 text-emerald-400',
  FAILED: 'bg-red-500/20 text-red-400',
  ARCHIVED: 'bg-gray-600/20 text-gray-400',
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status] ?? 'bg-gray-800 text-gray-400'}`}
    >
      {status}
    </span>
  );
}
