'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, Search, Users, BookOpen, Globe2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function Sidebar() {
  const t = useTranslations();
  const { user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: t('sidebar.homeFeed') },
    { href: '/search', icon: Search, label: t('sidebar.discoverStudents') },
    { href: '/search', icon: Users, label: t('sidebar.friends') },
    { href: '/search', icon: BookOpen, label: t('sidebar.studyGroups') },
    { href: '/universities', icon: Globe2, label: t('sidebar.universities') },
  ];

  return (
    <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-3 py-4 pr-2">
        {/* Guest CTA Card */}
        {!user && (
          <div className="csa-card overflow-hidden">
            <div className="csa-hero-gradient p-5">
              <div className="text-3xl mb-2">🏛️</div>
              <h3 className="text-white font-bold text-base leading-tight">
                {t('sidebar.joinCta.title')}
              </h3>
              <p className="text-blue-200 text-xs mt-1.5 leading-relaxed">
                {t('sidebar.joinCta.subtitle')}
              </p>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href="/register"
                className="btn-primary w-full text-center block text-sm py-2.5"
              >
                {t('sidebar.joinCta.createAccount')}
              </Link>
              <Link
                href="/login"
                className="btn-secondary w-full text-center block text-sm py-2.5"
              >
                {t('sidebar.joinCta.signIn')}
              </Link>
            </div>
          </div>
        )}

        {/* User Quick Profile */}
        {user && (
          <div className="csa-card p-4">
            <Link href={`/${user.username}`} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-csa-blue-900 to-csa-purple-600 flex items-center justify-center flex-shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{user.username}</p>
                {user.university && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.university.abbreviation}</p>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="csa-card p-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                {label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <p className="text-xs text-slate-400 dark:text-slate-600 px-2 leading-relaxed">
          © 2025 CSA Platform · For Cambodian students ·{' '}
          <Link href="/login" className="hover:text-blue-500 transition-colors">
            Sign in
          </Link>{' '}
          to unlock all features
        </p>
      </div>
    </aside>
  );
}
