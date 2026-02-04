'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';

export function LandingClient() {
  const router = useRouter();
  const accessToken = useStore((s) => s.accessToken);

  useEffect(() => {
    if (accessToken) router.replace('/dashboard');
  }, [accessToken, router]);

  if (accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-400">Redirecting…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-100">AI Knowledge Base</h1>
        <p className="max-w-md text-gray-400">
          Your documents, tags, and conversations in one place. Ask questions and get answers grounded in your knowledge.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-5 py-2.5 text-gray-100 transition hover:border-gray-600 hover:bg-gray-800"
        >
          <LogIn className="h-4 w-4" />
          Login
        </Link>
        <Link
          href="/register"
          className="flex items-center gap-2 rounded-lg bg-violet-500 px-5 py-2.5 text-white shadow-lg shadow-black/20 transition hover:bg-violet-600"
        >
          <UserPlus className="h-4 w-4" />
          Register
        </Link>
      </div>
    </div>
  );
}
