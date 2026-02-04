'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Signed in');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
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
        <span className="text-sm text-gray-400">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-gray-100 focus:border-violet-500 focus:outline-none"
          required
          autoComplete="current-password"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-violet-500 py-2.5 font-medium text-white shadow-lg shadow-black/20 hover:bg-violet-600 disabled:opacity-70"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
