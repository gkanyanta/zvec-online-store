'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface FlashSaleItem {
  id: string; label: string; salePrice: number; endsAt: string;
  product: Product & { originalPrice?: number };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function Countdown({ endsAt }: { endsAt: string }) {
  const [ms, setMs] = useState(() => Math.max(0, new Date(endsAt).getTime() - Date.now()));

  useEffect(() => {
    const t = setInterval(() => setMs(Math.max(0, new Date(endsAt).getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);

  const cell = (v: number, label: string) => (
    <div className="flex flex-col items-center">
      <span className="bg-gray-900 text-white font-mono font-black text-xl px-3 py-1.5 rounded-lg min-w-[2.5rem] text-center">{pad(v)}</span>
      <span className="text-gray-500 text-xs mt-1">{label}</span>
    </div>
  );

  if (ms === 0) return <span className="text-red-500 font-bold text-sm">Sale ended</span>;
  return (
    <div className="flex items-end gap-1.5">
      {cell(h, 'hrs')}
      <span className="text-gray-400 font-bold text-xl mb-5">:</span>
      {cell(m, 'min')}
      <span className="text-gray-400 font-bold text-xl mb-5">:</span>
      {cell(s, 'sec')}
    </div>
  );
}

export default function FlashSaleSection({ sales }: { sales: FlashSaleItem[] }) {
  const addItem = useCartStore((s) => s.addItem);
  if (!sales.length) return null;
  const sale = sales[0];
  const product = sale.product;
  const savings = product.price - sale.salePrice;
  const savingsPct = Math.round((savings / product.price) * 100);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gradient-to-r from-gray-950 to-gray-900 rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto md:min-h-[320px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-950/80 hidden md:block" />
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-amber-500 text-gray-950 font-black text-sm px-3 py-1.5 rounded-full">
              <Zap size={14} className="fill-current" /> {sale.label}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 flex flex-col justify-center gap-5">
            <div>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Limited Time Offer</p>
              <h2 className="text-white font-black text-2xl lg:text-3xl leading-tight mb-2">{product.name}</h2>
              <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
            </div>

            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-amber-400 font-black text-4xl">{formatPrice(sale.salePrice)}</span>
              <div className="flex flex-col">
                <span className="text-gray-500 line-through text-lg">{formatPrice(product.price)}</span>
                <span className="text-green-400 text-sm font-bold">Save {formatPrice(savings)} ({savingsPct}% off)</span>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Ends in</p>
              <Countdown endsAt={sale.endsAt} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => addItem({ ...product, price: sale.salePrice })}
                disabled={!product.inStock}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-950 font-black px-5 py-3 rounded-xl transition-all text-sm"
              >
                <ShoppingCart size={16} /> Add to Cart
              </button>
              <Link
                href={`/products/${product.slug}`}
                className="px-5 py-3 border border-white/20 text-gray-300 hover:text-white hover:border-white/40 font-semibold rounded-xl transition-colors text-sm"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
