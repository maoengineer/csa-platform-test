import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import type { University } from '@/types';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Universities | CSA',
  description: 'All 48 Cambodian universities and institutes on the CSA platform.',
};

export default async function UniversitiesPage() {
  const supabase = await createClient();
  const { data: universities } = await supabase
    .from('universities')
    .select('*, departments(count)')
    .order('is_public', { ascending: false })
    .order('name_en');

  const publicUnis = (universities || []).filter((u: University) => u.is_public);
  const privateUnis = (universities || []).filter((u: University) => !u.is_public);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <main className="csa-layout-2col py-4">
        <Sidebar />
        <div className="space-y-4 animate-fade-in">
          <div className="csa-card p-6 csa-hero-gradient">
            <h1 className="text-2xl font-bold text-white">🏛️ {universities?.length || 48} Universities on CSA</h1>
            <p className="text-blue-200 mt-1">Connect with students from all Cambodian universities</p>
            <div className="flex gap-3 mt-3">
              <span className="badge bg-white/20 text-white">{publicUnis.length} Public</span>
              <span className="badge bg-white/20 text-white">{privateUnis.length} Private</span>
            </div>
          </div>

          {[
            { title: 'Public Universities & Institutes', unis: publicUnis },
            { title: 'Private Universities', unis: privateUnis },
          ].map(({ title, unis }) => (
            <div key={title} className="csa-card p-5">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4">{title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unis.map((uni: University) => (
                  <div
                    key={uni.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-400 flex-shrink-0">
                      {uni.abbreviation.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {uni.abbreviation}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{uni.name_en}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
