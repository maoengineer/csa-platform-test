'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import type { Comment } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface CommentSectionProps {
  postId: string;
  showGuestBlur?: boolean;
}

export default function CommentSection({ postId, showGuestBlur }: CommentSectionProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('comments')
        .select('*, author:users(id, username, full_name, avatar_url, role)')
        .eq('post_id', postId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);
      setComments((data as Comment[]) || []);
      setLoading(false);
    };
    fetch();
  }, [postId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: user.id, content: newComment.trim() })
      .select('*, author:users(id, username, full_name, avatar_url, role)')
      .single();
    if (!error && data) {
      setComments(prev => [...prev, data as Comment]);
      setNewComment('');
    } else {
      toast.error('Failed to post comment');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-2">
              <div className="skeleton w-7 h-7 rounded-full" />
              <div className="skeleton flex-1 h-12 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5">
              <Link href={`/${c.author?.username}`} className="shrink-0">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {c.author?.avatar_url ? (
                    <img src={c.author.avatar_url} alt={c.author.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-xs font-bold">{c.author?.full_name?.charAt(0)}</span>
                  )}
                </div>
              </Link>
              <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 rounded-2xl px-3.5 py-2.5">
                <div className="flex items-baseline gap-2">
                  <Link href={`/${c.author?.username}`} className="text-xs font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {c.author?.full_name}
                  </Link>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Comment input */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mt-1">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">{user.full_name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              disabled={submitting}
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-2xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '...' : 'Send'}
            </button>
          </div>
        </form>
      ) : showGuestBlur ? (
        <Link href="/login" className="block text-sm text-center text-blue-600 dark:text-blue-400 hover:underline py-2">
          Sign in to comment
        </Link>
      ) : null}
    </div>
  );
}
