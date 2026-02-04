'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useStore } from '@/store';

export function useLanguage() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (preferred_language: 'en' | 'bn') => {
      const { data } = await api.patch<{ data?: { user: { preferred_language: string } } }>('/api/users/me', {
        preferred_language,
      });
      return data.data?.user ?? data;
    },
    onSuccess: (updated) => {
      if (updated && user) setUser({ ...user, preferred_language: updated.preferred_language as 'en' | 'bn' });
      qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const toggle = () => {
    const next = user?.preferred_language === 'en' ? 'bn' : 'en';
    mutation.mutate(next);
  };

  return { language: user?.preferred_language ?? 'en', toggle, isLoading: mutation.isPending };
}
