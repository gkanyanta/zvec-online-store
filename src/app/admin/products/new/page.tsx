'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInventoryStore } from '@/store/inventory';
import { Product } from '@/types';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  const router = useRouter();
  const addProduct = useInventoryStore((s) => s.addProduct);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  async function handleSave(data: Omit<Product, 'id' | 'slug'> & { slug?: string }) {
    setSaving(true);
    setSaveError('');
    try {
      const slug = data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await addProduct({ id: `p${Date.now()}`, slug, ...data } as Product);
      router.push('/admin/products');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save product. Please try again.');
      setSaving(false);
    }
  }

  return (
    <>
      {saveError && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {saveError}
        </div>
      )}
      <ProductForm title="Add New Product" backHref="/admin/products" onSave={handleSave} saving={saving} />
    </>
  );
}
