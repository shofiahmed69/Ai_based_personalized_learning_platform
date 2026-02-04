'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useConversation, useSendMessage, useArchiveConversation } from '@/hooks/useConversations';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatInput } from '@/components/chat/ChatInput';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useConversation(id);
  const sendMessage = useSendMessage();
  const archiveConv = useArchiveConversation();
  const [streamingContent, setStreamingContent] = useState<string | null>(null);

  const conversation = data?.conversation;
  const messages = data?.messages ?? [];

  async function handleSend(content: string) {
    if (!id || !content.trim()) return;
    try {
      const result = await sendMessage.mutateAsync({
        conversationId: id,
        content: content.trim(),
        role: 'user',
      });
      setStreamingContent('');
      if (result && !result.assistantMessage) {
        toast.info('Message saved. Add GEMINI_API_KEY to the server .env to get AI replies.');
      }
    } catch {
      toast.error('Failed to send message');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      await archiveConv.mutateAsync(id);
      toast.success('Conversation deleted');
      router.push('/chat');
    } catch {
      toast.error('Failed to delete conversation');
    }
  }

  if (isLoading && !data) {
    return (
      <div className="flex h-[calc(100vh-2rem)] flex-col p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-800" />
        <div className="mt-4 flex-1 animate-pulse rounded-lg bg-gray-800" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-6">
        <p className="text-red-400">Conversation not found.</p>
        <Link href="/chat" className="mt-2 inline-block text-violet-400 hover:underline">
          ← Back to chat
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link
          href="/chat"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to conversations
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={archiveConv.isPending}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-800 hover:text-red-400 disabled:opacity-50"
          title="Delete conversation"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
        <ChatWindow
          messages={messages}
          streamingContent={streamingContent}
          isLoading={sendMessage.isPending}
        />
        <ChatInput onSend={handleSend} disabled={sendMessage.isPending} />
      </div>
    </div>
  );
}
