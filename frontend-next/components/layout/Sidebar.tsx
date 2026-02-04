'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Network,
  Brain,
  LogOut,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/learning', label: 'Learning', icon: GraduationCap },
  { href: '/knowledge-graph', label: 'Knowledge Graph', icon: Network },
  { href: '/memories', label: 'Memories', icon: Brain },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language, toggle } = useLanguage();

  return (
    <aside className="flex w-60 flex-col border-r border-gray-800 bg-gray-900">
      <div className="flex h-14 items-center gap-2 border-b border-gray-800 px-4">
        <BookOpen className="h-6 w-6 text-violet-400" />
        <span className="font-semibold text-gray-100">AI Knowledge Base</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-gray-800 text-violet-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-800 p-2">
        <div className="mb-2 flex items-center justify-between rounded-lg px-3 py-2">
          <span className="text-xs text-gray-400">Language</span>
          <button
            type="button"
            onClick={toggle}
            className="rounded bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-300 hover:bg-gray-700"
          >
            {language === 'en' ? 'en' : 'বন'}
          </button>
        </div>
        <div className="truncate px-3 py-1 text-xs text-gray-400">{user?.email}</div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
