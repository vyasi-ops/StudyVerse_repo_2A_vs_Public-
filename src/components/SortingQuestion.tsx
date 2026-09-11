import React, { useState } from 'react';
import { QuizQuestion } from '../types.ts';

export const SortingQuestion: React.FC<{
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
  currentAnswer?: string;
}> = ({ question, onAnswer, currentAnswer }) => {
  // Assuming question.options are the items to sort
  // and bins are defined in some way, or perhaps the options have bin assignments?
  // Let's assume options are "item:bin"
  const items = question.options.map(opt => {
    const [item, bin] = opt.split(':');
    return { item, bin };
  });

  const bins = Array.from(new Set(items.map(i => i.bin)));
  
  const [selections, setSelections] = useState<Record<string, string>>(
    currentAnswer ? JSON.parse(currentAnswer) : {}
  );

  const handleSelect = (item: string, bin: string) => {
    const newSelections = { ...selections, [item]: bin };
    setSelections(newSelections);
    onAnswer(JSON.stringify(newSelections));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {bins.map(bin => (
        <div key={bin} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <h4 className="font-bold text-sm text-slate-700 mb-2">{bin}</h4>
          <div className="space-y-2">
            {items.filter(i => selections[i.item] === bin).map(i => (
              <div key={i.item} className="bg-white p-2 rounded-lg text-sm shadow-sm border border-slate-100">{i.item}</div>
            ))}
          </div>
        </div>
      ))}
      <div className="col-span-2 grid grid-cols-3 gap-2">
         {items.map(i => (
             <select key={i.item} value={selections[i.item] || ''} onChange={(e) => handleSelect(i.item, e.target.value)} className="p-2 border rounded-lg text-sm">
                 <option value="">{i.item}</option>
                 {bins.map(b => <option key={b} value={b}>{b}</option>)}
             </select>
         ))}
      </div>
    </div>
  );
};
