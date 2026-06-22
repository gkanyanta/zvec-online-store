'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Search, Menu, X, Phone } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { ZVEC_PHONE_DISPLAY, ZVEC_WHATSAPP_URL } from '@/lib/data';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openCart } = useCartStore();
  const count = itemCount();

  const navLinks = [
    { href: '/products', label: 'Shop' },
    { href: '/packages', label: 'Packages' },
    { href: '/products?category=laptops', label: 'Laptops' },
    { href: '/products?category=televisions', label: 'TVs' },
    { href: '/products?category=refrigerators', label: 'Fridges' },
    { href: '/products?category=mobile', label: 'Phones' },
    { href: '/track-order', label: 'Track Order' },
  ];

  return (
    <>
      {/* Top bar — navy from logo */}
      <div className="bg-[#1e3a8a] text-white text-sm py-2 px-4 flex items-center justify-between">
        <a href={ZVEC_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
           className="hidden sm:flex items-center gap-2 hover:text-teal-300 transition-colors">
          <Phone size={14} />
          <span>{ZVEC_PHONE_DISPLAY} &nbsp;|&nbsp; Cash on Delivery Available Nationwide</span>
        </a>
        <span className="text-teal-300 text-xs sm:text-sm font-medium">
          🛡️ Trusted Zambian Store &nbsp;•&nbsp; Genuine Products Guaranteed
        </span>
      </div>

      {/* Main header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/zvec-logo.png"
                alt="ZVEC Online Store"
                width={140}
                height={52}
                className="object-contain"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-teal-600 font-medium text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <Link href="/products" className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors">
                <Search size={20} />
              </Link>

              <button
                onClick={openCart}
                className="relative flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <ShoppingCart size={18} />
                <span className="hidden sm:inline text-sm font-medium">Cart</span>
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>

              <button
                className="lg:hidden text-gray-700"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-teal-600 font-medium"
              >
                {link.label}
              </Link>
            ))}
            <a href={ZVEC_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
               className="pt-2 border-t border-gray-100 text-sm text-gray-500 flex items-center gap-2 hover:text-teal-600">
              <Phone size={14} />
              {ZVEC_PHONE_DISPLAY}
            </a>
          </div>
        )}
      </header>
    </>
  );
}
