'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDocuments, useArchiveDocument } from '@/hooks/useDocuments';
import type { Document, DocumentStatus } from '@/lib/types';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_TABS: { value: DocumentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'INDEXED', label: 'Indexed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export default function DocumentsPage() {
  const [status, setStatus] = useState<DocumentStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDocuments({
    status: status === 'ALL' ? undefined : status,
    page,
    limit: 20,
  });
  const archiveDoc = useArchiveDocument();

  const items = data?.items ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 1 };

  async function handleDeleteDocument(doc: Document) {
    if (!confirm(`Delete "${doc.title}"? It will be moved to Archived.`)) return;
    try {
      await archiveDoc.mutateAsync(doc.id);
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-100">Documents</h1>
        <Link
          href="/documents/upload"
          className="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
        >
          <Upload className="h-4 w-4" />
          Upload
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value as DocumentStatus | 'ALL')}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              status === tab.value
                ? 'bg-violet-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No documents"
          description="Upload a document to get started."
          actionLabel="Upload document"
          actionHref="/documents/upload"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDelete={handleDeleteDocument} />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border border-gray-700 px-2 py-1 hover:bg-gray-800 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= (pagination.totalPages ?? 1)}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border border-gray-700 px-2 py-1 hover:bg-gray-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
