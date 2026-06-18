import { create } from 'zustand';
import type { Product } from '@/types';

interface InventoryStore {
  products: Product[];
  status: 'idle' | 'loading' | 'ready';
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  toggleStock: (id: string) => void;
  deleteProduct: (id: string) => void;
}

export const useInventoryStore = create<InventoryStore>()((set, get) => ({
  products: [],
  status: 'idle',

  fetchProducts: async () => {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    try {
      const res = await fetch('/api/products');
      const products: Product[] = await res.json();
      set({ products, status: 'ready' });
    } catch (err) {
      console.error('Failed to load products:', err);
      set({ status: 'idle' });
    }
  },

  addProduct: async (product) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to add product');
    const saved: Product = await res.json();
    set((s) => ({ products: [...s.products, saved] }));
  },

  updateProduct: async (id, updates) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update product');
    const saved: Product = await res.json();
    set((s) => ({ products: s.products.map((p) => (p.id === id ? saved : p)) }));
  },

  toggleStock: (id) => {
    const product = get().products.find((p) => p.id === id);
    if (!product) return;
    const newInStock = !product.inStock;
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, inStock: newInStock } : p)),
    }));
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inStock: newInStock }),
    }).catch(console.error);
  },

  deleteProduct: (id) => {
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(console.error);
  },
}));
