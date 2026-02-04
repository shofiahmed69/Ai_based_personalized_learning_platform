'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDocument, useArchiveDocument } from '@/hooks/useDocuments';
import { StatusBadge } from '@/components/documents/StatusBadge';
import { TagChip } from '@/components/documents/TagChip';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: doc, isLoading, error } = useDocument(id);
  const archiveDoc = useArchiveDocument();

  if (isLoading || !doc) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-800" />
        <div className="mt-4 h-64 animate-pulse rounded-lg bg-gray-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-red-400">Failed to load document.</p>
        <Link href="/documents" className="mt-2 inline-block text-violet-400 hover:underline">
          ← Back to documents
        </Link>
      </div>
    );
  }

  async function handleDelete() {
    if (!confirm(`Delete "${doc.title}"? It will be moved to Archived.`)) return;
    try {
      await archiveDoc.mutateAsync(id);
      toast.success('Document deleted');
      router.push('/documents');
    } catch {
      toast.error('Failed to delete document');
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link
          href="/documents"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to documents
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={archiveDoc.isPending}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-800 hover:text-red-400 disabled:opacity-50"
          title="Delete document"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">{doc.title}</h1>
            <p className="text-sm text-gray-400">{doc.original_filename} · {doc.file_type}</p>
          </div>
        </div>
        <StatusBadge status={doc.status} />
      </div>

      {doc.status === 'FAILED' && doc.error_message && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {doc.error_message}
        </div>
      )}

      {doc.tags && doc.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-medium text-gray-400">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {doc.tags.map((t) => (
              <TagChip key={t.id} tag={t} />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-lg shadow-black/20">
        <h2 className="mb-2 text-sm font-medium text-gray-400">Summary</h2>
        {doc.summary ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{doc.summary}</ReactMarkdown>
          </div>
        ) : doc.status === 'INDEXED' ? (
          <p className="text-gray-500">No summary.</p>
        ) : (
          <p className="text-gray-500">Processing… Summary will appear when indexed.</p>
        )}
      </div>

      {doc.learning_courses && doc.learning_courses.length > 0 && (
        <div className="mt-6 rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-lg shadow-black/20">
          <h2 className="mb-3 text-sm font-medium text-gray-400">Learning courses (YouTube)</h2>
          <p className="mb-3 text-xs text-gray-500">Videos related to this document&apos;s topics</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {doc.learning_courses.map((v) => (
              <li key={v.videoId}>
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 rounded-lg border border-gray-800 p-2 transition hover:border-violet-500/50 hover:bg-gray-800/50"
                >
                  {v.thumbnailUrl ? (
                    <img
                      src={v.thumbnailUrl}
                      alt=""
                      className="h-20 w-32 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-20 w-32 shrink-0 rounded bg-gray-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium text-gray-200">{v.title}</span>
                    {v.channelTitle && (
                      <p className="mt-0.5 text-xs text-gray-500">{v.channelTitle}</p>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <Link
          href={`/documents/${id}/versions`}
          className="text-sm text-violet-400 hover:underline"
        >
          View version history →
        </Link>
      </div>
    </div>
  );
}
