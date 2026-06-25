'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const { items, toggle, clear } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Wishlist</h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clear}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto text-gray-200 fill-gray-200 mb-4" />
          <p className="font-semibold text-gray-600 text-lg">Your wishlist is empty</p>
          <p className="text-gray-400 text-sm mt-1">Save products you love by clicking the heart icon.</p>
          <Link
            href="/products"
            className="inline-block mt-6 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
              <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-gray-800 font-semibold px-3 py-1 rounded-full text-sm">Out of Stock</span>
                  </div>
                )}
              </Link>
              <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-teal-600 transition-colors mb-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-teal-700 font-bold mb-3">{formatPrice(product.price)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => addItem(product)}
                    disabled={!product.inStock}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-100 disabled:text-gray-400 text-gray-950 font-bold text-sm py-2 rounded-lg transition-all"
                  >
                    <ShoppingCart size={14} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => toggle(product)}
                    className="p-2 border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-400 rounded-lg transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
