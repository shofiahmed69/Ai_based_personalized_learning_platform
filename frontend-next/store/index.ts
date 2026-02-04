import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  activeConversationId: string | null;
  setAuth: (user: User | null, accessToken: string | null, refreshToken: string | null) => void;
  setUser: (user: User | null) => void;
  setActiveConversationId: (id: string | null) => void;
  logout: () => void;
}

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      activeConversationId: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          activeConversationId: null,
        }),
    }),
    {
      name: 'ai-kb-auth',
      partialize: (s) => ({ accessToken: s.accessToken, user: s.user, refreshToken: s.refreshToken }),
    }
  )
);
