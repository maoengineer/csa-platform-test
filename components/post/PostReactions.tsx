'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare, SmilePlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import type { Post, ReactionType } from '@/types';
import Link from 'next/link';

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'haha', emoji: '😄', label: 'Haha' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
];

interface PostReactionsProps {
  post: Post;
  showGuestBlur?: boolean;
  onCommentClick: () => void;
  showComments: boolean;
}

export default function PostReactions({ post, showGuestBlur, onCommentClick, showComments }: PostReactionsProps) {
  const t = useTranslations();
  const { user } = useAuth();
  const supabase = createClient();

  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    like: 0, love: 0, haha: 0, sad: 0, angry: 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      const [{ data: reactions }, { count }, { data: userReactionData }] = await Promise.all([
        supabase.from('reactions').select('type').eq('post_id', post.id),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id).eq('is_deleted', false),
        user
          ? supabase.from('reactions').select('type').eq('post_id', post.id).eq('user_id', user.id).single()
          : Promise.resolve({ data: null }),
      ]);

      if (reactions) {
        const counts: Record<ReactionType, number> = { like: 0, love: 0, haha: 0, sad: 0, angry: 0 };
        reactions.forEach(r => { counts[r.type as ReactionType]++; });
        setReactionCounts(counts);
      }
      setCommentCount(count || 0);
      if (userReactionData) setUserReaction(userReactionData.type as ReactionType);
    };

    fetchCounts();

    // Realtime subscription
    const channel = supabase
      .channel(`reactions:${post.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions', filter: `post_id=eq.${post.id}` },
        () => fetchCounts()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [post.id, user, supabase]);

  const handleReact = async (type: ReactionType) => {
    if (!user) return;
    if (loading) return;
    setLoading(true);

    if (userReaction === type) {
      // Remove reaction
      await supabase.from('reactions').delete().eq('post_id', post.id).eq('user_id', user.id);
      setUserReaction(null);
      setReactionCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
    } else {
      if (userReaction) {
        // Update reaction
        await supabase.from('reactions').update({ type }).eq('post_id', post.id).eq('user_id', user.id);
        setReactionCounts(prev => ({
          ...prev,
          [userReaction]: Math.max(0, prev[userReaction] - 1),
          [type]: prev[type] + 1,
        }));
      } else {
        // Add reaction
        await supabase.from('reactions').insert({ post_id: post.id, user_id: user.id, type });
        setReactionCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
      }
      setUserReaction(type);
    }
    setShowPicker(false);
    setLoading(false);
  };

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);
  const topReactions = REACTIONS.filter(r => reactionCounts[r.type] > 0)
    .sort((a, b) => reactionCounts[b.type] - reactionCounts[a.type])
    .slice(0, 3);

  return (
    <div>
      {/* Reaction summary */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1 mb-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex -space-x-0.5">
            {topReactions.map(r => (
              <span key={r.type} className="text-sm">{r.emoji}</span>
            ))}
          </div>
          <span>{totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}</span>
          {commentCount > 0 && (
            <>
              <span className="mx-1">·</span>
              <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 relative">
        {/* React button */}
        {user ? (
          <div className="relative">
            <button
              className={`reaction-btn ${userReaction ? 'active' : ''}`}
              onClick={() => setShowPicker(!showPicker)}
            >
              {userReaction ? (
                <>
                  <span>{REACTIONS.find(r => r.type === userReaction)?.emoji}</span>
                  <span className="capitalize">{userReaction}</span>
                </>
              ) : (
                <>
                  <SmilePlus className="w-4 h-4" />
                  <span>{t('post.like')}</span>
                </>
              )}
            </button>

            {/* Reaction picker */}
            {showPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 flex gap-1 z-20 animate-slide-up">
                {REACTIONS.map(r => (
                  <button
                    key={r.type}
                    onClick={() => handleReact(r.type)}
                    className={`text-2xl p-1.5 rounded-xl hover:scale-125 transition-transform hover:bg-slate-100 dark:hover:bg-slate-700 ${
                      userReaction === r.type ? 'scale-125 bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    title={r.label}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : showGuestBlur ? (
          <Link href="/login" className="reaction-btn hover:text-blue-600 dark:hover:text-blue-400">
            <SmilePlus className="w-4 h-4" />
            <span>{t('post.like')}</span>
          </Link>
        ) : null}

        {/* Comment button */}
        <button
          className={`reaction-btn ${showComments ? 'active' : ''}`}
          onClick={user || !showGuestBlur ? onCommentClick : undefined}
        >
          {!user && showGuestBlur ? (
            <Link href="/login" className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>{t('post.comment')} {commentCount > 0 ? `(${commentCount})` : ''}</span>
            </Link>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              <span>{t('post.comment')} {commentCount > 0 ? `(${commentCount})` : ''}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
