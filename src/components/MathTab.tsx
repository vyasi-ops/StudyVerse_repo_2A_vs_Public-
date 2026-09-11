import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Grid3X3, 
  Divide, 
  Award, 
  ArrowRight,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { MathSubSection, MathPracticeMode } from '../types.ts';
import { soundFx } from '../utils/audio.ts';

export const MathTab: React.FC = () => {
  const [subSection, setSubSection] = useState<MathSubSection>('tables-teacher');

  // --- TABLES TEACHER STATE ---
  const [selectedTable, setSelectedTable] = useState<number>(7);
  const [customTableInput, setCustomTableInput] = useState<string>('');
  const [maxLimit, setMaxLimit] = useState<number>(12); // "till when to go"
  const [autoRateSeconds, setAutoRateSeconds] = useState<number>(2.0); // "rate"
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(false);

  // --- PRACTICE & DRILL STATE (TIMED vs UNTIMED) ---
  const [practiceMode, setPracticeMode] = useState<MathPracticeMode>('untimed');
  const [isDrillActive, setIsDrillActive] = useState<boolean>(false);
  const [drillQuestionIndex, setDrillQuestionIndex] = useState<number>(0);
  const [drillScore, setDrillScore] = useState<number>(0);
  const [drillStreak, setDrillStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [userAnswerInput, setUserAnswerInput] = useState<string>('');
  const [drillFeedback, setDrillFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [timedLimitSeconds, setTimedLimitSeconds] = useState<number>(8); // Per-question timer in timed mode
  const [timeLeft, setTimeLeft] = useState<number>(8);
  const [drillHistory, setDrillHistory] = useState<{ q: string; correctAns: number; userAns: number; isCorrect: boolean }[]>([]);
  const [isDrillFinished, setIsDrillFinished] = useState<boolean>(false);
  const [inputStyle, setInputStyle] = useState<'numpad' | 'options'>('options');

  // Auto-play interval ref
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Common quick tables: 2 to 12
  const popularTables = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const popularLimits = [10, 12, 15, 20, 25];

  // Sync audio speech setting
  useEffect(() => {
    soundFx.speechEnabled = speechEnabled;
  }, [speechEnabled]);

  // Handle Auto-Play Teacher step progression
  useEffect(() => {
    if (isPlayingAuto) {
      autoPlayTimerRef.current = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= maxLimit) {
            // loop back or stop
            return 1;
          }
          return prev + 1;
        });
      }, Math.max(500, autoRateSeconds * 1000));
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlayingAuto, autoRateSeconds, maxLimit]);

  // Read aloud or chime when activeStep changes in Auto mode
  useEffect(() => {
    if (isPlayingAuto && speechEnabled) {
      soundFx.speak(`${selectedTable} times ${activeStep} is ${selectedTable * activeStep}`);
    } else if (isPlayingAuto) {
      soundFx.playTick();
    }
  }, [activeStep, selectedTable, isPlayingAuto, speechEnabled]);

  // Handle custom table number
  const handleApplyCustomTable = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customTableInput, 10);
    if (!isNaN(val) && val >= 1 && val <= 999) {
      setSelectedTable(val);
      setActiveStep(1);
      setCustomTableInput('');
    }
  };

  // Generate question pool for drill
  const drillQuestions = useMemo(() => {
    const list: { table: number; step: number; product: number; options: number[] }[] = [];
    for (let i = 1; i <= maxLimit; i++) {
      const prod = selectedTable * i;
      // Generate plausible distractors
      const distractors = new Set<number>();
      distractors.add(prod);
      // nearby multiples or transposition
      const candidates = [
        prod + selectedTable,
        prod - selectedTable,
        prod + 2,
        prod - 2,
        (selectedTable + 1) * i,
        (selectedTable - 1) * i,
        prod + 10,
        prod - 10,
      ];
      for (const c of candidates) {
        if (c > 0 && c !== prod && distractors.size < 4) {
          distractors.add(c);
        }
      }
      while (distractors.size < 4) {
        distractors.add(Math.max(1, prod + (Math.floor(Math.random() * 11) - 5)));
      }

      const shuffledOptions = Array.from(distractors).sort(() => Math.random() - 0.5);
      list.push({ table: selectedTable, step: i, product: prod, options: shuffledOptions });
    }
    // Shuffle drill questions
    return list.sort(() => Math.random() - 0.5);
  }, [selectedTable, maxLimit]);

  const currentQuestion = drillQuestions[drillQuestionIndex] || drillQuestions[0];

  // Start Drill Session
  const startDrill = (mode: MathPracticeMode) => {
    setPracticeMode(mode);
    setIsDrillActive(true);
    setIsDrillFinished(false);
    setDrillQuestionIndex(0);
    setDrillScore(0);
    setDrillStreak(0);
    setDrillFeedback(null);
    setShowHint(false);
    setUserAnswerInput('');
    setDrillHistory([]);
    if (isPlayingAuto) setIsPlayingAuto(false);

    if (mode === 'timed') {
      setTimeLeft(timedLimitSeconds);
    }
  };

  // Timed Countdown logic
  useEffect(() => {
    if (!isDrillActive || isDrillFinished || practiceMode !== 'timed') {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      return;
    }

    setTimeLeft(timedLimitSeconds);
    questionTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(questionTimerRef.current!);
          // Time expired for this question
          handleAnswerSubmit(null, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [isDrillActive, isDrillFinished, drillQuestionIndex, practiceMode, timedLimitSeconds]);

  // Answer Submission
  const handleAnswerSubmit = (chosenVal: number | null, timedOut = false) => {
    if (drillFeedback !== null) return; // Prevent double submit
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    const question = currentQuestion;
    if (!question) return;

    const answerToEvaluate = timedOut ? -999 : (chosenVal !== null ? chosenVal : parseInt(userAnswerInput, 10));
    const isCorrect = answerToEvaluate === question.product;

    if (isCorrect) {
      soundFx.playCorrect();
      setDrillScore((s) => s + 10 + (practiceMode === 'timed' ? timeLeft * 2 : 0));
      setDrillStreak((st) => {
        const next = st + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
      setDrillFeedback({
        isCorrect: true,
        text: `Brilliant! ${question.table} × ${question.step} = ${question.product}`,
      });
    } else {
      soundFx.playIncorrect();
      setDrillStreak(0);
      setDrillFeedback({
        isCorrect: false,
        text: timedOut
          ? `Time's up! ${question.table} × ${question.step} = ${question.product}`
          : `Not quite. ${question.table} × ${question.step} = ${question.product}`,
      });
    }

    setDrillHistory((prev) => [
      ...prev,
      {
        q: `${question.table} × ${question.step}`,
        correctAns: question.product,
        userAns: answerToEvaluate,
        isCorrect,
      },
    ]);

    // Advance to next after delay
    setTimeout(() => {
      setDrillFeedback(null);
      setUserAnswerInput('');
      setShowHint(false);

      if (drillQuestionIndex + 1 >= drillQuestions.length) {
        setIsDrillFinished(true);
      } else {
        setDrillQuestionIndex((idx) => idx + 1);
      }
    }, isCorrect ? 900 : 1500);
  };

  // Numpad keypress handler
  const handleNumpadPress = (num: string) => {
    if (num === 'C') {
      setUserAnswerInput('');
    } else if (num === 'DEL') {
      setUserAnswerInput((prev) => prev.slice(0, -1));
    } else if (num === 'ENTER') {
      if (userAnswerInput.trim()) {
        handleAnswerSubmit(parseInt(userAnswerInput, 10));
      }
    } else {
      if (userAnswerInput.length < 5) {
        setUserAnswerInput((prev) => prev + num);
      }
    }
  };

  // Quick trick explanation for current table
  const getTableTrick = (n: number): string => {
    switch (n) {
      case 2:
        return 'Double any number! Add it to itself (e.g., 2 × 7 = 7 + 7 = 14).';
      case 3:
        return 'Double the number, then add it one more time (e.g., 3 × 6 = 12 + 6 = 18).';
      case 4:
        return 'Double it and double it again! (e.g., 4 × 7 -> double 7 is 14, double 14 is 28).';
      case 5:
        return 'All answers end in 0 or 5. Even numbers end in 0, odd numbers end in 5!';
      case 6:
        return 'When multiplying an even number, the last digit matches (e.g., 6 × 4 = 24, 6 × 8 = 48).';
      case 7:
        return 'Think in friendly chunks: 7 × 8 = (5 × 8) + (2 × 8) = 40 + 16 = 56.';
      case 8:
        return 'Double, double, and double again! (8 × 7 -> 14 -> 28 -> 56).';
      case 9:
        return 'The digits of each multiple always add up to 9! (e.g. 9×3=27: 2+7=9; 9×8=72: 7+2=9).';
      case 10:
        return 'Simply append a zero to the end of any number (e.g. 10 × 7 = 70).';
      case 11:
        return 'For single digits, repeat the digit (e.g., 11 × 4 = 44, 11 × 7 = 77).';
      case 12:
        return 'Multiply by 10 then add 2 times the number (e.g., 12 × 6 = 60 + 12 = 72).';
      default:
        return `Break ${n} into friendlier parts: (${Math.floor(n / 2)} × X) + (${n - Math.floor(n / 2)} × X).`;
    }
  };

  // --- SECTION: MATRIX INTERACTIVE ---
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);
  const matrixRange = 12;

  // --- SECTION: MENTAL MATH DRILL ---
  const [mentalOp, setMentalOp] = useState<'+' | '-' | '×' | '÷'>('×');
  const [mentalA, setMentalA] = useState<number>(8);
  const [mentalB, setMentalB] = useState<number>(9);
  const [mentalAnswer, setMentalAnswer] = useState<string>('');
  const [mentalScore, setMentalScore] = useState<number>(0);
  const [mentalFeedback, setMentalFeedback] = useState<string | null>(null);

  const generateMentalProblem = (op: '+' | '-' | '×' | '÷') => {
    let a = Math.floor(Math.random() * 12) + 1;
    let b = Math.floor(Math.random() * 12) + 1;
    if (op === '-') {
      if (a < b) [a, b] = [b, a];
    } else if (op === '÷') {
      const prod = a * b;
      a = prod; // so a / b is an integer!
    }
    setMentalA(a);
    setMentalB(b);
    setMentalAnswer('');
    setMentalFeedback(null);
  };

  const checkMentalAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(mentalAnswer, 10);
    let expected = 0;
    if (mentalOp === '+') expected = mentalA + mentalB;
    if (mentalOp === '-') expected = mentalA - mentalB;
    if (mentalOp === '×') expected = mentalA * mentalB;
    if (mentalOp === '÷') expected = Math.floor(mentalA / mentalB);

    if (val === expected) {
      soundFx.playCorrect();
      setMentalScore((s) => s + 1);
      setMentalFeedback('Correct! 🎯');
      setTimeout(() => generateMentalProblem(mentalOp), 800);
    } else {
      soundFx.playIncorrect();
      setMentalFeedback(`Expected ${expected}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Window Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-md border border-indigo-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive Math Academy</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Tables Teacher & Math Lab
            </h2>
            <p className="text-indigo-200/90 text-sm mt-1 max-w-xl">
              Master multiplication with our automated table teacher, customize progression speed and end limits, then test yourself in timed or untimed practice modes.
            </p>
          </div>

          {/* Sub-section Switcher Tabs */}
          <div className="flex flex-wrap gap-2 bg-indigo-950/60 p-1.5 rounded-2xl border border-indigo-800/80 backdrop-blur-sm self-start md:self-auto">
            <button
              onClick={() => {
                setSubSection('tables-teacher');
                setIsDrillActive(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                subSection === 'tables-teacher'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Tables Teacher</span>
            </button>
            <button
              onClick={() => setSubSection('matrix')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                subSection === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Tables Matrix (12×12)</span>
            </button>
            <button
              onClick={() => setSubSection('division-inverse')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                subSection === 'division-inverse'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
              }`}
            >
              <Divide className="w-3.5 h-3.5" />
              <span>Fact Families (÷ & ×)</span>
            </button>
            <button
              onClick={() => setSubSection('mental-math')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                subSection === 'mental-math'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Mental Speed</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: TABLES TEACHER (STAR FEATURE) */}
      {/* ======================================================== */}
      {subSection === 'tables-teacher' && (
        <div className="space-y-6">
          {/* Main Controls Card: Select Table, Till When to Go, Rate */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                  <span>Tables Teacher Configuration</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set which table to teach, the pace/rate of delivery, and the upper limit limit ("till when to go").
                </p>
              </div>

              {/* Mode Selector Toggle: Auto-Teacher vs Practice Drills */}
              <div className="flex items-center gap-2">
                {!isDrillActive ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startDrill('untimed')}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center space-x-1.5 border border-slate-200 shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Untimed Practice</span>
                    </button>
                    <button
                      onClick={() => startDrill('timed')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm shadow-indigo-600/20"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Timed Speed Drill</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsDrillActive(false);
                      setIsDrillFinished(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
                  >
                    ← Exit Practice Mode
                  </button>
                )}
              </div>
            </div>

            {/* CONFIGURATION CONTROLS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 1. SELECT TABLE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  1. Table To Learn: <span className="text-indigo-600 text-sm font-extrabold">{selectedTable}</span>
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {popularTables.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setSelectedTable(t);
                        setActiveStep(1);
                      }}
                      className={`w-9 h-8 rounded-lg text-xs font-bold transition ${
                        selectedTable === t
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {/* Custom Number Input */}
                <form onSubmit={handleApplyCustomTable} className="flex gap-1.5 pt-1">
                  <input
                    type="number"
                    min="1"
                    max="999"
                    placeholder="Custom (e.g. 17)"
                    value={customTableInput}
                    onChange={(e) => setCustomTableInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition shrink-0"
                  >
                    Set
                  </button>
                </form>
              </div>

              {/* 2. TILL WHEN TO GO (UPPER LIMIT) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  2. Till When To Go: <span className="text-indigo-600 text-sm font-extrabold">{maxLimit}</span>
                </label>
                <p className="text-[11px] text-slate-500">Calculate up to {selectedTable} × {maxLimit} = {selectedTable * maxLimit}</p>
                <div className="flex flex-wrap gap-2">
                  {popularLimits.map((lim) => (
                    <button
                      key={lim}
                      onClick={() => {
                        setMaxLimit(lim);
                        if (activeStep > lim) setActiveStep(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        maxLimit === lim
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Up to {lim}
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-xs text-slate-500">Range:</span>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={maxLimit}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setMaxLimit(v);
                      if (activeStep > v) setActiveStep(1);
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* 3. SET THE RATE (SPEED / INTERVAL) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    3. Auto-Teacher Rate: <span className="text-indigo-600 text-sm font-extrabold">{autoRateSeconds}s</span>
                  </label>
                  <button
                    onClick={() => setSpeechEnabled(!speechEnabled)}
                    className={`text-xs px-2 py-0.5 rounded-md flex items-center space-x-1 transition ${
                      speechEnabled
                        ? 'bg-emerald-100 text-emerald-800 font-semibold'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title="Audio Speech: reads tables aloud"
                  >
                    {speechEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                    <span>Voice</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">Speed at which teacher cycles each row during playback.</p>
                <div className="flex gap-1.5">
                  {[
                    { label: '0.8s (Fast)', val: 0.8 },
                    { label: '1.5s', val: 1.5 },
                    { label: '2.5s (Normal)', val: 2.5 },
                    { label: '4.0s (Slow)', val: 4.0 },
                  ].map((rate) => (
                    <button
                      key={rate.val}
                      onClick={() => setAutoRateSeconds(rate.val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition text-center ${
                        autoRateSeconds === rate.val
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {rate.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-xs text-slate-500">Fine-tune:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.25"
                    value={autoRateSeconds}
                    onChange={(e) => setAutoRateSeconds(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DRILL / PRACTICE MODE VIEW (TIMED OR UNTIMED) */}
          {isDrillActive ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
              {/* Practice Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                      practiceMode === 'timed'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}
                  >
                    {practiceMode === 'timed' ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Timed Mode ({timedLimitSeconds}s per question)</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Untimed Mode (Mastery & Hints)</span>
                      </>
                    )}
                  </span>
                  <span className="text-xs text-slate-500">
                    Table of {selectedTable} • Up to {maxLimit}
                  </span>
                </div>

                {/* Score & Streak */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Score</span>
                    <span className="text-lg font-black text-slate-800">{drillScore}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Streak</span>
                    <span className="text-lg font-black text-amber-600 flex items-center justify-end">
                      {drillStreak} <Zap className="w-4 h-4 ml-0.5 fill-amber-500 text-amber-500" />
                    </span>
                  </div>
                </div>
              </div>

              {/* FINISHED DRILL RECAP CARD */}
              {isDrillFinished ? (
                <div className="text-center py-8 space-y-6 max-w-lg mx-auto">
                  <div className="w-20 h-20 bg-indigo-50 border-2 border-indigo-200 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-sm">
                    <Award className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Drill Completed!</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      You practiced the {selectedTable} times table up to {maxLimit}.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Total Points</span>
                      <p className="text-xl font-black text-indigo-600">{drillScore}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Accuracy</span>
                      <p className="text-xl font-black text-emerald-600">
                        {drillHistory.length > 0
                          ? Math.round(
                              (drillHistory.filter((h) => h.isCorrect).length / drillHistory.length) * 100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold uppercase">Best Streak</span>
                      <p className="text-xl font-black text-amber-600">{bestStreak}</p>
                    </div>
                  </div>

                  {/* Question Breakdown */}
                  {drillHistory.some((h) => !h.isCorrect) && (
                    <div className="text-left bg-rose-50/70 border border-rose-200 p-4 rounded-2xl space-y-2">
                      <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                        Review Weak Spots:
                      </span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs">
                        {drillHistory
                          .filter((h) => !h.isCorrect)
                          .map((h, i) => (
                            <div key={i} className="flex justify-between items-center text-slate-700 bg-white p-2 rounded-lg border border-rose-100">
                              <span className="font-semibold">{h.q} = {h.correctAns}</span>
                              <span className="text-rose-600">You answered: {h.userAns === -999 ? 'Timed Out' : h.userAns}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => startDrill(practiceMode)}
                      className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition"
                    >
                      Practice Again 🔄
                    </button>
                    <button
                      onClick={() => startDrill(practiceMode === 'timed' ? 'untimed' : 'timed')}
                      className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition"
                    >
                      Switch to {practiceMode === 'timed' ? 'Untimed' : 'Timed'} Mode
                    </button>
                    <button
                      onClick={() => {
                        setIsDrillActive(false);
                        setIsDrillFinished(false);
                      }}
                      className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm transition"
                    >
                      Back to Table Teacher
                    </button>
                  </div>
                </div>
              ) : (
                /* ACTIVE DRILL QUESTION */
                <div className="space-y-6 max-w-xl mx-auto">
                  {/* Progress and Question Counter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                      <span>Question {drillQuestionIndex + 1} of {drillQuestions.length}</span>
                      <span>{Math.round(((drillQuestionIndex + 1) / drillQuestions.length) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                        style={{ width: `${((drillQuestionIndex + 1) / drillQuestions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Timed Bar Indicator */}
                  {practiceMode === 'timed' && (
                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                        <span className="text-xs font-bold text-amber-900">Time Left:</span>
                      </div>
                      <div className="flex items-center space-x-2 w-1/2">
                        <div className="w-full h-2.5 bg-amber-200/70 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 rounded-full ${
                              timeLeft <= 3 ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
                            }`}
                            style={{ width: `${(timeLeft / timedLimitSeconds) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono font-black text-amber-900 w-6 text-right">
                          {timeLeft}s
                        </span>
                      </div>
                    </div>
                  )}

                  {/* The Problem Display */}
                  <div className="bg-gradient-to-b from-indigo-50/50 to-slate-50 border-2 border-indigo-200/70 rounded-3xl p-8 text-center space-y-3 relative shadow-inner">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                      Solve The Multiplication
                    </span>
                    <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center justify-center space-x-4">
                      <span>{currentQuestion.table}</span>
                      <span className="text-indigo-600">×</span>
                      <span>{currentQuestion.step}</span>
                      <span className="text-slate-400">=</span>
                      <span className="text-indigo-600 underline decoration-indigo-300 underline-offset-8">
                        {drillFeedback !== null
                          ? currentQuestion.product
                          : userAnswerInput || '?'}
                      </span>
                    </div>

                    {/* Hint / Visual Breakdown in Untimed Mode */}
                    {practiceMode === 'untimed' && (
                      <div className="pt-2">
                        {!showHint ? (
                          <button
                            onClick={() => setShowHint(true)}
                            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 transition"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Need a Hint?</span>
                          </button>
                        ) : (
                          <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 text-xs text-indigo-900 font-medium animate-fadeIn">
                            💡 <strong>Repeated Addition:</strong>{' '}
                            {Array.from({ length: currentQuestion.step })
                              .map(() => currentQuestion.table)
                              .join(' + ')}{' '}
                            = {currentQuestion.product}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Feedback Message */}
                  {drillFeedback && (
                    <div
                      className={`p-3.5 rounded-2xl text-center text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                        drillFeedback.isCorrect
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {drillFeedback.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                      <span>{drillFeedback.text}</span>
                    </div>
                  )}

                  {/* Input Selector: Multiple Choice Buttons vs Numpad */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Select Answer:</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setInputStyle('options')}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                            inputStyle === 'options' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Choice Cards
                        </button>
                        <button
                          onClick={() => setInputStyle('numpad')}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                            inputStyle === 'numpad' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Touch Numpad
                        </button>
                      </div>
                    </div>

                    {inputStyle === 'options' ? (
                      <div className="grid grid-cols-2 gap-3">
                        {currentQuestion.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAnswerSubmit(opt)}
                            disabled={drillFeedback !== null}
                            className="p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 text-slate-800 font-extrabold text-xl md:text-2xl transition-all shadow-sm hover:shadow active:scale-98 disabled:opacity-50"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      /* NUMPAD INTERACTION */
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleNumpadPress(key)}
                              disabled={drillFeedback !== null}
                              className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg active:scale-95 transition"
                            >
                              {key}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNumpadPress('ENTER')}
                          disabled={drillFeedback !== null || !userAnswerInput}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition text-base shadow-sm"
                        >
                          Submit Answer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* AUTO-TEACHER & VISUALIZER MODE */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: The Interactive Table Visualizer (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
                {/* Active Card Spotlight */}
                <div className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 border-2 border-indigo-300/60 rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                      Step {activeStep} of {maxLimit}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                      Rate: {autoRateSeconds}s / step
                    </span>
                  </div>

                  {/* The big multiplication equation */}
                  <div className="py-2">
                    <div className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight flex items-center justify-center space-x-4">
                      <span>{selectedTable}</span>
                      <span className="text-indigo-600">×</span>
                      <span className="text-indigo-950 underline decoration-indigo-400 underline-offset-8">
                        {activeStep}
                      </span>
                      <span className="text-slate-400">=</span>
                      <span className="text-indigo-600">{selectedTable * activeStep}</span>
                    </div>
                  </div>

                  {/* Visual Dot Array (Shows rows x columns for physical understanding) */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-inner max-w-md mx-auto space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Dot Array: {activeStep} groups of {selectedTable}
                    </span>
                    <div className="flex flex-col items-center justify-center gap-1.5 overflow-x-auto py-2">
                      {Array.from({ length: Math.min(12, activeStep) }).map((_, rowIdx) => (
                        <div key={rowIdx} className="flex gap-1.5 justify-center">
                          {Array.from({ length: Math.min(15, selectedTable) }).map((_, colIdx) => (
                            <span
                              key={colIdx}
                              className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block shadow-xs"
                              title={`Dot ${rowIdx + 1}, ${colIdx + 1}`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    {/* Repeated Addition Explanation */}
                    <div className="text-xs font-mono font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl">
                      {Array.from({ length: activeStep })
                        .map(() => selectedTable)
                        .join(' + ')}{' '}
                      = <span className="text-indigo-700 font-bold">{selectedTable * activeStep}</span>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveStep((prev) => (prev > 1 ? prev - 1 : maxLimit))}
                      className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Previous Step"
                      aria-label="Previous Step"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setIsPlayingAuto(!isPlayingAuto)}
                      className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 transition shadow-md ${
                        isPlayingAuto
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isPlayingAuto ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pause Teacher</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Auto-Play Table</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveStep((prev) => (prev < maxLimit ? prev + 1 : 1))}
                      className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Next Step"
                      aria-label="Next Step"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveStep(1);
                        setIsPlayingAuto(false);
                      }}
                      className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
                      title="Restart Table"
                      aria-label="Restart Table"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Table Trick Card */}
                <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 text-xs text-indigo-900 flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 font-black">
                    💡
                  </div>
                  <div>
                    <strong className="block text-indigo-950 font-bold mb-0.5">
                      Memory Trick for the {selectedTable}s Table:
                    </strong>
                    <p className="text-slate-600 leading-relaxed">{getTableTrick(selectedTable)}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Full Scrollable Table List with Live Highlight (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col h-[520px]">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-800">
                    Table of {selectedTable} (1 to {maxLimit})
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">Click to jump</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 py-3 pr-1">
                  {Array.from({ length: maxLimit }).map((_, idx) => {
                    const stepNum = idx + 1;
                    const isCurrent = activeStep === stepNum;
                    const prod = selectedTable * stepNum;
                    return (
                      <button
                        key={stepNum}
                        onClick={() => setActiveStep(stepNum)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition text-left ${
                          isCurrent
                            ? 'bg-indigo-600 text-white font-extrabold shadow-sm scale-[1.02]'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-mono">
                          {selectedTable} × {stepNum}
                        </span>
                        <span className={`font-mono text-sm ${isCurrent ? 'text-white' : 'text-indigo-700 font-bold'}`}>
                          = {prod}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => startDrill('untimed')}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition text-center"
                  >
                    Untimed Test
                  </button>
                  <button
                    onClick={() => startDrill('timed')}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition text-center"
                  >
                    Timed Test
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: MULTIPLICATION MATRIX (12x12 Grid) */}
      {/* ======================================================== */}
      {subSection === 'matrix' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Interactive Multiplication Matrix</h3>
              <p className="text-xs text-slate-500">
                Hover or click any cell to highlight the row and column, visual product, and square number diagonals.
              </p>
            </div>
            {hoveredCell && (
              <div className="bg-indigo-50 border border-indigo-200 px-4 py-1.5 rounded-xl text-xs font-bold text-indigo-900">
                {hoveredCell.r} × {hoveredCell.c} = {hoveredCell.r * hoveredCell.c}
                {hoveredCell.r === hoveredCell.c && ' (Square Number! ✨)'}
              </div>
            )}
          </div>

          <div className="overflow-x-auto pb-4">
            <table className="border-collapse mx-auto text-xs">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-200 bg-slate-100 text-slate-500 font-bold w-10">×</th>
                  {Array.from({ length: matrixRange }).map((_, c) => (
                    <th
                      key={c}
                      className={`p-2 border border-slate-200 font-bold w-10 text-center ${
                        hoveredCell?.c === c + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: matrixRange }).map((_, r) => {
                  const rowNum = r + 1;
                  return (
                    <tr key={r}>
                      <td
                        className={`p-2 border border-slate-200 font-bold text-center ${
                          hoveredCell?.r === rowNum ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rowNum}
                      </td>
                      {Array.from({ length: matrixRange }).map((_, c) => {
                        const colNum = c + 1;
                        const product = rowNum * colNum;
                        const isSquare = rowNum === colNum;
                        const isHovered = hoveredCell?.r === rowNum && hoveredCell?.c === colNum;
                        const isRowColActive = hoveredCell?.r === rowNum || hoveredCell?.c === colNum;

                        return (
                          <td
                            key={c}
                            onMouseEnter={() => setHoveredCell({ r: rowNum, c: colNum })}
                            onClick={() => {
                              setSelectedTable(rowNum);
                              setActiveStep(colNum);
                              setSubSection('tables-teacher');
                            }}
                            className={`p-2 border border-slate-200 text-center cursor-pointer transition-colors duration-100 font-mono ${
                              isHovered
                                ? 'bg-indigo-600 text-white font-black scale-105 shadow'
                                : isRowColActive
                                ? 'bg-indigo-100/70 text-indigo-900 font-bold'
                                : isSquare
                                ? 'bg-amber-100/60 font-bold text-amber-900'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                            title={`${rowNum} × ${colNum} = ${product}`}
                          >
                            {product}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-amber-200 inline-block border border-amber-300"></span>
              <span>Perfect Squares (1, 4, 9, 16, 25...)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-indigo-600 inline-block"></span>
              <span>Active Selection</span>
            </span>
            <span className="text-slate-400">💡 Click any cell to open in Tables Teacher!</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: FACT FAMILIES (DIVISION & INVERSE TABLES) */}
      {/* ======================================================== */}
      {subSection === 'division-inverse' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">The Inverse Tables Teacher: Fact Families</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Multiplication and Division are opposites! If you know that 7 × 8 = 56, you automatically know that 56 ÷ 8 = 7 and 56 ÷ 7 = 8.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Fact Triangle Visualizer */}
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200 rounded-3xl p-8 text-center space-y-6">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block">
                Math Triangle: 3 Numbers, 4 Facts
              </span>

              {/* Triangle Layout */}
              <div className="flex flex-col items-center space-y-6 py-4">
                {/* Apex */}
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  {selectedTable * 8}
                </div>
                {/* Base */}
                <div className="flex items-center justify-between w-64">
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-indigo-500 text-indigo-900 font-bold text-xl flex items-center justify-center shadow-sm">
                    {selectedTable}
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Multiplies to Apex</span>
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-indigo-500 text-indigo-900 font-bold text-xl flex items-center justify-center shadow-sm">
                    8
                  </div>
                </div>
              </div>

              {/* The 4 Equations */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold">
                  {selectedTable} × 8 = {selectedTable * 8}
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold">
                  8 × {selectedTable} = {selectedTable * 8}
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold">
                  {selectedTable * 8} ÷ {selectedTable} = 8
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold">
                  {selectedTable * 8} ÷ 8 = {selectedTable}
                </div>
              </div>
            </div>

            {/* Division Drill Card */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">Quick Reverse Table Quiz</h4>
              <p className="text-xs text-slate-500">
                Test how fast you can invert multiplication into division.
              </p>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-center">
                <span className="text-xs text-slate-400 font-bold">Solve:</span>
                <div className="text-3xl font-black text-slate-800">
                  {selectedTable * 6} ÷ {selectedTable} = ?
                </div>
                <div className="flex gap-2 justify-center pt-2">
                  {[5, 6, 7, 8].map((ans) => (
                    <button
                      key={ans}
                      onClick={() => {
                        if (ans === 6) {
                          soundFx.playCorrect();
                          alert('Correct! Fact family mastered!');
                        } else {
                          soundFx.playIncorrect();
                        }
                      }}
                      className="px-4 py-2 bg-white hover:bg-indigo-600 hover:text-white text-slate-800 font-bold rounded-xl border border-slate-200 shadow-sm transition"
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: MENTAL MATH SPEED CHALLENGE */}
      {/* ======================================================== */}
      {subSection === 'mental-math' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Mental Math Rapid Trainer</h3>
              <p className="text-xs text-slate-500">
                Train your mental calculation speed across arithmetic operations.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-bold">Score</span>
              <p className="text-xl font-black text-indigo-600">{mentalScore}</p>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            {(['+', '-', '×', '÷'] as const).map((op) => (
              <button
                key={op}
                onClick={() => {
                  setMentalOp(op);
                  generateMentalProblem(op);
                }}
                className={`w-12 h-12 rounded-2xl text-lg font-black transition ${
                  mentalOp === op
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {op}
              </button>
            ))}
          </div>

          <div className="max-w-md mx-auto bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center space-y-5">
            <div className="text-4xl font-black text-slate-900">
              {mentalA} {mentalOp} {mentalB} = ?
            </div>

            <form onSubmit={checkMentalAnswer} className="flex gap-2">
              <input
                type="number"
                autoFocus
                placeholder="Answer"
                value={mentalAnswer}
                onChange={(e) => setMentalAnswer(e.target.value)}
                className="flex-1 px-4 py-3 text-lg font-bold text-center border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 bg-white"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-sm"
              >
                Check
              </button>
            </form>

            {mentalFeedback && (
              <p className="text-sm font-bold text-indigo-700 animate-fadeIn">{mentalFeedback}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
