import React, { useState } from 'react';
import { soundFx } from '../utils/audio.ts';
import { Heart, Sparkles, RefreshCw } from 'lucide-react';

const catQuotes = [
  "Meow! Purr-severance is key to finishing your tasks!",
  "Take a deep breath. You're doing paws-itively great!",
  "Just one more question, human. I believe in you!",
  "Don't forget your 7s times table: 7 × 8 = 56!",
  "You've got a sharp mind, let's keep sharpening it!",
  "Every problem you solve makes you stronger! Meow~ 💪",
  "Your brain is getting smarter with every question! Keep it up!",
  "I'm so proud of your dedication. You're unstoppable! 🌟",
  "Remember: mistakes are just learning in disguise. Keep going!",
  "You're building confidence with every answer. Purr-fect! 😸",
  "Focus and persistence beat perfection every single time!",
  "Your future self will thank you for studying hard today!",
  "Meow if you're ready to conquer today's goals! 🎯",
  "You've already overcome so much. This is nothing! 🚀",
  "Growth happens outside your comfort zone. Keep exploring!",
  "One question at a time. You've got this, scholar! 📚",
  "Your effort today compounds into success tomorrow!",
  "Believe in yourself the way I believe in you! 🐱✨",
  "Excellence isn't a destination—it's a journey. Enjoy it!",
  "You're not just learning, you're becoming unstoppable!",
];

const dogQuotes = [
  "Woof! Barking up the right tree with these study goals!",
  "Fetch that success! You're crushing it today!",
  "Stay paws-itive, you've got this in the bag!",
  "Math is like a game of fetch—the more you practice, the faster you get!",
  "High five! Or high paw! Keep going!",
  "Your dedication makes me so happy! Woof woof! 🐕",
  "Every study session is a step closer to your dreams!",
  "You're doing better than you think! Trust me, buddy! 🌟",
  "Tired? Take a break! But then come right back—you're almost there!",
  "Your hard work today is your superpower tomorrow! 💪",
  "The best time to study was yesterday. The second best? Right now!",
  "You're not alone in this journey—I'm cheering you on! 🎉",
  "Woof! Every correct answer is a victory to celebrate!",
  "Don't compare your beginning to someone else's middle!",
  "You're training your brain like an athlete. That's awesome! 🏆",
  "Success isn't luck—it's preparation meeting opportunity!",
  "Keep that motivation going! You're on fire today! 🔥",
  "I can see your potential from here! Woof woof! 🐶✨",
  "Struggle today = strength tomorrow. You're building power!",
  "Your consistency is your secret weapon. Keep it up, champ!",
];

const encouragementBoosts = [
  "🌟 You're making incredible progress!",
  "💪 Your dedication is truly inspiring!",
  "🚀 You're unstoppable!",
  "🎯 Laser focus—I love it!",
  "📚 Knowledge seeker detected!",
  "⚡ Energy level: MAXIMUM!",
  "🏆 Champion mindset activated!",
  "🌈 Crushing goals like a pro!",
];

export const MascotTab: React.FC = () => {
  const [isCat, setIsCat] = useState(true);
  const [speech, setSpeech] = useState(
    'Meow! Click me to pet me and get a study boost!'
  );
  const [status, setStatus] = useState('Ready to study');
  const [petCount, setPetCount] = useState(0);
  const [isPetting, setIsPetting] = useState(false);
  const [showBoost, setShowBoost] = useState(false);

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

    // Show motivation boost
    setShowBoost(true);
    setTimeout(() => {
      setShowBoost(false);
    }, 2000);

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

          {showBoost && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-center animate-pulse">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-bold text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                {encouragementBoosts[Math.floor(Math.random() * encouragementBoosts.length)]}
              </div>
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

        {/* Motivation Tips Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-semibold text-indigo-900">💡 Study Tip:</p>
          <p className="text-xs text-indigo-800 leading-relaxed">
            Struggling? Take a quick 5-minute break, pet your mascot, and come back refreshed. Your brain will thank you!
          </p>
        </div>
      </div>
    </div>
  );
};
