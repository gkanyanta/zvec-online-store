import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

interface WishlistStore {
  items: Product[];
  toggle: (product: Product) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const existing = get().items;
        const inList = existing.some((p) => p.id === product.id);
        set({ items: inList ? existing.filter((p) => p.id !== product.id) : [...existing, product] });
      },
      has: (productId) => get().items.some((p) => p.id === productId),
      clear: () => set({ items: [] }),
    }),
    { name: 'zvec-wishlist' }
  )
);
