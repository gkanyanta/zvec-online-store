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

  // Redirect if product genuinely doesn't exist (after hydration)
  useEffect(() => {
    if (products.length > 0 && !product) {
      router.replace('/admin/products');
    }
  }, [product, products.length, router]);

  async function handleSave(data: Omit<Product, 'id' | 'slug'> & { slug?: string }) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    await updateProduct(id, data);
    router.push('/admin/products');
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ProductForm
      title={`Edit: ${product.name}`}
      backHref="/admin/products"
      initial={product}
      onSave={handleSave}
      saving={saving}
    />
  );
}
