'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { api, setAuthToken, setupRefreshInterceptor, attachRequestAuth } from '@/lib/axios';
import { useStore } from '@/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    attachRequestAuth(() => useStore.getState().accessToken);
    const token = useStore.getState().accessToken;
    if (token) setAuthToken(token);

    setupRefreshInterceptor(
      async () => {
        const refreshToken = useStore.getState().refreshToken;
        if (!refreshToken) return null;
        try {
          const { data } = await api.post<{ data?: { accessToken: string }; accessToken?: string }>(
            '/api/auth/refresh',
            { refresh_token: refreshToken }
          );
          const newToken = data.data?.accessToken ?? (data as { accessToken?: string }).accessToken;
          if (newToken) {
            useStore.getState().setAuth(useStore.getState().user, newToken, refreshToken);
            setAuthToken(newToken);
            return newToken;
          }
        } catch {
          // ignore
        }
        return null;
      },
      () => {
        useStore.getState().logout();
        setAuthToken(null);
        router.push('/login');
      }
    );
  }, [router]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
