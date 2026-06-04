'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, ToggleLeft, ToggleRight, Trash2, Edit2 } from 'lucide-react';
import { useInventoryStore } from '@/store/inventory';
import { categories } from '@/lib/data';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const { products, toggleStock, deleteProduct } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out'>('all');

  const filtered = useMemo(() => {
    let result = [...products];
    if (category !== 'all') result = result.filter((p) => p.category === category);
    if (stockFilter === 'in') result = result.filter((p) => p.inStock);
    if (stockFilter === 'out') result = result.filter((p) => !p.inStock);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return result;
  }, [products, category, stockFilter, search]);

  const inStockCount = products.filter((p) => p.inStock).length;
  const outCount = products.filter((p) => !p.inStock).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{inStockCount} in stock · {outCount} out of stock</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-teal-400 text-sm"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-xl bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as 'all' | 'in' | 'out')}
          className="border border-gray-200 rounded-xl bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
        >
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-medium">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</p>
                          {product.badge && (
                            <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-medium">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-gray-600 capitalize">{product.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.originalPrice)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStock(product.id)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                          product.inStock ? 'text-teal-600 hover:text-teal-700' : 'text-red-500 hover:text-red-600'
                        }`}
                      >
                        {product.inStock ? (
                          <><ToggleRight size={20} /> In Stock</>
                        ) : (
                          <><ToggleLeft size={20} /> Out</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-gray-400 hover:text-teal-600 p-1"
                          title="Edit product"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => { if (confirm('Delete this product?')) deleteProduct(product.id); }}
                          className="text-gray-300 hover:text-red-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
