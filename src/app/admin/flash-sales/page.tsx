'use client';

import { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';
import { useInventoryStore } from '@/store/inventory';
import { formatPrice } from '@/lib/utils';

interface FlashSale {
  id: string; label: string; productId: string; productName: string;
  salePrice: number; endsAt: string; active: boolean; createdAt: string;
}

function tomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(23, 59, 0, 0);
  return d.toISOString().slice(0, 16);
}

export default function FlashSalesPage() {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ productId: '', label: 'Flash Sale', salePrice: '', endsAt: tomorrow() });

  const products = useInventoryStore((s) => s.products);
  const fetchProducts = useInventoryStore((s) => s.fetchProducts);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    adminFetch('/api/admin/flash-sales')
      .then((r) => r.json())
      .then((d) => { setSales(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await adminFetch('/api/admin/flash-sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, salePrice: Number(form.salePrice), endsAt: new Date(form.endsAt).toISOString() }),
    });
    if (res.ok) {
      const fresh = await adminFetch('/api/admin/flash-sales').then((r) => r.json());
      setSales(fresh);
      setShowForm(false);
      setForm({ productId: '', label: 'Flash Sale', salePrice: '', endsAt: tomorrow() });
    }
    setSaving(false);
  }

  async function toggleActive(sale: FlashSale) {
    await adminFetch(`/api/admin/flash-sales/${sale.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !sale.active }),
    });
    setSales((ss) => ss.map((s) => s.id === sale.id ? { ...s, active: !s.active } : s));
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this flash sale?')) return;
    await adminFetch(`/api/admin/flash-sales/${id}`, { method: 'DELETE' });
    setSales((ss) => ss.filter((s) => s.id !== id));
  }

  const activeSales = sales.filter((s) => s.active && new Date(s.endsAt) > new Date());

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Flash Sales</h1>
          <p className="text-gray-500 text-sm mt-0.5">{activeSales.length} active · {sales.length} total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> New Flash Sale
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-gray-900">New Flash Sale</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
            <select
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (regular: {formatPrice(p.price)})</option>
              ))}
            </select>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Label</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (K) *</label>
              <input
                type="number"
                value={form.salePrice}
                onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                required min={1}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ends At *</label>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-200 text-gray-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
              {saving ? 'Creating…' : 'Create Flash Sale'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
      ) : sales.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center">
          <Zap size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700">No flash sales yet</p>
          <p className="text-gray-400 text-sm mt-1">Create a time-limited deal to drive urgency.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sale Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Ends</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sales.map((sale) => {
                const expired = new Date(sale.endsAt) <= new Date();
                return (
                  <tr key={sale.id} className={expired ? 'opacity-40' : ''}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{sale.productName}</p>
                      <span className="text-xs text-amber-600 font-bold">{sale.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-teal-700">{formatPrice(sale.salePrice)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                      {expired ? '⏱ Expired' : new Date(sale.endsAt).toLocaleString('en-ZM', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleActive(sale)} className="text-gray-400 hover:text-teal-600 transition-colors">
                          {sale.active ? <ToggleRight size={20} className="text-teal-500" /> : <ToggleLeft size={20} />}
                        </button>
                        <button onClick={() => handleDelete(sale.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
