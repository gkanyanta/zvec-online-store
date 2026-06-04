'use client';

import { use, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { usePackagesStore } from '@/store/packages';
import { Package } from '@/types';
import PackageForm from '@/components/admin/PackageForm';

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { packages, updatePackage } = usePackagesStore();
  const pkg = packages.find((p) => p.id === id);
  if (!pkg) notFound();

  const [saving, setSaving] = useState(false);

  async function handleSave(data: Omit<Package, 'id'>) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updatePackage(id, data);
    router.push('/admin/packages');
  }

  return (
    <PackageForm
      title={`Edit: ${pkg!.title}`}
      backHref="/admin/packages"
      initial={pkg}
      onSave={handleSave}
      saving={saving}
    />
  );
}
