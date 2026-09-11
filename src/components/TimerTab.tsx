import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../utils/audio.ts';
import { Play, Pause, RotateCcw, Hourglass, Timer as StopwatchIcon, Flag } from 'lucide-react';

export const TimerTab: React.FC = () => {
  // Pomodoro state
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState<'focus' | 'short' | 'long'>('focus');

  // Stopwatch state
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  const pomoRef = useRef<NodeJS.Timeout | null>(null);
  const swRef = useRef<NodeJS.Timeout | null>(null);

  // Pomodoro Interval
  useEffect(() => {
    if (pomoActive) {
      pomoRef.current = setInterval(() => {
        setPomoSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(pomoRef.current!);
            setPomoActive(false);
            soundFx.playPing();
            alert('Pomodoro session completed! Take a break! 🍅');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pomoRef.current) clearInterval(pomoRef.current);
    }
    return () => {
      if (pomoRef.current) clearInterval(pomoRef.current);
    };
  }, [pomoActive]);

  // Stopwatch Interval
  useEffect(() => {
    if (stopwatchActive) {
      swRef.current = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (swRef.current) clearInterval(swRef.current);
    }
    return () => {
      if (swRef.current) clearInterval(swRef.current);
    };
  }, [stopwatchActive]);

  const switchPomoMode = (mode: 'focus' | 'short' | 'long') => {
    setPomoActive(false);
    setPomoMode(mode);
    if (mode === 'focus') setPomoSeconds(25 * 60);
    if (mode === 'short') setPomoSeconds(5 * 60);
    if (mode === 'long') setPomoSeconds(15 * 60);
  };

  const resetPomo = () => {
    setPomoActive(false);
    switchPomoMode(pomoMode);
  };

  const formatPomoTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatStopwatchTime = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const addLap = () => {
    setLaps([stopwatchSeconds, ...laps]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Timer & Stopwatch</h2>
        <p className="text-slate-500 text-sm">
          Keep track of your study focus sessions and time your problem-solving.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* POMODORO CARD */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col items-center space-y-6 text-center">
          <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
            <Hourglass className="w-4 h-4 text-indigo-600" />
            <span>Pomodoro Focus Timer</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => switchPomoMode('focus')}
              className={`px-3 py-1.5 rounded-xl transition ${
                pomoMode === 'focus' ? 'bg-white text-indigo-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => switchPomoMode('short')}
              className={`px-3 py-1.5 rounded-xl transition ${
                pomoMode === 'short' ? 'bg-white text-indigo-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => switchPomoMode('long')}
              className={`px-3 py-1.5 rounded-xl transition ${
                pomoMode === 'long' ? 'bg-white text-indigo-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          <div className="text-6xl font-mono font-black text-slate-900 tracking-wider py-2">
            {formatPomoTime(pomoSeconds)}
          </div>

          <div className="flex space-x-2 w-full">
            <button
              onClick={() => setPomoActive(!pomoActive)}
              className={`flex-1 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm ${
                pomoActive
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {pomoActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{pomoActive ? 'Pause' : 'Start Focus'}</span>
            </button>
            <button
              onClick={resetPomo}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STOPWATCH CARD */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col items-center space-y-6 text-center">
          <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
            <StopwatchIcon className="w-4 h-4 text-indigo-600" />
            <span>Speed Stopwatch</span>
          </div>

          <div className="text-5xl font-mono font-black text-slate-900 tracking-wider py-5">
            {formatStopwatchTime(stopwatchSeconds)}
          </div>

          <div className="flex space-x-2 w-full">
            <button
              onClick={() => setStopwatchActive(!stopwatchActive)}
              className={`flex-1 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm ${
                stopwatchActive
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {stopwatchActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{stopwatchActive ? 'Pause' : 'Start'}</span>
            </button>
            <button
              onClick={addLap}
              disabled={!stopwatchActive}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center space-x-1"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Lap</span>
            </button>
            <button
              onClick={() => {
                setStopwatchActive(false);
                setStopwatchSeconds(0);
                setLaps([]);
              }}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {laps.length > 0 && (
            <div className="w-full text-left bg-slate-50 p-3 rounded-2xl max-h-28 overflow-y-auto space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Laps Recorded:</span>
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between text-slate-700 font-mono">
                  <span>Lap {laps.length - i}:</span>
                  <span className="font-bold">{formatStopwatchTime(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
