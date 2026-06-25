'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { categories } from '@/lib/data';
import { useInventoryStore } from '@/store/inventory';
import ProductCard from '@/components/ProductCard';
import { Suspense } from 'react';

function ProductsContent() {
  const products = useInventoryStore((s) => s.products);
  const fetchProducts = useInventoryStore((s) => s.fetchProducts);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const qParam = searchParams.get('q') ?? '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [sortBy, setSortBy] = useState('default');
  const [maxPrice, setMaxPrice] = useState(20000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sync search when navigating from the header search overlay
  useEffect(() => { setSearchQuery(qParam); }, [qParam]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    result = result.filter((p) => p.price <= maxPrice);

    if (inStockOnly) result = result.filter((p) => p.inStock);

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, selectedCategory, searchQuery, maxPrice, inStockOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-1">{filtered.length} products found</p>
      </div>

      {/* Search + sort bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-teal-400 text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-200 rounded-xl bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 hidden sm:block"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A–Z</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border border-gray-200 rounded-xl bg-white px-3 py-2.5 text-sm hover:border-teal-400 sm:hidden"
        >
          <SlidersHorizontal size={16} />
          Filter
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters — desktop */}
        <aside className="hidden sm:block w-56 shrink-0 space-y-6">
          {/* Categories */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-teal-500 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name.split(' & ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Max Price</h3>
            <input
              type="range"
              min={500}
              max={20000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>K500</span>
              <span className="font-semibold text-teal-700">K{maxPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* In stock only */}
          <label className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:border-teal-200 transition-colors">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 accent-teal-500 shrink-0"
            />
            <span className="text-sm font-medium text-gray-700">In stock only</span>
          </label>
        </aside>

        {/* Mobile filter dropdown */}
        {showFilters && (
          <div className="sm:hidden fixed inset-0 bg-black/50 z-40 flex items-end" onClick={() => setShowFilters(false)}>
            <div className="bg-white w-full rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setShowFilters(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-teal-500 text-white border-teal-500 font-medium'
                        : 'text-gray-600 border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name.split(' & ')[0]}</span>
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A–Z</option>
              </select>
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search query.</p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setMaxPrice(20000); setInStockOnly(false); }}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
