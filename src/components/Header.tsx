import React from 'react';
import { TabId } from '../types.ts';
import { 
  Calculator, 
  CalendarCheck, 
  Brain, 
  Layers, 
  Gamepad2, 
  Cat, 
  Timer, 
  Bot, 
  Settings,
  GraduationCap
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
}) => {
  const tabTitles: Record<TabId, string> = {
    math: 'Math Lab & Tables Teacher',
    planner: 'Study Planner',
    quizzes: 'Multi-Stage Quiz Hub',
    flashcards: 'Flashcard Hub',
    game: 'Quiz Mini-Game (Answer Dash)',
    mascot: 'Study Mascot Window',
    timer: 'Timer & Stopwatch',
    chatbot: 'StudyBot AI Assistant',
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Brand / Window Title */}
      <div className="flex items-center space-x-3">
        <div className="md:hidden flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 text-base">StudyVerse</span>
        </div>

        <div className="hidden md:flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">StudyVerse</span>
          <span className="text-slate-300">/</span>
          <h1 className="text-sm font-bold text-slate-900">{tabTitles[activeTab]}</h1>
        </div>
      </div>

      {/* Mobile Navigation Pills */}
      <div className="flex md:hidden items-center space-x-1 overflow-x-auto max-w-[200px]">
        <button
          onClick={() => onSelectTab('math')}
          className={`p-1.5 rounded-lg ${activeTab === 'math' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
          title="Math Lab"
        >
          <Calculator className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTab('planner')}
          className={`p-1.5 rounded-lg ${activeTab === 'planner' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
          title="Planner"
        >
          <CalendarCheck className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTab('quizzes')}
          className={`p-1.5 rounded-lg ${activeTab === 'quizzes' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
          title="Quizzes"
        >
          <Brain className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTab('flashcards')}
          className={`p-1.5 rounded-lg ${activeTab === 'flashcards' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
          title="Flashcards"
        >
          <Layers className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTab('game')}
          className={`p-1.5 rounded-lg ${activeTab === 'game' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
          title="Game"
        >
          <Gamepad2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTab('mascot')}
          className={`p-1.5 rounded-lg ${activeTab === 'mascot' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
          title="Mascot"
        >
          <Cat className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTab('timer')}
          className={`p-1.5 rounded-lg ${activeTab === 'timer' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
          title="Timer"
        >
          <Timer className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectTab('chatbot')}
          className={`p-1.5 rounded-lg ${activeTab === 'chatbot' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
          title="Chatbot"
        >
          <Bot className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Action Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
