import Link from 'next/link';
import type { Document } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { TagChip } from './TagChip';
import { FileText, Trash2 } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onDelete?: (doc: Document) => void;
}

export function DocumentCard({ document: doc, onDelete }: DocumentCardProps) {
  return (
    <div className="relative rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-lg shadow-black/20 transition hover:border-gray-700">
      <Link href={`/documents/${doc.id}`} className="block">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-gray-400">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pr-8">
            <h3 className="truncate font-medium text-gray-100">{doc.title}</h3>
            <p className="text-xs text-gray-500">{doc.original_filename}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={doc.status} />
              {doc.tags?.slice(0, 2).map((t) => (
                <TagChip key={t.id} tag={t} />
              ))}
            </div>
          </div>
        </div>
      </Link>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onDelete(doc);
          }}
          className="absolute right-3 top-3 rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-red-400"
          title="Delete document"
          aria-label="Delete document"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
