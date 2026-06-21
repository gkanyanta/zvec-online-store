import { create } from 'zustand';
import { adminFetch } from '@/lib/adminFetch';
import type { Expense } from '@/types';

interface ExpensesStore {
  expenses: Expense[];
  status: 'idle' | 'loading' | 'ready';
  fetchExpenses: () => Promise<void>;
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, data: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const useExpensesStore = create<ExpensesStore>()((set, get) => ({
  expenses: [],
  status: 'idle',

  fetchExpenses: async () => {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    try {
      const res = await adminFetch('/api/expenses');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const expenses: Expense[] = await res.json();
      set({ expenses, status: 'ready' });
    } catch (err) {
      console.error('Failed to load expenses:', err);
      set({ status: 'idle' });
    }
  },

  addExpense: async (data) => {
    const res = await adminFetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add expense');
    const saved: Expense = await res.json();
    set((s) => ({ expenses: [saved, ...s.expenses] }));
  },

  updateExpense: async (id, data) => {
    const res = await adminFetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update expense');
    const saved: Expense = await res.json();
    set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? saved : e)) }));
  },

  deleteExpense: async (id) => {
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
    await adminFetch(`/api/expenses/${id}`, { method: 'DELETE' });
  },
}));
