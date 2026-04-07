'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import type { University, User } from '@/types';

const GUEST_SUGGESTIONS = [
  { id: '1', full_name: 'Kunthea Ros', username: 'kunthea_ros', university: { abbreviation: 'RUPP' }, department: { name_en: 'Computer Science' }, color: 'from-red-400 to-red-600', initials: 'KR' },
  { id: '2', full_name: 'Phearum Ith', username: 'phearum_ith', university: { abbreviation: 'ITC' }, department: { name_en: 'Civil Engineering' }, color: 'from-purple-400 to-purple-600', initials: 'PI' },
  { id: '3', full_name: 'Molika Sam', username: 'molika_sam', university: { abbreviation: 'PUC' }, department: { name_en: 'Law' }, color: 'from-green-400 to-green-600', initials: 'MS' },
  { id: '4', full_name: 'Raksmey Heng', username: 'raksmey_heng', university: { abbreviation: 'NUM' }, department: { name_en: 'Business' }, color: 'from-orange-400 to-red-500', initials: 'RH' },
  { id: '5', full_name: 'Visal Meng', username: 'visal_meng', university: { abbreviation: 'CADT' }, department: { name_en: 'AI & Data Science' }, color: 'from-violet-400 to-purple-600', initials: 'VM' },
];

export default function RightPanel() {
  const { user } = useAuth();
  const supabase = createClient();

  const [universities, setUniversities] = useState<University[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: unis } = await supabase
          .from('universities')
          .select('*')
          .order('is_public', { ascending: false })
          .limit(20);
        setUniversities(unis || []);

        if (user) {
          const { data: users } = await supabase
            .from('users')
            .select('*, university:universities(*), department:departments(*)')
            .neq('id', user.id)
            .limit(5);
          setSuggestions((users as User[]) || []);
        }
      } catch {
        // silently fail
      }
    };
    fetchData();
  }, [user, supabase]);

  const publicCount = universities.filter(u => u.is_public).length;
  const privateCount = universities.filter(u => !u.is_public).length;

  return (
    <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-3 py-4 pl-2">

        {/* Welcome / Auth CTA for guests */}
        {!user && (
          <div className="csa-card p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg csa-hero-gradient flex items-center justify-center">
                <span className="text-sm">🏛️</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Welcome to CSA{' '}
                  <span className="text-xs font-normal text-slate-400">KH</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cambodia Student Association</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              The exclusive social network for Cambodian university students. Verified community, real connections.
            </p>
            <Link href="/register" className="btn-primary w-full text-center block text-sm py-2.5 mb-2">
              Create an Account
            </Link>
            <Link href="/login" className="btn-secondary w-full text-center block text-sm py-2.5">
              Sign In
            </Link>
            <p className="text-xs text-center text-slate-400 mt-3">
              Gmail or .edu email · Verified students only
            </p>
          </div>
        )}

        {/* Students to connect with */}
        <div className="csa-card p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
            Students to connect with
          </h3>
          <div className="space-y-3">
            {user && suggestions.length > 0
              ? suggestions.map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt={s.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold text-sm">{s.full_name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.full_name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {(s.university as any)?.abbreviation} · {(s.department as any)?.name_en}
                    </p>
                  </div>
                  <Link
                    href={`/${s.username}`}
                    className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1 rounded-lg font-medium transition-colors shrink-0"
                  >
                    Add
                  </Link>
                </div>
              ))
              : GUEST_SUGGESTIONS.map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-xs">{s.initials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.full_name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {s.university.abbreviation} · {s.department.name_en}
                    </p>
                  </div>
                  <Link
                    href="/register"
                    className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1 rounded-lg font-medium transition-colors shrink-0"
                  >
                    Add
                  </Link>
                </div>
              ))
            }
          </div>
        </div>

        {/* Universities */}
        {universities.length > 0 && (
          <div className="csa-card p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
              {universities.length} Universities on CSA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {publicCount} public · {privateCount} private
            </p>
            <div className="flex flex-wrap gap-1.5">
              {universities.slice(0, 14).map(uni => (
                <Link
                  key={uni.id}
                  href="/universities"
                  className="badge-blue hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors cursor-pointer text-xs"
                >
                  {uni.abbreviation}
                </Link>
              ))}
              {universities.length > 14 && (
                <Link href="/universities" className="badge bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  +{universities.length - 14} more
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
