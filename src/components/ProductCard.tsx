'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.badge && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        {product.originalPrice && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{calculateDiscount(product.originalPrice, product.price)}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-semibold px-3 py-1 rounded-full text-sm">Out of Stock</span>
          </div>
        )}
        <button className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart size={16} className="text-gray-600" />
        </button>
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-green-600 transition-colors mb-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-green-700 font-bold text-base">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-gray-400 text-xs line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <button
          onClick={() => addItem(product)}
          disabled={!product.inStock}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium text-sm py-2 rounded-lg transition-colors"
        >
          <ShoppingCart size={15} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
