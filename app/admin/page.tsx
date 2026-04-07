import { createClient } from '@/lib/supabase/server';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

async function getAdminStats() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: totalUsers },
    { count: postsToday },
    { count: pendingReports },
    { count: pendingResets },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()).eq('is_deleted', false),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('password_reset_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('users').select('id, full_name, username, role, created_at, university:universities(abbreviation)').order('created_at', { ascending: false }).limit(5),
  ]);

  return {
    totalUsers: totalUsers || 0,
    postsToday: postsToday || 0,
    pendingReports: pendingReports || 0,
    pendingResets: pendingResets || 0,
    recentActivity: (recentActivity as any) || [],
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  return <AdminDashboardClient stats={stats} />;
}
