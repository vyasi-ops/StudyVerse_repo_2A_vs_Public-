import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types.ts';
import { soundFx } from '../utils/audio.ts';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Upload, BookOpen, Sparkles } from 'lucide-react';

const defaultFlashcardsText = `Front: What order do Opinion and Size adjectives go?
Back: Opinion always comes before Size (e.g., "lovely big house").

Front: Where does Color go relative to Material?
Back: Color comes before Material (e.g., "red wooden chair").

Front: What is the math shortcut for multiplying by 9?
Back: Multiply by 10 then subtract the number! (e.g. 9 × 7 = 70 - 7 = 63). Also, digits add up to 9!

Front: What is a Fact Family in math?
Back: A set of 3 numbers that form 4 related equations (e.g., 7, 8, 56 -> 7×8=56, 8×7=56, 56÷8=7, 56÷7=8).`;

export const FlashcardTab: React.FC = () => {
  const [rawText, setRawText] = useState(defaultFlashcardsText);
  const [aiInput, setAiInput] = useState<string>('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateFlashcards = async () => {
    if (!aiInput.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/parse-to-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiInput }),
      });
      if (!response.ok) throw new Error('Failed to generate flashcards');
      const generatedCards = await response.json();
      setCards(generatedCards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error(error);
      alert('Failed to generate flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const parseCards = (text: string) => {
    const list: Flashcard[] = [];
    const blocks = text.split(/\n\s*\n/);
    let id = 0;

    blocks.forEach((block) => {
      const lines = block.trim().split('\n');
      let frontText = '';
      let backText = '';
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (/^front\s*[:\-]/i.test(trimmed)) {
          frontText = trimmed.replace(/^front\s*[:\-]/i, '').trim();
        }
        if (/^back\s*[:\-]/i.test(trimmed)) {
          backText = trimmed.replace(/^back\s*[:\-]/i, '').trim();
        }
      });
      if (frontText && backText) {
        list.push({ id: id++, front: frontText, back: backText });
      }
    });

    setCards(list);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  useEffect(() => {
    parseCards(rawText);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        parseCards(content);
      }
    };
    reader.readAsText(file);
  };

  const flipCard = () => {
    soundFx.playTick();
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (cards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % cards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    if (cards.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setIsFlipped(false);
  };

  const shuffleCards = () => {
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-md border border-teal-700/50">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Interactive Flashcard Academy</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Flashcard Hub & Learn Page
          </h2>
          <p className="text-teal-200/90 text-sm mt-1 max-w-xl">
            Study key concepts, math shortcuts, and English grammar with interactive flipping cards. Use AI to generate flashcards from your study notes.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Flashcard Hub & Learn Page</h2>
          <p className="text-slate-500 text-sm">
            Study key concepts, math shortcuts, and English grammar with interactive flipping cards.
          </p>
        </div>

      {/* Active Card Viewer */}
      {cards.length > 0 && currentCard && (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/80 text-center space-y-6">
          <div className="flex justify-between items-center text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span className="text-slate-400">Click card or spacebar to flip</span>
          </div>

          {/* Flip Container */}
          <div
            onClick={flipCard}
            className="w-full min-h-[220px] md:min-h-[260px] bg-gradient-to-br from-indigo-50/70 to-slate-100 border-2 border-indigo-200/80 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer shadow-inner hover:shadow-md transition-all duration-200 select-none"
          >
            <span
              className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 ${
                isFlipped ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 shadow-xs'
              }`}
            >
              {isFlipped ? 'Back (Answer / Solution)' : 'Front (Question)'}
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 max-w-lg leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </h3>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={prevCard}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition text-xs flex items-center justify-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={flipCard}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-6 py-3 rounded-2xl transition text-xs flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Flip Card</span>
            </button>

            <button
              onClick={shuffleCards}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-3 rounded-2xl transition text-xs"
              title="Shuffle deck"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={nextCard}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition text-xs flex items-center justify-center space-x-1 shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload and Edit Deck Box */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <label className="font-semibold text-slate-700 text-xs flex items-center space-x-2">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Upload Flashcards File (.txt)</span>
          </label>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 text-xs mb-1.5 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Generate Flashcards with AI:</span>
          </label>
          <textarea
            rows={5}
            placeholder="Paste your notes or any text here, and I'll create flashcards..."
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            className="w-full p-3 font-mono text-xs border border-indigo-200 rounded-2xl focus:outline-none focus:border-indigo-500 bg-indigo-50/50"
          />
          <button
            type="button"
            onClick={handleGenerateFlashcards}
            disabled={loading}
            className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-2xl text-xs transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
