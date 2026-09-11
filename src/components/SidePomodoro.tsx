import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../utils/audio.ts';
import { Play, Pause, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';

export const SidePomodoro: React.FC = () => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            soundFx.playPing();
            alert('Side Pomodoro Session complete! 🍅');
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <aside
      aria-label="Floating Side Pomodoro"
      className="fixed bottom-5 right-5 z-40 bg-white/95 backdrop-blur-md shadow-xl rounded-3xl border border-slate-200/90 p-4 w-60 transition-all duration-200"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
          <span className="text-base leading-none">🍅</span>
          <span>Side Pomodoro</span>
        </span>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
          title={isMinimized ? 'Expand' : 'Minimize'}
          aria-label={isMinimized ? 'Expand' : 'Minimize'}
        >
          {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isMinimized && (
        <div className="space-y-3 pt-1">
          <div className="text-3xl font-mono font-black text-center text-slate-900 tracking-wider">
            {formatTime(seconds)}
          </div>
          <div className="flex space-x-1.5">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
                isActive
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
              <span>{isActive ? 'Pause' : 'Start'}</span>
            </button>
            <button
              onClick={() => {
                setIsActive(false);
                setSeconds(25 * 60);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              title="Reset timer"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
