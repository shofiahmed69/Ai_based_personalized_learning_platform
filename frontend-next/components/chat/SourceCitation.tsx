import Link from 'next/link';
import type { SourceCitation as SourceCitationType } from '@/lib/types';

export function SourceCitation({ citation }: { citation: SourceCitationType }) {
  return (
    <div className="rounded border border-gray-700 bg-gray-900/50 px-2 py-1 text-xs">
      <Link
        href={citation.document_id ? `/documents/${citation.document_id}` : '/documents'}
        className="font-medium text-violet-400 hover:underline"
      >
        {citation.doc_title}
      </Link>
      <p className="mt-0.5 truncate text-gray-500">{citation.snippet}</p>
    </div>
  );
}
