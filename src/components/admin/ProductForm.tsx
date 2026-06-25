'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { Product } from '@/types';
import { categories } from '@/lib/data';
import ImageUpload from './ImageUpload';

interface ProductFormProps {
  initial?: Partial<Product>;
  onSave: (data: Omit<Product, 'id' | 'slug'> & { slug?: string }) => void;
  backHref: string;
  title: string;
  saving: boolean;
}

export default function ProductForm({ initial = {}, onSave, backHref, title, saving }: ProductFormProps) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    category: initial.category ?? 'televisions',
    price: initial.price?.toString() ?? '',
    originalPrice: initial.originalPrice?.toString() ?? initial.price?.toString() ?? '',
    costPrice: initial.costPrice?.toString() ?? '',
    image: initial.image ?? '',
    images: initial.images ?? [] as string[],
    description: initial.description ?? '',
    features: initial.features?.join('\n') ?? '',
    badge: initial.badge ?? '',
    inStock: initial.inStock ?? true,
    stockQuantity: initial.stockQuantity?.toString() ?? '',
    lowStockThreshold: initial.lowStockThreshold?.toString() ?? '5',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Valid price required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.image.trim()) e.image = 'Product image is required';
    if (form.originalPrice && (isNaN(Number(form.originalPrice)) || Number(form.originalPrice) <= 0))
      e.originalPrice = 'Must be a valid number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      costPrice: form.costPrice ? Number(form.costPrice) : undefined,
      image: form.image,
      images: form.images.filter(Boolean),
      description: form.description.trim(),
      features: form.features ? form.features.split('\n').map((f) => f.trim()).filter(Boolean) : undefined,
      badge: form.badge.trim() || undefined,
      inStock: form.inStock,
      stockQuantity: form.stockQuantity ? Number(form.stockQuantity) : undefined,
      lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : undefined,
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={backHref} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black text-gray-900">{title}</h1>
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
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
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
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              placeholder="Describe the product..."
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
            <textarea
              value={form.features}
              onChange={(e) => update('features', e.target.value)}
              rows={5}
              placeholder={"4K Ultra HD\nSmart TV\nWi-Fi Built-In\nHDR10"}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none font-mono"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Pricing</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (K) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => {
                  const newPrice = e.target.value;
                  setForm((f) => ({
                    ...f,
                    price: newPrice,
                    // keep originalPrice in step with price until the admin sets them differently
                    originalPrice: f.originalPrice === f.price ? newPrice : f.originalPrice,
                  }));
                  setErrors((err) => { const n = { ...err }; delete n.price; return n; });
                }}
                placeholder="4500"
                min={1}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 ${errors.price ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (K) <span className="text-gray-400 font-normal">— strikethrough</span>
              </label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => update('originalPrice', e.target.value)}
                placeholder="5200"
                min={1}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 ${errors.originalPrice ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.originalPrice && <p className="text-red-500 text-xs mt-1">{errors.originalPrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price (K) <span className="text-gray-400 font-normal">— for profit tracking</span>
              </label>
              <input
                type="number"
                value={form.costPrice}
                onChange={(e) => update('costPrice', e.target.value)}
                placeholder="3200"
                min={0}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>
          {/* Live margin preview */}
          {form.price && form.costPrice && Number(form.price) > 0 && Number(form.costPrice) > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm">
              <span className="text-emerald-700 font-medium">Profit per unit:</span>
              <span className="font-bold text-emerald-800">
                K{(Number(form.price) - Number(form.costPrice)).toLocaleString()}
              </span>
              <span className="text-emerald-600">
                ({Math.round(((Number(form.price) - Number(form.costPrice)) / Number(form.price)) * 100)}% margin)
              </span>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <ImageUpload
            label="Main Product Image *"
            value={form.image}
            onChange={(url) => update('image', url)}
          />
          {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Additional Images <span className="text-gray-400 font-normal">(gallery, up to 5)</span>
              </label>
              {form.images.length < 5 && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, images: [...f.images, ''] }))}
                  className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  <Plus size={13} /> Add image
                </button>
              )}
            </div>
            {form.images.length === 0 && (
              <p className="text-gray-400 text-xs">No additional images. Click &ldquo;Add image&rdquo; to add gallery photos.</p>
            )}
            <div className="space-y-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative">
                  <ImageUpload
                    label={`Gallery Image ${i + 1}`}
                    value={img}
                    onChange={(url) => {
                      const next = [...form.images];
                      next[i] = url;
                      setForm((f) => ({ ...f, images: next }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                    className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Stock Management</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity <span className="text-gray-400 font-normal">— leave blank for manual toggle</span>
              </label>
              <input
                type="number"
                value={form.stockQuantity}
                onChange={(e) => update('stockQuantity', e.target.value)}
                placeholder="e.g. 12"
                min={0}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Alert At <span className="text-gray-400 font-normal">— units</span>
              </label>
              <input
                type="number"
                value={form.lowStockThreshold}
                onChange={(e) => update('lowStockThreshold', e.target.value)}
                placeholder="5"
                min={1}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>
          {form.stockQuantity && Number(form.stockQuantity) > 0 && Number(form.lowStockThreshold) >= Number(form.stockQuantity) && (
            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-xl">
              Warning: stock quantity is at or below the low-stock threshold.
            </div>
          )}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) => update('inStock', e.target.checked)}
              className="w-4 h-4 accent-teal-500"
            />
            <div>
              <span className="font-medium text-gray-900">Product is in stock</span>
              <p className="text-gray-500 text-xs">Auto-managed when stock quantity reaches zero</p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              <><Save size={16} /> Save Product</>
            )}
          </button>
          <Link href={backHref} className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
