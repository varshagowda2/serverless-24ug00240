import React from 'react';
import { Database, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

interface DashboardStatsProps {
  totalSubmissions: number;
  validSubmissions: number;
  rejectedSubmissions: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalSubmissions,
  validSubmissions,
  rejectedSubmissions,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Submissions */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Submissions</p>
          <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">{totalSubmissions}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Persisted in PostgreSQL</p>
        </div>
        <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
          <Database className="w-6 h-6" />
        </div>
      </div>

      {/* Valid Submissions */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valid Submissions</p>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{validSubmissions}</h3>
          <p className="text-[11px] text-emerald-500/80 mt-0.5">Passed Edge Validation</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/50 text-emerald-400">
          <CheckCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Rejected Submissions */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejected Inputs</p>
          <h3 className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">{rejectedSubmissions}</h3>
          <p className="text-[11px] text-rose-500/80 mt-0.5">Blocked by Edge Engine</p>
        </div>
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/50 text-rose-400">
          <XCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Security Status */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Defense</p>
          <h3 className="text-sm font-bold text-cyan-300 mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active Shield
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Supabase Edge + RLS</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-800/50 text-blue-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
