'use client';

import { useRef } from 'react';
import { setAuthToken } from '@/lib/axios';
import { useStore } from '@/store';

export function HydrationBoundary({ children }: { children: React.ReactNode }) {
  const hydrated = useRef(false);
  if (typeof window !== 'undefined' && !hydrated.current) {
    hydrated.current = true;
    const token = useStore.getState().accessToken;
    if (token) setAuthToken(token);
  }
  return <>{children}</>;
}
