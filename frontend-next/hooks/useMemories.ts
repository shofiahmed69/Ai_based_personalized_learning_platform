'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Memory, MemoryType } from '@/lib/types';

const BASE = '/api/memories';

export function useMemories(type?: MemoryType) {
  return useQuery({
    queryKey: ['memories', type],
    queryFn: async () => {
      const { data } = await api.get<{ data?: { memories: Memory[] }; memories?: Memory[] }>(
        type ? `${BASE}?type=${type}` : BASE
      );
      return data.data?.memories ?? data.memories ?? [];
    },
  });
}

export function useDeactivateMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`${BASE}/${id}/deactivate`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}
