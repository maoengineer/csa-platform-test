'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Shield, Flag, Key, Users, Building2 } from 'lucide-react';
import type { ModeratorPermissions } from '@/types';

interface Props {
  children: React.ReactNode;
  permissions: ModeratorPermissions | null;
}

export default function ModeratorLayoutClient({ children, permissions }: Props) {
  const pathname = usePathname();

  const navItems = [
    { href: '/moderator', label: 'Dashboard', icon: Shield, alwaysVisible: true },
    ...(permissions?.can_handle_reports !== false ? [{ href: '/moderator/reports', label: 'Reports', icon: Flag, alwaysVisible: false }] : []),
    ...(permissions?.can_reset_password !== false ? [{ href: '/moderator/passwords', label: 'Password Resets', icon: Key, alwaysVisible: false }] : []),
    ...(permissions?.can_manage_users !== false ? [{ href: '/moderator/users', label: 'Users', icon: Users, alwaysVisible: false }] : []),
    ...(permissions?.can_edit_universities !== false ? [{ href: '/moderator/universities', label: 'Universities', icon: Building2, alwaysVisible: false }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <div className="flex max-w-7xl mx-auto">
        <aside className="w-64 shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto py-4 pr-3">
          <div className="csa-card p-2">
            <div className="px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-slate-900 dark:text-white">Moderator</span>
              </div>
            </div>
            {navItems.map(({ href, label, icon: Icon }) => {
              const exact = href === '/moderator';
              const isActive = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
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
        <main className="flex-1 min-w-0 p-4">{children}</main>
      </div>
    </div>
  );
}
