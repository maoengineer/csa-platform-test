'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';
import type { University } from '@/types';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.passwordReset');
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('universities').select('*').order('name_en');
      setUniversities((data as University[]) || []);
    };
    fetch();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !studentId || !email || !description) return;
    setLoading(true);

    const { error } = await supabase.from('password_reset_requests').insert({
      requester_name: fullName.trim(),
      student_id: studentId.trim(),
      university_id: universityId || null,
      email: email.toLowerCase().trim(),
      description: description.trim(),
    });

    if (error) {
      toast.error('Failed to submit request. Please try again.');
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-lg">
        <Link href="/login" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('backToLogin')}
        </Link>

        <div className="csa-card p-8">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{t('success')}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                {t('note')}
              </p>
              <Link href="/login" className="btn-primary mt-6 inline-block px-8">
                {t('backToLogin')}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl csa-hero-gradient flex items-center justify-center text-xl">🔑</div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-5 text-xs text-amber-700 dark:text-amber-400">
                📌 {t('note')}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="csa-label">{t('fullName')} *</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className="csa-input" placeholder="Your full name as registered" required />
                </div>
                <div>
                  <label className="csa-label">{t('studentId')} *</label>
                  <input value={studentId} onChange={e => setStudentId(e.target.value)} className="csa-input" placeholder="e.g. e20210001" required />
                </div>
                <div>
                  <label className="csa-label">{t('university')}</label>
                  <select value={universityId} onChange={e => setUniversityId(e.target.value)} className="csa-input">
                    <option value="">Select your university</option>
                    {universities.map(u => (
                      <option key={u.id} value={u.id}>{u.abbreviation} — {u.name_en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="csa-label">{t('email')} *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="csa-input" placeholder="Email you registered with" required />
                </div>
                <div>
                  <label className="csa-label">{t('description')} *</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="csa-input resize-none"
                    placeholder={t('descriptionPlaceholder')}
                    rows={4}
                    required
                    maxLength={1000}
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? t('submitting') : t('submit')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
