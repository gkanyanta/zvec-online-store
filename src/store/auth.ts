import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types';

export type { UserRole };

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('zvec-admin-token', token);
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('zvec-admin-token');
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: 'zvec-auth' }
  )
);
