import Link from 'next/link';
import { RefreshCw, CheckCircle, XCircle, MessageCircle, Phone, Clock } from 'lucide-react';
import { ZVEC_PHONE, ZVEC_PHONE_DISPLAY, ZVEC_WHATSAPP_URL } from '@/lib/data';

const eligible = [
  'Item received in damaged or defective condition',
  'Item is significantly different from what was described',
  'Wrong item delivered',
  'Item is dead on arrival (DOA)',
  'Sealed packaging was already opened on delivery',
];

const notEligible = [
  'Items that have been used, installed, or assembled',
  'Items with physical damage caused after delivery',
  'Items missing original accessories, packaging, or manuals',
  'Items returned more than 7 days after delivery',
  'Consumable items (batteries, light bulbs, etc.)',
];

const steps = [
  { step: '1', title: 'Contact Us Within 7 Days', desc: 'Call or WhatsApp us within 7 days of receiving your order. Have your order reference number ready.' },
  { step: '2', title: 'Describe the Issue', desc: 'Tell us what\'s wrong and send photos or video if the item is damaged or defective. This speeds up the process.' },
  { step: '3', title: 'We Arrange Collection', desc: 'Our team will arrange to collect the item from your address — no need to travel anywhere.' },
  { step: '4', title: 'Inspection & Resolution', desc: 'Once we receive and inspect the item, we\'ll offer a replacement, exchange, or refund within 3–5 business days.' },
];

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-50 rounded-2xl mb-4">
          <RefreshCw size={26} className="text-teal-600" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Returns & Exchanges</h1>
        <p className="text-gray-500">We want you to be completely satisfied. If something&apos;s not right, we&apos;ll make it right.</p>
      </div>

      {/* Policy summary */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 flex items-start gap-4">
        <Clock size={22} className="text-teal-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-black text-teal-900 text-lg">7-Day Returns Policy</p>
          <p className="text-teal-700 text-sm mt-1">
            Return any eligible item within <strong>7 days of delivery</strong> for a full replacement, exchange, or refund. No restocking fees.
          </p>
        </div>
      </div>

      {/* Eligible / Not eligible */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-teal-500" />
            <h2 className="font-bold text-gray-900">Eligible for Return</h2>
          </div>
          <ul className="space-y-2">
            {eligible.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={18} className="text-red-400" />
            <h2 className="font-bold text-gray-900">Not Eligible</h2>
          </div>
          <ul className="space-y-2">
            {notEligible.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-300 shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Process */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-950 px-6 py-3">
          <h2 className="text-amber-400 font-bold text-sm uppercase tracking-widest">How to Return an Item</h2>
        </div>
        <div className="p-6 space-y-5">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5">
                {s.step}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{s.title}</p>
                <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refund timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Refund Timeline</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">Cash on Delivery orders</span>
            <span className="font-semibold text-gray-900">Cash refund on collection, or mobile money within 3 days</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">Replacement / exchange</span>
            <span className="font-semibold text-gray-900">Dispatched within 3–5 business days</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Inspection period</span>
            <span className="font-semibold text-gray-900">1–2 business days after we receive item</span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gray-950 rounded-2xl p-6 text-center">
        <h2 className="text-white font-black text-lg mb-2">Ready to Return an Item?</h2>
        <p className="text-gray-400 text-sm mb-5">Contact us now — we&apos;ll guide you through the process.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={ZVEC_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
            <MessageCircle size={16} /> WhatsApp Us
          </a>
          <a href={`tel:${ZVEC_PHONE}`}
            className="flex items-center justify-center gap-2 border border-white/20 hover:bg-white/5 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            <Phone size={16} /> {ZVEC_PHONE_DISPLAY}
          </a>
        </div>
      </div>

      <div className="text-center space-x-4 text-sm">
        <Link href="/faq" className="text-teal-600 hover:text-teal-700 font-medium">FAQ</Link>
        <span className="text-gray-300">·</span>
        <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">← Home</Link>
      </div>
    </div>
  );
}
