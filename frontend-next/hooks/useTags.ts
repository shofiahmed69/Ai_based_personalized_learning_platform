'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Tag, TagRelationship } from '@/lib/types';

const BASE = '/api/tags';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data } = await api.get<{ data?: { tags: Tag[] }; tags?: Tag[] }>(BASE);
      return data.data?.tags ?? data.tags ?? [];
    },
  });
}

export function useTag(id: string | null) {
  return useQuery({
    queryKey: ['tag', id],
    queryFn: async () => {
      const { data } = await api.get<{ data?: { tag: Tag }; tag?: Tag }>(`${BASE}/${id}`);
      return data.data?.tag ?? data.tag;
    },
    enabled: !!id,
  });
}

export function useTagRelationships(_id: string | null) {
  return useQuery({
    queryKey: ['tag-relationships', _id],
    queryFn: async (): Promise<TagRelationship[]> => {
      return [];
    },
    enabled: false,
  });
}

export function useTagsGraph() {
  return useQuery({
    queryKey: ['tags-graph'],
    queryFn: async () => {
      const { data } = await api.get<{ data?: { nodes: Tag[]; edges: TagRelationship[] }; nodes?: Tag[]; edges?: TagRelationship[] }>(`${BASE}/graph`);
      const nodes = data.data?.nodes ?? data.nodes ?? [];
      const edges = data.data?.edges ?? data.edges ?? [];
      return { nodes, edges };
    },
  });
}
