import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../utils/audio.ts';
import { Play, Pause, RotateCcw, Flame, CheckCircle2, Coffee, Clock, Sparkles, Volume2, VolumeX } from 'lucide-react';

export const RunningPomodoroTab: React.FC = () => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [focusGoal, setFocusGoal] = useState('Master math tables & study notes');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            if (soundEnabled) {
              soundFx.playPing();
            }
            if (mode === 'focus') {
              setCompletedSessions(c => c + 1);
              setTotalFocusMinutes(m => m + 25);
              alert('Running Pomodoro Focus Session Complete! Great job! 🎉 Take a break.');
            } else {
              alert('Break time is over! Ready to dive back in? 🍅');
            }
            return mode === 'focus' ? 25 * 60 : 5 * 60;
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
  }, [isActive, mode, soundEnabled]);

  const switchMode = (newMode: 'focus' | 'short' | 'long') => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === 'focus') setSeconds(25 * 60);
    if (newMode === 'short') setSeconds(5 * 60);
    if (newMode === 'long') setSeconds(15 * 60);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalTimeInMode = mode === 'focus' ? 25 * 60 : mode === 'short' ? 5 * 60 : 15 * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalTimeInMode - seconds) / totalTimeInMode) * 100));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-amber-700 rounded-3xl p-6 md:p-8 text-white shadow-lg border border-red-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Running Pomodoro Window</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Immersive Focus Workstation
          </h2>
          <p className="text-rose-100 text-sm mt-1 max-w-xl">
            Block out distractions with dedicated work intervals, break cycles, and real-time focus tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-rose-200 block">Completed Today</span>
            <span className="text-xl font-black text-white">{completedSessions} Sessions</span>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-rose-200 block">Focus Time</span>
            <span className="text-xl font-black text-white">{totalFocusMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Main Timer Workspace */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 flex flex-col items-center space-y-8">
        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl space-x-1">
          <button
            onClick={() => switchMode('focus')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-2 ${
              mode === 'focus'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Focus (25m)</span>
          </button>
          <button
            onClick={() => switchMode('short')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-2 ${
              mode === 'short'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Short Break (5m)</span>
          </button>
          <button
            onClick={() => switchMode('long')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-2 ${
              mode === 'long'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Long Break (15m)</span>
          </button>
        </div>

        {/* Current Goal Input */}
        <div className="w-full max-w-md bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center space-x-3">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <input
            type="text"
            value={focusGoal}
            onChange={(e) => setFocusGoal(e.target.value)}
            placeholder="What are you focusing on right now?"
            className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
          />
        </div>

        {/* Large Timer Display & Progress Ring */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center shadow-inner bg-gradient-to-b from-white to-slate-50">
          <div 
            className="absolute inset-0 rounded-full border-8 border-red-500 opacity-20 pointer-events-none"
            style={{ clipPath: `polygon(0 0, 100% 0, 100% ${progressPercent}%, 0 ${progressPercent}%)` }}
          />
          <div className="text-6xl md:text-7xl font-mono font-black text-slate-900 tracking-tight">
            {formatTime(seconds)}
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-slate-400 mt-2">
            {mode === 'focus' ? '🔥 Focus Time' : '☕ Break Time'}
          </span>
          <span className="text-[11px] text-slate-500 font-medium mt-1 px-4 truncate max-w-[220px]">
            {focusGoal}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4 w-full max-w-md">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`flex-1 py-4 rounded-2xl font-bold text-sm transition shadow-md flex items-center justify-center space-x-2 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Running Pomodoro</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsActive(false);
              switchMode(mode);
            }}
            className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition font-bold"
            title="Reset Timer"
            aria-label="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-4 rounded-2xl transition font-bold ${
              soundEnabled ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
            aria-label={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Stats and Tips Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-red-50 text-red-600 font-bold text-lg">
            🍅
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Pomodoro Technique Rule</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Work with absolute focus for 25 minutes, then take a 5-minute break. After 4 sessions, take a longer 15-minute break to recharge your cognitive capacity.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 font-bold text-lg">
            ⚡
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Active Focus Habit</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Keep your phone away and notifications silenced while the Running Pomodoro is active to maximize retention and problem-solving speed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
