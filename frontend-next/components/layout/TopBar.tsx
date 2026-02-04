'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export function TopBar() {
  const router = useRouter();
  const [q, setQ] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}&mode=hybrid`);
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-gray-800 bg-gray-950/80 px-4 backdrop-blur">
      <form onSubmit={handleSubmit} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search documents…"
            className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2 pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-violet-500 focus:outline-none"
          />
        </div>
      </form>
    </header>
  );
}
