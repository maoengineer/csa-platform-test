'use client';

import Link from 'next/link';
import { Users, FileText, Flag, Key, TrendingUp, AlertCircle, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StatsProps {
  stats: {
    totalUsers: number;
    postsToday: number;
    pendingReports: number;
    pendingResets: number;
    recentActivity: Array<{
      id: string;
      full_name: string;
      username: string;
      role: string;
      created_at: string;
      university?: { abbreviation: string };
    }>;
  };
}

export default function AdminDashboardClient({ stats }: StatsProps) {
  const cards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'blue',
      href: '/admin/users',
    },
    {
      label: 'Posts Today',
      value: stats.postsToday.toLocaleString(),
      icon: FileText,
      color: 'purple',
      href: '/admin/posts',
    },
    {
      label: 'Pending Reports',
      value: stats.pendingReports.toLocaleString(),
      icon: Flag,
      color: stats.pendingReports > 0 ? 'red' : 'green',
      href: '/admin/reports',
    },
    {
      label: 'Password Resets',
      value: stats.pendingResets.toLocaleString(),
      icon: Key,
      color: stats.pendingResets > 0 ? 'amber' : 'green',
      href: '/admin/reports',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Platform overview and quick actions</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="csa-card p-5 hover:shadow-card-hover transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Users */}
        <div className="csa-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Registrations</h2>
            <Link href="/admin/users" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {stats.recentActivity.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{user.full_name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">@{user.username} · {user.university?.abbreviation}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    user.role === 'moderator' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {user.role}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="csa-card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: '/admin/reports', label: 'Review Reports', icon: Flag, urgent: stats.pendingReports > 0 },
              { href: '/admin/reports', label: 'Password Resets', icon: Key, urgent: stats.pendingResets > 0 },
              { href: '/admin/users', label: 'Manage Users', icon: Users, urgent: false },
              { href: '/admin/universities', label: 'Universities', icon: UserCheck, urgent: false },
            ].map(({ href, label, icon: Icon, urgent }) => (
              <Link
                key={href + label}
                href={href}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all hover:scale-[1.02] ${
                  urgent
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
                {urgent && <AlertCircle className="w-3 h-3 text-red-500" />}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
