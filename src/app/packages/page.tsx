'use client';

import Image from 'next/image';
import { Check, ArrowRight, ShoppingCart } from 'lucide-react';
import { packages, products } from '@/lib/data';
import { useCartStore } from '@/store/cart';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import Link from 'next/link';

const packageHeaderColors: Record<string, string> = {
  blue: 'from-blue-600 to-blue-800',
  green: 'from-emerald-600 to-emerald-800',
  pink: 'from-pink-500 to-pink-700',
  orange: 'from-orange-500 to-orange-700',
};

export default function PackagesPage() {
  const addItem = useCartStore((s) => s.addItem);

  function addPackageToCart(productIds: string[]) {
    productIds.forEach((id) => {
      const product = products.find((p) => p.id === id);
      if (product) addItem(product);
    });
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-green-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-black mb-3">Special Packages</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg">
            Curated bundles designed for your life stage. Save more when you buy together.
          </p>
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {packages.map((pkg) => {
          const pkgProducts = pkg.products.map((id) => products.find((p) => p.id === id)!).filter(Boolean);
          const savings = pkg.totalValue - pkg.packagePrice;

          return (
            <div key={pkg.id} id={pkg.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              {/* Package header */}
              <div className={`bg-gradient-to-r ${packageHeaderColors[pkg.color]} p-8 text-white`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{pkg.icon}</div>
                    <div>
                      <h2 className="text-2xl font-black">{pkg.title}</h2>
                      <p className="text-white/80 font-medium">{pkg.subtitle}</p>
                      <p className="text-white/70 text-sm mt-1">For: {pkg.targetAudience}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 line-through text-lg">{formatPrice(pkg.totalValue)}</div>
                    <div className="text-3xl font-black">{formatPrice(pkg.packagePrice)}</div>
                    <div className="bg-yellow-400 text-yellow-900 font-bold text-sm px-3 py-1 rounded-full mt-1 inline-block">
                      Save {formatPrice(savings)} ({calculateDiscount(pkg.totalValue, pkg.packagePrice)}% OFF)
                    </div>
                  </div>
                </div>
              </div>

              {/* Package body */}
              <div className="p-8">
                <p className="text-gray-600 mb-8 text-base leading-relaxed max-w-2xl">{pkg.description}</p>

                <h3 className="font-bold text-gray-900 mb-4 text-lg">What&apos;s Included</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {pkgProducts.map((product) => (
                    <div key={product.id} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0">
                        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</p>
                        <p className="text-green-700 font-bold text-sm mt-1">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inclusions checklist */}
                <div className="bg-green-50 rounded-xl p-4 mb-8">
                  <h4 className="font-semibold text-green-800 mb-3">Package Includes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'All items delivered to your door',
                      'Cash on Delivery available',
                      'Nationwide delivery',
                      'Genuine products guarantee',
                      '7-day return policy',
                      'Dedicated customer support',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-green-700">
                        <Check size={15} className="shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => addPackageToCart(pkg.products)}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
                  >
                    <ShoppingCart size={18} />
                    Add Package to Cart — {formatPrice(pkg.packagePrice)}
                  </button>
                  <Link
                    href="/checkout"
                    onClick={() => addPackageToCart(pkg.products)}
                    className="flex items-center justify-center gap-2 border-2 border-green-600 text-green-700 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors"
                  >
                    Order Now <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom package CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-black mb-2">Need a Custom Package?</h2>
          <p className="text-green-100 mb-6 max-w-lg mx-auto">
            Contact us and our team will help you build the perfect bundle for your budget and needs.
          </p>
          <a
            href="https://wa.me/260970000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-green-700 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-600">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat with Us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
