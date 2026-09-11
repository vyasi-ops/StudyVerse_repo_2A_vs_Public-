import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Zap, Clock, BookOpen, Settings } from 'lucide-react';

interface MathWizardProps {
  isOpen: boolean;
  onClose: (config: any) => void;
}

export const MathWizard: React.FC<MathWizardProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({ table: 7, limit: 12, mode: 'untimed', rate: 2.0 });

  if (!isOpen) return null;

  const steps = [
    { title: 'Select Operation', desc: 'Choose your table.' },
    { title: 'Number Range', desc: 'How far should it go?' },
    { title: 'Mode & Speed', desc: 'Configure practice settings.' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">{steps[step-1].title}</h2>
            <button onClick={() => onClose(null)}><X className="w-5 h-5 text-slate-400"/></button>
        </div>
        
        {/* Wizard content based on step */}
        <div className="min-h-[200px]">
            {step === 1 && (
                <div className="grid grid-cols-4 gap-2">
                    {[2,3,4,5,6,7,8,9,10,11,12].map(t => (
                        <button key={t} onClick={() => setConfig({...config, table: t})} className={`p-4 rounded-xl font-bold ${config.table === t ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>{t}</button>
                    ))}
                </div>
            )}
            {step === 2 && (
                <div className="space-y-4">
                    <input type="range" min="5" max="50" value={config.limit} onChange={(e) => setConfig({...config, limit: parseInt(e.target.value)})} className="w-full" />
                    <p className="text-center font-bold text-lg">{config.limit}</p>
                </div>
            )}
            {step === 3 && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <button onClick={() => setConfig({...config, mode: 'untimed'})} className={`flex-1 p-4 rounded-xl ${config.mode === 'untimed' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}><BookOpen className="mx-auto" /> Untimed</button>
                        <button onClick={() => setConfig({...config, mode: 'timed'})} className={`flex-1 p-4 rounded-xl ${config.mode === 'timed' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}><Clock className="mx-auto" /> Timed</button>
                    </div>
                    <input type="range" min="0.5" max="5.0" step="0.25" value={config.rate} onChange={(e) => setConfig({...config, rate: parseFloat(e.target.value)})} className="w-full" />
                </div>
            )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
            <button disabled={step === 1} onClick={() => setStep(step-1)} className="px-4 py-2 rounded-xl text-slate-600 disabled:opacity-50"><ChevronLeft /> Back</button>
            {step < 3 ? (
                <button onClick={() => setStep(step+1)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white flex items-center">Next <ChevronRight /></button>
            ) : (
                <button onClick={() => onClose(config)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white flex items-center">Finish <Zap /></button>
            )}
        </div>
      </div>
    </div>
  );
};
