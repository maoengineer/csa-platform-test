'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import type { User, Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [conversations, setConversations] = useState<{ partner: User; lastMessage: Message; unread: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*, sender:users!sender_id(id, username, full_name, avatar_url, university:universities(abbreviation)), receiver:users!receiver_id(id, username, full_name, avatar_url, university:universities(abbreviation))')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      const map = new Map<string, { partner: User; lastMessage: Message; unread: number }>();
      (msgs || []).forEach((msg: Message & { sender: User; receiver: User }) => {
        const partner = msg.sender_id === user.id ? msg.receiver : msg.sender;
        if (!map.has(partner.id)) {
          map.set(partner.id, {
            partner,
            lastMessage: msg,
            unread: !msg.is_read && msg.receiver_id === user.id ? 1 : 0,
          });
        } else {
          const existing = map.get(partner.id)!;
          if (!msg.is_read && msg.receiver_id === user.id) {
            existing.unread++;
          }
        }
      });

      setConversations(Array.from(map.values()));
      setLoading(false);
    };

    fetchConversations();
  }, [user, supabase]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="csa-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h1>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton w-12 h-12 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-32 rounded" />
                    <div className="skeleton h-3 w-48 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-slate-500 dark:text-slate-400">No messages yet. Start a conversation!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {conversations.map(({ partner, lastMessage, unread }) => (
                <Link
                  key={partner.id}
                  href={`/messages/${partner.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {partner.avatar_url ? (
                      <img src={partner.avatar_url} alt={partner.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{partner.full_name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <p className={`font-semibold text-sm ${unread > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                        {partner.full_name}
                      </p>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-xs truncate ${unread > 0 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                        {lastMessage.sender_id === user.id ? 'You: ' : ''}{lastMessage.content}
                      </p>
                      {unread > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
