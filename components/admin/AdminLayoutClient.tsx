'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import {
  LayoutDashboard, Users, FileText, Building2, Shield,
  Flag, BarChart3, Settings, Megaphone
} from 'lucide-react';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/universities', label: 'Universities', icon: Building2 },
  { href: '/admin/moderators', label: 'Moderators', icon: Shield },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <div className="flex max-w-7xl mx-auto">
        {/* Admin sidebar */}
        <aside className="w-64 shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto py-4 pr-3">
          <div className="csa-card p-2">
            <div className="px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-slate-900 dark:text-white">Admin Panel</span>
              </div>
            </div>
            {adminNav.map(({ href, label, icon: Icon }) => {
              const exact = href === '/admin';
              const isActive = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
