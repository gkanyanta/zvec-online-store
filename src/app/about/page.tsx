import Link from 'next/link';
import Image from 'next/image';
import { Shield, Truck, Users, Star, MessageCircle, Phone } from 'lucide-react';
import { ZVEC_PHONE, ZVEC_PHONE_DISPLAY, ZVEC_WHATSAPP_URL } from '@/lib/data';

const values = [
  { icon: Shield,  title: 'Genuine Products Only',      desc: 'Every item we sell is sourced directly from verified suppliers. No counterfeits, no grey imports — ever.' },
  { icon: Truck,   title: 'Free Nationwide Delivery',    desc: 'We deliver across all 10 provinces of Zambia, completely free. Lusaka next-day, countrywide within 5 days.' },
  { icon: Star,    title: 'Quality You Can Trust',       desc: 'We hand-pick every product for build quality, value for money, and after-sales support availability in Zambia.' },
  { icon: Users,   title: 'Zambian-First Business',      desc: 'We are proudly Zambian — our team, our suppliers, and our customers. Every purchase supports local jobs and the local economy.' },
];

const stats = [
  { value: '400K+', label: 'Brand Followers' },
  { value: '10',    label: 'Provinces Covered' },
  { value: '100%',  label: 'Genuine Products' },
  { value: 'Free',  label: 'Nationwide Delivery' },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">

      {/* Hero */}
      <div className="text-center">
        <Image src="/zvec-logo.png" alt="ZVEC Online Store" width={180} height={64} className="object-contain mx-auto mb-6" />
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Zambia&apos;s Trusted Online Store</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          ZVEC Online Store is the e-commerce arm of the ZVEC brand — one of Zambia&apos;s most followed household goods and electronics brands, with over 400,000 followers nationwide.
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gray-950 rounded-2xl p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-black text-amber-400">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
        <div className="inline-block bg-gray-950 px-4 py-1.5 rounded-full mb-2">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Our Story</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          ZVEC started as a college-based brand with a simple mission: give Zambian families access to quality household electronics at fair prices, with the convenience of home delivery. What began on social media grew into one of the most recognised electronics brands in the country.
        </p>
        <p className="text-gray-600 leading-relaxed">
          ZVEC Online Store brings that same mission online — so whether you&apos;re in Lusaka, Kitwe, Chipata, or Mongu, you can shop from our full catalogue, pay on delivery, and get your order brought straight to your door.
        </p>
        <p className="text-gray-600 leading-relaxed">
          We believe buying electronics shouldn&apos;t require a trip to town, waiting in queues, or worrying about whether what you&apos;re buying is genuine. With ZVEC, you shop with confidence.
        </p>
      </div>

      {/* Values */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">What We Stand For</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4">
              <div className="w-11 h-11 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gray-950 rounded-2xl p-8 text-center">
        <h2 className="text-white font-black text-xl mb-2">Get in Touch</h2>
        <p className="text-gray-400 text-sm mb-6">Questions, partnerships, bulk orders — we&apos;re here to help. Mon–Sat, 8am–6pm.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={ZVEC_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
            <MessageCircle size={16} /> Chat on WhatsApp
          </a>
          <a href={`tel:${ZVEC_PHONE}`}
            className="flex items-center justify-center gap-2 border border-white/20 hover:bg-white/5 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            <Phone size={16} /> {ZVEC_PHONE_DISPLAY}
          </a>
        </div>
      </div>

      <div className="text-center">
        <Link href="/products" className="text-teal-600 hover:text-teal-700 text-sm font-medium">Browse Our Products →</Link>
      </div>

    </div>
  );
}
