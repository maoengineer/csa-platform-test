'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  Eye, EyeOff, Smile, ChevronDown
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import type { FontStyle, Post } from '@/types';
import toast from 'react-hot-toast';

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter', className: '' },
  { value: 'Roboto', label: 'Roboto', className: '' },
  { value: 'Hanuman', label: 'ហានុម៉ាន (Khmer)', className: 'font-khmer' },
  { value: 'Kantumruy Pro', label: 'កន្ទុំរួយ Pro', className: 'font-khmer-alt' },
  { value: 'Siemreap', label: 'Siemreap (Khmer)', className: '' },
];

const FONT_SIZES = [
  { value: 'small', label: 'Small', class: 'text-sm' },
  { value: 'normal', label: 'Normal', class: 'text-base' },
  { value: 'large', label: 'Large', class: 'text-lg' },
  { value: 'xlarge', label: 'X-Large', class: 'text-xl' },
];

const COLORS = [
  '#000000', '#1e3a8a', '#7c3aed', '#dc2626', '#16a34a',
  '#d97706', '#0891b2', '#db2777', '#64748b', '#f8fafc',
];

const EMOJIS = ['😊', '😂', '❤️', '🔥', '👍', '🙏', '😔', '🎉', '💪', '🤔', '📚', '🏛️', '🇰🇭', '✨', '🌟'];

const MAX_CHARS = 5000;

interface PostEditorProps {
  onPostCreated: (post: Post) => void;
}

const DEFAULT_STYLE: FontStyle = {
  fontFamily: 'Inter',
  fontSize: 'normal',
  textAlign: 'left',
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  color: '#000000',
};

export default function PostEditor({ onPostCreated }: PostEditorProps) {
  const t = useTranslations('editor');
  const { user } = useAuth();
  const supabase = createClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [content, setContent] = useState('');
  const [style, setStyle] = useState<FontStyle>(DEFAULT_STYLE);
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const charCount = content.length;
  const isNearLimit = charCount > 4500;
  const isOverLimit = charCount > MAX_CHARS;

  const toggle = (key: keyof FontStyle) => {
    setStyle(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setContent(prev => prev + emoji);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    setContent(prev => prev.slice(0, start) + emoji + prev.slice(end));
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + emoji.length;
      ta.focus();
    }, 0);
    setShowEmoji(false);
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user || isOverLimit) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        content: content.trim(),
        font_style: JSON.stringify(style),
      })
      .select('*, author:users(*, university:universities(*), department:departments(*))')
      .single();

    if (error) {
      toast.error('Failed to create post');
    } else {
      toast.success('Post published!');
      onPostCreated(data as Post);
      setContent('');
      setStyle(DEFAULT_STYLE);
      setPreview(false);
    }
    setSubmitting(false);
  };

  const fontFamilyClass = FONT_FAMILIES.find(f => f.value === style.fontFamily)?.className || '';
  const fontSizeClass = FONT_SIZES.find(f => f.value === style.fontSize)?.class || 'text-base';

  const textareaClasses = [
    fontFamilyClass,
    fontSizeClass,
    style.bold ? 'font-bold' : '',
    style.italic ? 'italic' : '',
    style.underline ? 'underline' : '',
    style.strikethrough ? 'line-through' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="csa-card p-4 animate-fade-in">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold">{user?.full_name?.charAt(0)}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.full_name}</p>
          {user?.university && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.university.abbreviation} · {user.university.name_en}</p>
          )}
        </div>
      </div>

      {/* Formatting toolbar */}
      <div className="flex flex-wrap items-center gap-1 mb-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
        {/* Text formatting */}
        <button onClick={() => toggle('bold')} title={t('bold')}
          className={`p-1.5 rounded-lg transition-all ${style.bold ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
          <Bold className="w-4 h-4" />
        </button>
        <button onClick={() => toggle('italic')} title={t('italic')}
          className={`p-1.5 rounded-lg transition-all ${style.italic ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
          <Italic className="w-4 h-4" />
        </button>
        <button onClick={() => toggle('underline')} title={t('underline')}
          className={`p-1.5 rounded-lg transition-all ${style.underline ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
          <Underline className="w-4 h-4" />
        </button>
        <button onClick={() => toggle('strikethrough')} title={t('strikethrough')}
          className={`p-1.5 rounded-lg transition-all ${style.strikethrough ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-0.5" />

        {/* Alignment */}
        {[
          { val: 'left', icon: AlignLeft },
          { val: 'center', icon: AlignCenter },
          { val: 'right', icon: AlignRight },
        ].map(({ val, icon: Icon }) => (
          <button key={val} onClick={() => setStyle(prev => ({ ...prev, textAlign: val as 'left' | 'center' | 'right' }))}
            className={`p-1.5 rounded-lg transition-all ${style.textAlign === val ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
            <Icon className="w-4 h-4" />
          </button>
        ))}

        <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-0.5" />

        {/* Font family */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium transition-all">
              {FONT_FAMILIES.find(f => f.value === style.fontFamily)?.label.split(' (')[0]}
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 min-w-[180px] animate-slide-down" sideOffset={4}>
              {FONT_FAMILIES.map(f => (
                <DropdownMenu.Item key={f.value} onClick={() => setStyle(prev => ({ ...prev, fontFamily: f.value }))}
                  className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${f.className} ${style.fontFamily === f.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                  {f.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Font size */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium transition-all">
              {FONT_SIZES.find(f => f.value === style.fontSize)?.label}
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 animate-slide-down" sideOffset={4}>
              {FONT_SIZES.map(s => (
                <DropdownMenu.Item key={s.value} onClick={() => setStyle(prev => ({ ...prev, fontSize: s.value as FontStyle['fontSize'] }))}
                  className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${s.class} ${style.fontSize === s.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                  {s.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Color picker */}
        <div className="relative">
          <button onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all" title={t('color')}>
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-500" style={{ backgroundColor: style.color }} />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-20 animate-slide-down">
              <div className="grid grid-cols-5 gap-1">
                {COLORS.map(c => (
                  <button key={c} onClick={() => { setStyle(prev => ({ ...prev, color: c })); setShowColorPicker(false); }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${style.color === c ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Emoji */}
        <div className="relative">
          <button onClick={() => setShowEmoji(!showEmoji)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-all">
            <Smile className="w-4 h-4" />
          </button>
          {showEmoji && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-20 animate-slide-down">
              <div className="grid grid-cols-5 gap-1">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => insertEmoji(e)} className="text-xl p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-110 transition-all">
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      {preview ? (
        <div className={`min-h-[120px] p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white post-content ${textareaClasses}`}
          style={{ textAlign: style.textAlign, color: style.color }}>
          {content || <span className="text-slate-400">{t('placeholder')}</span>}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={t('placeholder')}
          rows={4}
          maxLength={MAX_CHARS + 100}
          className={`w-full p-3 bg-transparent border-0 resize-none outline-none text-slate-900 dark:text-white placeholder-slate-400 ${textareaClasses}`}
          style={{ textAlign: style.textAlign, color: style.color }}
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className={`text-xs ${isOverLimit ? 'text-red-500 font-semibold' : isNearLimit ? 'text-amber-500' : 'text-slate-400'}`}>
            {charCount}/{MAX_CHARS}
          </span>
          {isNearLimit && !isOverLimit && (
            <span className="text-xs text-amber-500">{t('charWarning')}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="btn-ghost text-sm py-2 px-3 flex items-center gap-1.5"
          >
            {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {t('preview')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting || isOverLimit}
            className="btn-primary text-sm py-2 px-5"
          >
            {submitting ? '...' : t('post')}
          </button>
        </div>
      </div>
    </div>
  );
}
