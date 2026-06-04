'use client';

import { useState } from 'react';
import { useAdminStore } from '@/store/admin';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login } = useAdminStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  if (isAuthenticated) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = login(pin);
    if (!ok) {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
            <Lock size={28} className="text-teal-600" />
          </div>
          <div className="flex items-center justify-center mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/zvec-logo.png" alt="ZVEC Online Store" className="h-12 object-contain" />
          </div>
          <div className="text-gray-600 font-semibold text-sm">Admin Panel</div>
          <p className="text-gray-500 text-sm">Enter your PIN to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin PIN</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(''); }}
                placeholder="Enter PIN"
                className={`w-full border rounded-xl px-4 py-3 pr-10 text-center text-xl tracking-widest focus:outline-none focus:border-teal-400 ${
                  error ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Login
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Default PIN: <span className="font-mono font-bold text-gray-500">1234</span>
        </p>
      </div>
    </div>
  );
}
