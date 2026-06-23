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
      {/* Top bar */}
      <div className="bg-black text-gray-400 text-xs py-2 px-4 flex items-center justify-between border-b border-white/5">
        <a
          href={ZVEC_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 hover:text-amber-400 transition-colors"
        >
          <Phone size={12} />
          {ZVEC_PHONE_DISPLAY} &nbsp;·&nbsp; Cash on Delivery Available
        </a>
        <span className="text-gray-500 font-medium">
          🛡️ Trusted Zambian Store &nbsp;·&nbsp; Genuine Products
        </span>
      </div>

      {/* Main header */}
      <header className="bg-gray-950 border-b border-white/8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/zvec-logo.png"
                alt="ZVEC Online Store"
                width={130}
                height={48}
                className="object-contain brightness-0 invert"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/products"
                className="hidden sm:flex items-center justify-center w-9 h-9 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <Search size={18} />
              </Link>

              <button
                onClick={openCart}
                className="relative flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-gray-950 font-bold px-4 py-2 rounded-lg transition-all text-sm"
              >
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">Cart</span>
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                    {count}
                  </span>
                )}
              </button>

              <button
                className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-gray-900 border-t border-white/8 px-4 py-3 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex py-2.5 px-3 text-gray-300 hover:text-white hover:bg-white/5 font-medium text-sm rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={ZVEC_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2.5 px-3 text-gray-500 hover:text-amber-400 text-xs rounded-lg transition-all mt-1 border-t border-white/5 pt-3"
            >
              <Phone size={13} />
              {ZVEC_PHONE_DISPLAY}
            </a>
          </div>
        )}
      </header>
    </>
  );
}
