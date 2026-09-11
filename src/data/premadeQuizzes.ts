export interface PremadeQuiz {
  id: string;
  title: string;
  questions: any[];
}

export const premadeQuizzes: PremadeQuiz[] = [
  {
    id: 'math-tables',
    title: 'Math Tables Basics',
    questions: [
      { id: 1, question: 'What is 7 × 8?', answer: '56', options: ['48', '54', '56', '63'], points: 5, explanation: '7 × 8 = 56.' },
      { id: 2, question: 'What is 12 × 11?', answer: '132', options: ['122', '131', '132', '142'], points: 5, explanation: '12 × 11 = 132.' }
    ]
  },
  {
    id: 'english-adj',
    title: 'English Adjective Order',
    questions: [
      { id: 1, question: 'Which is correct: "small round wooden" or "round small wooden"?', answer: 'small round wooden', options: ['small round wooden', 'round small wooden'], points: 5, explanation: 'Size > Shape > Material' }
    ]
  }
];
