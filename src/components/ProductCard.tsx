'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useRatingsStore } from '@/store/ratings';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.id));
  const fetchSummaries = useRatingsStore((s) => s.fetchSummaries);
  const rating = useRatingsStore((s) => s.summaries[product.id]);
  useEffect(() => { fetchSummaries(); }, [fetchSummaries]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        {product.image.startsWith('data:') ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
        )}
        {product.badge && (
          <span className="absolute top-2 left-2 bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{calculateDiscount(product.originalPrice, product.price)}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-semibold px-3 py-1 rounded-full text-sm">Out of Stock</span>
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} className={inWishlist ? 'text-red-500 fill-red-500' : 'text-gray-600'} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-teal-600 transition-colors mb-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-teal-700 font-bold text-base">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-gray-400 text-xs line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        {rating && rating.count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-gray-700">{rating.avg.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({rating.count})</span>
          </div>
        )}

        <button
          onClick={() => addItem(product)}
          disabled={!product.inStock}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-100 disabled:text-gray-400 active:scale-95 text-gray-950 font-bold text-sm py-2 rounded-lg transition-all"
        >
          <ShoppingCart size={15} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
