'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import PostCard from '@/components/post/PostCard';
import PostEditor from '@/components/post/PostEditor';
import PostSkeleton from '@/components/post/PostSkeleton';
import GuestPrompt from '@/components/feed/GuestPrompt';
import { Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Post } from '@/types';
import Link from 'next/link';

interface FeedClientProps {
  initialPosts: Post[];
}

export default function FeedClient({ initialPosts }: FeedClientProps) {
  const t = useTranslations();
  const { user, loading } = useAuth();
  const supabase = createClient();

  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length === 20);

  const handlePostCreated = useCallback((post: Post) => {
    setPosts(prev => [post, ...prev]);
  }, []);

  const handlePostDeleted = useCallback((postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const oldest = posts[posts.length - 1];
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        author:users(
          id, username, full_name, avatar_url, role,
          university:universities(id, abbreviation, name_en),
          department:departments(id, name_en)
        )
      `)
      .eq('is_deleted', false)
      .lt('created_at', oldest?.created_at || new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    const newPosts = (data as Post[]) || [];
    setPosts(prev => [...prev, ...newPosts]);
    setHasMore(newPosts.length === 20);
    setLoadingMore(false);
  };

  return (
    <div className="space-y-3 min-w-0">
      {/* Post composer */}
      {loading ? (
        <div className="csa-card p-4">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="skeleton flex-1 h-10 rounded-xl" />
          </div>
        </div>
      ) : user ? (
        <PostEditor onPostCreated={handlePostCreated} />
      ) : (
        /* Guest composer placeholder */
        <div className="csa-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
            <Link
              href="/login"
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700/50 rounded-xl text-slate-400 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {t('feed.postPlaceholder')}
            </Link>
          </div>
        </div>
      )}

      {/* Guest prompt overlay card */}
      {!user && !loading && (
        <GuestPrompt />
      )}

      {/* Posts feed */}
      {posts.length === 0 && !loading ? (
        <div className="csa-card p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <>
          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              onDeleted={handlePostDeleted}
              showGuestBlur={!user}
            />
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="text-center py-4">
              <button onClick={loadMore} disabled={loadingMore} className="btn-secondary px-8">
                {loadingMore ? 'Loading...' : 'Load more posts'}
              </button>
            </div>
          )}

          {loadingMore && (
            <div className="space-y-3">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-6 text-sm text-slate-400 dark:text-slate-500">
              ✓ {t('feed.noMorePosts')}
            </div>
          )}
        </>
      )}
    </div>
  );
}
