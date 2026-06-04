'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminAuthGate from '@/components/admin/AdminAuthGate';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminAuthGate>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <AdminSidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-green-600 text-white font-black text-sm px-2 py-0.5 rounded-lg">ZVEC</div>
              <span className="font-semibold text-gray-900 text-sm">Admin Panel</span>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGate>
  );
}
