import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect('/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', authUser.id).single();

  if (!profile || profile.role !== 'admin') redirect('/');

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
