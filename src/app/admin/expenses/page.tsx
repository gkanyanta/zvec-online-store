'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, X, Check, Wallet } from 'lucide-react';
import { useExpensesStore } from '@/store/expenses';
import { formatPrice } from '@/lib/utils';
import type { Expense } from '@/types';

const CATEGORIES = [
  'Rent', 'Transport / Delivery', 'Salaries / Wages', 'Marketing & Advertising',
  'Utilities', 'Packaging', 'Stock Procurement', 'Phone & Internet', 'Other',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Rent': 'bg-purple-100 text-purple-700',
  'Transport / Delivery': 'bg-blue-100 text-blue-700',
  'Salaries / Wages': 'bg-emerald-100 text-emerald-700',
  'Marketing & Advertising': 'bg-pink-100 text-pink-700',
  'Utilities': 'bg-yellow-100 text-yellow-700',
  'Packaging': 'bg-orange-100 text-orange-700',
  'Stock Procurement': 'bg-teal-100 text-teal-700',
  'Phone & Internet': 'bg-indigo-100 text-indigo-700',
  'Other': 'bg-gray-100 text-gray-700',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' });
}

const EMPTY = { category: CATEGORIES[0], amount: '', date: new Date().toISOString().split('T')[0], description: '' };

export default function ExpensesPage() {
  const { expenses, status, fetchExpenses, addExpense, updateExpense, deleteExpense } = useExpensesStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const filtered = useMemo(() => {
    if (!filterMonth) return expenses;
    return expenses.filter((e) => e.date.startsWith(filterMonth));
  }, [expenses, filterMonth]);

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((e) => { map[e.category] = (map[e.category] ?? 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  function openAdd() { setEditing(null); setForm(EMPTY); setShowForm(true); }
  function openEdit(e: Expense) {
    setEditing(e);
    setForm({ category: e.category, amount: String(e.amount), date: e.date, description: e.description ?? '' });
    setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditing(null); }

  async function handleSave() {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return;
    setSaving(true);
    try {
      const data = { category: form.category, amount: Number(form.amount), date: form.date, description: form.description || undefined };
      if (editing) { await updateExpense(editing.id, data); }
      else { await addExpense(data); }
      closeForm();
    } finally { setSaving(false); }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm">Track business costs to see your real profit</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Month filter + total */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Month:</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
          />
          {filterMonth && (
            <button onClick={() => setFilterMonth('')} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2 rounded-xl">
          <Wallet size={16} className="text-red-500" />
          <span className="text-sm font-bold text-red-700">
            {filterMonth ? `${filterMonth} total:` : 'All time:'} {formatPrice(totalFiltered)}
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">By Category</h2>
          <div className="space-y-2">
            {byCategory.map(([cat, amt]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full w-44 truncate ${CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-700'}`}>
                  {cat}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${Math.min(100, (amt / totalFiltered) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 w-24 text-right">{formatPrice(amt)}</span>
                <span className="text-xs text-gray-400 w-10 text-right">{Math.round((amt / totalFiltered) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {status === 'loading' ? (
          <div className="text-center py-16 text-gray-400">Loading expenses…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Wallet size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No expenses recorded{filterMonth ? ' this month' : ''}</p>
            <button onClick={openAdd} className="mt-3 text-teal-600 text-sm font-medium hover:underline">Add your first expense</button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Description</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(exp.date)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${CATEGORY_COLORS[exp.category] ?? 'bg-gray-100 text-gray-700'}`}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{exp.description || '—'}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600 text-sm">{formatPrice(exp.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(exp)} className="text-gray-400 hover:text-teal-600 p-1"><Pencil size={14} /></button>
                      <button
                        onClick={() => { if (confirm('Delete this expense?')) deleteExpense(exp.id); }}
                        className="text-gray-300 hover:text-red-500 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900">{editing ? 'Edit Expense' : 'Add Expense'}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (K)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="500"
                    min={1}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Office rent for June"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={closeForm} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
