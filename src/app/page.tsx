export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Truck, CreditCard, RotateCcw, ChevronRight, MessageCircleMore } from 'lucide-react';
import { ZVEC_WHATSAPP_URL } from '@/lib/data';
import { packages, categories } from '@/lib/data';
import { sql, toProduct, toBanner, ensureSchema } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import HeroSlideshow from '@/components/HeroSlideshow';
import { formatPrice, calculateDiscount } from '@/lib/utils';

const SLIDE_TAGLINES: Record<string, string> = {};

const trustItems = [
  { icon: Shield,    title: 'Genuine Products',     desc: 'Every item verified authentic — no counterfeits, no compromises.' },
  { icon: Truck,     title: 'Free Nationwide Delivery', desc: 'We deliver across all 10 provinces in Zambia, for free.' },
  { icon: CreditCard, title: 'Cash on Delivery',    desc: 'Pay when your order arrives. Zero upfront risk.' },
  { icon: RotateCcw, title: '7-Day Returns',        desc: 'Not happy? Return within 7 days, no questions asked.' },
];

const packageAccentMap: Record<string, { ring: string; badge: string; dot: string }> = {
  blue:   { ring: 'border-blue-500/40',    badge: 'bg-blue-600',   dot: 'bg-blue-400' },
  green:  { ring: 'border-emerald-500/40', badge: 'bg-emerald-600', dot: 'bg-emerald-400' },
  pink:   { ring: 'border-pink-500/40',    badge: 'bg-pink-500',   dot: 'bg-pink-400' },
  orange: { ring: 'border-orange-500/40',  badge: 'bg-orange-500', dot: 'bg-orange-400' },
};

export default async function HomePage() {
  await ensureSchema();

  const [featuredRows, moreRows, bannerRows] = await Promise.all([
    sql`SELECT * FROM products WHERE badge IS NOT NULL ORDER BY name LIMIT 8`,
    sql`SELECT * FROM products ORDER BY id DESC LIMIT 8`,
    sql`SELECT * FROM slideshow_banners WHERE active = true ORDER BY sort_order ASC LIMIT 3`,
  ]);
  const featuredProducts = featuredRows.map(toProduct);
  const moreProducts    = moreRows.map(toProduct);

  // Use admin-managed banners if any exist, otherwise fall back to featured products
  const heroSlides = bannerRows.length > 0
    ? bannerRows.map(toBanner).map((b) => ({
        id:      b.id,
        image:   b.image,
        title:   b.title,
        tagline: b.tagline,
        linkUrl: b.linkUrl,
      }))
    : (() => {
        const pool = featuredProducts.length >= 3 ? featuredProducts : [...featuredProducts, ...moreProducts];
        return pool.slice(0, 3).map((p) => ({
          id:      p.id,
          image:   p.image,
          title:   p.name,
          tagline: SLIDE_TAGLINES[p.id] ?? p.description.split('.')[0] + '.',
          linkUrl: `/products/${p.slug}`,
          badge:   p.badge ?? p.category,
        }));
      })();

  return (
    <div className="bg-gray-50">

      {/* ── Hero Slideshow ───────────────────────────────────────── */}
      <HeroSlideshow slides={heroSlides} />

      {/* ── Trust bar ────────────────────────────────────────────── */}
      <section className="bg-gray-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{title}</h3>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by Category ─────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">Shop by Category</h2>
            <Link href="/products" className="text-sm text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              All <ChevronRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {categories.slice(1).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-2 bg-gray-50 hover:bg-amber-50 border border-gray-100 hover:border-amber-200 rounded-xl p-3 transition-all group"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[11px] text-gray-600 group-hover:text-amber-700 text-center leading-tight font-medium">
                  {cat.name.split(' ')[0]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Featured Products</h2>
            <p className="text-gray-500 text-sm mt-0.5">Hand-picked, top-selling items</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold text-sm">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── Packages banner ──────────────────────────────────────── */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              Bundle Deals
            </span>
            <h2 className="text-3xl font-black text-white mb-3">Special Packages</h2>
            <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
              Curated bundles for every life stage. Buy together and save more.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((pkg) => {
              const accent = packageAccentMap[pkg.color] ?? packageAccentMap.blue;
              return (
                <Link
                  key={pkg.id}
                  href={`/packages#${pkg.id}`}
                  className={`group bg-gray-900 border ${accent.ring} rounded-2xl p-5 hover:bg-gray-800 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${accent.badge} rounded-xl text-2xl mb-4 shadow-lg`}>
                    {pkg.icon}
                  </div>
                  <h3 className="font-bold text-white mb-1">{pkg.title}</h3>
                  <p className="text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed">{pkg.description}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-gray-600 text-xs line-through">{formatPrice(pkg.totalValue)}</div>
                      <div className="text-amber-400 font-black text-lg">{formatPrice(pkg.packagePrice)}</div>
                    </div>
                    <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold text-xs px-2.5 py-1 rounded-lg">
                      -{calculateDiscount(pkg.totalValue, pkg.packagePrice)}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-amber-500/25 text-sm tracking-wide"
            >
              Explore All Packages <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── More Products ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-2xl font-black text-gray-900">New Arrivals</h2>
            <p className="text-gray-500 text-sm mt-0.5">Recently added to the store</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold text-sm">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {moreProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────── */}
      <section className="bg-amber-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '400K+', label: 'Brand Followers' },
              { value: '10',    label: 'Provinces Covered' },
              { value: '100%',  label: 'Genuine Products' },
              { value: 'Free',  label: 'Nationwide Delivery' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-black text-gray-950">{s.value}</div>
                <div className="text-gray-800 text-sm font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WhatsApp CTA ──────────────────────────────────────────── */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-2xl mb-6">
            <MessageCircleMore size={30} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Need Help Ordering?</h2>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            Chat with our team on WhatsApp — we&apos;re here Mon–Sat, 8 am to 6 pm.
          </p>
          <a
            href={ZVEC_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-green-500/25 text-sm tracking-wide"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>

    </div>
  );
}
