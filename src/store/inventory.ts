import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { products as seedProducts } from '@/lib/data';
import { Product } from '@/types';

interface InventoryStore {
  products: Product[];
  toggleStock: (id: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

// Use IndexedDB instead of localStorage — products contain large base64 images
// that easily exceed localStorage's ~5 MB limit, causing silent save failures.
const IDB_NAME = 'zvec-db';
const IDB_STORE = 'keyval';
let _db: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => { _db = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error);
  });
}

const idbStorage = createJSONStorage(() => ({
  getItem: async (name: string): Promise<string | null> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(name);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, name);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  removeItem: async (name: string): Promise<void> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(name);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
}));

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
    { name: 'zvec-inventory', storage: idbStorage }
  )
);
