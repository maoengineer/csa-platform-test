'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { University, Department } from '@/types';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [universityId, setUniversityId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [uniSearch, setUniSearch] = useState('');

  const [studentId, setStudentId] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('universities').select('*').order('name_en');
      setUniversities((data as University[]) || []);
    };
    fetch();
  }, [supabase]);

  useEffect(() => {
    if (!universityId) { setDepartments([]); setDepartmentId(''); return; }
    const fetch = async () => {
      const { data } = await supabase.from('departments').select('*').eq('university_id', universityId).order('name_en');
      setDepartments((data as Department[]) || []);
      setDepartmentId('');
    };
    fetch();
  }, [universityId, supabase]);

  const filteredUniversities = universities.filter(u =>
    u.name_en.toLowerCase().includes(uniSearch.toLowerCase()) ||
    u.abbreviation.toLowerCase().includes(uniSearch.toLowerCase())
  );

  const validateStep1 = () => {
    if (!fullName.trim()) { setError(t('errors.fullNameRequired')); return false; }
    if (!username.trim()) { setError(t('errors.usernameRequired')); return false; }
    if (!email.trim()) { setError('Email is required'); return false; }
    if (password.length < 8) { setError(t('errors.passwordTooShort')); return false; }
    if (password !== confirmPassword) { setError(t('errors.passwordMismatch')); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!universityId) { setError(t('errors.universityRequired')); return false; }
    if (!departmentId) { setError(t('errors.departmentRequired')); return false; }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check username/email uniqueness
    const [{ data: existingUsername }, { data: existingEmail }] = await Promise.all([
      supabase.from('users').select('id').eq('username', username.toLowerCase()).single(),
      supabase.from('users').select('id').eq('email', email.toLowerCase()).single(),
    ]);

    if (existingUsername) { setError(t('errors.usernameExists')); setLoading(false); return; }
    if (existingEmail) { setError(t('errors.emailExists')); setLoading(false); return; }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        },
      },
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message || t('errors.generic'));
      setLoading(false);
      return;
    }

    // Update the user profile with all details
    await supabase.from('users').update({
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      full_name: fullName.trim(),
      university_id: universityId,
      department_id: departmentId,
      student_id: studentId || null,
      year_of_study: yearOfStudy ? parseInt(yearOfStudy) : null,
      bio: bio.trim() || null,
    }).eq('id', data.user.id);

    toast.success(t('success'));
    router.push('/');
    router.refresh();
    setLoading(false);
  };

  const steps = [
    { num: 1, label: t('step1') },
    { num: 2, label: t('step2') },
    { num: 3, label: t('step3') },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-between w-[380px] csa-hero-gradient p-10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏛️</div>
            <span className="text-white font-bold text-2xl">CSA</span>
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">{t('title')}</h1>
          <p className="text-blue-200 leading-relaxed">{t('subtitle')}</p>
        </div>
        <div className="relative z-10">
          {steps.map(s => (
            <div key={s.num} className={`flex items-center gap-3 mb-4 ${step >= s.num ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s.num ? 'bg-green-400 text-white' : step === s.num ? 'bg-white text-blue-900' : 'bg-white/20 text-white'
              }`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-white font-medium">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/4 -translate-y-1/4" />
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl csa-hero-gradient flex items-center justify-center">🏛️</div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">CSA</span>
            <span className="ml-auto text-sm text-slate-500">Step {step} of 3</span>
          </div>

          <div className="csa-card p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{t('title')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              {steps.find(s => s.num === step)?.label}
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-4 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="csa-label">{t('fullName')} *</label>
                    <input id="full_name" value={fullName} onChange={e => setFullName(e.target.value)} className="csa-input" placeholder="Your full name" required />
                  </div>
                  <div>
                    <label className="csa-label">{t('username')} *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                      <input
                        id="username"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="csa-input pl-8"
                        placeholder="your_username"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{t('usernameHint')}</p>
                  </div>
                  <div>
                    <label className="csa-label">{t('email')} *</label>
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="csa-input" placeholder="your@email.com" required />
                  </div>
                  <div>
                    <label className="csa-label">{t('password')} *</label>
                    <div className="relative">
                      <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="csa-input pr-11" placeholder="At least 8 characters" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="csa-label">{t('confirmPassword')} *</label>
                    <input id="confirm_password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="csa-input" placeholder="Repeat password" required />
                  </div>
                </div>
              )}

              {/* STEP 2: University */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="csa-label">{t('university')} *</label>
                    <input
                      value={uniSearch}
                      onChange={e => { setUniSearch(e.target.value); setUniversityId(''); }}
                      className="csa-input mb-2"
                      placeholder={t('universitySearch')}
                    />
                    <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredUniversities.slice(0, 15).map(uni => (
                        <button
                          key={uni.id}
                          type="button"
                          onClick={() => { setUniversityId(uni.id); setUniSearch(`${uni.abbreviation} — ${uni.name_en}`); }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${universityId === uni.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}
                        >
                          <span>
                            <span className="font-semibold">{uni.abbreviation}</span> — {uni.name_en}
                          </span>
                          {!uni.is_public && <span className="text-xs text-slate-400">Private</span>}
                        </button>
                      ))}
                      {filteredUniversities.length === 0 && (
                        <p className="px-4 py-3 text-sm text-slate-400">No universities found</p>
                      )}
                    </div>
                  </div>

                  {universityId && departments.length > 0 && (
                    <div>
                      <label className="csa-label">{t('department')} *</label>
                      <select
                        value={departmentId}
                        onChange={e => setDepartmentId(e.target.value)}
                        className="csa-input"
                        required
                      >
                        <option value="">{t('departmentSelect')}</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name_en}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Student Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="csa-label">{t('studentId')}</label>
                    <input value={studentId} onChange={e => setStudentId(e.target.value)} className="csa-input" placeholder="e.g. e20210001" />
                    <p className="text-xs text-slate-400 mt-1">Used by moderators for identity verification</p>
                  </div>
                  <div>
                    <label className="csa-label">{t('yearOfStudy')}</label>
                    <select value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} className="csa-input">
                      <option value="">Select year</option>
                      {[1, 2, 3, 4, 5, 6].map(y => (
                        <option key={y} value={y}>{t(`years.${y}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="csa-label">{t('bio')}</label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      className="csa-input resize-none"
                      placeholder={t('bioPlaceholder')}
                      rows={3}
                      maxLength={300}
                    />
                    <p className="text-xs text-slate-400 mt-1">{bio.length}/300</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                )}
                <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : step === 3 ? (
                    <>{t('createAccount')}</>
                  ) : (
                    <>Next <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>

            <div className="divider my-5" />
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {t('alreadyHaveAccount')}{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">{t('signIn')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
