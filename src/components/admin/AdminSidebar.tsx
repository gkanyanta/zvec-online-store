'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  LogOut, ExternalLink, ChevronRight, X, Gift,
  ReceiptText, TrendingUp, Wallet,
} from 'lucide-react';
import { useEffect } from 'react';
import { useAdminStore } from '@/store/admin';
import { useOrdersStore } from '@/store/orders';

const navItems = [
  { href: '/admin',           label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders',    label: 'Orders',    icon: ShoppingBag },
  { href: '/admin/products',  label: 'Products',  icon: Package },
  { href: '/admin/packages',  label: 'Packages',  icon: Gift },
  { href: '/admin/documents', label: 'Documents', icon: ReceiptText },
  { href: '/admin/expenses',  label: 'Expenses',  icon: Wallet },
  { href: '/admin/reports',   label: 'Reports',   icon: TrendingUp },
  { href: '/admin/customers', label: 'Customers', icon: Users },
];

interface Props {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAdminStore((s) => s.logout);
  const orders = useOrdersStore((s) => s.orders);
  const fetchOrders = useOrdersStore((s) => s.fetchOrders);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  function isActive(item: typeof navItems[0]) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  function handleLogout() {
    logout();
    router.push('/admin');
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zvec-logo.png" alt="ZVEC" className="h-8 object-contain brightness-0 invert" />
          <div>
            <div className="text-gray-400 text-xs mt-0.5">Admin Panel</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
                active
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span className="flex-1 font-medium text-sm">{item.label}</span>
              {item.label === 'Orders' && pendingCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm"
        >
          <ExternalLink size={16} />
          View Storefront
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-900/50 hover:text-red-300 transition-colors text-sm"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
