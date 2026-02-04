'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTagsGraph } from '@/hooks/useTags';
import { EmptyState } from '@/components/shared/EmptyState';

const KnowledgeGraph = dynamic(
  () => import('@/components/graph/KnowledgeGraph').then((m) => m.KnowledgeGraph),
  { ssr: false, loading: () => <div className="h-[500px] animate-pulse rounded-lg bg-gray-800" /> }
);

export default function KnowledgeGraphPage() {
  const { data, isLoading } = useTagsGraph();
  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-100">Knowledge Graph</h1>
      <p className="mb-4 text-gray-400">
        Your tags as nodes; lines show relationships between them. Click a node to filter documents by that tag.
      </p>

      <div className="mb-6 rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-sm text-gray-400">
        <p className="mb-2 font-medium text-gray-300">How to use the Knowledge Graph</p>
        <ol className="list-inside list-decimal space-y-1">
          <li><Link href="/documents" className="text-violet-400 hover:underline">Upload documents</Link>, then open a document and add <strong>tags</strong> (e.g. &quot;Python&quot;, &quot;API&quot;) to group topics.</li>
          <li>Tags are created when you add them to a document (or via the API). The graph shows all your tags as <strong>nodes</strong>.</li>
          <li>To show <strong>connections</strong> between tags, add relationships via <code className="rounded bg-gray-800 px-1">POST /api/tags/relationships</code> with <code className="rounded bg-gray-800 px-1">source_tag_id</code>, <code className="rounded bg-gray-800 px-1">target_tag_id</code>, and <code className="rounded bg-gray-800 px-1">relationship</code> (IS_A, RELATED_TO, PART_OF, OPPOSITE_OF).</li>
          <li><strong>Click a node</strong> to open the documents list filtered by that tag.</li>
        </ol>
      </div>

      {isLoading ? (
        <div className="h-[500px] animate-pulse rounded-lg bg-gray-800" />
      ) : nodes.length === 0 ? (
        <EmptyState
          title="No graph yet"
          description="Create tags and add them to documents. Add relationships between tags to see the graph."
          actionLabel="Upload document"
          actionHref="/documents/upload"
        />
      ) : (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-lg shadow-black/20">
          <KnowledgeGraph nodes={nodes} edges={edges} />
        </div>
      )}
    </div>
  );
}
