'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Loader2, X, Save } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';
import { formatPrice } from '@/lib/utils';
import type { PromoCode } from '@/types';

const EMPTY_FORM = {
  code: '',
  discountType: 'percent' as 'percent' | 'fixed',
  discountValue: '',
  minOrder: '',
  maxUses: '',
};

export default function PromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const res = await adminFetch('/api/admin/promos');
    if (res.ok) setPromos(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setForm(EMPTY_FORM); setError(''); setModal(true); }

  async function handleSave() {
    if (!form.code.trim()) { setError('Code is required.'); return; }
    if (!form.discountValue || Number(form.discountValue) <= 0) { setError('Discount value must be greater than 0.'); return; }
    if (form.discountType === 'percent' && Number(form.discountValue) > 100) { setError('Percent discount cannot exceed 100.'); return; }
    setSaving(true); setError('');
    try {
      const res = await adminFetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `promo_${Date.now()}`,
          code: form.code.trim().toUpperCase(),
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          minOrder: form.minOrder ? Number(form.minOrder) : 0,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Save failed');
      }
      await load();
      setModal(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save. The code may already exist.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(promo: PromoCode) {
    const res = await adminFetch(`/api/admin/promos/${promo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !promo.active }),
    });
    if (res.ok) setPromos((ps) => ps.map((p) => p.id === promo.id ? { ...p, active: !p.active } : p));
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this promo code?')) return;
    await adminFetch(`/api/admin/promos/${id}`, { method: 'DELETE' });
    setPromos((ps) => ps.filter((p) => p.id !== id));
  }

  function describeDiscount(p: PromoCode) {
    const val = p.discountType === 'percent' ? `${p.discountValue}% off` : `${formatPrice(p.discountValue)} off`;
    const min = p.minOrder > 0 ? ` · min order ${formatPrice(p.minOrder)}` : '';
    const uses = p.maxUses != null ? ` · ${p.usesCount}/${p.maxUses} used` : ` · ${p.usesCount} used`;
    return val + min + uses;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Promo Codes</h1>
          <p className="text-gray-500 text-sm mt-0.5">{promos.filter((p) => p.active).length} active code{promos.filter((p) => p.active).length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
          <Plus size={16} /> New Code
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
      ) : promos.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center">
          <Tag size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700">No promo codes yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">Create a code and share it with customers for discounts at checkout.</p>
          <button onClick={openNew} className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Plus size={15} /> Create First Code
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => (
            <div key={promo.id} className={`bg-white border rounded-2xl px-5 py-4 flex items-center gap-4 ${promo.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center shrink-0">
                <Tag size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-gray-900 font-mono tracking-wider">{promo.code}</span>
                  {promo.active
                    ? <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
                    : <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">INACTIVE</span>
                  }
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{describeDiscount(promo)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleToggle(promo)} className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors">
                  {promo.active ? <ToggleRight size={20} className="text-teal-500" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => handleDelete(promo.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-black text-gray-900">New Promo Code</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <p className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">{error}</p>}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. ZVEC10"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 font-mono uppercase tracking-wider"
                />
                <p className="text-[11px] text-gray-400 mt-1">Customers enter this at checkout. Automatically uppercased.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount Type *</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as 'percent' | 'fixed' }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (K)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {form.discountType === 'percent' ? 'Discount %' : 'Discount Amount'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={form.discountType === 'percent' ? '100' : undefined}
                    value={form.discountValue}
                    onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                    placeholder={form.discountType === 'percent' ? '10' : '500'}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min. Order (K)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrder}
                    onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                    placeholder="0 = no minimum"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Uses</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxUses}
                    onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                    placeholder="Leave blank = unlimited"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Create Code</>}
              </button>
              <button onClick={() => setModal(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
