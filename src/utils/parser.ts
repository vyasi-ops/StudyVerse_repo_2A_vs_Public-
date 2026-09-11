import { QuizQuestion } from '../types.ts';

export const parseQuizScript = (text: string): QuizQuestion[] => {
  const list: QuizQuestion[] = [];
  // Handles .qs / .txt format (block-based)
  const blocks = text.split(/\n\s*\n/);
  
  blocks.forEach((block, index) => {
    const lines = block.trim().split('\n');
    let q: Partial<QuizQuestion> = { id: index, type: 'mcq', points: 5, calculator: false };
    
    lines.forEach(line => {
      const [key, ...rest] = line.split(':');
      const val = rest.join(':').trim();
      if (!key) return;
      
      const k = key.trim().toLowerCase();
      if (k === 'question') q.question = val;
      else if (k === 'options') q.options = val.split(',').map(o => o.trim());
      else if (k === 'answer') q.answer = val;
      else if (k === 'explanation') q.explanation = val;
      else if (k === 'points') q.points = parseInt(val, 10);
      else if (k === 'type') q.type = val as any;
      else if (k === 'calculator') q.calculator = val.toLowerCase() === 'true';
      else if (k === 'imageurl') q.imageUrl = val;
    });

    if (q.question && q.answer) {
      list.push(q as QuizQuestion);
    }
  });
  
  return list;
};

export const parseQuizJson = (jsonText: string): QuizQuestion[] => {
  try {
    return JSON.parse(jsonText);
  } catch {
    return [];
  }
};
