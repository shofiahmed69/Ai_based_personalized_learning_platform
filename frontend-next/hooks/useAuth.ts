'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, setAuthToken } from '@/lib/axios';
import { useStore } from '@/store';
import type { User } from '@/lib/types';

export function useAuth() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const accessToken = useStore((s) => s.accessToken);
  const refreshToken = useStore((s) => s.refreshToken);
  const setAuth = useStore((s) => s.setAuth);
  const logout = useStore((s) => s.logout);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<{ success: boolean; data: { user: User; accessToken: string; refreshToken: string } }>(
        '/api/auth/login',
        { email, password }
      );
      const payload = data.data ?? (data as unknown as { user: User; accessToken: string; refreshToken: string });
      setAuth(payload.user, payload.accessToken, payload.refreshToken ?? null);
      setAuthToken(payload.accessToken);
      router.push('/dashboard');
    },
    [router, setAuth]
  );

  const register = useCallback(
    async (email: string, password: string, display_name?: string) => {
      const { data } = await api.post<{ success: boolean; data: { user: User; accessToken: string; refreshToken: string } }>(
        '/api/auth/register',
        { email, password, display_name }
      );
      const payload = data.data ?? (data as unknown as { user: User; accessToken: string; refreshToken: string });
      setAuth(payload.user, payload.accessToken, payload.refreshToken ?? null);
      setAuthToken(payload.accessToken);
      router.push('/dashboard');
    },
    [router, setAuth]
  );

  const doLogout = useCallback(() => {
    setAuthToken(null);
    logout();
    router.push('/login');
  }, [logout, router]);

  return { user, accessToken, refreshToken, login, register, logout: doLogout };
}
