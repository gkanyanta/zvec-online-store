'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Menu, X, Phone } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cart';

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
  ];

  return (
    <>
      {/* Top bar */}
      <div className="bg-green-800 text-white text-sm py-2 px-4 flex items-center justify-between">
        <span className="hidden sm:flex items-center gap-2">
          <Phone size={14} />
          <span>+260 97X XXX XXX &nbsp;|&nbsp; Cash on Delivery Available Nationwide</span>
        </span>
        <span className="text-green-200 text-xs sm:text-sm font-medium">
          🛡️ Trusted Zambian Store &nbsp;•&nbsp; Genuine Products Guaranteed
        </span>
      </div>

      {/* Main header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-green-600 text-white font-black text-xl px-3 py-1 rounded-lg tracking-tight">
                ZVEC
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-gray-900 leading-tight text-sm">Online Store</div>
                <div className="text-xs text-green-600">Trusted. Affordable. Zambian.</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-green-600 font-medium text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <Link href="/products" className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors">
                <Search size={20} />
              </Link>

              <button
                onClick={openCart}
                className="relative flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
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
                className="block py-2 text-gray-700 hover:text-green-600 font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 text-sm text-gray-500 flex items-center gap-2">
              <Phone size={14} />
              +260 97X XXX XXX
            </div>
          </div>
        )}
      </header>
    </>
  );
}
