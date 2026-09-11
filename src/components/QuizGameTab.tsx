import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion } from '../types.ts';
import { soundFx } from '../utils/audio.ts';
import { Gamepad2, Zap, Clock, Trophy, RotateCcw } from 'lucide-react';

interface QuizGameTabProps {
  questions: QuizQuestion[];
}

export const QuizGameTab: React.FC<QuizGameTabProps> = ({ questions }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [activeDeck, setActiveDeck] = useState<QuizQuestion[]>([]);
  const [timeLeft, setTimeLeft] = useState(12);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    const pool = questions.length > 0 ? questions : [
      { id: 1, question: 'What is 8 × 7?', options: ['48', '54', '56', '64'], answer: '56', points: 5 },
      { id: 2, question: 'Which order is correct?', options: ['old red car', 'red old car'], answer: 'old red car', points: 5 },
    ];

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setActiveDeck(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setGameState('playing');
    setTimeLeft(12);
  };

  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(12);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex]);

  const handleTimeExpired = () => {
    soundFx.playIncorrect();
    setStreak(0);
    setFeedback({ text: "Time's up! ⌛", isCorrect: false });
    setTimeout(() => {
      advanceQuestion();
    }, 1000);
  };

  const handleOptionSelect = (opt: string) => {
    if (feedback !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const q = activeDeck[currentIndex];
    const isCorrect = opt.trim().toLowerCase() === q.answer.trim().toLowerCase();

    if (isCorrect) {
      soundFx.playCorrect();
      setScore((s) => s + q.points + timeLeft);
      setStreak((st) => st + 1);
      setFeedback({ text: `Correct! +${q.points + timeLeft} pts 🎉`, isCorrect: true });
    } else {
      soundFx.playIncorrect();
      setStreak(0);
      setFeedback({ text: `Wrong! Correct: ${q.answer}`, isCorrect: false });
    }

    setTimeout(() => {
      advanceQuestion();
    }, 1100);
  };

  const advanceQuestion = () => {
    setFeedback(null);
    if (currentIndex + 1 >= activeDeck.length) {
      setGameState('gameover');
    } else {
      setCurrentIndex((idx) => idx + 1);
    }
  };

  const currentQ = activeDeck[currentIndex];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Answer Dash (Quiz Mini-Game)</h2>
        <p className="text-slate-500 text-sm">
          Fast-paced multiple choice dash against the clock to rack up points and streaks!
        </p>
      </div>

      {gameState === 'start' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 text-center space-y-5">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-2xl shadow-inner">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Ready to Play Answer Dash?</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Answer fast before the timer runs out to multiply your score!
            </p>
          </div>
          <button
            onClick={startGame}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-2xl transition shadow-sm text-sm"
          >
            Start Game 🚀
          </button>
        </div>
      )}

      {gameState === 'playing' && currentQ && (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
          {/* Header Stats */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Score:</span>
              <span className="text-lg font-black text-indigo-600">{score}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-700 font-mono">
                {timeLeft}s
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-emerald-600 uppercase">Streak:</span>
              <span className="text-lg font-black text-emerald-700">{streak}</span>
              <Zap className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2 text-center py-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Question {currentIndex + 1} of {activeDeck.length}
            </span>
            <h3 className="text-xl font-bold text-slate-900 leading-snug">{currentQ.question}</h3>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(opt)}
                disabled={feedback !== null}
                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 text-slate-800 font-bold text-sm text-left transition shadow-xs disabled:opacity-50"
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3 rounded-2xl text-center text-xs font-bold ${
                feedback.isCorrect
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.text}
            </div>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 text-center space-y-5">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto text-2xl shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Game Over!</h3>
            <p className="text-sm text-slate-500 mt-1">
              Final Score: <strong className="text-indigo-600 text-lg">{score} points</strong>
            </p>
          </div>
          <button
            onClick={startGame}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-2xl transition text-sm flex items-center justify-center space-x-2 mx-auto shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
