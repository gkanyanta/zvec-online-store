import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products as seedProducts } from '@/lib/data';
import { Product } from '@/types';

interface InventoryStore {
  products: Product[];
  toggleStock: (id: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set) => ({
      products: seedProducts,
      toggleStock: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, inStock: !p.inStock } : p
          ),
        })),
      updateProduct: (id, updates) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      addProduct: (product) =>
        set((s) => ({ products: [...s.products, product] })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
    }),
    { name: 'zvec-inventory' }
  )
);
