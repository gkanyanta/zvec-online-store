import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';
import { ZVEC_PHONE, ZVEC_PHONE_DISPLAY, ZVEC_WHATSAPP_URL } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Image src="/zvec-logo.png" alt="ZVEC Online Store" width={160} height={60} className="object-contain brightness-0 invert" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Zambia&apos;s trusted online store for household goods and electronics. Backed by the ZVEC brand with 400,000+ followers.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="bg-gray-800 hover:bg-teal-500 p-2 rounded-lg transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="bg-gray-800 hover:bg-teal-500 p-2 rounded-lg transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="bg-gray-800 hover:bg-teal-500 p-2 rounded-lg transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/products', label: 'All Products' },
                { href: '/packages', label: 'Special Packages' },
                { href: '/products?category=laptops', label: 'Laptops' },
                { href: '/products?category=televisions', label: 'Televisions' },
                { href: '/products?category=refrigerators', label: 'Refrigerators' },
                { href: '/products?category=mobile', label: 'Mobile Phones' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-teal-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/track-order', label: 'Track My Order' },
                { href: '/returns', label: 'Returns & Exchanges' },
                { href: '/faq', label: 'FAQ' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/about', label: 'About ZVEC Store' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-teal-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone size={16} className="text-teal-400 mt-0.5 shrink-0" />
                <div>
                  <a href={`tel:${ZVEC_PHONE}`} className="hover:text-teal-400 transition-colors">{ZVEC_PHONE_DISPLAY}</a>
                  <br />
                  <a href={ZVEC_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors text-xs">WhatsApp us</a>
                  <br />
                  <span className="text-xs text-gray-500">Mon–Sat: 8am – 6pm</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="text-teal-400 mt-0.5 shrink-0" />
                <span>info@zveconlinestore.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-teal-400 mt-0.5 shrink-0" />
                <span>ZVEC College Campus<br />Lusaka, Zambia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} ZVEC Online Store. All rights reserved.</p>
            <span className="hidden sm:inline text-gray-700">·</span>
            <p>
              Built by{' '}
              <a
                href="https://store.privtech.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Privtech Solutions Ltd
              </a>
            </p>
          </div>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-teal-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-teal-400">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6 text-xs text-gray-500">
          <span>✅ Cash on Delivery</span>
          <span>🚚 Nationwide Delivery</span>
          <span>🔒 Secure Shopping</span>
          <span>↩️ Easy Returns</span>
          <span>🏷️ Genuine Products</span>
        </div>
      </div>
    </footer>
  );
}
