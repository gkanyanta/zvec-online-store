'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Check, Truck, AlertCircle, Tag, X } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useOrdersStore } from '@/store/orders';
import { formatPrice } from '@/lib/utils';
import { zambianProvinces, DELIVERY_FEES } from '@/lib/data';
import { CustomerInfo, PromoCode } from '@/types';

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { addOrder } = useOrdersStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'mobile_money'>('cod');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const [form, setForm] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: 'Lusaka Province',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  const subtotal = total();
  const deliveryFee = DELIVERY_FEES[form.province] ?? 0;
  const discountAmount = promoApplied
    ? promoApplied.discountType === 'percent'
      ? Math.round((subtotal * promoApplied.discountValue) / 100)
      : Math.min(promoApplied.discountValue, subtotal)
    : 0;
  const orderTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  async function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true); setPromoError('');
    try {
      const res = await fetch(`/api/promo/${encodeURIComponent(code)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Invalid promo code');
      }
      const promo: PromoCode = await res.json();
      if (subtotal < promo.minOrder) {
        throw new Error(`Minimum order of ${formatPrice(promo.minOrder)} required for this code`);
      }
      setPromoApplied(promo);
    } catch (e: unknown) {
      setPromoError(e instanceof Error ? e.message : 'Invalid promo code');
    } finally {
      setPromoLoading(false);
    }
  }

  function update(field: keyof CustomerInfo, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<CustomerInfo> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Required';
    if (!form.lastName.trim()) newErrors.lastName = 'Required';
    if (!form.phone.trim()) newErrors.phone = 'Required';
    if (!form.address.trim()) newErrors.address = 'Required';
    if (!form.city.trim()) newErrors.city = 'Required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderId = `ZVE-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date().toISOString();

      const order = {
        id: orderId,
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          province: form.province,
          notes: form.notes,
        },
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
        })),
        subtotal,
        deliveryFee,
        discountCode: promoApplied?.code,
        discountAmount: discountAmount || undefined,
        total: orderTotal,
        paymentMethod,
        status: 'pending' as const,
        deliveryDate: deliveryDate || undefined,
        createdAt: now,
        updatedAt: now,
      };

      // Save order to DB (also deducts stock server-side)
      await addOrder(order);

      // Send WhatsApp notifications (fire and forget — don't block the checkout)
      fetch('/api/whatsapp/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'order_placed', order }),
      }).catch(console.error);

      clearCart();
      router.push(`/order-confirmed?id=${orderId}`);
    } catch (err) {
      console.error('Order placement failed:', err);
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products before checking out.</p>
        <Link href="/products" className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-3 rounded-xl transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 text-sm mb-6">
        <ArrowLeft size={16} /> Continue Shopping
      </Link>

      <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Personal Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 ${errors.firstName ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 ${errors.lastName ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="Banda"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="+260 97X XXX XXX"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <Truck size={20} className="text-teal-600" /> Delivery Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                  <select
                    value={form.province}
                    onChange={(e) => update('province', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                  >
                    {zambianProvinces.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                  <p className="text-xs text-teal-600 mt-1 flex items-center gap-1 font-medium">
                    <Truck size={12} />
                    {deliveryFee === 0
                      ? `Free delivery to ${form.province}`
                      : `Delivery to ${form.province}: ${formatPrice(deliveryFee)}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City / Town *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 ${errors.city ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="Lusaka"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address / Area *</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    rows={3}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none ${errors.address ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="House No. 12, Roma, near Roma Primary School..."
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => update('notes', e.target.value)}
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none"
                    placeholder="Any special delivery instructions..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Delivery Date (Optional)</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    min={getTomorrow()}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">Let us know when you&apos;re available — we&apos;ll do our best to accommodate.</p>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 accent-teal-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Cash on Delivery</div>
                    <div className="text-sm text-gray-500 mt-0.5">Pay in cash when your order is delivered to your door. No upfront payment required.</div>
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'mobile_money' ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="mobile_money"
                    checked={paymentMethod === 'mobile_money'}
                    onChange={() => setPaymentMethod('mobile_money')}
                    className="mt-0.5 accent-teal-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      Mobile Money / Bank Transfer
                      <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">Coming Soon</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">MTN Mobile Money, Airtel Money, and bank transfer. Available soon.</div>
                  </div>
                </label>
              </div>

              {paymentMethod === 'mobile_money' && (
                <div className="mt-3 flex items-start gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-xl">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  Mobile money integration is coming soon. Please select Cash on Delivery for now.
                </div>
              )}
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-teal-600 font-semibold' : ''}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-semibold">
                    <span>Promo ({promoApplied?.code})</span>
                    <span>−{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-lg text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-teal-700">{formatPrice(orderTotal)}</span>
                </div>
              </div>

              {/* Promo code */}
              <div className="mt-4">
                {promoApplied ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                    <Tag size={14} className="text-green-600 shrink-0" />
                    <span className="text-green-700 text-xs font-semibold flex-1">{promoApplied.code} applied — saving {formatPrice(discountAmount)}</span>
                    <button onClick={() => { setPromoApplied(null); setPromoInput(''); }} className="text-green-500 hover:text-green-700">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } }}
                        placeholder="Promo code"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400 font-mono uppercase placeholder:normal-case placeholder:font-sans"
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        disabled={promoLoading || !promoInput.trim()}
                        className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold px-3 py-2 rounded-xl text-xs transition-colors whitespace-nowrap"
                      >
                        <Tag size={13} /> {promoLoading ? '…' : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-teal-50 rounded-xl text-xs text-teal-700 flex items-start gap-2">
                <Check size={14} className="shrink-0 mt-0.5" />
                <span>Cash on Delivery — pay only when you receive your order.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || paymentMethod === 'mobile_money'}
                className="w-full mt-4 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>Place Order — {formatPrice(orderTotal)}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
