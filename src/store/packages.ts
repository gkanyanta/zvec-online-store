import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { packages as seedPackages } from '@/lib/data';
import { Package } from '@/types';

interface PackagesStore {
  packages: Package[];
  addPackage: (pkg: Package) => void;
  updatePackage: (id: string, updates: Partial<Package>) => void;
  deletePackage: (id: string) => void;
}

export const usePackagesStore = create<PackagesStore>()(
  persist(
    (set) => ({
      packages: seedPackages,
      addPackage: (pkg) => set((s) => ({ packages: [...s.packages, pkg] })),
      updatePackage: (id, updates) =>
        set((s) => ({
          packages: s.packages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deletePackage: (id) =>
        set((s) => ({ packages: s.packages.filter((p) => p.id !== id) })),
    }),
    { name: 'zvec-packages' }
  )
);
