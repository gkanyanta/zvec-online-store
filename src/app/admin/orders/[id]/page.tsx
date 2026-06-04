'use client';

import { use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Phone, MapPin, Package, Clock, Check } from 'lucide-react';
import { useOrdersStore, OrderStatus } from '@/store/orders';
import { formatPrice } from '@/lib/utils';
import StatusBadge from '@/components/admin/StatusBadge';

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-ZM', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { orders, updateStatus } = useOrdersStore();
  const order = orders.find((o) => o.id === id);
  if (!order) notFound();

  const nextStatus = NEXT_STATUS[order.status];
  const currentStepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-gray-900 font-mono">{order.id}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-gray-500 text-sm">Placed {formatDate(order.createdAt)}</p>
        </div>
        {order.status !== 'cancelled' && order.status !== 'delivered' && nextStatus && (
          <button
            onClick={() => updateStatus(order.id, nextStatus)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm"
          >
            <Check size={16} />
            Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
          </button>
        )}
      </div>

      {/* Progress tracker */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-green-600" /> Order Progress
          </h2>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, idx) => {
              const done = idx <= currentStepIdx;
              const active = idx === currentStepIdx;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      done ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                    } ${active ? 'ring-4 ring-green-100' : ''}`}>
                      {done ? <Check size={14} /> : idx + 1}
                    </div>
                    <span className={`text-xs mt-1 text-center capitalize font-medium ${done ? 'text-green-700' : 'text-gray-400'}`}>
                      {step}
                    </span>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${idx < currentStepIdx ? 'bg-green-500' : 'bg-gray-100'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Package size={16} className="text-green-600" />
              <h2 className="font-bold text-gray-900">Order Items ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                    <p className="text-gray-500 text-sm">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <div className="font-bold text-gray-900 text-sm shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 px-5 py-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span><span>{formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-black text-lg text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span><span className="text-green-700">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status update */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Update Status</h2>
            <div className="flex flex-wrap gap-2">
              {(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(order.id, s)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors border ${
                    order.status === s
                      ? 'bg-green-600 text-white border-green-600'
                      : s === 'cancelled'
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-gray-200 text-gray-600 hover:border-green-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer + delivery info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone size={16} className="text-green-600" /> Customer
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-900">{order.customer.firstName} {order.customer.lastName}</p>
              <a href={`tel:${order.customer.phone}`} className="block text-green-600 hover:underline font-medium">
                {order.customer.phone}
              </a>
              {order.customer.email && (
                <a href={`mailto:${order.customer.email}`} className="block text-blue-600 hover:underline truncate">
                  {order.customer.email}
                </a>
              )}
              <a
                href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                WhatsApp Customer
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-green-600" /> Delivery Address
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.customer.city}, {order.customer.province}</p>
              <p>{order.customer.address}</p>
              {order.customer.notes && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700">
                  📝 {order.customer.notes}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Payment</h2>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full uppercase">
                {order.paymentMethod.replace('_', ' ')}
              </span>
              {order.status === 'delivered' ? (
                <span className="text-green-600 text-xs font-medium">✅ Paid</span>
              ) : (
                <span className="text-orange-500 text-xs font-medium">⏳ Due on delivery</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/admin/orders" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>
    </div>
  );
}
