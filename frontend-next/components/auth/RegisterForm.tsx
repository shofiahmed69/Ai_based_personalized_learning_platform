'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, displayName || undefined);
      toast.success('Account created');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string }; status?: number } };
      const message =
        ax.response?.data?.message ||
        (err instanceof Error ? err.message : 'Registration failed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-400">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-gray-100 focus:border-violet-500 focus:outline-none"
          required
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-400">Display name (optional)</span>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-gray-100 focus:border-violet-500 focus:outline-none"
          autoComplete="name"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-400">Password (min 8 characters)</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-gray-100 focus:border-violet-500 focus:outline-none"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-violet-500 py-2.5 font-medium text-white shadow-lg shadow-black/20 hover:bg-violet-600 disabled:opacity-70"
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
