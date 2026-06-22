'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, ArrowLeft } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';
import { formatPrice } from '@/lib/utils';
import type { DeliveryRun } from '@/types';

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-ZM', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function fmtPrefDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-ZM', { day: 'numeric', month: 'short' });
}

export default function ManifestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [run, setRun] = useState<DeliveryRun | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await adminFetch(`/api/delivery-runs/${id}`);
    if (res.ok) setRun(await res.json());
    else router.push('/admin/delivery');
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-6 text-center text-gray-400 py-20">Loading…</div>;
  if (!run) return null;

  const orders = run.orders ?? [];

  return (
    <>
      {/* Screen controls — hidden on print */}
      <div className="print:hidden flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-gray-700 flex-1">Manifest — {run.label}</span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-xl text-sm"
        >
          <Printer size={16} /> Print
        </button>
      </div>

      {/* Manifest body */}
      <div className="max-w-3xl mx-auto p-8 print:p-0 print:max-w-none">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-900">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/zvec-logo.png" alt="ZVEC" className="h-10 object-contain mb-1" />
            <p className="text-xs text-gray-500">ZVEC Online Store · Zambia</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-gray-900 uppercase tracking-wide">Delivery Manifest</p>
            <p className="text-gray-500 text-sm mt-1">Generated {new Date().toLocaleDateString('en-ZM')}</p>
          </div>
        </div>

        {/* Run details */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Run</p>
            <p className="font-bold text-gray-900">{run.label}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Date</p>
            <p className="font-bold text-gray-900">{fmtDate(run.date)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Driver</p>
            <p className="font-bold text-gray-900">{run.driverName}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Stops</p>
            <p className="font-bold text-gray-900">{orders.length}</p>
          </div>
          {run.notes && (
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Notes</p>
              <p className="text-gray-700">{run.notes}</p>
            </div>
          )}
        </div>

        {/* Stops table */}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-left py-2 pr-3 font-bold text-gray-900 w-8">#</th>
              <th className="text-left py-2 pr-3 font-bold text-gray-900">Customer</th>
              <th className="text-left py-2 pr-3 font-bold text-gray-900">Phone</th>
              <th className="text-left py-2 pr-3 font-bold text-gray-900">Address</th>
              <th className="text-left py-2 pr-3 font-bold text-gray-900">Items</th>
              <th className="text-right py-2 pr-3 font-bold text-gray-900">Total</th>
              <th className="text-center py-2 font-bold text-gray-900 w-20">Received</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={order.id} className="border-b border-gray-200 align-top">
                <td className="py-3 pr-3 font-bold text-gray-500">{idx + 1}</td>
                <td className="py-3 pr-3">
                  <p className="font-semibold text-gray-900">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">{order.id}</p>
                  {order.deliveryDate && (
                    <p className="text-xs text-teal-600">Pref: {fmtPrefDate(order.deliveryDate)}</p>
                  )}
                </td>
                <td className="py-3 pr-3 text-gray-700 whitespace-nowrap">{order.customer.phone}</td>
                <td className="py-3 pr-3 text-gray-700">
                  <p>{order.customer.address}</p>
                  <p className="text-gray-500">{order.customer.city}, {order.customer.province}</p>
                  {order.customer.notes && (
                    <p className="text-xs text-orange-600 mt-0.5">📝 {order.customer.notes}</p>
                  )}
                </td>
                <td className="py-3 pr-3 text-gray-700">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-xs">
                      {item.productName} <span className="text-gray-400">×{item.quantity}</span>
                    </p>
                  ))}
                </td>
                <td className="py-3 pr-3 text-right font-bold text-gray-900 whitespace-nowrap">
                  {formatPrice(order.total)}
                </td>
                <td className="py-3">
                  {/* Signature / checkbox box for paper use */}
                  <div className="border-2 border-gray-300 rounded h-10 w-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-12 grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="font-bold text-gray-700 mb-6">Dispatched By:</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-xs text-gray-400">Signature &amp; Date</p>
          </div>
          <div>
            <p className="font-bold text-gray-700 mb-6">Verified By (Supervisor):</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-xs text-gray-400">Signature &amp; Date</p>
          </div>
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center print:block hidden">
          ZVEC Online Store — Confidential Delivery Manifest — {fmtDate(run.date)}
        </p>
      </div>

      <style>{`
        @media print {
          body { margin: 0; }
          @page { margin: 1.5cm; size: A4 landscape; }
        }
      `}</style>
    </>
  );
}
