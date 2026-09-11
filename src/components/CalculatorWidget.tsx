import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';

export const CalculatorWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');

  const handleBtn = (val: string) => {
    if (val === 'C') setDisplay('0');
    else if (val === '=') {
      try {
        // eslint-disable-next-line no-new-func
        setDisplay(String(new Function('return ' + display)()));
      } catch {
        setDisplay('Error');
      }
    } else {
      setDisplay(display === '0' ? val : display + val);
    }
  };

  return (
    <div className="absolute right-0 top-12 z-20 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 space-y-4">
      <div className="flex justify-between items-center text-sm font-bold text-slate-700">
        <span className="flex items-center space-x-1.5"><Calculator className="w-4 h-4 text-indigo-600"/> <span>Calc</span></span>
        <button onClick={onClose}><X className="w-4 h-4 text-slate-400"/></button>
      </div>
      <div className="bg-slate-100 p-3 rounded-xl text-right font-mono text-lg font-bold text-slate-900">{display}</div>
      <div className="grid grid-cols-4 gap-2 text-xs font-bold">
        {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => (
          <button key={btn} onClick={() => handleBtn(btn)} className="bg-slate-50 hover:bg-slate-200 p-2 rounded-lg transition">{btn}</button>
        ))}
      </div>
    </div>
  );
};
