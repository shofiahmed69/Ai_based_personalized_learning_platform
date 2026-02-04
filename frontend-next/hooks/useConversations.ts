'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Conversation, ConversationMessage } from '@/lib/types';

const BASE = '/api/conversations';

export function useConversations(limit?: number) {
  return useQuery({
    queryKey: ['conversations', limit],
    queryFn: async () => {
      const { data } = await api.get<{ data?: { conversations: Conversation[] }; conversations?: Conversation[] }>(
        `${BASE}${limit ? `?limit=${limit}` : ''}`
      );
      const list = data.data?.conversations ?? data.conversations ?? [];
      return list;
    },
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      const { data } = await api.get<{ data?: { conversation: Conversation; messages: ConversationMessage[] }; conversation?: Conversation; messages?: ConversationMessage[] }>(
        `${BASE}/${id}`
      );
      const conv = data.data?.conversation ?? data.conversation;
      const messages = data.data?.messages ?? data.messages ?? [];
      return { conversation: conv, messages };
    },
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title?: string) => {
      const { data } = await api.post<{ data?: { conversation: Conversation }; conversation?: Conversation }>(
        BASE,
        title ? { title } : {}
      );
      return data.data?.conversation ?? data.conversation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      role,
    }: { conversationId: string; content: string; role: 'user' | 'assistant' | 'system' }) => {
      const { data } = await api.post<{
        data?: { message: ConversationMessage; assistantMessage?: ConversationMessage };
        message?: ConversationMessage;
        assistantMessage?: ConversationMessage;
      }>(`${BASE}/${conversationId}/messages`, { role, content });
      const payload = data.data ?? data;
      const userMsg = payload.message ?? (data as { message?: ConversationMessage }).message;
      const assistantMsg = payload.assistantMessage ?? (data as { assistantMessage?: ConversationMessage }).assistantMessage;
      return { conversationId, userMessage: userMsg, assistantMessage: assistantMsg };
    },
    onSuccess: (result) => {
      const { conversationId, userMessage, assistantMessage } = result;
      if (!userMessage) return;
      qc.setQueryData(
        ['conversation', conversationId],
        (old: { conversation?: Conversation; messages?: ConversationMessage[] } | undefined) => {
          if (!old) return old;
          const toMsg = (m: Partial<ConversationMessage> & { id: string; role: string; content: string }) => ({
            id: m.id,
            conversation_id: conversationId,
            role: m.role as ConversationMessage['role'],
            content: m.content,
            sources: m.sources ?? null,
            memories_used: m.memories_used ?? null,
            groq_usage: m.groq_usage ?? null,
            created_at: typeof m.created_at === 'string' ? m.created_at : (m.created_at as Date)?.toISO?.() ?? new Date().toISOString(),
          });
          const newMessages = [
            ...(old.messages ?? []),
            toMsg(userMessage),
            ...(assistantMessage ? [toMsg(assistantMessage)] : []),
          ];
          return { ...old, messages: newMessages };
        }
      );
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useArchiveConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      await api.post(`${BASE}/${conversationId}/archive`);
      return conversationId;
    },
    onSuccess: (conversationId) => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      qc.invalidateQueries({ queryKey: ['conversation', conversationId] });
    },
  });
}
