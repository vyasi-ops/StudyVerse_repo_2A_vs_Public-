/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabId, QuizQuestion } from './types.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { MathTab } from './components/MathTab.tsx';
import { PlannerTab } from './components/PlannerTab.tsx';
import { QuizHubTab } from './components/QuizHubTab.tsx';
import { FlashcardTab } from './components/FlashcardTab.tsx';
import { QuizGameTab } from './components/QuizGameTab.tsx';
import { MascotTab } from './components/MascotTab.tsx';
import { TimerTab } from './components/TimerTab.tsx';
import { ChatbotTab } from './components/ChatbotTab.tsx';
import { RunningPomodoroTab } from './components/RunningPomodoroTab.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { LoadingOverlay } from './components/LoadingOverlay.tsx';
import { DeveloperDebugReader } from './components/DeveloperDebugReader.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('math');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sharedQuizQuestions, setSharedQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        setIsDebugOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden antialiased">
      <LoadingOverlay isLoading={isLoading} />
      <DeveloperDebugReader isOpen={isDebugOpen} onClose={() => setIsDebugOpen(false)} />
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full pb-20">
            {activeTab === 'math' && <MathTab />}
            {activeTab === 'running-pomodoro' && <RunningPomodoroTab />}
            {activeTab === 'planner' && <PlannerTab />}
            {activeTab === 'quizzes' && (
              <QuizHubTab onQuestionsUpdated={setSharedQuizQuestions} />
            )}
            {activeTab === 'flashcards' && <FlashcardTab />}
            {activeTab === 'game' && (
              <QuizGameTab questions={sharedQuizQuestions} />
            )}
            {activeTab === 'mascot' && <MascotTab />}
            {activeTab === 'timer' && <TimerTab />}
            {activeTab === 'chatbot' && <ChatbotTab />}
          </div>
        </main>
      </div>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
