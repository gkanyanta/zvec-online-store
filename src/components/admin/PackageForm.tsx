'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Save, ArrowLeft } from 'lucide-react';
import { Package } from '@/types';
import { useInventoryStore } from '@/store/inventory';
import { formatPrice } from '@/lib/utils';
import ImageUpload from './ImageUpload';

const COLORS = ['blue', 'green', 'pink', 'orange', 'purple', 'red'];
const ICONS = ['🏛️', '🎓', '👶', '🏠', '💼', '🛒', '🎁', '⭐', '💎', '🔥'];

interface PackageFormProps {
  initial?: Partial<Package>;
  onSave: (data: Omit<Package, 'id'>) => void;
  backHref: string;
  title: string;
  saving: boolean;
}

export default function PackageForm({ initial = {}, onSave, backHref, title, saving }: PackageFormProps) {
  const { products } = useInventoryStore();
  const [form, setForm] = useState({
    title: initial.title ?? '',
    subtitle: initial.subtitle ?? '',
    description: initial.description ?? '',
    targetAudience: initial.targetAudience ?? '',
    icon: initial.icon ?? '🛒',
    color: initial.color ?? 'green',
    image: initial.image ?? '',
    packagePrice: initial.packagePrice?.toString() ?? '',
    selectedProducts: initial.products ?? [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(field: string, value: string | string[]) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function toggleProduct(id: string) {
    const sel = form.selectedProducts.includes(id)
      ? form.selectedProducts.filter((p) => p !== id)
      : [...form.selectedProducts, id];
    update('selectedProducts', sel);
  }

  const totalValue = form.selectedProducts.reduce((sum, id) => {
    const p = products.find((pr) => pr.id === id);
    return sum + (p?.price ?? 0);
  }, 0);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.packagePrice || isNaN(Number(form.packagePrice)) || Number(form.packagePrice) <= 0)
      e.packagePrice = 'Valid package price required';
    if (form.selectedProducts.length === 0) e.products = 'Select at least one product';
    if (!form.image.trim()) e.image = 'Package image is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      targetAudience: form.targetAudience.trim(),
      icon: form.icon,
      color: form.color,
      image: form.image,
      packagePrice: Number(form.packagePrice),
      totalValue,
      products: form.selectedProducts,
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
          <h2 className="font-bold text-gray-900">Package Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Package Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Civil Servant Package"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => update('subtitle', e.target.value)}
                placeholder="e.g. Home Essentials Bundle"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <input
                type="text"
                value={form.targetAudience}
                onChange={(e) => update('targetAudience', e.target.value)}
                placeholder="e.g. Civil Servants & Government Workers"
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
              placeholder="Describe who this package is for and what it offers..."
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Icon & Color */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => update('icon', icon)}
                    className={`w-10 h-10 text-xl rounded-xl border-2 transition-colors ${form.icon === icon ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => update('color', color)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize border-2 transition-colors ${form.color === color ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products selection */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Included Products *</h2>
            {form.selectedProducts.length > 0 && (
              <span className="text-sm text-gray-500">{form.selectedProducts.length} selected · Total value: {formatPrice(totalValue)}</span>
            )}
          </div>
          {errors.products && <p className="text-red-500 text-xs mb-3">{errors.products}</p>}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {products.map((product) => {
              const selected = form.selectedProducts.includes(product.id);
              return (
                <label
                  key={product.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${selected ? 'border-teal-400 bg-teal-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleProduct(product.id)}
                    className="w-4 h-4 accent-teal-500 shrink-0"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                  </div>
                  <span className="text-sm font-bold text-teal-700 shrink-0">{formatPrice(product.price)}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Package Pricing</h2>
          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Price (K) *</label>
              <input
                type="number"
                value={form.packagePrice}
                onChange={(e) => update('packagePrice', e.target.value)}
                placeholder="8500"
                min={1}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 ${errors.packagePrice ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.packagePrice && <p className="text-red-500 text-xs mt-1">{errors.packagePrice}</p>}
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <div className="text-gray-500">Total product value</div>
              <div className="font-black text-gray-900 text-lg">{formatPrice(totalValue)}</div>
              {totalValue > 0 && Number(form.packagePrice) > 0 && (
                <div className="text-teal-600 text-xs font-medium">
                  Customer saves {formatPrice(totalValue - Number(form.packagePrice))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <ImageUpload label="Package Image *" value={form.image} onChange={(url) => update('image', url)} />
          {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
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
              <><Save size={16} /> Save Package</>
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
