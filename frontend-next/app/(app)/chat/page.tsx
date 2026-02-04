'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useConversations, useCreateConversation, useArchiveConversation } from '@/hooks/useConversations';
import { EmptyState } from '@/components/shared/EmptyState';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatPage() {
  const router = useRouter();
  const { data: conversations, isLoading } = useConversations();
  const createConv = useCreateConversation();
  const archiveConv = useArchiveConversation();

  async function handleNew() {
    try {
      const conv = await createConv.mutateAsync();
      if (conv?.id) router.push(`/chat/${conv.id}`);
    } catch {
      toast.error('Failed to create conversation');
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      await archiveConv.mutateAsync(id);
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete conversation');
    }
  }

  const list = conversations ?? [];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-100">Chat</h1>
        <button
          type="button"
          onClick={handleNew}
          disabled={createConv.isPending}
          className="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-70"
        >
          <Plus className="h-4 w-4" />
          New conversation
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-800" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title="No conversations"
          description="Start a new chat to ask questions about your documents. Use the button above to create one."
        />
      ) : (
        <ul className="space-y-1">
          {list.map((c) => (
            <li key={c.id}>
              <Link
                href={`/chat/${c.id}`}
                className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 transition hover:border-gray-700"
              >
                <MessageSquare className="h-5 w-5 shrink-0 text-gray-500" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-100">{c.title || 'New conversation'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, c.id)}
                  className="shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-red-400"
                  title="Delete conversation"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
