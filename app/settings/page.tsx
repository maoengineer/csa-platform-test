'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import * as Tabs from '@radix-ui/react-tabs';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/providers/ThemeProvider';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { User, Lock, Building, Globe, Shield, Eye } from 'lucide-react';
import type { University, Department } from '@/types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const supabase = createClient();

  // Profile state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [yearOfStudy, setYearOfStudy] = useState(user?.year_of_study?.toString() || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // University state
  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [universityId, setUniversityId] = useState(user?.university_id || '');
  const [departmentId, setDepartmentId] = useState(user?.department_id || '');
  const [savingUni, setSavingUni] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setBio(user.bio || '');
      setYearOfStudy(user.year_of_study?.toString() || '');
      setUniversityId(user.university_id || '');
      setDepartmentId(user.department_id || '');
    }
  }, [user]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('universities').select('*').order('name_en');
      setUniversities((data as University[]) || []);
    };
    load();
  }, [supabase]);

  useEffect(() => {
    if (!universityId) return;
    const load = async () => {
      const { data } = await supabase.from('departments').select('*').eq('university_id', universityId).order('name_en');
      setDepartments((data as Department[]) || []);
    };
    load();
  }, [universityId, supabase]);

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from('users').update({
      full_name: fullName.trim(),
      bio: bio.trim() || null,
      year_of_study: yearOfStudy ? parseInt(yearOfStudy) : null,
    }).eq('id', user.id);
    if (error) toast.error('Failed to save profile');
    else { toast.success(t('profile.success')); await refreshUser(); }
    setSavingProfile(false);
  };

  const saveUniversity = async () => {
    if (!user) return;
    setSavingUni(true);
    const { error } = await supabase.from('users').update({ university_id: universityId, department_id: departmentId }).eq('id', user.id);
    if (error) toast.error('Failed to save university');
    else { toast.success(t('university.success')); await refreshUser(); }
    setSavingUni(false);
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 8) { toast.error(t('security.errors.tooShort')); return; }
    if (newPassword !== confirmNewPassword) { toast.error(t('security.errors.mismatch')); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(t('security.errors.wrongPassword'));
    else { toast.success(t('security.success')); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }
    setSavingPassword(false);
  };

  if (!user) return null;

  const tabItems = [
    { id: 'profile', label: t('tabs.profile'), icon: User },
    { id: 'university', label: t('tabs.university'), icon: Building },
    { id: 'account', label: t('tabs.account'), icon: Shield },
    { id: 'security', label: t('tabs.security'), icon: Lock },
    { id: 'language', label: t('tabs.language'), icon: Globe },
    { id: 'privacy', label: t('tabs.privacy'), icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <main className="csa-layout-2col py-4">
        <Sidebar />
        <div className="min-w-0">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          </div>

          <Tabs.Root defaultValue="profile" className="space-y-4">
            {/* Tab list */}
            <Tabs.List className="csa-card p-1.5 flex flex-wrap gap-1">
              {tabItems.map(({ id, label, icon: Icon }) => (
                <Tabs.Trigger
                  key={id}
                  value={id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-purple-50 dark:data-[state=active]:from-blue-900/20 dark:data-[state=active]:to-purple-900/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {/* Profile tab */}
            <Tabs.Content value="profile">
              <div className="csa-card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('profile.title')}</h2>
                <div>
                  <label className="csa-label">{t('profile.fullName')}</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className="csa-input" />
                </div>
                <div>
                  <label className="csa-label">{t('profile.bio')}</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} className="csa-input resize-none" rows={3} maxLength={300} placeholder={t('profile.bioPlaceholder')} />
                  <p className="text-xs text-slate-400 mt-1">{bio.length}/300</p>
                </div>
                <div>
                  <label className="csa-label">{t('profile.yearOfStudy')}</label>
                  <select value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} className="csa-input">
                    <option value="">Select year</option>
                    {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <button onClick={saveProfile} disabled={savingProfile} className="btn-primary px-6">
                  {savingProfile ? t('profile.saving') : t('profile.save')}
                </button>
              </div>
            </Tabs.Content>

            {/* University tab */}
            <Tabs.Content value="university">
              <div className="csa-card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('university.title')}</h2>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
                  ⚠️ {t('university.warning')}
                </div>
                <div>
                  <label className="csa-label">{t('university.title')}</label>
                  <select value={universityId} onChange={e => setUniversityId(e.target.value)} className="csa-input">
                    <option value="">Select university</option>
                    {universities.map(u => <option key={u.id} value={u.id}>{u.abbreviation} — {u.name_en}</option>)}
                  </select>
                </div>
                {departments.length > 0 && (
                  <div>
                    <label className="csa-label">Department</label>
                    <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="csa-input">
                      <option value="">Select department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name_en}</option>)}
                    </select>
                  </div>
                )}
                <button onClick={saveUniversity} disabled={savingUni} className="btn-primary px-6">
                  {savingUni ? 'Saving...' : t('university.save')}
                </button>
              </div>
            </Tabs.Content>

            {/* Account tab */}
            <Tabs.Content value="account">
              <div className="csa-card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('account.title')}</h2>
                <div>
                  <label className="csa-label">{t('account.username')}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                    <input value={user.username} readOnly className="csa-input pl-8 bg-slate-100 dark:bg-slate-700 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Username changes require contacting a moderator</p>
                </div>
                <div>
                  <label className="csa-label">{t('account.email')}</label>
                  <input value={user.email} readOnly className="csa-input bg-slate-100 dark:bg-slate-700 cursor-not-allowed" />
                  <p className="text-xs text-slate-400 mt-1">{t('account.emailNote')}</p>
                </div>
              </div>
            </Tabs.Content>

            {/* Security tab */}
            <Tabs.Content value="security">
              <div className="csa-card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('security.title')}</h2>
                <div>
                  <label className="csa-label">{t('security.newPassword')}</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="csa-input" placeholder="New password (min 8 characters)" />
                </div>
                <div>
                  <label className="csa-label">{t('security.confirmPassword')}</label>
                  <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="csa-input" placeholder="Repeat new password" />
                </div>
                <button onClick={changePassword} disabled={savingPassword} className="btn-primary px-6">
                  {savingPassword ? 'Changing...' : t('security.changePassword')}
                </button>
              </div>
            </Tabs.Content>

            {/* Language tab */}
            <Tabs.Content value="language">
              <div className="csa-card p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('language.title')}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { locale: 'en', label: t('language.english'), flag: '🇬🇧' },
                    { locale: 'kh', label: t('language.khmer'), flag: '🇰🇭' },
                  ].map(({ locale, label, flag }) => {
                    const current = document.cookie.includes(`NEXT_LOCALE=${locale}`);
                    return (
                      <button
                        key={locale}
                        onClick={() => {
                          document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
                          window.location.reload();
                        }}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          current
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl">{flag}</span>
                        <span className={`font-medium ${current ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-3">Theme</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'light', label: '☀️ Light' },
                      { value: 'dark', label: '🌙 Dark' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value as 'light' | 'dark')}
                        className={`p-4 rounded-2xl border-2 font-medium transition-all ${
                          theme === value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Tabs.Content>

            {/* Privacy tab */}
            <Tabs.Content value="privacy">
              <div className="csa-card p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('tabs.privacy')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Privacy controls coming in v2.</p>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </main>
    </div>
  );
}
