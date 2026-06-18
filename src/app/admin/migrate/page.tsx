'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ScanSearch, Upload, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { products as seedProducts } from '@/lib/data';
import type { Product } from '@/types';

const seedMap = new Map(seedProducts.map((p) => [p.id, p]));

function productsDiffer(local: Product, seed: Product): boolean {
  return (
    local.name !== seed.name ||
    local.category !== seed.category ||
    local.price !== seed.price ||
    local.originalPrice !== seed.originalPrice ||
    local.image !== seed.image ||
    local.description !== seed.description ||
    local.inStock !== seed.inStock ||
    local.badge !== seed.badge ||
    JSON.stringify(local.features ?? []) !== JSON.stringify(seed.features ?? [])
  );
}

async function readIDB(): Promise<Product[] | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('zvec-db', 1);
      req.onupgradeneeded = () => resolve(null);
      req.onerror = () => resolve(null);
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('keyval')) { db.close(); resolve(null); return; }
        const getReq = db.transaction('keyval', 'readonly').objectStore('keyval').get('zvec-inventory');
        getReq.onsuccess = () => {
          try { resolve(JSON.parse(getReq.result ?? 'null')?.state?.products ?? null); }
          catch { resolve(null); }
        };
        getReq.onerror = () => resolve(null);
      };
    } catch { resolve(null); }
  });
}

function readLS(): Product[] | null {
  try {
    const raw = localStorage.getItem('zvec-inventory');
    return raw ? (JSON.parse(raw)?.state?.products ?? null) : null;
  } catch { return null; }
}

type MigrateItem = { product: Product; type: 'new' | 'modified' };
type ItemResult = { id: string; name: string; ok: boolean; error?: string };

export default function MigratePage() {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [source, setSource] = useState<'idb' | 'ls' | 'none' | null>(null);
  const [items, setItems] = useState<MigrateItem[]>([]);
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<ItemResult[]>([]);

  async function scan() {
    setScanState('scanning');
    setResults([]);

    let products: Product[] | null = await readIDB();
    let src: 'idb' | 'ls' | 'none' = 'idb';

    if (!products?.length) {
      products = readLS();
      src = products?.length ? 'ls' : 'none';
    }

    if (!products?.length) {
      setSource('none');
      setScanState('done');
      setItems([]);
      return;
    }

    const found: MigrateItem[] = [];
    for (const p of products) {
      const seed = seedMap.get(p.id);
      if (!seed) {
        found.push({ product: p, type: 'new' });
      } else if (productsDiffer(p, seed)) {
        found.push({ product: p, type: 'modified' });
      }
    }

    setSource(src);
    setItems(found);
    setScanState('done');
  }

  async function migrate() {
    setMigrating(true);
    const out: ItemResult[] = [];

    for (const { product, type } of items) {
      try {
        const method = type === 'new' ? 'POST' : 'PUT';
        const url = type === 'new' ? '/api/products' : `/api/products/${product.id}`;
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
        out.push({ id: product.id, name: product.name, ok: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` });
      } catch (e) {
        out.push({ id: product.id, name: product.name, ok: false, error: String(e) });
      }
    }

    setResults(out);
    setMigrating(false);
  }

  const successCount = results.filter((r) => r.ok).length;
  const failCount = results.filter((r) => !r.ok).length;
  const allDone = results.length === items.length && items.length > 0;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Migrate Local Products</h1>
          <p className="text-sm text-gray-500">One-time tool to copy products from this browser to the shared database.</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-amber-800 space-y-1">
          <p className="font-semibold">Run this on the admin's device only.</p>
          <p>This page reads any products stored in <strong>this browser</strong> from before the shared database was set up, then uploads them so everyone can see them.</p>
        </div>
      </div>

      {/* Step 1: Scan */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Step 1 — Scan this browser</h2>
        <button
          onClick={scan}
          disabled={scanState === 'scanning'}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          {scanState === 'scanning'
            ? <><Loader2 size={16} className="animate-spin" /> Scanning…</>
            : <><ScanSearch size={16} /> Scan for local products</>}
        </button>

        {scanState === 'done' && (
          <div className="space-y-3">
            {source === 'none' && (
              <p className="text-gray-500 text-sm">No local product data found in this browser. Nothing to migrate.</p>
            )}
            {source === 'idb' && (
              <p className="text-xs text-gray-400">Source: IndexedDB (zvec-db)</p>
            )}
            {source === 'ls' && (
              <p className="text-xs text-gray-400">Source: localStorage</p>
            )}

            {items.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Found <span className="text-teal-600">{items.length} product{items.length !== 1 ? 's' : ''}</span> to migrate:
                </p>
                <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-sm">
                  {items.map(({ product, type }) => (
                    <li key={product.id} className="flex items-center gap-3 px-4 py-2.5 bg-white">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        type === 'new' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {type === 'new' ? 'NEW' : 'EDITED'}
                      </span>
                      <span className="flex-1 truncate font-medium text-gray-800">{product.name}</span>
                      {/* Show result if migration ran */}
                      {results.find((r) => r.id === product.id)?.ok === true && (
                        <CheckCircle size={16} className="text-teal-500 shrink-0" />
                      )}
                      {results.find((r) => r.id === product.id)?.ok === false && (
                        <XCircle size={16} className="text-red-500 shrink-0" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {items.length === 0 && source !== 'none' && (
              <p className="text-sm text-gray-500">All local products match the default catalogue. Nothing to migrate.</p>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Migrate */}
      {scanState === 'done' && items.length > 0 && !allDone && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Step 2 — Upload to database</h2>
          <button
            onClick={migrate}
            disabled={migrating}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            {migrating
              ? <><Loader2 size={16} className="animate-spin" /> Migrating…</>
              : <><Upload size={16} /> Migrate {items.length} product{items.length !== 1 ? 's' : ''}</>}
          </button>
        </div>
      )}

      {/* Results */}
      {allDone && (
        <div className={`rounded-2xl p-5 border ${failCount === 0 ? 'bg-teal-50 border-teal-200' : 'bg-red-50 border-red-200'}`}>
          {failCount === 0 ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="text-teal-500 shrink-0" size={24} />
              <div>
                <p className="font-bold text-teal-800">Migration complete!</p>
                <p className="text-sm text-teal-700">{successCount} product{successCount !== 1 ? 's' : ''} saved to the shared database. They are now visible to everyone.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="text-red-500 shrink-0" size={20} />
                <p className="font-bold text-red-800">{failCount} product{failCount !== 1 ? 's' : ''} failed</p>
              </div>
              {results.filter((r) => !r.ok).map((r) => (
                <p key={r.id} className="text-sm text-red-700 ml-7">{r.name}: {r.error}</p>
              ))}
              {successCount > 0 && (
                <p className="text-sm text-gray-600 ml-7">{successCount} product{successCount !== 1 ? 's' : ''} migrated successfully.</p>
              )}
            </div>
          )}
          <Link
            href="/admin/products"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
          >
            View all products →
          </Link>
        </div>
      )}
    </div>
  );
}
