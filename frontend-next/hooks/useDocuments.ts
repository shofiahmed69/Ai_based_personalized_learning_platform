'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Document, DocumentStatus } from '@/lib/types';

const BASE = '/api/documents';

export function useDocuments(params?: { status?: DocumentStatus; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();

  return useQuery({
    queryKey: ['documents', params?.status, params?.page, params?.limit],
    queryFn: async () => {
      const { data } = await api.get<{ data?: { items: Document[]; pagination: { total: number; page: number; limit: number } }; items?: Document[]; pagination?: { total: number; page: number; limit: number } }>(
        `${BASE}${qs ? `?${qs}` : ''}`
      );
      const items = data.data?.items ?? data.items ?? [];
      const pagination = data.data?.pagination ?? data.pagination ?? { total: 0, page: 1, limit: 20 };
      return { items, pagination };
    },
  });
}

export function useDocument(id: string | null) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const { data } = await api.get<{ data?: { document: Document }; document?: Document }>(`${BASE}/${id}`);
      return data.data?.document ?? data.document;
    },
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; original_filename: string; file_type: string; storage_path: string; file_size_bytes: number }) => {
      const { data } = await api.post<{ data?: { document: Document }; document?: Document }>(BASE, body);
      return data.data?.document ?? data.document;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ data?: { document: Document }; document?: Document }>(
        `${BASE}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data.data?.document ?? data.document;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useArchiveDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      await api.post(`${BASE}/${documentId}/archive`);
      return documentId;
    },
    onSuccess: (documentId) => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['document', documentId] });
    },
  });
}
