import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { InputForm } from '../components/InputForm';
import { SanitizationPreview } from '../components/SanitizationPreview';
import { SecurityTestCases } from '../components/SecurityTestCases';
import { DashboardStats } from '../components/DashboardStats';
import { SubmissionTable, SubmissionRecord } from '../components/SubmissionTable';
import { RawUserInput } from '../lib/sanitizer';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { ShieldCheck, Info } from 'lucide-react';

const DEFAULT_FORM: RawUserInput = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

export const Home: React.FC = () => {
  const [formData, setFormData] = useState<RawUserInput>(DEFAULT_FORM);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [rejectedCount, setRejectedCount] = useState(0);

  const handleFieldChange = (field: keyof RawUserInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearForm = () => {
    setFormData(DEFAULT_FORM);
  };

  const handleSelectTestCase = (payload: RawUserInput) => {
    setFormData(payload);
    // Smooth scroll up to form on payload click
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      if (isSupabaseConnected) {
        const { data, error } = await supabase
          .from('sanitized_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          setSubmissions(data);
          return;
        }
      }

      // Fallback for local development server
      const serverUrl =
        import.meta.env.VITE_SUPABASE_FUNCTION_URL ||
        'http://localhost:3001/api/sanitize-input';

      const submissionsUrl = serverUrl.replace(
        '/functions/v1/sanitize-input',
        '/api/submissions'
      ).replace(
        '/api/sanitize-input',
        '/api/submissions'
      );

      const res = await fetch(submissionsUrl);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSubmissions(json.data);
        }
      }
    } catch {
      // Offline handling
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSubmitSuccess = (newRecord: SubmissionRecord) => {
    setSubmissions((prev) => [newRecord, ...prev]);
  };

  const handleSubmissionAttempt = (success: boolean) => {
    if (!success) {
      setRejectedCount((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Security Architecture Banner */}
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-900/60 border border-cyan-700/50 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-cyan-100">Zero Unsanitized Client Direct Writes</p>
              <p className="text-slate-400 text-xs">
                Browser inputs are strictly gated by Supabase Edge Functions. PostgreSQL Row Level Security (RLS) blocks raw anon INSERTs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0">
            <Info className="w-3.5 h-3.5 text-cyan-400" /> Defense-In-Depth Architecture
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats
          totalSubmissions={submissions.length}
          validSubmissions={submissions.length}
          rejectedSubmissions={rejectedCount}
        />

        {/* Form and Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <InputForm
            formData={formData}
            onChange={handleFieldChange}
            onClear={handleClearForm}
            onSubmitSuccess={handleSubmitSuccess}
            onSubmissionAttempt={handleSubmissionAttempt}
          />
          <SanitizationPreview formData={formData} />
        </div>

        {/* Security Test Cases Suite */}
        <SecurityTestCases onSelectTestCase={handleSelectTestCase} />

        {/* Submissions Table */}
        <SubmissionTable
          submissions={submissions}
          loading={loadingSubmissions}
          onRefresh={fetchSubmissions}
        />
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 bg-slate-950">
        <p>Data Sanitization & Validation System • Built with React, Vite, Supabase & PostgreSQL</p>
      </footer>
    </div>
  );
};
