import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminStore {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

const ADMIN_PIN = '1234';

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (pin) => {
        if (pin === ADMIN_PIN) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    { name: 'zvec-admin' }
  )
);
