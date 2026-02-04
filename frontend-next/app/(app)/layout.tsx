'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useStore((s) => s.accessToken);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!accessToken) {
      router.replace(`/login?from=${encodeURIComponent(pathname || '/dashboard')}`);
    }
  }, [accessToken, router, pathname]);

  if (!accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
