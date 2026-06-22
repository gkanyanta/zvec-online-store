'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Truck, Calendar, User, ChevronRight, X, Check } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';
import type { DeliveryRun, DeliveryRunStatus, AdminUser } from '@/types';

const STATUS_TABS: { value: DeliveryRunStatus | 'all'; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'planned',     label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
];

const STATUS_BADGE: Record<DeliveryRunStatus, string> = {
  planned:     'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed:   'bg-teal-100 text-teal-700',
};

const STATUS_LABEL: Record<DeliveryRunStatus, string> = {
  planned:     'Planned',
  in_progress: 'In Progress',
  completed:   'Completed',
};

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-ZM', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function DeliveryPage() {
  const [runs, setRuns] = useState<DeliveryRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DeliveryRunStatus | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: '', date: '', driverName: '', driverId: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    load();
    loadUsers();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminFetch('/api/delivery-runs');
      if (res.ok) setRuns(await res.json());
    } finally { setLoading(false); }
  }

  async function loadUsers() {
    const res = await adminFetch('/api/users');
    if (res.ok) setUsers(await res.json());
  }

  function openCreate() {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    setForm({ label: '', date: today.toISOString().split('T')[0], driverName: '', driverId: '', notes: '' });
    setError('');
    setShowCreate(true);
  }

  async function handleCreate() {
    if (!form.label.trim() || !form.date || !form.driverName.trim()) {
      setError('Label, date and driver are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await adminFetch('/api/delivery-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: form.label.trim(),
          date: form.date,
          driverName: form.driverName.trim(),
          driverId: form.driverId || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed'); return; }
      setRuns((r) => [data, ...r]);
      setShowCreate(false);
    } finally { setSaving(false); }
  }

  function pickDriver(u: AdminUser) {
    setForm((f) => ({ ...f, driverName: u.name, driverId: u.id }));
  }

  const visible = tab === 'all' ? runs : runs.filter((r) => r.status === tab);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Delivery Runs</h1>
          <p className="text-gray-500 text-sm">Plan and track daily delivery schedules</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-sm"
        >
          <Plus size={16} /> New Run
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.value !== 'all' && (
              <span className="ml-1.5 text-xs text-gray-400">
                ({runs.filter((r) => r.status === t.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Runs list */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Truck size={40} className="mx-auto mb-3 opacity-30" strokeWidth={1} />
          <p className="font-medium">No delivery runs {tab !== 'all' ? `(${STATUS_LABEL[tab as DeliveryRunStatus]})` : ''}</p>
          <p className="text-sm mt-1">Create one to start planning deliveries</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((run) => (
            <Link
              key={run.id}
              href={`/admin/delivery/${run.id}`}
              className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:border-teal-200 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                <Truck size={18} className="text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900">{run.label}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[run.status]}`}>
                    {STATUS_LABEL[run.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(run.date)}</span>
                  <span className="flex items-center gap-1"><User size={11} />{run.driverName}</span>
                  <span className="flex items-center gap-1"><Truck size={11} />{run.orderCount ?? 0} orders</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-teal-500 shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 flex items-center gap-2">
                <Truck size={18} className="text-teal-600" /> New Delivery Run
              </h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Run Label</label>
                <input type="text" value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Lusaka East Morning Run"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                <input type="date" value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                {users.filter((u) => u.active).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {users.filter((u) => u.active).map((u) => (
                      <button key={u.id} onClick={() => pickDriver(u)}
                        className={`text-xs px-3 py-1 rounded-lg border font-medium transition-colors ${
                          form.driverId === u.id ? 'bg-teal-500 text-white border-teal-500' : 'border-gray-200 text-gray-600 hover:border-teal-300'
                        }`}>
                        {u.name}
                      </button>
                    ))}
                  </div>
                )}
                <input type="text" value={form.driverName}
                  onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value, driverId: '' }))}
                  placeholder="Driver name (or pick above)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="e.g. Priority stops, vehicle details..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none" />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl text-sm">
                {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
                {saving ? 'Creating…' : 'Create Run'}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
