'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setAuth } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <>{children}</>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }
      setAuth(data.user, data.token);
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
            <Lock size={28} className="text-teal-600" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zvec-logo.png" alt="ZVEC Online Store" className="h-10 object-contain mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Sign in to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="e.g. admin"
                autoComplete="username"
                autoFocus
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full border rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-teal-400 ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 space-y-0.5">
          <p className="font-semibold">First time? Default credentials:</p>
          <p>Username: <span className="font-mono font-bold">admin</span></p>
          <p>Password: <span className="font-mono font-bold">Admin1234</span></p>
          <p className="text-blue-500 mt-1">Change your password in Users after logging in.</p>
        </div>
      </div>
    </div>
  );
}
