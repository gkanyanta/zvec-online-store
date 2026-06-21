import { create } from 'zustand';
import { adminFetch } from '@/lib/adminFetch';
import type { Order, OrderStatus, PaymentMethod } from '@/types';

export type { Order, OrderItem, OrderStatus, PaymentMethod } from '@/types';

interface OrdersStore {
  orders: Order[];
  status: 'idle' | 'loading' | 'ready';
  fetchOrders: () => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => void;
}

export const useOrdersStore = create<OrdersStore>()((set, get) => ({
  orders: [],
  status: 'idle',

  fetchOrders: async () => {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    try {
      const res = await adminFetch('/api/orders');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const orders: Order[] = await res.json();
      set({ orders, status: 'ready' });
    } catch (err) {
      console.error('Failed to load orders:', err);
      set({ status: 'idle' });
    }
  },

  addOrder: async (order) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Failed to save order');
    const saved: Order = await res.json();
    set((s) => ({ orders: [saved, ...s.orders] }));
  },

  updateStatus: async (id, status) => {
    // Optimistic update
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      ),
    }));
    await adminFetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(console.error);
  },

  deleteOrder: (id) => {
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
    adminFetch(`/api/orders/${id}`, { method: 'DELETE' }).catch(console.error);
  },
}));
