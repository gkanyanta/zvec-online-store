'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, Plus, Trash2, X, Phone, MapPin, Package, ChevronDown } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';
import { useAuthStore } from '@/store/auth';
import { formatPrice } from '@/lib/utils';
import type { DeliveryRun, DeliveryRunStatus, Order } from '@/types';

const STATUS_OPTIONS: { value: DeliveryRunStatus; label: string; color: string }[] = [
  { value: 'planned',     label: 'Planned',     color: 'bg-blue-100 text-blue-700' },
  { value: 'in_progress', label: 'In Progress',  color: 'bg-orange-100 text-orange-700' },
  { value: 'completed',   label: 'Completed',    color: 'bg-teal-100 text-teal-700' },
];

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-ZM', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function fmtDeliveryDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-ZM', {
    day: 'numeric', month: 'short',
  });
}

export default function DeliveryRunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const isDelivery = user?.role === 'delivery';
  const [run, setRun] = useState<DeliveryRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddOrders, setShowAddOrders] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/delivery-runs/${id}`);
      if (res.ok) setRun(await res.json());
      else router.push('/admin/delivery');
    } finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(status: DeliveryRunStatus) {
    setStatusOpen(false);
    const res = await adminFetch(`/api/delivery-runs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setRun(await res.json());
  }

  async function removeOrder(orderId: string) {
    setRemoving(orderId);
    try {
      await adminFetch(`/api/delivery-runs/${id}/orders?orderId=${orderId}`, { method: 'DELETE' });
      setRun((r) => r ? { ...r, orders: r.orders?.filter((o) => o.id !== orderId), orderCount: (r.orderCount ?? 1) - 1 } : r);
    } finally { setRemoving(null); }
  }

  async function loadAvailableOrders() {
    setLoadingOrders(true);
    try {
      const res = await adminFetch('/api/orders');
      if (res.ok) {
        const all: Order[] = await res.json();
        const inRun = new Set(run?.orders?.map((o) => o.id) ?? []);
        setAllOrders(all.filter((o) =>
          !inRun.has(o.id) &&
          !['cancelled', 'delivered'].includes(o.status)
        ));
      }
    } finally { setLoadingOrders(false); }
  }

  async function addOrder(orderId: string) {
    setAdding(orderId);
    try {
      await adminFetch(`/api/delivery-runs/${id}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      await load();
      setAllOrders((o) => o.filter((x) => x.id !== orderId));
    } finally { setAdding(null); }
  }

  async function deleteRun() {
    if (!confirm('Delete this delivery run? Orders will not be affected.')) return;
    await adminFetch(`/api/delivery-runs/${id}`, { method: 'DELETE' });
    router.push('/admin/delivery');
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === run?.status) ?? STATUS_OPTIONS[0];

  if (loading) return <div className="p-6 text-center text-gray-400 py-20">Loading…</div>;
  if (!run) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 mt-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-gray-900">{run.label}</h1>
          <p className="text-gray-500 text-sm">{fmtDate(run.date)} · Driver: {run.driverName}</p>
          {run.notes && <p className="text-gray-500 text-sm mt-1 italic">📝 {run.notes}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm ${currentStatus.color}`}
            >
              {currentStatus.label}
              <ChevronDown size={14} />
            </button>
            {statusOpen && (
              <div className="absolute right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden w-36">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s.value} onClick={() => changeStatus(s.value)}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 ${run.status === s.value ? 'text-teal-600' : 'text-gray-700'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link
            href={`/admin/delivery/${id}/manifest`}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-xl text-sm"
          >
            <Printer size={15} /> Print Manifest
          </Link>
          {!isDelivery && (
            <button onClick={deleteRun} className="text-red-400 hover:text-red-600 p-2" title="Delete run">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Orders in run */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            Orders in this Run <span className="text-gray-400 font-normal">({run.orders?.length ?? 0})</span>
          </h2>
          {!isDelivery && (
            <button
              onClick={() => { setShowAddOrders(true); loadAvailableOrders(); }}
              className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              <Plus size={15} /> Add Orders
            </button>
          )}
        </div>

        {!run.orders?.length ? (
          <div className="text-center py-14 text-gray-400">
            <Package size={36} className="mx-auto mb-2 opacity-30" strokeWidth={1} />
            <p className="text-sm">No orders assigned yet</p>
            {!isDelivery && (
              <button onClick={() => { setShowAddOrders(true); loadAvailableOrders(); }}
                className="mt-3 text-teal-600 text-sm font-semibold hover:underline">
                + Add orders
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {run.orders.map((order, idx) => (
              <div key={order.id} className="flex items-start gap-4 p-4">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone size={10} />
                        <a href={`tel:${order.customer.phone}`} className="hover:text-teal-600">{order.customer.phone}</a>
                      </p>
                      <p className="text-xs text-gray-500 flex items-start gap-1 mt-0.5">
                        <MapPin size={10} className="shrink-0 mt-0.5" />
                        {order.customer.address}, {order.customer.city}
                      </p>
                      {order.deliveryDate && (
                        <p className="text-xs text-teal-600 mt-0.5">Preferred: {fmtDeliveryDate(order.deliveryDate)}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono text-gray-400">{order.id}</p>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                      <p className="text-xs text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {order.items.map((item) => `${item.productName} ×${item.quantity}`).join(', ')}
                  </div>
                </div>
                {!isDelivery && (
                  <button
                    onClick={() => removeOrder(order.id)}
                    disabled={removing === order.id}
                    className="text-gray-300 hover:text-red-400 disabled:opacity-30 p-1 shrink-0"
                    title="Remove from run"
                  >
                    {removing === order.id
                      ? <div className="w-4 h-4 border-2 border-gray-300 border-t-red-400 rounded-full animate-spin" />
                      : <X size={16} />}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add orders modal */}
      {showAddOrders && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="font-black text-gray-900">Add Orders to Run</h2>
              <button onClick={() => setShowAddOrders(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {loadingOrders ? (
              <div className="text-center py-10 text-gray-400">Loading orders…</div>
            ) : allOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="font-medium">No available orders</p>
                <p className="text-sm mt-1">All pending orders are already assigned to runs, delivered, or cancelled.</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 space-y-2">
                {allOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customer.city} · {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {formatPrice(order.total)}
                      </p>
                      {order.deliveryDate && (
                        <p className="text-xs text-teal-600">Prefers: {fmtDeliveryDate(order.deliveryDate)}</p>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'processing' ? 'bg-purple-100 text-purple-700' :
                      'bg-teal-100 text-teal-700'
                    }`}>{order.status}</span>
                    <button
                      onClick={() => addOrder(order.id)}
                      disabled={adding === order.id}
                      className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0"
                    >
                      {adding === order.id
                        ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <Plus size={12} />}
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 shrink-0">
              <button onClick={() => setShowAddOrders(false)}
                className="w-full border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
