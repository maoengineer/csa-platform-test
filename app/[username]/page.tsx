import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RightPanel from '@/components/layout/RightPanel';
import ProfileClient from '@/components/user/ProfileClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { User } from '@/types';

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: user } = await supabase
    .from('users')
    .select('full_name, username, bio, university:universities(name_en)')
    .eq('username', params.username)
    .single();

  if (!user) return { title: 'User not found | CSA' };
  return {
    title: `${user.full_name} (@${user.username}) | CSA`,
    description: user.bio || `${user.full_name}'s profile on CSA`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const supabase = await createClient();
  const { data: profileUser } = await supabase
    .from('users')
    .select(`
      *,
      university:universities(*),
      department:departments(*)
    `)
    .eq('username', params.username)
    .single();

  if (!profileUser) notFound();

  const { data: posts } = await supabase
    .from('posts')
    .select(`*, author:users(id, username, full_name, avatar_url, role, university:universities(abbreviation))`)
    .eq('author_id', profileUser.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <main className="csa-layout py-4">
        <Sidebar />
        <ProfileClient user={profileUser as User} initialPosts={posts || []} />
        <RightPanel />
      </main>
    </div>
  );
}
