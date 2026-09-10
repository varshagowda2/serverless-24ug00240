import React from 'react';
import { Terminal, Play, ShieldAlert } from 'lucide-react';
import { RawUserInput } from '../lib/sanitizer';

interface TestCase {
  id: number;
  name: string;
  category: string;
  description: string;
  payload: RawUserInput;
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    name: 'HTML Test',
    category: 'XSS Injection',
    description: 'Attempts inline script execution via <script> tags in Name and Message.',
    payload: {
      name: '<script>alert("XSS")</script> Varshini M',
      email: 'varshini@example.com',
      phone: '+91 98765-43210',
      message: 'Hello <script>alert("XSS")</script> testing payload execution.',
    },
  },
  {
    id: 2,
    name: 'HTML Tag Test',
    category: 'DOM Injection',
    description: 'Attempts rich text markup injection (<h1>, <p>) into fields.',
    payload: {
      name: '<b>Varshini M</b>',
      email: 'varshini@example.com',
      phone: '+91 98765-43210',
      message: '<h1>Hello Header</h1><p>Paragraph with <b>bold text</b>.</p>',
    },
  },
  {
    id: 3,
    name: 'Email Test',
    category: 'Data Normalization',
    description: 'Tests uppercase email normalization and leading/trailing whitespace removal.',
    payload: {
      name: 'Varshini M',
      email: '   VARSHINI@EXAMPLE.COM   ',
      phone: '+91 98765-43210',
      message: 'Testing email case normalization to lowercase.',
    },
  },
  {
    id: 4,
    name: 'Whitespace Test',
    category: 'Data Cleanliness',
    description: 'Tests collapse of multiple consecutive spaces and tab characters.',
    payload: {
      name: '   Varshini       M   ',
      email: 'varshini@example.com',
      phone: '+91 98765-43210',
      message: 'Message with    excessive   spaces\t\tand\t\ttabs.',
    },
  },
  {
    id: 5,
    name: 'JavaScript URL Test',
    category: 'Protocol Hijack',
    description: 'Tests neutralization of pseudo-protocol javascript: links.',
    payload: {
      name: 'Varshini M',
      email: 'varshini@example.com',
      phone: '+91 98765-43210',
      message: 'Click here: javascript:alert("XSS") for free reward.',
    },
  },
  {
    id: 6,
    name: 'Event Handler Test',
    category: 'Attribute Attack',
    description: 'Tests removal of broken img tags containing onerror inline event handlers.',
    payload: {
      name: 'Varshini M',
      email: 'varshini@example.com',
      phone: '+91 98765-43210',
      message: 'Image payload: <img src=x onerror=alert(1)> image tag attack.',
    },
  },
  {
    id: 7,
    name: 'SQL-like Input Test',
    category: 'Injection Safety',
    description: "Tests handling of SQL syntax (' OR '1'='1). Demonstrates safe parameterized storage.",
    payload: {
      name: "Varshini O'Connor",
      email: 'varshini@example.com',
      phone: '+91 98765-43210',
      message: "' OR '1'='1; DROP TABLE sanitized_submissions; --",
    },
  },
];

interface SecurityTestCasesProps {
  onSelectTestCase: (payload: RawUserInput) => void;
}

export const SecurityTestCases: React.FC<SecurityTestCasesProps> = ({ onSelectTestCase }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" /> Security Test Cases
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Click any attack payload vector to populate the form and observe server-side neutralization.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/60">
          <ShieldAlert className="w-3.5 h-3.5" /> 7 Test Payloads
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {TEST_CASES.map((tc) => (
          <div
            key={tc.id}
            className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-semibold border border-slate-700">
                  {tc.category}
                </span>
                <span className="text-[11px] font-mono text-slate-500">#{tc.id}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                {tc.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {tc.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectTestCase(tc.payload)}
              className="mt-4 w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700 hover:border-cyan-500"
            >
              <Play className="w-3 h-3 fill-current" /> Load Payload
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
