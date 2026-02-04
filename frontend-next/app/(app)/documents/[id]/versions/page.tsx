'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DocumentVersionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="p-6 lg:p-8">
      <Link
        href={`/documents/${id}`}
        className="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to document
      </Link>
      <h1 className="text-2xl font-bold text-gray-100">Version history</h1>
      <p className="mt-2 text-gray-400">
        Version history and rollback will appear here when the backend supports <code className="rounded bg-gray-800 px-1">GET /documents/:id/versions</code> and <code className="rounded bg-gray-800 px-1">POST /documents/:id/versions/rollback</code>.
      </p>
    </div>
  );
}
