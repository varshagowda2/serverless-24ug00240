import React from 'react';
import { ShieldCheck, Lock, Server } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="relative border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20 text-white">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Data Sanitization System
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  <Server className="w-3 h-3 mr-1" /> Edge Enforced
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Validate and sanitize user input before database storage.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400 bg-slate-900/90 px-3.5 py-2 rounded-lg border border-slate-800">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Zero Unsanitized Client Direct Writes (RLS Enforced)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
