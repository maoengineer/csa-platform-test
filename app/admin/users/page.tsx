'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Ban, UserCheck, Shield, Trash2, Eye } from 'lucide-react';
import type { User } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [uniFilter, setUniFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase
      .from('users')
      .select('*, university:universities(abbreviation, name_en), department:departments(name_en)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (search) query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`);
    if (roleFilter) query = query.eq('role', roleFilter);

    const { data } = await query;
    setUsers((data as User[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const updateRole = async (userId: string, role: string) => {
    const { error } = await supabase.from('users').update({ role }).eq('id', userId);
    if (!error) {
      toast.success(`Role updated to ${role}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: role as User['role'] } : u));
    }
  };

  const toggleBan = async (user: User) => {
    const { error } = await supabase.from('users').update({ is_banned: !user.is_banned }).eq('id', user.id);
    if (!error) {
      toast.success(user.is_banned ? 'User unbanned' : 'User banned');
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_banned: !u.is_banned } : u));
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>

      <div className="csa-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, username, or email..."
            className="csa-input pl-10 py-2"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="csa-input w-40">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="csa-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">User</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden md:table-cell">University</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden lg:table-cell">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Role</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="skeleton h-4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{user.full_name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{user.full_name}</p>
                      <p className="text-xs text-slate-400">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-500 dark:text-slate-400 text-xs">
                  {user.university?.abbreviation}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-slate-400 text-xs">
                  {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={e => updateRole(user.id, e.target.value)}
                    className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <option value="user">user</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${user.is_banned ? 'badge-red' : 'badge-green'}`}>
                    {user.is_banned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/${user.username}`} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => toggleBan(user)}
                      className={`p-1.5 rounded-lg transition-colors ${user.is_banned ? 'hover:bg-green-100 dark:hover:bg-green-900/20 text-green-500' : 'hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500'}`}
                    >
                      {user.is_banned ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && users.length === 0 && (
          <div className="text-center py-12 text-slate-400">No users found</div>
        )}
      </div>
    </div>
  );
}
