'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Package, AlertTriangle } from 'lucide-react';
import { useInventoryStore } from '@/store/inventory';
import type { Product } from '@/types';

export default function StockEditorPage() {
  const products = useInventoryStore((s) => s.products);
  const fetchProducts = useInventoryStore((s) => s.fetchProducts);
  const updateProduct = useInventoryStore((s) => s.updateProduct);
  const status = useInventoryStore((s) => s.status);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Local edits: productId → { qty, threshold }
  const [edits, setEdits] = useState<Record<string, { qty: string; threshold: string }>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function getQty(p: Product) {
    return edits[p.id]?.qty ?? (p.stockQuantity?.toString() ?? '');
  }
  function getThreshold(p: Product) {
    return edits[p.id]?.threshold ?? (p.lowStockThreshold?.toString() ?? '5');
  }

  function setQty(id: string, val: string) {
    setEdits((e) => ({ ...e, [id]: { qty: val, threshold: e[id]?.threshold ?? '' } }));
  }
  function setThreshold(id: string, val: string) {
    setEdits((e) => ({ ...e, [id]: { qty: e[id]?.qty ?? '', threshold: val } }));
  }

  async function saveAll() {
    const changed = products.filter((p) => edits[p.id]);
    if (!changed.length) return;
    setSaving(true);
    try {
      await Promise.all(
        changed.map((p) =>
          updateProduct(p.id, {
            stockQuantity: edits[p.id].qty !== '' ? Number(edits[p.id].qty) : undefined,
            lowStockThreshold: edits[p.id].threshold !== '' ? Number(edits[p.id].threshold) : 5,
          })
        )
      );
      setEdits({});
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  const dirtyCount = Object.keys(edits).length;
  const lowStock = products.filter(
    (p) => p.stockQuantity != null && p.stockQuantity <= (p.lowStockThreshold ?? 5)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Stock Editor</h1>
          <p className="text-gray-500 text-sm mt-0.5">Update quantities and low-stock thresholds for all products at once.</p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving || dirtyCount === 0}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : saved ? '✓ Saved!' : <><Save size={15} /> Save {dirtyCount > 0 ? `(${dirtyCount})` : 'Changes'}</>}
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700">
            <span className="font-bold">{lowStock.length} product{lowStock.length > 1 ? 's' : ''} running low:</span>{' '}
            {lowStock.map((p) => `${p.name} (${p.stockQuantity ?? 0} left)`).join(', ')}
          </p>
        </div>
      )}

      {status !== 'ready' ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 w-36">Stock Qty</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 w-36">Alert Below</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => {
                const qty = getQty(p);
                const threshold = getThreshold(p);
                const qtyNum = qty !== '' ? Number(qty) : null;
                const threshNum = threshold !== '' ? Number(threshold) : 5;
                const isLow = qtyNum !== null && qtyNum <= threshNum;
                const isDirty = !!edits[p.id];
                return (
                  <tr key={p.id} className={isDirty ? 'bg-amber-50/40' : ''}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-gray-100 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[240px]">{p.name}</p>
                          <p className="text-gray-400 text-xs capitalize">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={(e) => setQty(p.id, e.target.value)}
                        placeholder="—"
                        className={`w-24 text-center border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-teal-400 ${isLow && qtyNum !== null ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={threshold}
                        onChange={(e) => setThreshold(p.id, e.target.value)}
                        className="w-24 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-teal-400"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {qtyNum === null ? (
                        <span className="text-gray-300 text-xs">not tracked</span>
                      ) : isLow ? (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">LOW</span>
                      ) : (
                        <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 justify-center">
                          <Package size={10} /> OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400 text-center">Leave Qty blank to stop tracking stock for a product. &quot;Alert Below&quot; sets when the low-stock warning appears on the dashboard.</p>
    </div>
  );
}
