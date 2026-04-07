'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';

export default function GuestPrompt() {
  const t = useTranslations('feed.guestPrompt');

  return (
    <div className="csa-card relative overflow-hidden">
      {/* Blurred preview */}
      <div className="p-5 filter blur-[2px] pointer-events-none select-none">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500" />
          <div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-1" />
            <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-40" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 dark:bg-slate-900/75 backdrop-blur-[4px] p-6 text-center">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <Lock className="w-5 h-5 text-slate-400" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
          {t('title')}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
          {t('desc')}
        </p>
        <div className="flex gap-3">
          <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
            {t('joinFree')}
          </Link>
          <Link href="/login" className="btn-secondary text-sm px-5 py-2.5">
            {t('signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
