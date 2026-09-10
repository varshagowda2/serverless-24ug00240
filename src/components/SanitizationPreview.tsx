import React from 'react';
import { RawUserInput, sanitizeAllInputs } from '../lib/sanitizer';
import { FileText, ShieldAlert, ShieldCheck } from 'lucide-react';

interface SanitizationPreviewProps {
  formData: RawUserInput;
}

export const SanitizationPreview: React.FC<SanitizationPreviewProps> = ({ formData }) => {
  // Dry run client-side sanitization preview matching server algorithm
  const sanitized = sanitizeAllInputs(formData);

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Live Sanitization Preview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time side-by-side comparison of original user input vs server-sanitized output.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
          Dry-Run Inspector
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* ORIGINAL INPUT */}
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4 flex flex-col">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-rose-900/30">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Original Input
            </span>
            <span className="text-[10px] text-rose-300/70 font-mono">Unsanitized Raw Data</span>
          </div>

          <div className="space-y-3 font-mono text-xs text-slate-300 flex-1 overflow-y-auto">
            <div>
              <span className="text-slate-500 block text-[11px] font-sans font-medium mb-0.5">Name:</span>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 break-all whitespace-pre-wrap font-mono min-h-[36px]">
                {String(formData.name || '') || <span className="text-slate-600 italic">Empty</span>}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] font-sans font-medium mb-0.5">Email:</span>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 break-all whitespace-pre-wrap font-mono min-h-[36px]">
                {String(formData.email || '') || <span className="text-slate-600 italic">Empty</span>}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] font-sans font-medium mb-0.5">Phone:</span>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 break-all whitespace-pre-wrap font-mono min-h-[36px]">
                {String(formData.phone || '') || <span className="text-slate-600 italic">Empty</span>}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] font-sans font-medium mb-0.5">Message:</span>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 break-all whitespace-pre-wrap font-mono min-h-[80px]">
                {String(formData.message || '') || <span className="text-slate-600 italic">Empty</span>}
              </div>
            </div>
          </div>
        </div>

        {/* SANITIZED OUTPUT */}
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 flex flex-col">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-emerald-900/30">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Sanitized Output
            </span>
            <span className="text-[10px] text-emerald-300/70 font-mono">Safe DB Format</span>
          </div>

          <div className="space-y-3 font-mono text-xs text-emerald-200/90 flex-1 overflow-y-auto">
            <div>
              <span className="text-slate-500 block text-[11px] font-sans font-medium mb-0.5">Name:</span>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-emerald-900/50 break-all whitespace-pre-wrap min-h-[36px]">
                {sanitized.name || <span className="text-slate-600 italic font-sans">No output</span>}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] font-sans font-medium mb-0.5">Email:</span>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-emerald-900/50 break-all whitespace-pre-wrap min-h-[36px]">
                {sanitized.email || <span className="text-slate-600 italic font-sans">No output</span>}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] font-sans font-medium mb-0.5">Phone:</span>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-emerald-900/50 break-all whitespace-pre-wrap min-h-[36px]">
                {sanitized.phone || <span className="text-slate-600 italic font-sans">No output</span>}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px] font-sans font-medium mb-0.5">Message:</span>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-emerald-900/50 break-all whitespace-pre-wrap min-h-[80px]">
                {sanitized.message || <span className="text-slate-600 italic font-sans">No output</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
