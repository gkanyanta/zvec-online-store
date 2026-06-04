'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePackagesStore } from '@/store/packages';
import { Package } from '@/types';
import PackageForm from '@/components/admin/PackageForm';

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { packages, updatePackage } = usePackagesStore();
  const pkg = packages.find((p) => p.id === id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (packages.length > 0 && !pkg) {
      router.replace('/admin/packages');
    }
  }, [pkg, packages.length, router]);

  async function handleSave(data: Omit<Package, 'id'>) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updatePackage(id, data);
    router.push('/admin/packages');
  }

  if (!pkg) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PackageForm
      title={`Edit: ${pkg.title}`}
      backHref="/admin/packages"
      initial={pkg}
      onSave={handleSave}
      saving={saving}
    />
  );
}
