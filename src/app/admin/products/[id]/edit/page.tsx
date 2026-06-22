'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInventoryStore } from '@/store/inventory';
import { Product } from '@/types';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { products, updateProduct, fetchProducts } = useInventoryStore();
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  const product = products.find((p) => p.id === id);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Redirect if product genuinely doesn't exist (after hydration)
  useEffect(() => {
    if (products.length > 0 && !product) {
      router.replace('/admin/products');
    }
  }, [product, products.length, router]);

  async function handleSave(data: Omit<Product, 'id' | 'slug'> & { slug?: string }) {
    setSaving(true);
    setSaveError('');
    try {
      await updateProduct(id, data);
      router.push('/admin/products');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save product. Please try again.');
      setSaving(false);
    }
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {saveError && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {saveError}
        </div>
      )}
      <ProductForm
        title={`Edit: ${product.name}`}
        backHref="/admin/products"
        initial={product}
        onSave={handleSave}
        saving={saving}
      />
    </>
  );
}
