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

  async function handleSave(data: Omit<Product, 'id' | 'slug'> & { slug?: string }) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const slug = data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    addProduct({ id: `p${Date.now()}`, slug, ...data } as Product);
    router.push('/admin/products');
  }

  return <ProductForm title="Add New Product" backHref="/admin/products" onSave={handleSave} saving={saving} />;
}
