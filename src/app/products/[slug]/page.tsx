'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, Check, Truck, Shield, RefreshCw, ChevronRight } from 'lucide-react';
import { useInventoryStore } from '@/store/inventory';
import { useCartStore } from '@/store/cart';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import { use, useState, useEffect } from 'react';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const products = useInventoryStore((s) => s.products);
  const status = useInventoryStore((s) => s.status);
  const fetchProducts = useInventoryStore((s) => s.fetchProducts);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  const product = products.find((p) => p.slug === slug);

  if (status !== 'ready') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!product) notFound();

  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  function handleAdd() {
    addItem(product!);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-teal-600">Home</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:text-teal-600">Products</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        {/* Image */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
            {product.image.startsWith('data:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            )}
            {product.badge && (
              <span className="absolute top-4 left-4 bg-teal-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {product.badge}
              </span>
            )}
            {product.originalPrice && (
              <span className="absolute top-4 right-4 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{calculateDiscount(product.originalPrice, product.price)}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <Link href="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 mb-3">
            <ArrowLeft size={14} /> Back to Products
          </Link>

          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-black text-teal-700">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="bg-orange-100 text-orange-600 text-sm font-bold px-2 py-1 rounded-full">
                  You save {formatPrice(product.originalPrice - product.price)}
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-teal-600 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stock */}
          <div className="mb-6">
            {product.inStock ? (
              <span className="inline-flex items-center gap-2 text-teal-700 font-medium text-sm bg-teal-50 px-3 py-1.5 rounded-full">
                <Check size={14} /> In Stock — Ready for delivery
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-red-600 font-medium text-sm bg-red-50 px-3 py-1.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {added ? (
                <><Check size={18} /> Added to Cart!</>
              ) : (
                <><ShoppingCart size={18} /> Add to Cart</>
              )}
            </button>
            <Link
              href="/checkout"
              onClick={() => addItem(product)}
              className="px-6 py-3 border-2 border-teal-500 text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors"
            >
              Buy Now
            </Link>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="flex flex-col items-center gap-1 text-center">
              <Truck size={20} className="text-teal-600" />
              <span className="text-xs text-gray-600 font-medium">Nationwide Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Shield size={20} className="text-teal-600" />
              <span className="text-xs text-gray-600 font-medium">Genuine Product</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <RefreshCw size={20} className="text-teal-600" />
              <span className="text-xs text-gray-600 font-medium">7-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
