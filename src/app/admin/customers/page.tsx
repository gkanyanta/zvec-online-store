'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Phone, MapPin, ShoppingBag, MessageCircle } from 'lucide-react';
import { useOrdersStore } from '@/store/orders';
import { formatPrice } from '@/lib/utils';
import StatusBadge from '@/components/admin/StatusBadge';

interface CustomerSummary {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  province: string;
  orderCount: number;
  totalSpent: number;
  lastOrderId: string;
  lastOrderDate: string;
  lastOrderStatus: string;
}

export default function CustomersPage() {
  const orders = useOrdersStore((s) => s.orders);
  const [search, setSearch] = useState('');

  const customers = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    orders.forEach((order) => {
      const key = order.customer.phone;
      const existing = map.get(key);
      if (existing) {
        existing.orderCount++;
        existing.totalSpent += order.total;
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderId = order.id;
          existing.lastOrderDate = order.createdAt;
          existing.lastOrderStatus = order.status;
        }
      } else {
        map.set(key, {
          phone: order.customer.phone,
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
          email: order.customer.email,
          city: order.customer.city,
          province: order.customer.province,
          orderCount: 1,
          totalSpent: order.total,
          lastOrderId: order.id,
          lastOrderDate: order.createdAt,
          lastOrderStatus: order.status,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm">{customers.length} unique customers · {formatPrice(totalRevenue)} total spent</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, color: 'bg-purple-50 text-purple-700' },
          { label: 'Repeat Customers', value: customers.filter((c) => c.orderCount > 1).length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Avg. Order Value', value: formatPrice(orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0), color: 'bg-green-50 text-green-700' },
          { label: 'Total Orders', value: orders.length, color: 'bg-orange-50 text-orange-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color.split(' ')[0]}`}>
            <div className={`text-2xl font-black ${s.color.split(' ')[1]}`}>{s.value}</div>
            <div className="text-sm font-medium opacity-75 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-green-400 text-sm"
        />
      </div>

      {/* Customers table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">👤</div>
            <p className="font-medium">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Spent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Last Order</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((customer) => (
                  <tr key={customer.phone} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {customer.firstName[0]}{customer.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{customer.firstName} {customer.lastName}</p>
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <Phone size={10} /> {customer.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        {customer.city}, {customer.province.split(' ')[0]}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag size={13} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{customer.orderCount}</span>
                        {customer.orderCount > 1 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Repeat</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-green-700 text-sm">{formatPrice(customer.totalSpent)}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div>
                        <Link href={`/admin/orders/${customer.lastOrderId}`} className="font-mono text-xs text-green-600 hover:underline">
                          {customer.lastOrderId}
                        </Link>
                        <div className="mt-0.5">
                          <StatusBadge status={customer.lastOrderStatus as never} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-medium"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
