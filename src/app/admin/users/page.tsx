'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, KeyRound, ToggleLeft, ToggleRight, X, Check, UserCog } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';
import { useAuthStore } from '@/store/auth';
import type { AdminUser, UserRole } from '@/types';

const ROLE_BADGE: Record<UserRole, string> = {
  owner:    'bg-teal-100 text-teal-700',
  sales:    'bg-blue-100 text-blue-700',
  delivery: 'bg-indigo-100 text-indigo-700',
};

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  { value: 'owner',    label: 'Owner',    desc: 'Full access — products, orders, expenses, reports, users' },
  { value: 'sales',    label: 'Sales',    desc: 'Orders, documents, products, customers — no financials' },
  { value: 'delivery', label: 'Delivery', desc: 'Orders only — can mark as shipped or delivered' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' });
}

type ModalMode = 'create' | 'edit' | 'password' | null;

export default function UsersPage() {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ModalMode>(null);
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', username: '', password: '', confirmPassword: '', role: 'sales' as UserRole });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminFetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({ name: '', username: '', password: '', confirmPassword: '', role: 'sales' });
    setError('');
    setMode('create');
    setTarget(null);
  }

  function openEdit(u: AdminUser) {
    setForm({ name: u.name, username: u.username, password: '', confirmPassword: '', role: u.role });
    setError('');
    setMode('edit');
    setTarget(u);
  }

  function openPassword(u: AdminUser) {
    setForm({ name: '', username: '', password: '', confirmPassword: '', role: 'sales' });
    setError('');
    setMode('password');
    setTarget(u);
  }

  function close() { setMode(null); setTarget(null); setError(''); }

  async function handleCreate() {
    if (!form.name.trim() || !form.username.trim() || !form.password) { setError('All fields required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await adminFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), username: form.username.trim(), password: form.password, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to create user'); return; }
      setUsers((u) => [...u, data]);
      close();
    } finally { setSaving(false); }
  }

  async function handleEdit() {
    if (!form.name.trim()) { setError('Name required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await adminFetch(`/api/users/${target!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to update user'); return; }
      setUsers((u) => u.map((x) => x.id === data.id ? data : x));
      close();
    } finally { setSaving(false); }
  }

  async function handlePassword() {
    if (!form.password) { setError('Password required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await adminFetch(`/api/users/${target!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: form.password }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed'); return; }
      close();
    } finally { setSaving(false); }
  }

  async function toggleActive(u: AdminUser) {
    const res = await adminFetch(`/api/users/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !u.active }),
    });
    const data = await res.json();
    if (res.ok) setUsers((list) => list.map((x) => x.id === data.id ? data : x));
    else alert(data.error ?? 'Failed');
  }

  const isSelf = (u: AdminUser) => u.id === me?.id;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">Manage who has access and what they can do</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Role guide */}
      <div className="grid sm:grid-cols-3 gap-3">
        {ROLE_OPTIONS.map((r) => (
          <div key={r.value} className="bg-white rounded-xl border border-gray-100 p-4">
            <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${ROLE_BADGE[r.value]}`}>{r.label}</span>
            <p className="text-xs text-gray-500 mt-2">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Added</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.active ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-black text-teal-700 shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {u.name} {isSelf(u) && <span className="text-xs text-gray-400">(you)</span>}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u)}
                      disabled={isSelf(u)}
                      title={isSelf(u) ? 'Cannot deactivate yourself' : u.active ? 'Deactivate' : 'Activate'}
                      className="disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {u.active
                        ? <ToggleRight size={22} className="text-teal-500" />
                        : <ToggleLeft size={22} className="text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(u)} title="Edit name / role" className="text-gray-400 hover:text-teal-600 p-1">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => openPassword(u)} title="Reset password" className="text-gray-400 hover:text-orange-500 p-1">
                        <KeyRound size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {mode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 flex items-center gap-2">
                <UserCog size={18} className="text-teal-600" />
                {mode === 'create' ? 'Add User' : mode === 'edit' ? 'Edit User' : 'Reset Password'}
              </h2>
              <button onClick={close} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {mode === 'create' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Mwansa Chanda"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input type="text" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))}
                      placeholder="e.g. mwansa"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 font-mono" />
                  </div>
                </>
              )}

              {mode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
                </div>
              )}

              {(mode === 'create' || mode === 'edit') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="space-y-2">
                    {ROLE_OPTIONS.map((r) => (
                      <label key={r.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${form.role === r.value ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                          onChange={() => setForm((f) => ({ ...f, role: r.value }))} className="mt-0.5 accent-teal-500" />
                        <div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${ROLE_BADGE[r.value]}`}>{r.label}</span>
                          <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(mode === 'create' || mode === 'password') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {mode === 'password' ? 'New Password' : 'Password'}
                    </label>
                    <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Min. 6 characters"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input type="password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="Repeat password"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
                  </div>
                </>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={mode === 'create' ? handleCreate : mode === 'edit' ? handleEdit : handlePassword}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl text-sm"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={close} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
