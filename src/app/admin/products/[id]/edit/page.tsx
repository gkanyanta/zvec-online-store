'use client';

import { use, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { useInventoryStore } from '@/store/inventory';
import { Product } from '@/types';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { products, updateProduct } = useInventoryStore();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const [saving, setSaving] = useState(false);

  async function handleSave(data: Omit<Product, 'id' | 'slug'> & { slug?: string }) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateProduct(id, data);
    router.push('/admin/products');
  }

  return (
    <ProductForm
      title={`Edit: ${product!.name}`}
      backHref="/admin/products"
      initial={product}
      onSave={handleSave}
      saving={saving}
    />
  );
}
