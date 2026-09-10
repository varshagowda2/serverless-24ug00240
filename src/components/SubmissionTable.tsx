import React from 'react';
import { Database, RefreshCw, Clock } from 'lucide-react';

export interface SubmissionRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
}

interface SubmissionTableProps {
  submissions: SubmissionRecord[];
  loading: boolean;
  onRefresh: () => void;
}

export const SubmissionTable: React.FC<SubmissionTableProps> = ({
  submissions,
  loading,
  onRefresh,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" /> Sanitized Database Records
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted records retrieved from PostgreSQL table <code className="text-cyan-400 font-mono">sanitized_submissions</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Table
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800/80">
          <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">No submissions recorded yet.</p>
          <p className="text-xs text-slate-500 mt-1">
            Submit a form or run a Security Test Case to view sanitized database entries.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3 px-4 rounded-l-lg">ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 max-w-xs">Message (Sanitized)</th>
                <th className="py-3 px-4 rounded-r-lg">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {submissions.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-900/80 transition-colors group"
                >
                  <td className="py-3.5 px-4 text-cyan-400 font-semibold whitespace-nowrap">
                    {row.id.length > 8 ? `${row.id.substring(0, 8)}...` : row.id}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-medium text-slate-100 whitespace-nowrap">
                    {row.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                    {row.email}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                    {row.phone}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-300 max-w-xs break-words">
                    {/* Rendered strictly as plain text string to prevent XSS execution */}
                    <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80 font-mono text-[11px] text-emerald-300/90 whitespace-pre-wrap">
                      {String(row.message)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                    <div className="flex items-center gap-1 font-sans">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(row.created_at).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
