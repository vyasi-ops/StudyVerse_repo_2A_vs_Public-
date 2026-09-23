/**
 * Shared types for StudyVerse & Math Learning Platform
 */

export type TabId = 
  | 'planner' 
  | 'math' 
  | 'quizzes' 
  | 'flashcards' 
  | 'game' 
  | 'mascot' 
  | 'timer' 
  | 'chatbot'
  | 'running-pomodoro';

export interface TaskItem {
  id: number;
  text: string;
  priority: number; // 1 - 10
  completed: boolean;
  createdAt: number;
}

export type QuestionType = 'mcq' | 'true_false' | 'fill_in_blank' | 'short_answer' | 'matching' | 'sorting';

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  points: number;
  imageUrl?: string;
  calculator?: boolean;
  // For matching/sorting
  pairs?: { left: string; right: string }[];
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  mastered?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

// Math Section Types
export type MathSubSection = 'tables-teacher' | 'matrix' | 'mental-math' | 'division-inverse';

export type MathPracticeMode = 'untimed' | 'timed';

export interface TableItem {
  multiplier: number;
  multiplicand: number;
  product: number;
}

export interface MathDrillQuestion {
  id: number;
  table: number;
  step: number;
  questionText: string;
  correctAnswer: number;
  options: number[];
}

export interface MathSessionStats {
  totalAnswered: number;
  correctCount: number;
  incorrectCount: number;
  streak: number;
  bestStreak: number;
  timeSpentSeconds: number;
  missedQuestions: { question: string; answer: number; userAnswer: number }[];
}
