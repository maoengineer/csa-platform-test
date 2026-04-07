'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Metadata } from 'next';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError(t('errors.emailRequired')); return; }
    if (!password) { setError(t('errors.passwordRequired')); return; }

    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(t('errors.invalidCredentials'));
      setLoading(false);
      return;
    }

    if (data.user) {
      // Check if banned
      const { data: profile } = await supabase.from('users').select('is_banned, role').eq('id', data.user.id).single();
      if (profile?.is_banned) {
        await supabase.auth.signOut();
        setError(t('errors.banned'));
        setLoading(false);
        return;
      }

      // Update last_seen_at
      await supabase.from('users').update({ last_seen_at: new Date().toISOString() }).eq('id', data.user.id);

      toast.success('Welcome back! 🎉');
      router.push('/');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] csa-hero-gradient p-10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏛️</div>
            <span className="text-white font-bold text-2xl">CSA</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Cambodia Student Association
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            Connect with students from 48 universities across Cambodia.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { emoji: '🎓', text: 'Students from 48 universities' },
            { emoji: '🇰🇭', text: 'Full Khmer language support' },
            { emoji: '💬', text: 'Real-time messaging & reactions' },
            { emoji: '🛡️', text: 'Safe & moderated community' },
          ].map(item => (
            <div key={item.emoji} className="flex items-center gap-3">
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-blue-100 text-sm">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl csa-hero-gradient flex items-center justify-center">🏛️</div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">CSA</span>
          </div>

          <div className="csa-card p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{t('welcomeBack')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{t('signInSubtitle')}</p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-4 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="csa-label" htmlFor="email">{t('email')}</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="csa-input"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="csa-label" htmlFor="password">{t('password')}</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="csa-input pr-11"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input type="checkbox" className="rounded" /> {t('rememberMe')}
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  {t('forgotPassword')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {loading ? t('signingIn') : t('signIn')}
              </button>
            </form>

            <div className="divider my-5" />

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                {t('joinNow')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
