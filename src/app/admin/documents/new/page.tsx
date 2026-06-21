'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useDocumentsStore } from '@/store/documents';
import { formatPrice } from '@/lib/utils';
import type { DocumentType, DocumentItem } from '@/types';

const EMPTY_ITEM: DocumentItem = { description: '', quantity: 1, unitPrice: 0, total: 0 };

export default function NewDocumentPage() {
  const router = useRouter();
  const { createDocument } = useDocumentsStore();
  const [saving, setSaving] = useState(false);

  const [docType, setDocType] = useState<DocumentType>('quote');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const [items, setItems] = useState<DocumentItem[]>([{ ...EMPTY_ITEM }]);
  const [taxRate, setTaxRate] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');

  function updateItem(idx: number, field: keyof DocumentItem, val: string) {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[idx], [field]: field === 'description' ? val : Number(val) };
      item.total = item.quantity * item.unitPrice;
      next[idx] = item;
      return next;
    });
  }

  function addItem() { setItems((p) => [...p, { ...EMPTY_ITEM }]); }
  function removeItem(idx: number) { setItems((p) => p.filter((_, i) => i !== idx)); }

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmt = Math.round((subtotal * Number(taxRate)) / 100);
  const discountAmt = Number(discount);
  const total = subtotal + taxAmt - discountAmt;

  async function handleSave() {
    if (!customer.name.trim()) return alert('Customer name is required');
    if (items.some((i) => !i.description.trim())) return alert('All items must have a description');
    setSaving(true);
    try {
      const doc = await createDocument({
        type: docType,
        customer,
        items,
        subtotal,
        tax: taxAmt,
        discount: discountAmt,
        total,
        notes: notes || undefined,
        dueDate: dueDate || undefined,
      });
      router.push(`/admin/documents/${doc.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create document');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/documents" className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-black text-gray-900">New Document</h1>
      </div>

      {/* Document type */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-3">Document Type</h2>
        <div className="flex gap-3">
          {(['quote', 'invoice'] as DocumentType[]).map((t) => (
            <label
              key={t}
              className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                docType === t ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input type="radio" value={t} checked={docType === t} onChange={() => setDocType(t)} className="accent-teal-500" />
              <div>
                <div className="font-semibold text-gray-900 capitalize">{t}</div>
                <div className="text-xs text-gray-500">
                  {t === 'quote' ? 'Price estimate for customer approval' : 'Payment request — converts to receipt when paid'}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Customer */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Customer Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
              placeholder="e.g. Mwansa Chanda"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
              placeholder="+260 97X XXX XXX"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={customer.email} onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
              placeholder="email@example.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" value={customer.address} onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))}
              placeholder="City, Province"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-xs text-gray-500 font-semibold">Description</th>
                <th className="text-center pb-2 text-xs text-gray-500 font-semibold w-20">Qty</th>
                <th className="text-right pb-2 text-xs text-gray-500 font-semibold w-28">Unit Price (K)</th>
                <th className="text-right pb-2 text-xs text-gray-500 font-semibold w-28">Total</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 pr-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder="Product or service description"
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-teal-400"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      min={1}
                      className="w-full text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-teal-400"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <input
                      type="number"
                      value={item.unitPrice || ''}
                      onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                      min={0}
                      placeholder="0"
                      className="w-full text-right border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-teal-400"
                    />
                  </td>
                  <td className="py-2 pl-3 text-right font-semibold text-gray-900">{formatPrice(item.total)}</td>
                  <td className="py-2 pl-2">
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addItem} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium">
          <Plus size={16} /> Add Item
        </button>

        {/* Totals */}
        <div className="border-t border-gray-100 pt-4 space-y-2 max-w-xs ml-auto">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 gap-3">
            <span>Discount (K)</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min={0}
              className="w-24 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 gap-3">
            <span>VAT / Tax (%)</span>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              min={0}
              max={100}
              className="w-24 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
          {taxAmt > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax ({taxRate}%)</span><span>{formatPrice(taxAmt)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-lg text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span><span className="text-teal-700">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes + Due date */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Additional Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {docType === 'invoice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
          )}
          <div className={docType === 'invoice' ? '' : 'sm:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Payment instructions, terms, or any other notes..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          {saving ? 'Creating…' : `Create ${docType.charAt(0).toUpperCase() + docType.slice(1)}`}
        </button>
        <Link href="/admin/documents" className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50">
          Cancel
        </Link>
      </div>
    </div>
  );
}
