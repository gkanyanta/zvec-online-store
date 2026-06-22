'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ZVEC_PHONE, ZVEC_PHONE_DISPLAY, ZVEC_WHATSAPP_URL } from '@/lib/data';
import {
  Search, Package, CheckCircle, Clock, Truck, MapPin,
  Phone, MessageCircle, ChevronRight, XCircle, AlertCircle,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';

// ─── status config ───────────────────────────────────────────────────────────

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG: Record<OrderStatus, { label: string; message: string; icon: React.ElementType; color: string; bg: string }> = {
  pending: {
    label: 'Order Received',
    message: "We've received your order. Our team will call you shortly to confirm.",
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
  },
  confirmed: {
    label: 'Confirmed',
    message: "Your order has been confirmed! We're now preparing it for dispatch.",
    icon: CheckCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
  processing: {
    label: 'Processing',
    message: "Your items are being packed and quality-checked before dispatch.",
    icon: Package,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
  },
  shipped: {
    label: 'Out for Delivery',
    message: "Your order is on its way to you! Our delivery partner will contact you.",
    icon: Truck,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200',
  },
  delivered: {
    label: 'Delivered',
    message: "Your order has been delivered. We hope you love your purchase! 🎉",
    icon: CheckCircle,
    color: 'text-teal-600',
    bg: 'bg-teal-50 border-teal-200',
  },
  cancelled: {
    label: 'Cancelled',
    message: "This order has been cancelled. Contact us if you have any questions.",
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
  },
};

const STEP_LABELS: Record<OrderStatus, string> = {
  pending: 'Received',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-ZM', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function estimatedDelivery(order: Order): string {
  const province = order.customer.province;
  const days = province === 'Lusaka Province' ? '1–2' : province.includes('Copperbelt') ? '2–3' : '3–5';
  const placed = new Date(order.createdAt);
  placed.setDate(placed.getDate() + (province === 'Lusaka Province' ? 2 : province.includes('Copperbelt') ? 3 : 5));
  return `${days} business days (by ~${placed.toLocaleDateString('en-ZM', { weekday: 'short', day: 'numeric', month: 'short' })})`;
}

// ─── components ──────────────────────────────────────────────────────────────

function OrderTracker({ order }: { order: Order }) {
  const cfg = STATUS_CONFIG[order.status];
  const StatusIcon = cfg.icon;
  const currentIdx = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Status banner */}
      <div className={`flex items-start gap-4 p-5 rounded-2xl border ${cfg.bg}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${cfg.color} bg-white shadow-sm`}>
          <StatusIcon size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-black text-lg ${cfg.color}`}>{cfg.label}</span>
            <span className="text-gray-400 text-sm font-mono">· {order.id}</span>
          </div>
          <p className="text-gray-600 text-sm">{cfg.message}</p>
        </div>
      </div>

      {/* Progress bar */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wide">Delivery Progress</h3>
          <div className="flex items-start">
            {STATUS_STEPS.map((step, idx) => {
              const done = idx <= currentIdx;
              const active = idx === currentIdx;
              return (
                <div key={step} className="flex items-start flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        done
                          ? active
                            ? 'bg-teal-500 text-white ring-4 ring-teal-100'
                            : 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {done && !active ? <CheckCircle size={16} /> : idx + 1}
                    </div>
                    <span className={`text-xs mt-2 text-center font-medium w-16 leading-tight ${done ? 'text-teal-700' : 'text-gray-400'}`}>
                      {STEP_LABELS[step]}
                    </span>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mt-4 mx-1 transition-all ${idx < currentIdx ? 'bg-teal-500' : 'bg-gray-100'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {order.status !== 'delivered' && (
            <div className="mt-5 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl">
              <Clock size={14} className="text-teal-500 shrink-0" />
              Estimated delivery: <span className="font-semibold text-gray-700">{estimatedDelivery(order)}</span>
            </div>
          )}
        </div>
      )}

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <Package size={16} className="text-teal-500" />
          <h3 className="font-bold text-gray-900">Order Items</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-xl object-cover bg-gray-50 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-bold text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 px-5 py-4 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Delivery</span><span>{formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-black text-base text-gray-900 pt-1 border-t border-gray-100 mt-1">
            <span>Total</span>
            <span className="text-teal-700">{formatPrice(order.total)}</span>
          </div>
          <p className="text-xs text-gray-400 pt-1">
            Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Mobile Money'} ·
            {order.status === 'delivered' ? ' Paid ✅' : ' Due on delivery'}
          </p>
        </div>
      </div>

      {/* Delivery address */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-teal-500" />
          <h3 className="font-bold text-gray-900">Delivery Address</h3>
        </div>
        <p className="text-sm font-semibold text-gray-900">{order.customer.firstName} {order.customer.lastName}</p>
        <p className="text-sm text-gray-600 mt-0.5">{order.customer.address}</p>
        <p className="text-sm text-gray-600">{order.customer.city}, {order.customer.province}</p>
        {order.customer.notes && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg mt-2">
            📝 {order.customer.notes}
          </p>
        )}
      </div>

      {/* Contact support */}
      <div className="bg-[#1e3a8a] rounded-2xl p-6 text-white text-center">
        <h3 className="font-bold text-lg mb-1">Need Help?</h3>
        <p className="text-blue-200 text-sm mb-4">Our team is available Mon–Sat, 8am–6pm.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={ZVEC_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            <MessageCircle size={16} /> WhatsApp Us
          </a>
          <a
            href={`tel:${ZVEC_PHONE}`}
            className="flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Phone size={16} /> {ZVEC_PHONE_DISPLAY}
          </a>
        </div>
      </div>

      <div className="text-center">
        <Link href="/products" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

function TrackOrderContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('id') ?? '');
  const [submitted, setSubmitted] = useState(!!searchParams.get('id'));
  const [result, setResult] = useState<Order | null | 'not-found'>(null);

  useEffect(() => {
    if (submitted && query.trim()) {
      lookup(query.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  async function lookup(q: string) {
    setResult(null);
    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(q)}`);
      setResult(res.ok ? await res.json() : 'not-found');
    } catch {
      setResult('not-found');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmitted(true);
    lookup(query.trim());
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-2xl mb-4">
          <Package size={30} className="text-teal-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Track Your Order</h1>
        <p className="text-gray-500 mt-2">Enter your order reference number or phone number to check your delivery status.</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Order Reference or Phone Number
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSubmitted(false); setResult(null); }}
            placeholder="e.g. ZVE-ABC123 or 0977123456"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 font-mono uppercase placeholder:normal-case placeholder:font-sans"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            <Search size={16} /> Track
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Your order reference was sent via SMS and shown on your order confirmation page.
        </p>
      </form>

      {/* Results */}
      {submitted && result === null && (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {result === 'not-found' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-orange-500" />
          </div>
          <h2 className="font-bold text-gray-900 mb-1">Order Not Found</h2>
          <p className="text-gray-500 text-sm mb-4">
            We couldn&apos;t find an order matching <span className="font-mono font-bold text-gray-700">{query}</span>.
          </p>
          <div className="text-sm text-gray-500 space-y-1 bg-gray-50 rounded-xl p-4 text-left max-w-xs mx-auto">
            <p className="font-semibold text-gray-700 mb-2">Try:</p>
            <p>• Double-check the order reference (e.g. ZVE-ABC123)</p>
            <p>• Enter the phone number used when ordering</p>
            <p>• Check your SMS for the reference number</p>
          </div>
          <a
            href={ZVEC_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-teal-600 hover:text-teal-700 text-sm font-medium"
          >
            <MessageCircle size={14} /> Contact support on WhatsApp
          </a>
        </div>
      )}

      {result && result !== 'not-found' && <OrderTracker order={result} />}

      {/* How it works */}
      {!submitted && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChevronRight size={16} className="text-teal-500" />
            How Order Tracking Works
          </h2>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Place Your Order', desc: 'Complete checkout and receive your order reference number (e.g. ZVE-ABC123).' },
              { step: '2', title: 'Confirmation Call', desc: 'Our team calls to confirm your order and delivery details within a few hours.' },
              { step: '3', title: 'Track in Real-Time', desc: 'Enter your reference or phone number here to see your live delivery status.' },
              { step: '4', title: 'Receive Your Order', desc: 'Pay cash on delivery when your items arrive at your door.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderContent />
    </Suspense>
  );
}
