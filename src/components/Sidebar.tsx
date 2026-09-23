import React from 'react';
import { 
  CalendarCheck, 
  Calculator, 
  Brain, 
  Layers, 
  Gamepad2, 
  Cat, 
  Timer, 
  Bot, 
  Settings, 
  GraduationCap,
  Flame
} from 'lucide-react';
import { TabId } from '../types.ts';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
}) => {
  const navItems: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'math', label: 'Math & Tables', icon: <Calculator className="w-5 h-5" />, badge: 'NEW' },
    { id: 'running-pomodoro', label: 'Running Pomodoro', icon: <Flame className="w-5 h-5" />, badge: 'HOT' },
    { id: 'planner', label: 'Study Planner', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'quizzes', label: 'Quiz Hub', icon: <Brain className="w-5 h-5" /> },
    { id: 'flashcards', label: 'Flashcard Hub', icon: <Layers className="w-5 h-5" /> },
    { id: 'game', label: 'Quiz Mini-Game', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'mascot', label: 'Mascot Window', icon: <Cat className="w-5 h-5" /> },
    { id: 'timer', label: 'Timer & Clock', icon: <Timer className="w-5 h-5" /> },
    { id: 'chatbot', label: 'Study Assistant', icon: <Bot className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between hidden md:flex border-r border-slate-800 select-none shrink-0">
      <div>
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-tight">StudyVerse</span>
              <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">Math & Learning Hub</span>
            </div>
          </div>
          <button 
            onClick={onOpenSettings}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-indigo-800 text-indigo-200' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        StudyVerse 5.0 • Math Tables Teacher
      </div>
    </aside>
  );
};
