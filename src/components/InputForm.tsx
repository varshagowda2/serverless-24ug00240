import React, { useState } from 'react';
import { User, Mail, Phone, MessageSquare, Send, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { RawUserInput } from '../lib/sanitizer';

interface InputFormProps {
  formData: RawUserInput;
  onChange: (field: keyof RawUserInput, value: string) => void;
  onClear: () => void;
  onSubmitSuccess: (record: any) => void;
  onSubmissionAttempt: (success: boolean) => void;
}

export const InputForm: React.FC<InputFormProps> = ({
  formData,
  onChange,
  onClear,
  onSubmitSuccess,
  onSubmissionAttempt,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successResponse, setSuccessResponse] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessResponse(null);
    setServerError(null);

    try {
      const functionUrl =
        import.meta.env.VITE_SUPABASE_FUNCTION_URL ||
        'http://localhost:3001/api/sanitize-input';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        onSubmissionAttempt(false);
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setServerError(data.message || 'Server-side sanitization failed');
        }
        return;
      }

      // Success
      onSubmissionAttempt(true);
      setSuccessResponse({
        id: data.data.id,
        message: data.message || 'Input sanitized and stored successfully',
      });
      onSubmitSuccess(data.data);
    } catch (err: any) {
      onSubmissionAttempt(false);
      setServerError(
        'Failed to connect to Edge Function. Please ensure local server or Supabase Edge Function is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    onClear();
    setErrors({});
    setSuccessResponse(null);
    setServerError(null);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800 relative">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Send className="w-5 h-5 text-cyan-400" /> User Data Input Form
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Inputs are sent to Supabase Edge Function for server-side sanitization.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClearForm}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear Form
        </button>
      </div>

      {/* Success Notification Banner */}
      {successResponse && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-sm glow-emerald flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-emerald-200">{successResponse.message}</p>
            <p className="text-xs font-mono text-emerald-400/90 break-all">
              PostgreSQL Record ID: <span className="font-bold underline">{successResponse.id}</span>
            </p>
          </div>
        </div>
      )}

      {/* Server Error Banner */}
      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-sm glow-rose flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Submission Blocked</p>
            <p className="text-xs text-rose-300/90">{serverError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={String(formData.name || '')}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="e.g. Varshini M"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border ${
                errors.name ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-700/80 focus:ring-cyan-500'
              } rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            />
          </div>
          {errors.name && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={String(formData.email || '')}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="e.g. varshini@example.com"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border ${
                errors.email ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-700/80 focus:ring-cyan-500'
              } rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            />
          </div>
          {errors.email && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.email}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={String(formData.phone || '')}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="e.g. +91 98765-43210"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border ${
                errors.phone ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-700/80 focus:ring-cyan-500'
              } rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            />
          </div>
          {errors.phone && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.phone}</p>}
        </div>

        {/* User Message */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            User Message
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3.5 pointer-events-none text-slate-500">
              <MessageSquare className="w-4 h-4" />
            </div>
            <textarea
              rows={4}
              value={String(formData.message || '')}
              onChange={(e) => onChange('message', e.target.value)}
              placeholder="Enter message or test payloads (e.g. <h1>Hello</h1><script>alert('XSS')</script>)..."
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border ${
                errors.message ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-700/80 focus:ring-cyan-500'
              } rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all font-mono`}
            />
          </div>
          {errors.message && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/25 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Sanitize & Storing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Sanitize & Store
            </>
          )}
        </button>
      </form>
    </div>
  );
};
