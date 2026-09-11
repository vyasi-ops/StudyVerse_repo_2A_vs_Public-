import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { TaskItem } from '../types.ts';

export const PlannerTab: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('study_tasks');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      { id: 1, text: 'Review English Adjectives Order', priority: 8, completed: false, createdAt: Date.now() },
      { id: 2, text: 'Master Table of 7 up to 12 in Math Lab', priority: 10, completed: false, createdAt: Date.now() },
      { id: 3, text: 'Complete 25-minute Pomodoro focus session', priority: 5, completed: false, createdAt: Date.now() },
    ];
  });

  const [taskText, setTaskText] = useState('');
  const [taskPriority, setTaskPriority] = useState<number>(5);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    localStorage.setItem('study_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const getPriorityBadgeStyle = (priority: number) => {
    const map: Record<number, string> = {
      1: 'bg-green-100 text-green-700 border border-green-300',
      2: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      3: 'bg-lime-100 text-lime-800 border border-lime-300',
      4: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      5: 'bg-amber-100 text-amber-800 border border-amber-300',
      6: 'bg-orange-100 text-orange-800 border border-orange-300',
      7: 'bg-rose-100 text-rose-800 border border-rose-300',
      8: 'bg-red-200 text-red-700 border border-red-300',
      9: 'bg-red-600 text-white font-semibold',
      10: 'bg-red-950 text-white font-bold shadow-sm',
    };
    return map[priority] || map[5];
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    const newTask: TaskItem = {
      id: Date.now(),
      text: taskText.trim(),
      priority: taskPriority,
      completed: false,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setTaskText('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Study Planner</h2>
        <p className="text-slate-500 text-sm">
          Organize your daily study goals with a 10-tier priority gradient system.
        </p>
      </div>

      {/* Task Input Form */}
      <form
        onSubmit={addTask}
        className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row gap-4 items-center"
      >
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="What do you want to study? (e.g. Master 8s Times Table)"
          required
          className="flex-1 w-full px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 text-sm"
        />

        <div className="flex items-center space-x-3 w-full lg:w-auto bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 justify-between">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Priority: <strong className="text-indigo-600">{taskPriority} / 10</strong>
          </span>
          <input
            type="range"
            min="1"
            max="10"
            value={taskPriority}
            onChange={(e) => setTaskPriority(parseInt(e.target.value, 10))}
            className="w-28 accent-indigo-600 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold transition w-full lg:w-auto flex items-center justify-center space-x-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
          {(['all', 'active', 'completed'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                filter === mode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {mode} ({mode === 'all' ? tasks.length : tasks.filter((t) => (mode === 'active' ? !t.completed : t.completed)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-slate-400 space-y-2">
            <Calendar className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-sm">No tasks in this view. Ready to add a new study goal?</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const badgeStyle = getPriorityBadgeStyle(task.priority);
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3.5 border rounded-2xl transition ${
                  task.completed ? 'bg-slate-50/70 border-slate-100 opacity-60' : 'bg-white border-slate-200/70 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                      task.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 hover:border-indigo-500'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {task.text}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${badgeStyle}`}>
                    P-{task.priority}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
