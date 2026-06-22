'use client';

import { use, useEffect } from 'react';
import { useDocumentsStore } from '@/store/documents';
import { formatPrice } from '@/lib/utils';

export default function DocumentPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { documents, status, fetchDocuments, fetchDocumentById } = useDocumentsStore();

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const doc = documents.find((d) => d.id === id);

  useEffect(() => {
    if (status === 'ready' && !doc) {
      fetchDocumentById(id);
    }
  }, [status, doc, id, fetchDocumentById]);

  if (!doc) return <div className="p-8 text-gray-400">Loading document…</div>;

  const isDeliveryNote = doc.type === 'delivery_note';
  const typeLabel = doc.type === 'quote' ? 'QUOTATION'
    : doc.type === 'invoice' ? 'INVOICE'
    : doc.type === 'receipt' ? 'RECEIPT'
    : 'DELIVERY NOTE';
  const today = new Date().toLocaleDateString('en-ZM', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; }
      `}</style>

      {/* Print button */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="bg-teal-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg hover:bg-teal-700 text-sm"
        >
          Print / Save as PDF
        </button>
        <button onClick={() => window.close()} className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl shadow text-sm hover:bg-gray-50">
          Close
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-10 bg-white min-h-screen" style={{ color: '#1a1a2e' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/zvec-logo.png" alt="ZVEC" className="h-12 object-contain mb-2" />
            <p className="text-xs text-gray-500 leading-relaxed">
              ZVEC Online Store<br />
              Lusaka, Zambia<br />
              Powered by Privtech Solutions Limited
            </p>
          </div>
          <div className="text-right">
            <div
              className="inline-block text-white font-black text-xl px-4 py-2 rounded-xl mb-3"
              style={{ background: '#0D9E8E' }}
            >
              {typeLabel}
            </div>
            <p className="text-sm text-gray-600"><span className="font-semibold">Number:</span> {doc.number}</p>
            <p className="text-sm text-gray-600"><span className="font-semibold">Date:</span> {today}</p>
            {doc.dueDate && (
              <p className="text-sm text-gray-600"><span className="font-semibold">Due:</span> {new Date(doc.dueDate).toLocaleDateString('en-ZM', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            )}
            <div
              className="mt-2 inline-block text-xs font-bold px-2 py-1 rounded-full capitalize"
              style={{ background: '#f0fdf4', color: '#15803d' }}
            >
              {doc.status}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 3, background: '#0D9E8E', borderRadius: 2, marginBottom: 24 }} />

        {/* Deliver To / Bill To */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#0D9E8E' }}>
            {isDeliveryNote ? 'Deliver To' : 'Bill To'}
          </p>
          <p className="font-bold text-lg">{doc.customer.name}</p>
          {doc.customer.phone && <p className="text-sm text-gray-600">{doc.customer.phone}</p>}
          {doc.customer.email && <p className="text-sm text-gray-600">{doc.customer.email}</p>}
          {doc.customer.address && <p className="text-sm text-gray-600">{doc.customer.address}</p>}
        </div>

        {/* Items table */}
        <table className="w-full mb-6" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0D9E8E', color: 'white' }}>
              <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide">Description</th>
              <th className="text-center py-3 px-3 text-xs font-bold uppercase tracking-wide">Qty</th>
              {!isDeliveryNote && <th className="text-right py-3 px-3 text-xs font-bold uppercase tracking-wide">Unit Price</th>}
              {!isDeliveryNote && <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide">Total</th>}
              {isDeliveryNote && <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wide">Received</th>}
            </tr>
          </thead>
          <tbody>
            {doc.items.map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? '#f0fdfa' : 'white' }}>
                <td className="py-3 px-4 text-sm">{item.description}</td>
                <td className="py-3 px-3 text-sm text-center text-gray-600">{item.quantity}</td>
                {!isDeliveryNote && <td className="py-3 px-3 text-sm text-right text-gray-600">{formatPrice(item.unitPrice)}</td>}
                {!isDeliveryNote && <td className="py-3 px-4 text-sm text-right font-semibold">{formatPrice(item.total)}</td>}
                {isDeliveryNote && <td className="py-3 px-4 text-sm text-center" style={{ border: '1px solid #d1d5db', minWidth: 80 }}>&nbsp;</td>}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals (hidden for delivery notes) */}
        {!isDeliveryNote && (
          <div className="ml-auto max-w-xs space-y-1.5">
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
            <div className="flex justify-between font-black text-xl pt-2" style={{ borderTop: '2px solid #0D9E8E', color: '#0D9E8E' }}>
              <span>TOTAL</span><span>{formatPrice(doc.total)}</span>
            </div>
          </div>
        )}

        {/* Delivery note signature section */}
        {isDeliveryNote && (
          <div className="mt-10 grid grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-6">Dispatched By</p>
              <div style={{ borderTop: '1px solid #9ca3af', paddingTop: 4 }}>
                <p className="text-xs text-gray-400">Name &amp; Signature</p>
              </div>
              <div className="mt-4" style={{ borderTop: '1px solid #9ca3af', paddingTop: 4 }}>
                <p className="text-xs text-gray-400">Date</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-6">Received By (Customer)</p>
              <div style={{ borderTop: '1px solid #9ca3af', paddingTop: 4 }}>
                <p className="text-xs text-gray-400">Name &amp; Signature</p>
              </div>
              <div className="mt-4" style={{ borderTop: '1px solid #9ca3af', paddingTop: 4 }}>
                <p className="text-xs text-gray-400">Date</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {doc.notes && (
          <div className="mt-8 p-4 rounded-xl" style={{ background: '#fefce8', border: '1px solid #fde68a' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1 text-yellow-700">Notes</p>
            <p className="text-sm text-yellow-800">{doc.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6" style={{ borderTop: '1px solid #e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Thank you for your business.</p>
              <p className="text-xs text-gray-400">For queries: contact ZVEC via WhatsApp or email.</p>
            </div>
            <div style={{ height: 3, width: 80, background: '#0D9E8E', borderRadius: 2 }} />
          </div>
          <p className="text-center text-xs text-gray-300 mt-4">
            Powered by Privtech Solutions Limited · www.privtech.net
          </p>
        </div>
      </div>
    </>
  );
}
