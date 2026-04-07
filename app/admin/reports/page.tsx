'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Clock, AlertTriangle, User } from 'lucide-react';
import type { Report, PasswordResetRequest } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>([]);
  const [resets, setResets] = useState<PasswordResetRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'resets'>('reports');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [{ data: r }, { data: p }] = await Promise.all([
        supabase.from('reports').select('*, reporter:users!reporter_id(username), reported_post:posts(content), reported_user:users!reported_user_id(username, full_name)').order('created_at', { ascending: false }),
        supabase.from('password_reset_requests').select('*, university:universities(abbreviation)').order('created_at', { ascending: false }),
      ]);
      setReports((r as Report[]) || []);
      setResets((p as PasswordResetRequest[]) || []);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const updateReportStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('reports').update({ status }).eq('id', id);
    if (!error) {
      toast.success('Status updated');
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: status as Report['status'] } : r));
    }
  };

  const handlePasswordReset = async (req: PasswordResetRequest) => {
    if (!confirm(`Reset password for ${req.requester_name} (${req.email}) to CSA-KH-123?`)) return;
    // In production: use service role key to call auth admin API
    // For now, update status and log
    const { error } = await supabase.from('password_reset_requests').update({
      status: 'resolved',
      reset_at: new Date().toISOString(),
      moderator_notes: 'Password reset to CSA-KH-123 by admin',
    }).eq('id', req.id);
    if (!error) {
      toast.success(`Password reset logged for ${req.requester_name}. Use Supabase dashboard to set the actual password.`);
      setResets(prev => prev.map(r => r.id === req.id ? { ...r, status: 'resolved' } : r));
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'resolved') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'reviewed') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Clock className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Requests</h1>

      <div className="flex gap-2">
        {[
          { id: 'reports', label: `Content Reports (${reports.filter(r => r.status === 'pending').length} pending)` },
          { id: 'resets', label: `Password Resets (${resets.filter(r => r.status === 'pending').length} pending)` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'reports' | 'resets')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="csa-card p-4 skeleton h-24" />)
          ) : reports.length === 0 ? (
            <div className="csa-card p-12 text-center text-slate-400">No reports yet. 🎉</div>
          ) : reports.map(report => (
            <div key={report.id} className="csa-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {statusIcon(report.status)}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    report.reason === 'politics' ? 'badge-red' :
                    report.reason === 'adult' ? 'badge-red' :
                    report.reason === 'harassment' ? 'badge-red' :
                    'badge-blue'
                  }`}>
                    {report.reason}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={report.status}
                    onChange={e => updateReportStatus(report.id, e.target.value)}
                    className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              {report.reported_user && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  <span className="font-medium">Reported user:</span> @{report.reported_user.username} ({report.reported_user.full_name})
                </p>
              )}
              {report.details && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">"{report.details}"</p>
              )}
              {report.reporter && (
                <p className="text-xs text-slate-400 mt-1">Reported by @{report.reporter.username}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'resets' && (
        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="csa-card p-4 skeleton h-24" />)
          ) : resets.length === 0 ? (
            <div className="csa-card p-12 text-center text-slate-400">No password reset requests. 🎉</div>
          ) : resets.map(req => (
            <div key={req.id} className="csa-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {statusIcon(req.status)}
                    <span className="font-medium text-slate-900 dark:text-white text-sm">{req.requester_name}</span>
                    <span className="badge-blue">{req.university?.abbreviation}</span>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email: {req.email} · Student ID: {req.student_id}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">"{req.description}"</p>
                </div>
                {req.status === 'pending' && (
                  <button
                    onClick={() => handlePasswordReset(req)}
                    className="btn-primary text-xs px-3 py-1.5 shrink-0"
                  >
                    Reset to CSA-KH-123
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
