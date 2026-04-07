'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search as SearchIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RightPanel from '@/components/layout/RightPanel';
import type { User } from '@/types';
import Link from 'next/link';

export default function SearchPage() {
  const t = useTranslations('search');
  const { user } = useAuth();
  const supabase = createClient();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) { setResults([]); return; }
      setLoading(true);
      const { data } = await supabase
        .from('users')
        .select('*, university:universities(id, abbreviation, name_en), department:departments(name_en)')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .eq('is_banned', false)
        .limit(20);

      let sorted = (data as User[]) || [];
      // Rank: same dept > same univ > others
      if (user) {
        sorted = sorted.sort((a, b) => {
          const aScore = (a.department_id === user.department_id ? 2 : 0) + (a.university_id === user.university_id ? 1 : 0);
          const bScore = (b.department_id === user.department_id ? 2 : 0) + (b.university_id === user.university_id ? 1 : 0);
          return bScore - aScore;
        });
      }
      setResults(sorted);
      setLoading(false);
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query, user, supabase]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <main className="csa-layout py-4">
        <Sidebar />
        <div className="space-y-4">
          <div className="csa-card p-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('title')}</h1>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('placeholder')}
                className="csa-input pl-12 py-3 text-base"
                autoFocus
              />
            </div>
          </div>

          {loading && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="csa-card p-4 flex items-center gap-3">
                  <div className="skeleton w-12 h-12 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-36 rounded" />
                    <div className="skeleton h-3 w-52 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="csa-card p-12 text-center">
              <p className="text-slate-400">No students found for "{query}"</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              {results.map(result => {
                const sameDept = result.department_id === user?.department_id;
                const sameUni = result.university_id === user?.university_id;
                return (
                  <Link
                    key={result.id}
                    href={`/${result.username}`}
                    className="csa-card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow animate-fade-in"
                  >
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      {result.avatar_url ? (
                        <img src={result.avatar_url} alt={result.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold">{result.full_name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{result.full_name}</h3>
                        {sameDept && <span className="badge-gold text-xs">Same Dept</span>}
                        {!sameDept && sameUni && <span className="badge-blue text-xs">Same Uni</span>}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">@{result.username}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {result.university && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{result.university.abbreviation}</span>
                        )}
                        {result.department && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{result.department.name_en}</span>
                          </>
                        )}
                        {result.year_of_study && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <span className="text-xs text-slate-400">Year {result.year_of_study}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {user && result.id !== user.id && (
                      <Link
                        href={`/messages/${result.id}`}
                        onClick={e => e.stopPropagation()}
                        className="btn-secondary text-xs px-3 py-1.5 shrink-0"
                      >
                        Message
                      </Link>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <RightPanel />
      </main>
    </div>
  );
}
