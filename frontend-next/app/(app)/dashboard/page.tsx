'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDocuments } from '@/hooks/useDocuments';
import { useConversations } from '@/hooks/useConversations';
import { useMemories } from '@/hooks/useMemories';
import { useCreateConversation } from '@/hooks/useConversations';
import { FileText, MessageSquare, Brain, Plus } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { data: docData, isLoading: docLoading } = useDocuments({ limit: 5 });
  const { data: convs, isLoading: convLoading } = useConversations(5);
  const { data: memories, isLoading: memLoading } = useMemories();
  const createConv = useCreateConversation();

  const docs = docData?.items ?? [];
  const totalDocs = docData?.pagination?.total ?? 0;
  const indexedCount = docs.filter((d) => d.status === 'INDEXED').length;

  async function handleNewChat() {
    try {
      const conv = await createConv.mutateAsync();
      if (conv?.id) router.push(`/chat/${conv.id}`);
    } catch {
      // toast in mutation
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-100">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 text-gray-400">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-medium">Documents</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-100">{docLoading ? '—' : totalDocs}</p>
          <p className="text-xs text-gray-500">{indexedCount} indexed</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 text-gray-400">
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">Conversations</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-100">{convLoading ? '—' : (convs?.length ?? 0)}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 text-gray-400">
            <Brain className="h-5 w-5" />
            <span className="text-sm font-medium">Memories</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-100">{memLoading ? '—' : (memories?.length ?? 0)}</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Start a conversation</h2>
        <button
          type="button"
          onClick={handleNewChat}
          disabled={createConv.isPending}
          className="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-70"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-lg shadow-black/20">
        <h2 className="mb-3 text-lg font-semibold text-gray-100">Recent documents</h2>
        {docLoading ? (
          <p className="text-gray-400">Loading…</p>
        ) : docs.length === 0 ? (
          <p className="text-gray-400">No documents yet.</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/documents/${d.id}`}
                  className="flex items-center justify-between rounded px-2 py-1.5 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
                >
                  <span className="truncate">{d.title}</span>
                  <span className="ml-2 shrink-0 rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">
                    {d.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/documents"
          className="mt-3 inline-block text-sm text-violet-400 hover:underline"
        >
          View all documents →
        </Link>
      </div>
    </div>
  );
}
