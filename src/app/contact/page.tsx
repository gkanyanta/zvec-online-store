import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { ZVEC_PHONE, ZVEC_PHONE_DISPLAY, ZVEC_WHATSAPP_URL } from '@/lib/data';

const ZVEC_EMAIL = 'info@zveconlinestore.com';

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500">We&apos;re a real Zambian team — reach us by WhatsApp, phone, or email.</p>
      </div>

      {/* WhatsApp primary CTA */}
      <a
        href={ZVEC_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl p-6 transition-colors group"
      >
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
          <MessageCircle size={28} />
        </div>
        <div>
          <p className="font-black text-lg">Chat on WhatsApp</p>
          <p className="text-green-100 text-sm mt-0.5">Fastest response — usually within minutes during business hours.</p>
        </div>
        <span className="ml-auto text-white/60 group-hover:text-white text-2xl">→</span>
      </a>

      {/* Contact details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-bold text-gray-900">Get in Touch</h2>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
              <Phone size={16} className="text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Phone / WhatsApp</p>
              <a href={`tel:${ZVEC_PHONE}`} className="font-semibold text-gray-900 hover:text-teal-600 transition-colors">
                {ZVEC_PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
              <Mail size={16} className="text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Email</p>
              <a href={`mailto:${ZVEC_EMAIL}`} className="font-semibold text-gray-900 hover:text-teal-600 transition-colors break-all">
                {ZVEC_EMAIL}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Address</p>
              <p className="font-semibold text-gray-900">ZVEC College Campus</p>
              <p className="text-gray-500 text-sm">Lusaka, Zambia</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={16} className="text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Business Hours</p>
              <p className="font-semibold text-gray-900">Monday – Saturday</p>
              <p className="text-gray-500 text-sm">8:00 AM – 6:00 PM</p>
              <p className="text-gray-400 text-xs mt-0.5">Closed Sundays & public holidays</p>
            </div>
          </div>
        </div>

        {/* Common reasons */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Common Enquiries</h2>
          <div className="space-y-3">
            {[
              { label: 'Track my order',     href: '/track-order' },
              { label: 'Returns & exchanges', href: '/returns' },
              { label: 'Product availability', href: '/products' },
              { label: 'Bulk / wholesale orders', href: null },
              { label: 'Delivery areas & times', href: '/faq' },
              { label: 'Promo codes & deals', href: '/products' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                {item.href ? (
                  <Link href={item.href} className="text-teal-600 hover:text-teal-700 font-medium">{item.label}</Link>
                ) : (
                  <a href={ZVEC_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 font-medium">{item.label} — WhatsApp us</a>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              For the fastest response, contact us on WhatsApp. We aim to reply within 30 minutes during business hours.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/" className="text-teal-600 hover:text-teal-700 text-sm font-medium">← Back to Home</Link>
      </div>
    </div>
  );
}
