'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, LogOut, ChevronRight, Loader2, Package } from 'lucide-react';
import { useCustomerStore } from '@/store/customer';
import { formatPrice } from '@/lib/utils';
import StatusBadge from '@/components/admin/StatusBadge';
import type { Order } from '@/types';

export default function AccountPage() {
  const router = useRouter();
  const { customer, token, logout } = useCustomerStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [tab, setTab] = useState<'orders' | 'profile'>('orders');
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '', currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!token) { router.replace('/account/login'); return; }
    if (customer) setProfileForm((f) => ({ ...f, firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone }));
  }, [token, customer, router]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/account/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoadingOrders(false); })
      .catch(() => setLoadingOrders(false));
  }, [token]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaveMsg('');
    try {
      const res = await fetch('/api/account/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      setSaveMsg('Profile updated successfully.');
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (!customer) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-gray-300" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Account</h1>
          <p className="text-gray-500 text-sm mt-0.5">Hi, {customer.firstName}! Welcome back.</p>
        </div>
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('orders')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <ShoppingBag size={15} /> Orders
        </button>
        <button onClick={() => setTab('profile')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <User size={15} /> Profile
        </button>
      </div>

      {tab === 'orders' && (
        <div className="space-y-3">
          {loadingOrders ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center">
              <Package size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="font-semibold text-gray-600">No orders yet</p>
              <p className="text-gray-400 text-sm mt-1">Your orders will appear here once you place them.</p>
              <Link href="/products" className="inline-block mt-5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono font-black text-gray-900 text-sm">{order.id.toUpperCase()}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' })}
                    &nbsp;·&nbsp;{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    &nbsp;·&nbsp;<span className="font-semibold text-gray-700">{formatPrice(order.total)}</span>
                  </p>
                </div>
                <Link href={`/track-order?id=${order.id}`} className="text-gray-300 hover:text-teal-600 transition-colors shrink-0">
                  <ChevronRight size={18} />
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 max-w-lg">
          <h2 className="font-bold text-gray-900">Personal Information</h2>
          {saveMsg && (
            <p className={`text-sm px-4 py-3 rounded-xl ${saveMsg.includes('success') ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>{saveMsg}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" value={profileForm.firstName} onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value={profileForm.lastName} onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={customer.email} disabled className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" placeholder="+260 97X XXX XXX" />
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Change Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></p>
            <div className="space-y-3">
              <input type="password" value={profileForm.currentPassword} onChange={(e) => setProfileForm((f) => ({ ...f, currentPassword: e.target.value }))} placeholder="Current password" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
              <input type="password" value={profileForm.newPassword} onChange={(e) => setProfileForm((f) => ({ ...f, newPassword: e.target.value }))} placeholder="New password (min. 8 chars)" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" minLength={8} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
}
