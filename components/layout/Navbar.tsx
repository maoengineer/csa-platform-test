'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import {
  Home, Search, Users, BookOpen, Bell, MessageSquare,
  Moon, Sun, Menu, X, ChevronDown, Settings, LogOut,
  Shield, UserCircle, Globe
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Navbar() {
  const t = useTranslations();
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const stored = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('NEXT_LOCALE='))
      ?.split('=')[1] || 'en';
    setLocale(stored);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      const [{ count: msgs }, { count: notifs }] = await Promise.all([
        supabase.from('messages').select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id).eq('is_read', false),
        supabase.from('notifications').select('*', { count: 'exact', head: true })
          .eq('user_id', user.id).eq('is_read', false),
      ]);
      setUnreadMessages(msgs || 0);
      setUnreadNotifs(notifs || 0);
    };

    fetchCounts();
  }, [user, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
    toast.success('Signed out successfully');
  };

  const toggleLocale = () => {
    const next = locale === 'en' ? 'kh' : 'en';
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
    setLocale(next);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg csa-hero-gradient flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <span className="text-lg">🏛️</span>
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-csa-blue-900 to-csa-purple-600">CSA</span>
          </span>
        </Link>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <Link
            href="/search"
            className="w-full flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>{t('nav.search')}</span>
          </Link>
        </div>

        {/* Center nav icons */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
          {[
            { href: '/', icon: Home, label: t('nav.home') },
            { href: '/search', icon: Search, label: t('nav.discover') },
            { href: '/universities', icon: BookOpen, label: 'Universities' },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-csa-blue-900 dark:hover:text-blue-400 transition-all"
              title={label}
            >
              <Icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle language"
          >
            <Globe className="w-4 h-4" />
            <span>{locale === 'en' ? 'EN' : 'ខ្មែរ'}</span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {!loading && (
            <>
              {user ? (
                <>
                  {/* Messages */}
                  <Link
                    href="/messages"
                    className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    aria-label={t('nav.messages')}
                  >
                    <MessageSquare className="w-5 h-5" />
                    {unreadMessages > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </Link>

                  {/* Notifications */}
                  <Link
                    href="/notifications"
                    className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    aria-label={t('nav.notifications')}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                        {unreadNotifs > 9 ? '9+' : unreadNotifs}
                      </span>
                    )}
                  </Link>

                  {/* User menu */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-csa-blue-900 to-csa-purple-600 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-semibold text-sm">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform group-data-[state=open]:rotate-180" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="z-50 min-w-[200px] bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 animate-slide-down"
                        align="end"
                        sideOffset={8}
                      >
                        <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700 mb-1">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{user.full_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>
                        </div>

                        <DropdownMenu.Item asChild>
                          <Link href={`/${user.username}`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                            <UserCircle className="w-4 h-4" />
                            {t('nav.profile')}
                          </Link>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item asChild>
                          <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                            <Settings className="w-4 h-4" />
                            {t('nav.settings')}
                          </Link>
                        </DropdownMenu.Item>

                        {(user.role === 'admin' || user.role === 'moderator') && (
                          <>
                            <DropdownMenu.Separator className="my-1 border-t border-slate-100 dark:border-slate-700" />
                            {user.role === 'admin' && (
                              <DropdownMenu.Item asChild>
                                <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors">
                                  <Shield className="w-4 h-4" />
                                  {t('nav.admin')}
                                </Link>
                              </DropdownMenu.Item>
                            )}
                            {user.role === 'moderator' && (
                              <DropdownMenu.Item asChild>
                                <Link href="/moderator" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors">
                                  <Shield className="w-4 h-4" />
                                  {t('nav.moderator')}
                                </Link>
                              </DropdownMenu.Item>
                            )}
                          </>
                        )}

                        <DropdownMenu.Separator className="my-1 border-t border-slate-100 dark:border-slate-700" />
                        <DropdownMenu.Item
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
                          onClick={handleSignOut}
                        >
                          <LogOut className="w-4 h-4" />
                          {t('nav.signOut')}
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="btn-ghost text-sm px-4 py-2">
                    {t('nav.signIn')}
                  </Link>
                  <Link href="/register" className="btn-primary text-sm px-4 py-2">
                    {t('nav.joinFree')}
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 animate-slide-down">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200" onClick={() => setMobileOpen(false)}>
            <Home className="w-4 h-4" /> {t('nav.home')}
          </Link>
          <Link href="/search" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200" onClick={() => setMobileOpen(false)}>
            <Search className="w-4 h-4" /> {t('nav.search')}
          </Link>
          {user && (
            <>
              <Link href="/messages" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200" onClick={() => setMobileOpen(false)}>
                <MessageSquare className="w-4 h-4" /> {t('nav.messages')}
                {unreadMessages > 0 && <span className="ml-auto badge-red">{unreadMessages}</span>}
              </Link>
            </>
          )}
          <button
            onClick={() => { toggleLocale(); setMobileOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            <Globe className="w-4 h-4" />
            {locale === 'en' ? 'Switch to ខ្មែរ' : 'Switch to English'}
          </button>
        </div>
      )}
    </header>
  );
}


