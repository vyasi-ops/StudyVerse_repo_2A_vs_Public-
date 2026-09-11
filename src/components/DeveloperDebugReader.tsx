import React, { useState, useEffect } from 'react';
import { Terminal, X } from 'lucide-react';

export const DeveloperDebugReader: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Intercept console.error to show in debug reader
    const originalError = console.error;
    console.error = (...args: any[]) => {
      setLogs(prev => [...prev, args.join(' ')]);
      originalError(...args);
    };
    return () => { console.error = originalError; };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] w-96 h-64 bg-slate-900 text-emerald-400 p-4 rounded-xl shadow-2xl border border-slate-700 font-mono text-xs overflow-y-auto">
      <div className="flex justify-between mb-2">
        <span className="flex items-center space-x-1"><Terminal className="w-3 h-3"/> <span>Debug Console</span></span>
        <button onClick={onClose}><X className="w-3 h-3"/></button>
      </div>
      {logs.map((log, i) => <div key={i}>{log}</div>)}
    </div>
  );
};
