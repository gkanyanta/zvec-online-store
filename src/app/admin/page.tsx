'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, TrendingUp, Clock, Package, Users, ChevronRight, ArrowUpRight, Wallet, AlertTriangle } from 'lucide-react';
import { useOrdersStore, OrderStatus } from '@/store/orders';
import { useInventoryStore } from '@/store/inventory';
import { useExpensesStore } from '@/store/expenses';
import { formatPrice } from '@/lib/utils';
import StatusBadge from '@/components/admin/StatusBadge';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminDashboard() {
  const orders = useOrdersStore((s) => s.orders);
  const products = useInventoryStore((s) => s.products);
  const fetchProducts = useInventoryStore((s) => s.fetchProducts);
  const { expenses, fetchExpenses } = useExpensesStore();
  useEffect(() => { fetchProducts(); fetchExpenses(); }, [fetchProducts, fetchExpenses]);

  const thisMonthPrefix = new Date().toISOString().slice(0, 7);

  const thisMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(thisMonthPrefix)).reduce((s, e) => s + e.amount, 0);
  }, [expenses, thisMonthPrefix]);

  const thisMonthRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'cancelled' && o.createdAt.startsWith(thisMonthPrefix))
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders, thisMonthPrefix]);

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stockQuantity != null && p.stockQuantity <= (p.lowStockThreshold ?? 5)),
    [products]
  );

  const productCostMap = useMemo(
    () => new Map(products.filter((p) => p.costPrice != null).map((p) => [p.id, p.costPrice!])),
    [products]
  );

  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const totalProfit = activeOrders.reduce((sum, o) => {
      return sum + o.items.reduce((s, item) => {
        const cost = productCostMap.get(item.productId);
        return cost != null ? s + (item.price - cost) * item.quantity : s;
      }, 0);
    }, 0);
    const profitTracked = activeOrders.some((o) =>
      o.items.some((item) => productCostMap.has(item.productId))
    );
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const uniqueCustomers = new Set(orders.map((o) => o.customer.phone)).size;

    const statusCounts = STATUS_ORDER.reduce((acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    }, {} as Record<OrderStatus, number>);

    return { totalRevenue, totalProfit, profitTracked, totalOrders, pendingOrders, deliveredOrders, uniqueCustomers, statusCounts };
  }, [orders, productCostMap]);

  const recentOrders = orders.slice(0, 5);

  // Simple revenue by day for last 7 days
  const revenueByDay = useMemo(() => {
    const days: { label: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-ZM', { weekday: 'short' });
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = dayStart + 86400000;
      const revenue = orders
        .filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= dayStart && t < dayEnd && o.status !== 'cancelled';
        })
        .reduce((sum, o) => sum + o.total, 0);
      days.push({ label, revenue });
    }
    return days;
  }, [orders]);

  const maxRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; image: string; count: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!counts[item.productId]) {
          counts[item.productId] = { name: item.productName, image: item.productImage, count: 0, revenue: 0 };
        }
        counts[item.productId].count += item.quantity;
        counts[item.productId].revenue += item.price * item.quantity;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-ZM', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link href="/admin/orders" className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors">
          <ShoppingBag size={16} /> View Orders
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', change: 'from orders' },
          { label: 'This Month Net', value: formatPrice(thisMonthRevenue - thisMonthExpenses), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', change: 'revenue minus expenses' },
          { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', change: `${stats.pendingOrders} pending` },
          { label: 'This Month Expenses', value: formatPrice(thisMonthExpenses), icon: Wallet, color: 'text-red-500', bg: 'bg-red-50', change: 'operational costs' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon size={20} className={card.color} />
              </div>
              <span className="text-xs text-gray-400 font-medium">{card.change}</span>
            </div>
            <div className="text-2xl font-black text-gray-900">{card.value}</div>
            <div className="text-gray-500 text-sm mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {stats.pendingOrders > 0 && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <Clock size={18} className="text-orange-500 shrink-0" />
          <p className="text-orange-800 text-sm font-medium">
            {stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} need attention — awaiting confirmation.
          </p>
          <Link href="/admin/orders?status=pending" className="ml-auto text-orange-600 hover:text-orange-700 text-sm font-bold flex items-center gap-1">
            Review <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 text-sm font-medium mb-1">
              {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on stock:
            </p>
            <p className="text-red-600 text-xs">
              {lowStockProducts.slice(0, 3).map((p) => `${p.name} (${p.stockQuantity} left)`).join(' · ')}
              {lowStockProducts.length > 3 ? ` + ${lowStockProducts.length - 3} more` : ''}
            </p>
          </div>
          <Link href="/admin/products" className="text-red-600 hover:text-red-700 text-sm font-bold flex items-center gap-1 shrink-0">
            Manage <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Revenue — Last 7 Days</h2>
          <div className="flex items-end gap-3 h-40">
            {revenueByDay.map((day) => (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500 font-medium">{day.revenue > 0 ? formatPrice(day.revenue) : ''}</div>
                <div className="w-full flex items-end" style={{ height: 96 }}>
                  <div
                    className="w-full bg-teal-500 rounded-t-lg transition-all hover:bg-teal-500"
                    style={{ height: `${Math.max((day.revenue / maxRevenue) * 96, day.revenue > 0 ? 4 : 0)}px` }}
                  />
                </div>
                <div className="text-xs text-gray-400">{day.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Order Status</h2>
          <div className="space-y-3">
            {STATUS_ORDER.map((status) => {
              const count = stats.statusCounts[status];
              const pct = stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={status} />
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-teal-600 text-sm hover:text-teal-700 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-700">{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 truncate">
                    {order.customer.firstName} {order.customer.lastName} · {order.customer.city}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-gray-900 text-sm">{formatPrice(order.total)}</div>
                  <div className="text-xs text-gray-400">{timeAgo(order.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Top Products</h2>
            <Link href="/admin/products" className="text-teal-600 text-sm hover:text-teal-700 flex items-center gap-1">
              Manage <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.map(([id, item], idx) => (
              <div key={id} className="flex items-center gap-3 px-6 py-3">
                <span className="text-lg font-black text-gray-200 w-6 shrink-0">#{idx + 1}</span>
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 line-clamp-2">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.count} sold</p>
                </div>
                <span className="text-xs font-bold text-teal-700 shrink-0">{formatPrice(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory quick look */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Package size={18} className="text-teal-600" />
            Inventory Overview
          </h2>
          <Link href="/admin/products" className="text-teal-600 text-sm hover:text-teal-700 flex items-center gap-1">
            Manage stock <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-teal-50 rounded-xl">
            <div className="text-2xl font-black text-teal-700">{products.filter((p) => p.inStock).length}</div>
            <div className="text-xs text-teal-600 font-medium">In Stock</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl">
            <div className="text-2xl font-black text-red-600">{products.filter((p) => !p.inStock).length}</div>
            <div className="text-xs text-red-500 font-medium">Out of Stock</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <div className="text-2xl font-black text-blue-600">{products.length}</div>
            <div className="text-xs text-blue-500 font-medium">Total Products</div>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <div className="text-2xl font-black text-emerald-600">{products.filter((p) => p.costPrice != null).length}</div>
            <div className="text-xs text-emerald-600 font-medium">Cost Tracked</div>
          </div>
        </div>
      </div>
    </div>
  );
}
