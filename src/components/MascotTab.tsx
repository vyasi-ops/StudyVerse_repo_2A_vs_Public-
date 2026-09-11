import React, { useState } from 'react';
import { soundFx } from '../utils/audio.ts';
import { Heart, Sparkles, RefreshCw } from 'lucide-react';

const catQuotes = [
  "Meow! Purr-severance is key to finishing your tasks!",
  "Take a deep breath. You're doing paws-itively great!",
  "Just one more question, human. I believe in you!",
  "Don't forget your 7s times table: 7 × 8 = 56!",
  "You've got a sharp mind, let's keep sharpening it!",
];

const dogQuotes = [
  "Woof! Barking up the right tree with these study goals!",
  "Fetch that success! You're crushing it today!",
  "Stay paws-itive, you've got this in the bag!",
  "Math is like a game of fetch—the more you practice, the faster you get!",
  "High five! Or high paw! Keep going!",
];

export const MascotTab: React.FC = () => {
  const [isCat, setIsCat] = useState(true);
  const [speech, setSpeech] = useState(
    'Meow! Click me to pet me and get a study boost!'
  );
  const [status, setStatus] = useState('Ready to study');
  const [petCount, setPetCount] = useState(0);
  const [isPetting, setIsPetting] = useState(false);

  const toggleMascot = () => {
    setIsCat(!isCat);
    if (isCat) {
      setSpeech('Woof! Ready to help you tackle math and study tasks!');
      setStatus('Ready to fetch knowledge');
    } else {
      setSpeech("Meow! Let's conquer our study goals today!");
      setStatus('Ready to study');
    }
  };

  const petMascot = () => {
    soundFx.playPing();
    setIsPetting(true);
    setPetCount((c) => c + 1);

    const quotes = isCat ? catQuotes : dogQuotes;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setSpeech(randomQuote);
    setStatus(isCat ? '*Purrs happily* 🐾 meow~' : '*Wags tail furiously* 🐕 woof!');

    setTimeout(() => {
      setIsPetting(false);
    }, 600);

    setTimeout(() => {
      setStatus('Ready to study');
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Study Mascot Window</h2>
        <p className="text-slate-500 text-sm">
          Switch between your study cat and study dog. Pet them whenever you need a boost of encouragement!
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6 text-center">
        {/* Mascot Switcher Header */}
        <div className="flex justify-between items-center bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
          <div className="flex items-center space-x-3 text-left">
            <span
              onClick={petMascot}
              className={`text-4xl cursor-pointer select-none transition-transform duration-200 ${
                isPetting ? 'scale-125' : 'hover:scale-110'
              }`}
            >
              {isCat ? '🐱' : '🐶'}
            </span>
            <div>
              <h4 className="text-sm font-bold text-indigo-950">
                {isCat ? 'Study Cat (Whiskers)' : 'Study Dog (Buddy)'}
              </h4>
              <span className="text-xs text-slate-500 font-medium">{status}</span>
            </div>
          </div>

          <button
            onClick={toggleMascot}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl transition font-semibold shadow-xs flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch to {isCat ? '🐶 Dog' : '🐱 Cat'}</span>
          </button>
        </div>

        {/* Big Animated Mascot Avatar */}
        <div className="py-6 relative">
          <div
            onClick={petMascot}
            className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-100 to-slate-100 border-4 border-indigo-200 flex items-center justify-center text-6xl cursor-pointer select-none shadow-sm transition-transform duration-150 ${
              isPetting ? 'scale-110 rotate-3' : 'hover:scale-105'
            }`}
          >
            {isCat ? '🐱' : '🐶'}
          </div>

          {isPetting && (
            <div className="absolute top-4 right-1/4 text-rose-500 animate-bounce flex items-center space-x-1 font-bold text-xs">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
          )}
        </div>

        {/* Mascot Speech Bubble */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 font-medium relative shadow-inner">
          <p className="leading-relaxed">"{speech}"</p>
        </div>

        {/* Pet Button */}
        <button
          onClick={petMascot}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl transition shadow-sm text-sm flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Pet Your Study Mascot 🐾 ({petCount} pets)</span>
        </button>
      </div>
    </div>
  );
};
