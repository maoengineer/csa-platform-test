'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import PostCard from '@/components/post/PostCard';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Calendar, GraduationCap, BookOpen, Settings } from 'lucide-react';
import Link from 'next/link';
import type { User, Post } from '@/types';
import toast from 'react-hot-toast';

interface ProfileClientProps {
  user: User;
  initialPosts: Post[];
}

export default function ProfileClient({ user: profileUser, initialPosts }: ProfileClientProps) {
  const t = useTranslations('profile');
  const { user: currentUser } = useAuth();
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="csa-card overflow-hidden">
        {/* Cover */}
        <div className="h-32 csa-hero-gradient relative">
          {isOwnProfile && (
            <Link href="/settings" className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white">
              <Settings className="w-4 h-4" />
            </Link>
          )}
        </div>
        {/* Info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {profileUser.avatar_url ? (
                <img src={profileUser.avatar_url} alt={profileUser.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-2xl">{profileUser.full_name.charAt(0)}</span>
              )}
            </div>
            {!isOwnProfile && currentUser && (
              <Link
                href={`/messages/${profileUser.id}`}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {t('message')}
              </Link>
            )}
          </div>

          <div className="flex items-start gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{profileUser.full_name}</h1>
            {profileUser.role !== 'user' && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
                profileUser.role === 'admin'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              }`}>
                {profileUser.role}
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">@{profileUser.username}</p>

          {profileUser.bio && (
            <p className="text-slate-700 dark:text-slate-300 text-sm mb-3 leading-relaxed">{profileUser.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {profileUser.university && (
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-400">{profileUser.university.abbreviation}</span>
                <span>— {profileUser.university.name_en}</span>
              </div>
            )}
            {profileUser.department && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                <span>{profileUser.department.name_en}</span>
              </div>
            )}
            {profileUser.year_of_study && (
              <span className="badge-blue">Year {profileUser.year_of_study}</span>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{t('memberSince', { date: formatDistanceToNow(new Date(profileUser.created_at), { addSuffix: true }) })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="csa-card p-0 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {[
            { key: 'posts', label: `${t('posts')} (${posts.length})` },
            { key: 'about', label: t('about') },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'posts' | 'about')}
              className={`flex-1 py-3.5 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'posts' ? (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="csa-card p-8 text-center">
              <p className="text-slate-400">✏️ {t('noPosts')}</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                showGuestBlur={!currentUser}
                onDeleted={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
              />
            ))
          )}
        </div>
      ) : (
        <div className="csa-card p-5 space-y-4">
          {[
            { label: t('university'), value: profileUser.university?.name_en },
            { label: t('department'), value: profileUser.department?.name_en },
            { label: t('year'), value: profileUser.year_of_study ? `Year ${profileUser.year_of_study}` : null, template: true },
            { label: t('memberSince'), value: new Date(profileUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
          ].filter(item => item.value).map(item => (
            <div key={item.label} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
