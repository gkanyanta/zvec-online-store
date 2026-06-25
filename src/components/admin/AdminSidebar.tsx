'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Truck,
  LogOut, ExternalLink, ChevronRight, X, Gift,
  ReceiptText, TrendingUp, Wallet, UserCog, GalleryHorizontal, Tag, Star, BarChart2,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '@/store/auth';
import { useOrdersStore } from '@/store/orders';

const NAV = [
  { href: '/admin',            label: 'Dashboard', icon: LayoutDashboard, exact: true,  roles: ['owner', 'sales'] as UserRole[] },
  { href: '/admin/orders',     label: 'Orders',    icon: ShoppingBag,     exact: false, roles: ['owner', 'sales', 'delivery'] as UserRole[] },
  { href: '/admin/delivery',   label: 'Delivery',  icon: Truck,           exact: false, roles: ['owner', 'sales', 'delivery'] as UserRole[] },
  { href: '/admin/slideshow',  label: 'Slideshow', icon: GalleryHorizontal, exact: false, roles: ['owner', 'sales'] as UserRole[] },
  { href: '/admin/promos',     label: 'Promos',    icon: Tag,               exact: false, roles: ['owner', 'sales'] as UserRole[] },
  { href: '/admin/reviews',    label: 'Reviews',   icon: Star,              exact: false, roles: ['owner', 'sales'] as UserRole[] },
  { href: '/admin/analytics',  label: 'Analytics', icon: BarChart2,         exact: false, roles: ['owner'] as UserRole[] },
  { href: '/admin/products',   label: 'Products',  icon: Package,         exact: false, roles: ['owner', 'sales'] as UserRole[] },
  { href: '/admin/packages',   label: 'Packages',  icon: Gift,            exact: false, roles: ['owner', 'sales'] as UserRole[] },
  { href: '/admin/documents',  label: 'Documents', icon: ReceiptText,     exact: false, roles: ['owner', 'sales'] as UserRole[] },
  { href: '/admin/expenses',   label: 'Expenses',  icon: Wallet,          exact: false, roles: ['owner'] as UserRole[] },
  { href: '/admin/reports',    label: 'Reports',   icon: TrendingUp,      exact: false, roles: ['owner'] as UserRole[] },
  { href: '/admin/customers',  label: 'Customers', icon: Users,           exact: false, roles: ['owner', 'sales'] as UserRole[] },
  { href: '/admin/users',      label: 'Users',     icon: UserCog,         exact: false, roles: ['owner'] as UserRole[] },
];

const ROLE_BADGE: Record<UserRole, string> = {
  owner:    'bg-teal-500 text-white',
  sales:    'bg-blue-500 text-white',
  delivery: 'bg-indigo-500 text-white',
};

interface Props { onClose?: () => void; }

export default function AdminSidebar({ onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const orders = useOrdersStore((s) => s.orders);
  const fetchOrders = useOrdersStore((s) => s.fetchOrders);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const role = user?.role ?? 'sales';
  const visibleNav = NAV.filter((item) => item.roles.includes(role));

  function isActive(item: typeof NAV[0]) {
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
          <span className="text-gray-400 text-xs">Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Current user */}
      {user && (
        <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-black shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded capitalize ${ROLE_BADGE[user.role]}`}>
              {user.role}
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
                active ? 'bg-teal-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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
