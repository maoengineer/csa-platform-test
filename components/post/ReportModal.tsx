'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import type { ReportReason } from '@/types';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const REASONS: ReportReason[] = ['politics', 'adult', 'fake', 'harassment', 'spam', 'impersonation', 'other'];

interface ReportModalProps {
  postId?: string;
  userId?: string;
  onClose: () => void;
}

export default function ReportModal({ postId, userId, onClose }: ReportModalProps) {
  const t = useTranslations('report');
  const { user } = useAuth();
  const supabase = createClient();
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    const payload: Record<string, string | null | undefined> = {
      reason,
      details: details || null,
      reporter_id: user?.id || null,
      reported_post_id: postId || null,
      reported_user_id: userId || null,
    };
    const { error } = await supabase.from('reports').insert(payload);
    if (!error) {
      toast.success(t('success'));
      onClose();
    } else {
      toast.error('Failed to submit report');
    }
    setSubmitting(false);
  };

  return (
    <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">{t('title')}</Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('subtitle')}</Dialog.Description>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {REASONS.map(r => (
              <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                reason === r
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
              }`}>
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  reason === r ? 'border-blue-500' : 'border-slate-300 dark:border-slate-500'
                }`}>
                  {reason === r && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-200">{t(`reasons.${r}`)}</span>
              </label>
            ))}
          </div>

          <div className="mb-4">
            <label className="csa-label">{t('details')}</label>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder={t('detailsPlaceholder')}
              rows={3}
              className="csa-input resize-none"
              maxLength={500}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">{t('cancel')}</button>
            <button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="btn-primary flex-1"
            >
              {submitting ? t('submitting') : t('submit')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
