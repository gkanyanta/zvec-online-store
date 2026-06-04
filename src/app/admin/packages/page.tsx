'use client';

import Link from 'next/link';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { usePackagesStore } from '@/store/packages';
import { useInventoryStore } from '@/store/inventory';
import { formatPrice, calculateDiscount } from '@/lib/utils';

const colorDot: Record<string, string> = {
  blue: 'bg-blue-500', green: 'bg-emerald-500', pink: 'bg-pink-500',
  orange: 'bg-orange-500', purple: 'bg-purple-500', red: 'bg-red-500',
};

export default function AdminPackagesPage() {
  const { packages, deletePackage } = usePackagesStore();
  const { products } = useInventoryStore();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Packages</h1>
          <p className="text-gray-500 text-sm">{packages.length} packages configured</p>
        </div>
        <Link
          href="/admin/packages/new"
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> New Package
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-medium">No packages yet</p>
          <Link href="/admin/packages/new" className="text-teal-600 text-sm hover:underline mt-2 inline-block">
            Create your first package
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const pkgProducts = pkg.products.map((id) => products.find((p) => p.id === id)).filter(Boolean);
            const savings = pkg.totalValue - pkg.packagePrice;
            const savePct = calculateDiscount(pkg.totalValue, pkg.packagePrice);

            return (
              <div key={pkg.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-36 bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="text-2xl">{pkg.icon}</span>
                    <span className="text-white font-black text-base">{pkg.title}</span>
                  </div>
                  <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${colorDot[pkg.color] ?? 'bg-gray-400'}`} />
                </div>

                <div className="p-4">
                  {pkg.subtitle && <p className="text-xs text-gray-500 font-medium mb-1">{pkg.subtitle}</p>}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{pkg.description}</p>

                  {/* Products preview */}
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {pkgProducts.slice(0, 4).map((p) => p && (
                      <div key={p.id} className="relative w-8 h-8 rounded-md overflow-hidden bg-gray-50 border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {pkgProducts.length > 4 && (
                      <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold">
                        +{pkgProducts.length - 4}
                      </div>
                    )}
                    <span className="text-xs text-gray-400 self-center ml-1">{pkgProducts.length} item{pkgProducts.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs text-gray-400 line-through">{formatPrice(pkg.totalValue)}</div>
                      <div className="text-teal-700 font-black text-lg">{formatPrice(pkg.packagePrice)}</div>
                    </div>
                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                      Save {savePct}% · {formatPrice(savings)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/packages/${pkg.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-teal-400 text-gray-600 hover:text-teal-700 font-medium py-2 rounded-xl text-sm transition-colors"
                    >
                      <Edit2 size={14} /> Edit
                    </Link>
                    <button
                      onClick={() => { if (confirm('Delete this package?')) deletePackage(pkg.id); }}
                      className="flex items-center justify-center gap-1.5 border border-gray-200 hover:border-red-300 text-gray-400 hover:text-red-500 font-medium px-3 py-2 rounded-xl text-sm transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
