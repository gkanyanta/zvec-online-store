'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, ArrowRight, Check, Send } from 'lucide-react';
import { useDocumentsStore } from '@/store/documents';
import { formatPrice } from '@/lib/utils';
import type { BizDocument, DocumentStatus } from '@/types';

const STATUS_COLOR: Record<DocumentStatus, string> = {
  draft:     'bg-gray-100 text-gray-600',
  sent:      'bg-blue-100 text-blue-700',
  accepted:  'bg-teal-100 text-teal-700',
  rejected:  'bg-red-100 text-red-600',
  expired:   'bg-orange-100 text-orange-600',
  paid:      'bg-emerald-100 text-emerald-700',
  overdue:   'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  issued:    'bg-emerald-100 text-emerald-700',
};

const QUOTE_STATUSES: DocumentStatus[] = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
const INVOICE_STATUSES: DocumentStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZM', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { documents, status, fetchDocuments, fetchDocumentById, updateDocument, convertDocument } = useDocumentsStore();
  const [converting, setConverting] = useState(false);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const doc = documents.find((d) => d.id === id);

  useEffect(() => {
    if (status === 'ready' && !doc) {
      fetchDocumentById(id);
    }
  }, [status, doc, id, fetchDocumentById]);

  if (!doc) return (
    <div className="p-6 text-center text-gray-400 py-20">
      <p>Loading…</p>
    </div>
  );

  const statuses = doc.type === 'quote' ? QUOTE_STATUSES : doc.type === 'invoice' ? INVOICE_STATUSES : [];

  async function setStatus(status: DocumentStatus) {
    await updateDocument(id, { status });
  }

  async function handleConvert(to: 'invoice' | 'receipt') {
    setConverting(true);
    try {
      const newDoc = await convertDocument(id, to);
      router.push(`/admin/documents/${newDoc.id}`);
    } catch (err) {
      console.error(err);
      alert('Conversion failed');
    } finally {
      setConverting(false);
    }
  }

  const typeLabel = doc.type.charAt(0).toUpperCase() + doc.type.slice(1);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-gray-900 font-mono">{doc.number}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[doc.status]}`}>
              {doc.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm">{typeLabel} · Created {formatDate(doc.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/documents/${id}/print`}
            target="_blank"
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-xl text-sm font-medium"
          >
            <Printer size={15} /> Print / PDF
          </Link>
          {doc.type === 'quote' && doc.status !== 'rejected' && doc.status !== 'expired' && (
            <button
              onClick={() => handleConvert('invoice')}
              disabled={converting}
              className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-xl text-sm font-bold"
            >
              <ArrowRight size={15} /> Convert to Invoice
            </button>
          )}
          {doc.type === 'invoice' && doc.status !== 'paid' && doc.status !== 'cancelled' && (
            <button
              onClick={() => handleConvert('receipt')}
              disabled={converting}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-xl text-sm font-bold"
            >
              <Check size={15} /> Mark Paid + Issue Receipt
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Document preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-3">Bill To</h2>
            <p className="font-semibold text-gray-900">{doc.customer.name}</p>
            {doc.customer.phone && <p className="text-sm text-gray-600">{doc.customer.phone}</p>}
            {doc.customer.email && <p className="text-sm text-gray-600">{doc.customer.email}</p>}
            {doc.customer.address && <p className="text-sm text-gray-600">{doc.customer.address}</p>}
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Line Items</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Description</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">Qty</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500">Unit Price</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {doc.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-5 py-3 text-gray-800">{item.description}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{item.quantity}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{formatPrice(item.unitPrice)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-5 py-4 space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>{formatPrice(doc.subtotal)}</span>
              </div>
              {doc.discount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Discount</span><span>- {formatPrice(doc.discount)}</span>
                </div>
              )}
              {doc.tax > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax / VAT</span><span>{formatPrice(doc.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-lg text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span><span className="text-teal-700">{formatPrice(doc.total)}</span>
              </div>
            </div>
          </div>

          {doc.notes && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
              <h2 className="font-bold text-yellow-800 mb-2 text-sm">Notes</h2>
              <p className="text-sm text-yellow-700">{doc.notes}</p>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Dates */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Created</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDate(doc.createdAt)}</p>
            </div>
            {doc.dueDate && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Due Date</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDate(doc.dueDate)}</p>
              </div>
            )}
            {doc.linkedDocId && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Linked Document</p>
                <Link href={`/admin/documents/${doc.linkedDocId}`} className="text-sm text-teal-600 hover:underline font-medium mt-0.5 block">
                  View linked document
                </Link>
              </div>
            )}
          </div>

          {/* Status update */}
          {statuses.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Send size={15} className="text-teal-600" /> Update Status
              </h2>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors border ${
                      doc.status === s
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'border-gray-200 text-gray-600 hover:border-teal-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Link href="/admin/documents" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft size={14} /> Back to Documents
      </Link>
    </div>
  );
}
