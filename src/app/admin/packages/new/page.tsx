'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePackagesStore } from '@/store/packages';
import { Package } from '@/types';
import PackageForm from '@/components/admin/PackageForm';

export default function NewPackagePage() {
  const router = useRouter();
  const addPackage = usePackagesStore((s) => s.addPackage);
  const [saving, setSaving] = useState(false);

  async function handleSave(data: Omit<Package, 'id'>) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    addPackage({ id: `pkg${Date.now()}`, ...data });
    router.push('/admin/packages');
  }

  return <PackageForm title="New Package" backHref="/admin/packages" onSave={handleSave} saving={saving} />;
}
