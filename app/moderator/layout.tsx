import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ModeratorLayoutClient from '@/components/moderator/ModeratorLayoutClient';

export default async function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect('/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', authUser.id).single();

  if (!profile || (profile.role !== 'moderator' && profile.role !== 'admin')) redirect('/');

  const { data: permissions } = await supabase
    .from('moderator_permissions')
    .select('*')
    .eq('moderator_id', authUser.id)
    .single();

  return <ModeratorLayoutClient permissions={permissions}>{children}</ModeratorLayoutClient>;
}
