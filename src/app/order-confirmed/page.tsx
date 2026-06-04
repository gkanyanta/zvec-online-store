'use client';

import Link from 'next/link';
import { CheckCircle, Phone, MessageCircle, Package } from 'lucide-react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'ZVE-UNKNOWN';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-teal-100 rounded-full p-5">
            <CheckCircle size={56} className="text-teal-600" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-2">Thank you for shopping with ZVEC Online Store.</p>

        <div className="bg-teal-50 border border-teal-200 rounded-xl px-6 py-3 inline-block mb-8">
          <p className="text-sm text-teal-600 font-medium">Order Reference</p>
          <p className="text-2xl font-black text-teal-800">{orderId}</p>
        </div>

        {/* What happens next */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 text-left">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-teal-600" />
            What Happens Next
          </h2>
          <ol className="space-y-3">
            {[
              { step: '1', title: 'Order Received', desc: 'We\'ve received your order and are processing it.', done: true },
              { step: '2', title: 'Confirmation Call', desc: 'A ZVEC team member will call you to confirm your order and delivery details.', done: false },
              { step: '3', title: 'Dispatch', desc: 'Your order will be packed and handed to our delivery partner.', done: false },
              { step: '4', title: 'Delivery', desc: 'Your order arrives at your address. Pay cash on delivery.', done: false },
            ].map((item) => (
              <li key={item.step} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${item.done ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {item.done ? <CheckCircle size={14} /> : item.step}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Track order CTA */}
        <Link
          href={`/track-order?id=${orderId}`}
          className="flex items-center justify-center gap-2 w-full bg-[#1e3a8a] hover:bg-[#1a3278] text-white font-bold py-3 rounded-xl transition-colors mb-3 text-sm"
        >
          <Package size={16} /> Track This Order
        </Link>

        {/* Contact options */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <a
            href="https://wa.me/260970000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            <MessageCircle size={16} /> WhatsApp Us
          </a>
          <a
            href="tel:+260970000000"
            className="flex items-center justify-center gap-2 border-2 border-teal-500 text-teal-700 font-medium py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm"
          >
            <Phone size={16} /> Call Us
          </a>
        </div>

        <Link
          href="/products"
          className="text-teal-600 hover:text-teal-700 font-medium text-sm"
        >
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense>
      <OrderConfirmedContent />
    </Suspense>
  );
}
