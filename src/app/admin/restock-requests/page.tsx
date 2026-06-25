'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Loader2, Phone, Mail } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';

interface RestockRequest {
  id: string;
  productId: string;
  productName: string;
  contact: string;
  type: 'email' | 'phone';
  notified: boolean;
  createdAt: string;
}

export default function RestockRequestsPage() {
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'notified'>('pending');

  useEffect(() => {
    adminFetch('/api/admin/restock-requests')
      .then((r) => r.json())
      .then((data) => { setRequests(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function markNotified(id: string) {
    await adminFetch(`/api/admin/restock-requests/${id}`, { method: 'PUT' });
    setRequests((rs) => rs.map((r) => r.id === id ? { ...r, notified: true } : r));
  }

  async function handleDelete(id: string) {
    await adminFetch(`/api/admin/restock-requests/${id}`, { method: 'DELETE' });
    setRequests((rs) => rs.filter((r) => r.id !== id));
  }

  const filtered = requests.filter((r) => {
    if (filter === 'pending') return !r.notified;
    if (filter === 'notified') return r.notified;
    return true;
  });

  const pendingCount = requests.filter((r) => !r.notified).length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Back-in-Stock Requests</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {pendingCount} pending · {requests.length} total
          </p>
        </div>
        <div className="flex gap-2">
          {(['pending', 'notified', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-teal-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center">
          <Bell size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700">No requests</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === 'pending' ? 'All requests have been notified.' : 'No back-in-stock requests yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.id} className={r.notified ? 'opacity-50' : ''}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.productName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {r.type === 'email' ? <Mail size={13} className="text-gray-400" /> : <Phone size={13} className="text-gray-400" />}
                      <span className="text-sm text-gray-700">{r.contact}</span>
                      {r.notified && <span className="text-xs text-teal-600 font-medium ml-1">Notified</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">
                    {new Date(r.createdAt).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {!r.notified && (
                        <button
                          onClick={() => markNotified(r.id)}
                          className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium px-2 py-1 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
                        >
                          <Check size={12} /> Done
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
