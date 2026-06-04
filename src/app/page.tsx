import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Truck, CreditCard, RotateCcw, Star, ChevronRight } from 'lucide-react';
import { products, packages, categories } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import { formatPrice, calculateDiscount } from '@/lib/utils';

const featuredProducts = products.filter((p) => p.badge).slice(0, 8);

const trustItems = [
  {
    icon: <Shield className="text-green-600" size={28} />,
    title: 'Genuine Products',
    desc: 'Every item is verified authentic. No counterfeits, no compromises.',
  },
  {
    icon: <Truck className="text-green-600" size={28} />,
    title: 'Nationwide Delivery',
    desc: 'We deliver to all 10 provinces across Zambia.',
  },
  {
    icon: <CreditCard className="text-green-600" size={28} />,
    title: 'Cash on Delivery',
    desc: 'Pay when your order arrives. No upfront risk.',
  },
  {
    icon: <RotateCcw className="text-green-600" size={28} />,
    title: 'Easy Returns',
    desc: 'Not satisfied? Return within 7 days, no questions asked.',
  },
];

const packageColorMap: Record<string, string> = {
  blue: 'bg-blue-600',
  green: 'bg-emerald-600',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
};

const packageBorderMap: Record<string, string> = {
  blue: 'border-blue-200 hover:border-blue-400',
  green: 'border-emerald-200 hover:border-emerald-400',
  pink: 'border-pink-200 hover:border-pink-400',
  orange: 'border-orange-200 hover:border-orange-400',
};

export default function HomePage() {
  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                Zambia&apos;s Most Trusted Online Store
              </div>
              <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4">
                Shop Smart.<br />
                <span className="text-yellow-400">Save More.</span><br />
                Delivered to You.
              </h1>
              <p className="text-green-100 text-lg mb-8 max-w-lg">
                Household goods, electronics and more — delivered nationwide.
                Backed by the ZVEC brand trusted by 400,000+ Zambians.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors"
                >
                  Shop Now <ArrowRight size={18} />
                </Link>
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-2 border-2 border-white/60 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  View Packages
                </Link>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/20">
                <div>
                  <div className="text-2xl font-black">400K+</div>
                  <div className="text-green-200 text-sm">Brand Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-black">10</div>
                  <div className="text-green-200 text-sm">Provinces Covered</div>
                </div>
                <div>
                  <div className="text-2xl font-black">100%</div>
                  <div className="text-green-200 text-sm">Genuine Products</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {featuredProducts.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="bg-white/10 hover:bg-white/20 rounded-2xl overflow-hidden transition-all group"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="200px"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-white text-xs font-medium truncate">{p.name}</p>
                    <p className="text-yellow-300 text-sm font-bold">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.slice(1).map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="flex flex-col items-center gap-2 bg-white rounded-xl p-3 border border-gray-100 hover:border-green-300 hover:shadow-sm transition-all group"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs text-gray-600 group-hover:text-green-700 text-center leading-tight font-medium">
                {cat.name.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link href="/products" className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Special Packages banner */}
      <section className="bg-gradient-to-r from-gray-900 to-green-900 py-16 my-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3">Special Packages</h2>
            <p className="text-gray-300 max-w-xl mx-auto">
              Bundled deals designed for your life stage. Save more when you buy together.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/packages#${pkg.id}`}
                className={`bg-white rounded-2xl border-2 ${packageBorderMap[pkg.color]} p-5 hover:shadow-lg transition-all group`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${packageColorMap[pkg.color]} rounded-xl text-2xl mb-3`}>
                  {pkg.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{pkg.title}</h3>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{pkg.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 text-xs line-through">{formatPrice(pkg.totalValue)}</div>
                    <div className="text-green-700 font-black text-lg">{formatPrice(pkg.packagePrice)}</div>
                  </div>
                  <span className="bg-orange-100 text-orange-600 font-bold text-xs px-2 py-1 rounded-full">
                    Save {calculateDiscount(pkg.totalValue, pkg.packagePrice)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors"
            >
              Explore All Packages <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* All products preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">More Products</h2>
          <Link href="/products" className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="bg-green-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-black text-white mb-2">Need Help Ordering?</h2>
          <p className="text-green-100 mb-6">Chat with us on WhatsApp. We&apos;re available Mon–Sat, 8am–6pm.</p>
          <a
            href="https://wa.me/260970000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-green-700 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-600">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
