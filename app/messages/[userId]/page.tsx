'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/Navbar';
import type { User, Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: { userId: string };
}

export default function ChatPage({ params }: Props) {
  const { user } = useAuth();
  const supabase = createClient();
  const [partner, setPartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: partnerData } = await supabase
        .from('users')
        .select('*, university:universities(abbreviation, name_en)')
        .eq('id', params.userId)
        .single();
      setPartner(partnerData as User);

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${params.userId}),and(sender_id.eq.${params.userId},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true })
        .limit(100);

      setMessages((msgs as Message[]) || []);
      setLoading(false);

      // Mark as read
      if (user) {
        await supabase.from('messages')
          .update({ is_read: true })
          .eq('sender_id', params.userId)
          .eq('receiver_id', user.id)
          .eq('is_read', false);
      }
    };

    init();
  }, [params.userId, user, supabase]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`chat:${[user.id, params.userId].sort().join('-')}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${params.userId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, params.userId, supabase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    const { data } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: params.userId,
      content,
    }).select('*').single();

    if (data) setMessages(prev => [...prev, data as Message]);
    setSending(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-4 w-full flex flex-col gap-3" style={{ height: 'calc(100vh - 56px)' }}>
        <div className="csa-card flex flex-col flex-1 overflow-hidden">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <Link href="/messages" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            {partner && (
              <>
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {partner.avatar_url ? (
                    <img src={partner.avatar_url} alt={partner.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm">{partner.full_name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{partner.full_name}</p>
                  <p className="text-xs text-slate-400">@{partner.username}</p>
                </div>
              </>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-4xl mb-2">💬</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Start a conversation with {partner?.full_name}</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMine = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isMine ? 'order-1' : ''}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <p className={`text-xs text-slate-400 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
