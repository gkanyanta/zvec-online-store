'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MessageCircle, Phone } from 'lucide-react';
import { ZVEC_PHONE, ZVEC_PHONE_DISPLAY, ZVEC_WHATSAPP_URL } from '@/lib/data';

const FAQS = [
  {
    section: 'Ordering',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Browse our products, add items to your cart, and proceed to checkout. Fill in your delivery details and submit. Our team will call you within a few hours to confirm the order and arrange delivery.',
      },
      {
        q: 'Do I need an account to order?',
        a: 'No account needed. Just add items to your cart and check out as a guest. Your order reference number is all you need to track your delivery.',
      },
      {
        q: 'Can I order by WhatsApp or phone?',
        a: 'Yes! You can contact us directly on WhatsApp or call us on ' + ZVEC_PHONE_DISPLAY + ' to place an order. Our team is available Monday to Saturday, 8am–6pm.',
      },
      {
        q: 'Can I change or cancel my order after placing it?',
        a: 'Yes, as long as the order hasn\'t been dispatched. Call or WhatsApp us as soon as possible and we\'ll make the changes. Once an order is out for delivery, we\'re unable to cancel it.',
      },
    ],
  },
  {
    section: 'Delivery',
    items: [
      {
        q: 'Where do you deliver?',
        a: 'We deliver across all 10 provinces of Zambia — Lusaka, Copperbelt, Southern, Eastern, Northern, North-Western, Western, Luapula, Central, and Muchinga. No area is too remote.',
      },
      {
        q: 'How much does delivery cost?',
        a: 'Delivery is free nationwide on all orders. No hidden charges — the price you see is the price you pay.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Lusaka: 1–2 business days. Copperbelt: 2–3 business days. All other provinces: 3–5 business days. Delivery times may vary slightly during public holidays.',
      },
      {
        q: 'How will I know when my order is coming?',
        a: 'Our delivery team will call you before arriving to confirm your address and agree on a convenient time. You can also track your order anytime at zvec.store/track-order using your order reference number.',
      },
    ],
  },
  {
    section: 'Payment',
    items: [
      {
        q: 'How do I pay?',
        a: 'We offer Cash on Delivery — you pay when your order arrives at your door. No upfront payment is required. We also accept Mobile Money (MTN MoMo and Airtel Money) on request.',
      },
      {
        q: 'Is it safe to order without paying upfront?',
        a: 'Absolutely. We\'re a trusted Zambian business with 400,000+ followers and a long track record. You inspect your items before paying — there\'s no risk to you.',
      },
      {
        q: 'Do you offer credit or instalment plans?',
        a: 'Not at the moment, but we do offer Special Packages that bundle multiple items at a discounted price. Check our Packages page for current deals.',
      },
    ],
  },
  {
    section: 'Products & Authenticity',
    items: [
      {
        q: 'Are your products genuine?',
        a: 'Yes, 100%. Every product we sell is sourced from verified suppliers and is fully authentic. We do not sell counterfeit or second-hand goods unless explicitly stated.',
      },
      {
        q: 'Do products come with a warranty?',
        a: 'Most electronics come with a manufacturer\'s warranty. The warranty period is stated on the product packaging. Contact us if you have a warranty claim and we\'ll assist you.',
      },
      {
        q: 'What if an item is out of stock?',
        a: 'Out-of-stock items are clearly marked. You can contact us on WhatsApp to ask when a product will be restocked, and we\'ll notify you when it\'s available.',
      },
    ],
  },
  {
    section: 'Returns & Refunds',
    items: [
      {
        q: 'What is your returns policy?',
        a: 'We offer a 7-day returns policy. If you\'re not satisfied with your purchase, contact us within 7 days of delivery and we\'ll arrange a return or exchange.',
      },
      {
        q: 'What items can be returned?',
        a: 'Items must be in original condition, unused, and in original packaging. We cannot accept returns on items that have been used, damaged by the customer, or are missing accessories.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Contact us on WhatsApp or call us on ' + ZVEC_PHONE_DISPLAY + ' within 7 days of receiving your order. Our team will guide you through the return process and arrange collection.',
      },
      {
        q: 'How long do refunds take?',
        a: 'Once we receive and inspect the returned item, refunds are processed within 3–5 business days via the same payment method used.',
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-semibold text-gray-900 text-sm sm:text-base">{q}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="text-gray-600 text-sm leading-relaxed pb-4">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-500">Everything you need to know about ordering from ZVEC Online Store.</p>
      </div>

      {/* FAQ sections */}
      <div className="space-y-6">
        {FAQS.map((section) => (
          <div key={section.section} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-950 px-6 py-3">
              <h2 className="text-amber-400 font-bold text-sm uppercase tracking-widest">{section.section}</h2>
            </div>
            <div className="px-6">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions */}
      <div className="mt-10 bg-gray-950 rounded-2xl p-8 text-center">
        <h2 className="text-white font-black text-xl mb-2">Still have a question?</h2>
        <p className="text-gray-400 text-sm mb-6">Our team is available Monday–Saturday, 8am–6pm.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={ZVEC_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            <MessageCircle size={16} /> Chat on WhatsApp
          </a>
          <a
            href={`tel:${ZVEC_PHONE}`}
            className="flex items-center justify-center gap-2 border border-white/20 hover:bg-white/5 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            <Phone size={16} /> {ZVEC_PHONE_DISPLAY}
          </a>
        </div>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-teal-600 hover:text-teal-700 text-sm font-medium">← Back to Home</Link>
      </div>
    </div>
  );
}
