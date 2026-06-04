'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, ImageIcon } from 'lucide-react';
import { useInventoryStore } from '@/store/inventory';
import { categories } from '@/lib/data';
import { Product } from '@/types';

export default function NewProductPage() {
  const router = useRouter();
  const addProduct = useInventoryStore((s) => s.addProduct);

  const [form, setForm] = useState({
    name: '',
    category: 'televisions',
    price: '',
    originalPrice: '',
    image: '',
    description: '',
    features: '',
    badge: '',
    inStock: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.price || isNaN(Number(form.price))) e.price = 'Valid price required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.image.trim()) e.image = 'Image URL is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));

    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const product: Product = {
      id: `p${Date.now()}`,
      name: form.name,
      slug,
      category: form.category,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      image: form.image,
      description: form.description,
      features: form.features ? form.features.split('\n').map((f) => f.trim()).filter(Boolean) : undefined,
      badge: form.badge || undefined,
      inStock: form.inStock,
    };

    addProduct(product);
    router.push('/admin/products');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black text-gray-900">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Samsung 55-inch 4K Smart TV"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400"
              >
                {categories.slice(1).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge (Optional)</label>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => update('badge', e.target.value)}
                placeholder="e.g. Best Seller, New Arrival"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              placeholder="Product description..."
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
            <textarea
              value={form.features}
              onChange={(e) => update('features', e.target.value)}
              rows={4}
              placeholder="4K Ultra HD&#10;Smart TV&#10;Wi-Fi Built-In&#10;HDR10"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 resize-none font-mono"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Pricing</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (K) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                placeholder="4500"
                min={0}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 ${errors.price ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (K) — for discount display</label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => update('originalPrice', e.target.value)}
                placeholder="5200"
                min={0}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400"
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon size={16} className="text-green-600" /> Product Image
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => update('image', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 ${errors.image ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            {form.image && (
              <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Stock */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) => update('inStock', e.target.checked)}
              className="w-4 h-4 accent-green-600"
            />
            <div>
              <span className="font-medium text-gray-900">Product is in stock</span>
              <p className="text-gray-500 text-xs">Uncheck to mark as out of stock and hide from cart</p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Product</>
            )}
          </button>
          <Link href="/admin/products" className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
