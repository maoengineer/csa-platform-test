'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import type { University, User } from '@/types';

export default function RightPanel() {
  const t = useTranslations();
  const { user } = useAuth();
  const supabase = createClient();

  const [universities, setUniversities] = useState<University[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: unis }] = await Promise.all([
        supabase.from('universities').select('*').order('is_public', { ascending: false }).limit(20),
      ]);
      setUniversities(unis || []);

      if (user) {
        const { data: users } = await supabase
          .from('users')
          .select('*, university:universities(*), department:departments(*)')
          .eq('university_id', user.university_id)
          .neq('id', user.id)
          .limit(4);
        setSuggestions((users as User[]) || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [user, supabase]);

  const publicCount = universities.filter(u => u.is_public).length;
  const privateCount = universities.filter(u => !u.is_public).length;

  return (
    <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-3 py-4 pl-2">
        {/* Welcome / Auth CTA */}
        {!user && (
          <div className="csa-card p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg csa-hero-gradient flex items-center justify-center">
                <span className="text-sm">🏛️</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {t('rightPanel.welcomeTitle')}{' '}
                  <span className="text-xs font-normal text-slate-400">KH</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('rightPanel.welcomeSubtitle')}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {t('rightPanel.welcomeDesc')}
            </p>
            <Link href="/register" className="btn-primary w-full text-center block text-sm py-2.5 mb-2">
              {t('rightPanel.createAccount')}
            </Link>
            <Link href="/login" className="btn-secondary w-full text-center block text-sm py-2.5">
              {t('rightPanel.signIn')}
            </Link>
            <p className="text-xs text-center text-slate-400 mt-3">
              Gmail or .edu email · Verified students only
            </p>
          </div>
        )}

        {/* People you may know */}
        {user && suggestions.length > 0 && (
          <div className="csa-card p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">
              {t('rightPanel.suggestedTitle')}
            </h3>
            <div className="space-y-3">
              {suggestions.map(suggestion => (
                <Link
                  key={suggestion.id}
                  href={`/${suggestion.username}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {suggestion.avatar_url ? (
                      <img src={suggestion.avatar_url} alt={suggestion.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {suggestion.full_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {suggestion.full_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{suggestion.username}</p>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium shrink-0">Follow</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Universities */}
        <div className="csa-card p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            {universities.length} {t('rightPanel.universitiesTitle', { count: '' }).trim()}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {t('rightPanel.universitiesDesc', { public: publicCount, private: privateCount })}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {universities.slice(0, 14).map(uni => (
              <Link
                key={uni.id}
                href={`/universities`}
                className="badge-blue hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors cursor-pointer text-xs"
              >
                {uni.abbreviation}
              </Link>
            ))}
            {universities.length > 14 && (
              <Link href="/universities" className="badge bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                +{universities.length - 14} {t('common.more')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
