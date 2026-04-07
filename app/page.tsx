import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RightPanel from '@/components/layout/RightPanel';
import FeedClient from '@/components/feed/FeedClient';
import type { Post } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CSA — Cambodia Student Association',
  description: 'The home feed for Cambodian university students. Read posts, react, and connect with students from 48 universities.',
};

async function getInitialPosts(): Promise<Post[]> {
  try {
    const supabase = await createClient();
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
      .order('is_announcement', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    return (data as Post[]) || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const initialPosts = await getInitialPosts();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <main className="csa-layout py-4 min-h-[calc(100vh-56px)]">
        <Sidebar />
        <FeedClient initialPosts={initialPosts} />
        <RightPanel />
      </main>
    </div>
  );
}
