'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, ShoppingBag, Wallet, ArrowDownRight, Download } from 'lucide-react';
import { useOrdersStore } from '@/store/orders';
import { useExpensesStore } from '@/store/expenses';
import { formatPrice } from '@/lib/utils';

type Range = '7d' | '30d' | 'month' | 'custom';

function startOf(range: Range, customFrom: string, customTo: string): { from: Date; to: Date } {
  const now = new Date();
  if (range === '7d') return { from: new Date(Date.now() - 6 * 864e5), to: now };
  if (range === '30d') return { from: new Date(Date.now() - 29 * 864e5), to: now };
  if (range === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from, to: now };
  }
  return { from: customFrom ? new Date(customFrom) : new Date(Date.now() - 29 * 864e5), to: customTo ? new Date(customTo) : now };
}

function inRange(iso: string, from: Date, to: Date) {
  const t = new Date(iso).getTime();
  const start = new Date(from).setHours(0, 0, 0, 0);
  const end = new Date(to).setHours(23, 59, 59, 999);
  return t >= start && t <= end;
}

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const orders = useOrdersStore((s) => s.orders);
  const { expenses, status: expStatus, fetchExpenses } = useExpensesStore();
  const [range, setRange] = useState<Range>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const { from, to } = useMemo(() => startOf(range, customFrom, customTo), [range, customFrom, customTo]);

  const filteredOrders = useMemo(
    () => orders.filter((o) => o.status !== 'cancelled' && inRange(o.createdAt, from, to)),
    [orders, from, to]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => inRange(e.date + 'T00:00:00', from, to)),
    [expenses, from, to]
  );

  const revenue = filteredOrders.reduce((s, o) => s + o.total, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = revenue - totalExpenses;
  const avgOrder = filteredOrders.length ? Math.round(revenue / filteredOrders.length) : 0;

  // Revenue by day
  const revenueByDay = useMemo(() => {
    const days: { label: string; date: string; revenue: number }[] = [];
    const diff = Math.min(Math.round((to.getTime() - from.getTime()) / 864e5) + 1, 60);
    for (let i = 0; i < diff; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const label = d.toLocaleDateString('en-ZM', { day: 'numeric', month: 'short' });
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = dayStart + 864e5;
      const rev = orders
        .filter((o) => { const t = new Date(o.createdAt).getTime(); return t >= dayStart && t < dayEnd && o.status !== 'cancelled'; })
        .reduce((s, o) => s + o.total, 0);
      days.push({ label, date: d.toISOString().split('T')[0], revenue: rev });
    }
    return days;
  }, [orders, from, to]);

  const maxRev = Math.max(...revenueByDay.map((d) => d.revenue), 1);

  // By category
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        // category is not in order items; use product name prefix heuristic or leave as 'Products'
        map['Products'] = (map['Products'] ?? 0) + item.price * item.quantity;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredOrders]);

  // By province
  const byProvince = useMemo(() => {
    const map: Record<string, { orders: number; revenue: number }> = {};
    filteredOrders.forEach((o) => {
      const prov = o.customer.province || 'Unknown';
      if (!map[prov]) map[prov] = { orders: 0, revenue: 0 };
      map[prov].orders++;
      map[prov].revenue += o.total;
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [filteredOrders]);

  // Expenses by category
  const expByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => { map[e.category] = (map[e.category] ?? 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  function exportOrders() {
    const rows = [
      ['Order ID', 'Customer', 'Phone', 'City', 'Province', 'Items', 'Subtotal', 'Delivery', 'Total', 'Status', 'Date'],
      ...filteredOrders.map((o) => [
        o.id,
        `${o.customer.firstName} ${o.customer.lastName}`,
        o.customer.phone,
        o.customer.city,
        o.customer.province,
        o.items.length,
        o.subtotal,
        o.deliveryFee,
        o.total,
        o.status,
        new Date(o.createdAt).toLocaleDateString('en-ZM'),
      ].map(String)),
    ];
    downloadCSV(rows, `zvec-orders-${range}.csv`);
  }

  function exportExpenses() {
    const rows = [
      ['Date', 'Category', 'Amount', 'Description'],
      ...filteredExpenses.map((e) => [e.date, e.category, e.amount, e.description ?? ''].map(String)),
    ];
    downloadCSV(rows, `zvec-expenses-${range}.csv`);
  }

  const RANGES: { value: Range; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'month', label: 'This month' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-black text-gray-900">Reports</h1>
        <div className="flex gap-2">
          <button onClick={exportOrders} className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50">
            <Download size={13} /> Orders CSV
          </button>
          <button onClick={exportExpenses} className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50">
            <Download size={13} /> Expenses CSV
          </button>
        </div>
      </div>

      {/* Range picker */}
      <div className="flex flex-wrap gap-2 items-center">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${range === r.value ? 'bg-teal-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {r.label}
          </button>
        ))}
        {range === 'custom' && (
          <div className="flex items-center gap-2 ml-2">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-teal-400" />
            <span className="text-gray-400 text-sm">to</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-teal-400" />
          </div>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue', value: formatPrice(revenue), icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', sub: `${filteredOrders.length} orders` },
          { label: 'Expenses', value: formatPrice(totalExpenses), icon: Wallet, color: 'text-red-500', bg: 'bg-red-50', sub: `${filteredExpenses.length} entries` },
          { label: 'Net Profit', value: formatPrice(netProfit), icon: ArrowDownRight, color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', bg: netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50', sub: `${revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0}% margin` },
          { label: 'Avg. Order', value: formatPrice(avgOrder), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'per order' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
              <c.icon size={18} className={c.color} />
            </div>
            <div className="text-2xl font-black text-gray-900">{c.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{c.label} · {c.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Revenue Over Time</h2>
        {revenueByDay.length <= 30 ? (
          <div className="flex items-end gap-1 h-40 overflow-x-auto">
            {revenueByDay.map((day) => (
              <div key={day.date} className="flex-1 min-w-[20px] flex flex-col items-center gap-1">
                <div className="w-full flex items-end" style={{ height: 96 }}>
                  <div
                    title={`${day.label}: ${formatPrice(day.revenue)}`}
                    className="w-full bg-teal-500 rounded-t hover:bg-teal-400 transition-colors cursor-default"
                    style={{ height: `${Math.max((day.revenue / maxRev) * 96, day.revenue > 0 ? 4 : 0)}px` }}
                  />
                </div>
                {revenueByDay.length <= 14 && (
                  <div className="text-xs text-gray-400 text-center" style={{ fontSize: 9 }}>{day.label}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Showing aggregated data for ranges over 30 days. Use a narrower range for the daily chart.</p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expenses by category */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Expenses by Category</h2>
          {expStatus === 'loading' ? <p className="text-sm text-gray-400">Loading…</p> : expByCategory.length === 0 ? (
            <p className="text-sm text-gray-400">No expenses in this period</p>
          ) : (
            <div className="space-y-3">
              {expByCategory.map(([cat, amt]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-36 truncate">{cat}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${(amt / totalExpenses) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-20 text-right">{formatPrice(amt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By province */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Revenue by Province</h2>
          {byProvince.length === 0 ? <p className="text-sm text-gray-400">No orders in this period</p> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs text-gray-500 font-semibold">Province</th>
                  <th className="text-center pb-2 text-xs text-gray-500 font-semibold">Orders</th>
                  <th className="text-right pb-2 text-xs text-gray-500 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {byProvince.map(([prov, data]) => (
                  <tr key={prov}>
                    <td className="py-2 text-gray-700">{prov.replace(' Province', '')}</td>
                    <td className="py-2 text-center text-gray-500">{data.orders}</td>
                    <td className="py-2 text-right font-bold text-teal-700">{formatPrice(data.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Orders in Period ({filteredOrders.length})</h2>
        </div>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No orders in this period</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase">Order</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase hidden sm:table-cell">City</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-semibold uppercase">Total</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.slice(0, 50).map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-xs text-teal-700">{o.id}</td>
                    <td className="px-4 py-2.5 text-gray-900">{o.customer.firstName} {o.customer.lastName}</td>
                    <td className="px-4 py-2.5 text-gray-500 hidden sm:table-cell">{o.customer.city}</td>
                    <td className="px-4 py-2.5 font-bold text-gray-900 text-right">{formatPrice(o.total)}</td>
                    <td className="px-4 py-2.5 capitalize text-gray-600 text-xs">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length > 50 && (
              <div className="text-center py-3 text-sm text-gray-400 border-t border-gray-100">
                Showing 50 of {filteredOrders.length}. Export CSV to see all.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
