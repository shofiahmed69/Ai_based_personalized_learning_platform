'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { SearchMode } from '@/lib/types';

export interface SearchResultItem {
  document_id: string;
  document_title: string;
  snippet: string;
  score?: number;
}

export function useSearch(query: string, mode: SearchMode = 'keyword', enabled = true) {
  return useQuery({
    queryKey: ['search', query, mode],
    queryFn: async (): Promise<SearchResultItem[]> => {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      params.set('mode', mode);
      const { data } = await api.get<{ data?: { results: SearchResultItem[] }; results?: SearchResultItem[] }>(
        `/api/search?${params.toString()}`
      );
      return data.data?.results ?? data.results ?? [];
    },
    enabled: enabled && query.trim().length > 0,
  });
}
