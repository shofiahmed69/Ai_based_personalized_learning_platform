'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearch } from '@/hooks/useSearch';
import type { SearchMode } from '@/lib/types';
import { EmptyState } from '@/components/shared/EmptyState';
import { Search as SearchIcon, FileText } from 'lucide-react';

const MODES: { value: SearchMode; label: string }[] = [
  { value: 'keyword', label: 'Keyword' },
  { value: 'semantic', label: 'Semantic' },
  { value: 'hybrid', label: 'Hybrid' },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = (searchParams.get('q') ?? '').trim();
  const urlMode = searchParams.get('mode');
  const [mode, setMode] = useState<SearchMode>(
    urlMode === 'semantic' || urlMode === 'hybrid' ? urlMode : 'keyword'
  );
  const [inputValue, setInputValue] = useState(q);
  useEffect(() => setInputValue((prev) => (q !== prev ? q : prev)), [q]);
  useEffect(() => {
    if (urlMode === 'semantic' || urlMode === 'hybrid') setMode(urlMode);
  }, [urlMode]);

  const { data: results = [], isLoading, isFetching } = useSearch(q, mode, true);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-100">Search</h1>
      <p className="mb-4 text-gray-400">
        Search across your documents by title and summary.
      </p>

      <form
        className="mb-4 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const next = new URLSearchParams(searchParams);
          next.set('q', inputValue.trim() || '');
          router.push(`/search?${next.toString()}`);
        }}
      >
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search documents…"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-gray-100 placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
        >
          Search
        </button>
      </form>

      <div className="mb-4 flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={`rounded-lg px-3 py-1 text-sm ${
              mode === m.value ? 'bg-violet-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {isLoading || isFetching ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-800" />
          ))}
        </div>
      ) : !q ? (
        <EmptyState
          title="Enter a search query"
          description="Type something and click Search to find documents by title or summary."
        />
      ) : results.length === 0 ? (
        <EmptyState
          title="No results"
          description="Try a different query or search mode."
        />
      ) : (
        <ul className="space-y-3">
          {results.map((r) => (
            <li key={r.document_id}>
              <Link
                href={`/documents/${r.document_id}`}
                className="block rounded-lg border border-gray-700 bg-gray-800/50 p-4 transition hover:border-violet-500/50 hover:bg-gray-800"
              >
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-100">{r.document_title}</div>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">{r.snippet}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
