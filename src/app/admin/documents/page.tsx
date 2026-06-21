'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, ReceiptText, FileText, ChevronRight, Trash2 } from 'lucide-react';
import { useDocumentsStore } from '@/store/documents';
import { formatPrice } from '@/lib/utils';
import type { DocumentType, DocumentStatus } from '@/types';

const TYPE_TABS: { value: DocumentType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'quote', label: 'Quotations' },
  { value: 'invoice', label: 'Invoices' },
  { value: 'receipt', label: 'Receipts' },
];

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

const TYPE_ICON = { quote: FileText, invoice: ReceiptText, receipt: ReceiptText };
const TYPE_COLOR = { quote: 'text-blue-500', invoice: 'text-teal-600', receipt: 'text-emerald-600' };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DocumentsPage() {
  const { documents, status, fetchDocuments, deleteDocument } = useDocumentsStore();
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return documents;
    return documents.filter((d) => d.type === typeFilter);
  }, [documents, typeFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: documents.length };
    documents.forEach((d) => { c[d.type] = (c[d.type] ?? 0) + 1; });
    return c;
  }, [documents]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Documents</h1>
          <p className="text-gray-500 text-sm">Quotations · Invoices · Receipts</p>
        </div>
        <Link
          href="/admin/documents/new"
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> New Document
        </Link>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 flex-wrap">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setTypeFilter(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              typeFilter === tab.value
                ? 'bg-teal-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {(counts[tab.value] ?? 0) > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${typeFilter === tab.value ? 'bg-white/20' : 'bg-gray-100'}`}>
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {status === 'loading' ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ReceiptText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No documents yet</p>
            <Link href="/admin/documents/new" className="mt-3 inline-block text-teal-600 text-sm font-medium hover:underline">
              Create your first document
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Number</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((doc) => {
                const Icon = TYPE_ICON[doc.type];
                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon size={15} className={TYPE_COLOR[doc.type]} />
                        <Link href={`/admin/documents/${doc.id}`} className="font-mono text-sm font-bold text-teal-700 hover:underline">
                          {doc.number}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{doc.customer.name}</div>
                      {doc.customer.phone && <div className="text-xs text-gray-500">{doc.customer.phone}</div>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">{formatDate(doc.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm">{formatPrice(doc.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_COLOR[doc.status]}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/documents/${doc.id}`} className="text-teal-600 hover:text-teal-700 p-1">
                          <ChevronRight size={16} />
                        </Link>
                        <button
                          onClick={() => { if (confirm('Delete this document?')) deleteDocument(doc.id); }}
                          className="text-gray-300 hover:text-red-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
