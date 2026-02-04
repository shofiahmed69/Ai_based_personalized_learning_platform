import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth, users, type User } from '../api/client';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setState((s) => ({ ...s, user: null, loading: false }));
      return;
    }
    try {
      const { data } = await users.me();
      setState((s) => ({ ...s, user: data.user, loading: false, error: null }));
    } catch {
      localStorage.removeItem('accessToken');
      setState((s) => ({ ...s, user: null, loading: false }));
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { data } = await auth.login(email, password);
      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
      setState((s) => ({ ...s, user: data.user, loading: false, error: null }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Login failed';
      setState((s) => ({ ...s, loading: false, error: message }));
      throw e;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { data } = await auth.register(email, password, displayName);
      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
      setState((s) => ({ ...s, user: data.user, loading: false, error: null }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Registration failed';
      setState((s) => ({ ...s, loading: false, error: message }));
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setState((s) => ({ ...s, user: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
