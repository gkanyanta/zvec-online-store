'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, ShoppingBag, DollarSign, BarChart2 } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';

interface Analytics {
  totals: { order_count: number; revenue: number; avg_order: number };
  monthly: { month: string; orders: number; revenue: number }[];
  byStatus: { status: string; count: number }[];
  topProducts: { productId: string; productName: string; revenue: number; unitsSold: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-orange-400',
  confirmed:  'bg-blue-400',
  processing: 'bg-purple-400',
  shipped:    'bg-indigo-400',
  delivered:  'bg-teal-500',
  cancelled:  'bg-red-400',
};

function formatK(n: number) {
  if (n >= 1_000_000) return `K${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `K${(n / 1_000).toFixed(1)}k`;
  return `K${Math.round(n).toLocaleString()}`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-red-500">Failed to load analytics.</div>;
  }

  const { totals, monthly, byStatus, topProducts } = data;
  const maxRevenue = Math.max(...monthly.map((m) => m.revenue), 1);
  const maxProductRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);
  const totalStatusOrders = byStatus.reduce((s, b) => s + b.count, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Store performance overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
              <DollarSign size={18} className="text-teal-600" />
            </div>
            <span className="text-gray-500 text-sm font-medium">Total Revenue</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{formatK(Number(totals.revenue))}</p>
          <p className="text-xs text-gray-400 mt-1">Excluding cancelled orders</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShoppingBag size={18} className="text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm font-medium">Total Orders</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{totals.order_count.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-amber-600" />
            </div>
            <span className="text-gray-500 text-sm font-medium">Avg Order Value</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{formatK(Number(totals.avg_order))}</p>
          <p className="text-xs text-gray-400 mt-1">Excluding cancelled</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly revenue chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 size={18} className="text-gray-400" />
            <h2 className="font-bold text-gray-900">Revenue — Last 6 Months</h2>
          </div>
          {monthly.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {monthly.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-medium">{formatK(m.revenue)}</span>
                  <div
                    className="w-full bg-teal-500 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(4, (m.revenue / maxRevenue) * 120)}px` }}
                  />
                  <span className="text-xs text-gray-400 text-center leading-tight">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders by status */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-bold text-gray-900 mb-5">Orders by Status</h2>
          {byStatus.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {byStatus.map((s) => (
                <div key={s.status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700 font-medium">{s.status}</span>
                    <span className="text-gray-500">{s.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_COLORS[s.status] ?? 'bg-gray-400'}`}
                      style={{ width: `${(s.count / totalStatusOrders) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="font-bold text-gray-900 mb-5">Top Products by Revenue</h2>
        {topProducts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No order data yet</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-4">
                <span className="text-gray-300 font-bold text-sm w-5 text-right shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800 truncate">{p.productName}</span>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xs text-gray-400">{p.unitsSold} sold</span>
                      <span className="text-sm font-bold text-gray-900">{formatK(p.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(p.revenue / maxProductRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
