import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

interface RecentlyViewedStore {
  items: Product[];
  add: (product: Product) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => {
        const filtered = get().items.filter((p) => p.id !== product.id);
        set({ items: [product, ...filtered].slice(0, 8) });
      },
    }),
    { name: 'zvec-recently-viewed' }
  )
);
