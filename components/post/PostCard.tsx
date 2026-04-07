'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { MoreHorizontal, Flag, Pencil, Trash2, Megaphone } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import PostReactions from './PostReactions';
import CommentSection from './CommentSection';
import ReportModal from './ReportModal';
import type { Post, FontStyle } from '@/types';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: Post;
  onDeleted?: (postId: string) => void;
  showGuestBlur?: boolean;
}

const FONT_FAMILY_MAP: Record<string, string> = {
  'Hanuman': 'font-khmer',
  'Kantumruy Pro': 'font-khmer-alt',
  'Inter': 'font-sans',
  'Roboto': '',
  'Siemreap': '',
};

const FONT_SIZE_MAP: Record<string, string> = {
  small: 'text-sm',
  normal: 'text-base',
  large: 'text-lg',
  xlarge: 'text-xl',
};

export default function PostCard({ post, onDeleted, showGuestBlur = false }: PostCardProps) {
  const t = useTranslations();
  const { user } = useAuth();
  const supabase = createClient();

  const [showComments, setShowComments] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === post.author_id;
  const isAdminOrMod = user?.role === 'admin' || user?.role === 'moderator';

  let fontStyle: FontStyle = {
    fontFamily: 'Inter',
    fontSize: 'normal',
    textAlign: 'left',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    color: '#000000',
  };

  try {
    if (typeof post.font_style === 'string') {
      fontStyle = JSON.parse(post.font_style);
    } else if (post.font_style) {
      fontStyle = post.font_style as FontStyle;
    }
  } catch {}

  const textClasses = [
    'post-content',
    FONT_FAMILY_MAP[fontStyle.fontFamily] || '',
    FONT_SIZE_MAP[fontStyle.fontSize] || 'text-base',
    fontStyle.bold ? 'font-bold' : '',
    fontStyle.italic ? 'italic' : '',
    fontStyle.underline ? 'underline' : '',
    fontStyle.strikethrough ? 'line-through' : '',
  ].filter(Boolean).join(' ');

  const textStyle = {
    textAlign: fontStyle.textAlign as 'left' | 'center' | 'right',
    color: fontStyle.color,
    ...(fontStyle.fontFamily === 'Roboto' || fontStyle.fontFamily === 'Siemreap'
      ? { fontFamily: fontStyle.fontFamily }
      : {}),
  };

  const handleDelete = async () => {
    if (!confirm(t('post.deleteConfirm'))) return;
    setIsDeleting(true);
    const { error } = await supabase
      .from('posts')
      .update({ is_deleted: true })
      .eq('id', post.id);
    if (error) {
      toast.error('Failed to delete post');
    } else {
      toast.success(t('post.deleteSuccess'));
      onDeleted?.(post.id);
    }
    setIsDeleting(false);
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const wasEdited = post.updated_at !== post.created_at;

  return (
    <article className="csa-card overflow-hidden animate-fade-in">
      {/* Announcement banner */}
      {post.is_announcement && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-bold tracking-wide uppercase">
            {t('post.announcement')}
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Author header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href={`/${post.author?.username}`} className="shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:scale-105 transition-transform">
                {post.author?.avatar_url ? (
                  <img src={post.author.avatar_url} alt={post.author.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold">
                    {post.author?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/${post.author?.username}`}
                  className="font-semibold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {post.author?.full_name}
                </Link>
                {(post.author?.role === 'admin' || post.author?.role === 'moderator') && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    post.author.role === 'admin'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}>
                    {post.author.role}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  @{post.author?.username}
                </span>
                {post.author?.university && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {post.author.university.abbreviation}
                    </span>
                  </>
                )}
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {timeAgo}
                  {wasEdited && <span className="ml-1 opacity-70">· {t('post.edited')}</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[160px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 animate-slide-down"
                align="end"
                sideOffset={4}
              >
                {(isOwner || isAdminOrMod) && (
                  <>
                    {isOwner && (
                      <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-200 transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> {t('post.edit')}
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer text-red-600 dark:text-red-400 transition-colors"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> {t('post.delete')}
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="my-1 border-t border-slate-100 dark:border-slate-700" />
                  </>
                )}
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-200 transition-colors"
                  onClick={() => setShowReport(true)}
                >
                  <Flag className="w-3.5 h-3.5" /> {t('post.report')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Post content */}
        <div className={textClasses} style={textStyle}>
          {post.content}
        </div>

        {/* Reactions + Comments */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
          <PostReactions
            post={post}
            showGuestBlur={showGuestBlur}
            onCommentClick={() => setShowComments(!showComments)}
            showComments={showComments}
          />
        </div>

        {/* Comment section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
            <CommentSection postId={post.id} showGuestBlur={showGuestBlur} />
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReport && (
        <ReportModal
          postId={post.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </article>
  );
}
