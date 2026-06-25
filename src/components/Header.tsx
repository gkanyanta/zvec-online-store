'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Search, Menu, X, Phone, ChevronRight, Heart } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { useInventoryStore } from '@/store/inventory';
import { useWishlistStore } from '@/store/wishlist';
import { formatPrice } from '@/lib/utils';
import { ZVEC_PHONE_DISPLAY, ZVEC_WHATSAPP_URL } from '@/lib/data';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount, openCart } = useCartStore();
  const count = itemCount();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const products = useInventoryStore((s) => s.products);
  const fetchProducts = useInventoryStore((s) => s.fetchProducts);

  useEffect(() => {
    if (searchOpen) {
      fetchProducts();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen, fetchProducts]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSearchOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, products]);

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  }

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
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="flex items-center justify-center w-9 h-9 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <Search size={18} />
              </button>

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative flex items-center justify-center w-9 h-9 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {wishlistCount}
                  </span>
                )}
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

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="max-w-2xl mx-auto mt-16 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <form onSubmit={submitSearch} className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-gray-900 text-white pl-12 pr-14 py-4 rounded-2xl text-base border border-white/10 focus:outline-none focus:border-amber-500/60 placeholder-gray-500 shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </form>

            {/* Live results */}
            {searchQuery.trim() && (
              <div className="bg-gray-900 border border-white/10 rounded-2xl mt-2 overflow-hidden shadow-2xl">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg shrink-0 bg-gray-800" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{product.name}</p>
                          <p className="text-gray-400 text-xs">{formatPrice(product.price)}</p>
                        </div>
                        <ChevronRight size={14} className="text-gray-600 shrink-0" />
                      </Link>
                    ))}
                    <button
                      onClick={submitSearch}
                      className="w-full px-4 py-3 text-amber-400 text-sm font-semibold text-left hover:bg-white/5 transition-colors"
                    >
                      See all results for &ldquo;{searchQuery.trim()}&rdquo; →
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-gray-400 text-sm">No products found for &ldquo;{searchQuery.trim()}&rdquo;</p>
                    <p className="text-gray-600 text-xs mt-1">Try a different keyword</p>
                  </div>
                )}
              </div>
            )}

            <p className="text-center text-gray-600 text-xs mt-4">Press ESC to close</p>
          </div>
        </div>
      )}
    </>
  );
}
