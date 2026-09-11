import React, { useState } from 'react';
import { soundFx } from '../utils/audio.ts';
import { Settings, X, Trash2, Volume2, VolumeX, Mic } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [soundOn, setSoundOn] = useState(soundFx.soundEnabled);
  const [voiceOn, setVoiceOn] = useState(soundFx.speechEnabled);

  if (!isOpen) return null;

  const toggleSound = () => {
    const next = !soundOn;
    soundFx.soundEnabled = next;
    setSoundOn(next);
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    soundFx.speechEnabled = next;
    setVoiceOn(next);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to reset all stored tasks and decks?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>StudyVerse Settings</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Audio & Speech Settings */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Audio & Sound</h4>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2.5">
                {soundOn ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                <div>
                  <p className="font-bold text-slate-800">Sound Effects</p>
                  <p className="text-slate-500 text-[10px]">Chimes for correct answers & timer pings</p>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`px-3 py-1 rounded-xl font-bold transition ${
                  soundOn ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {soundOn ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2.5">
                <Mic className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="font-bold text-slate-800">Voice Synthesis</p>
                  <p className="text-slate-500 text-[10px]">Read math tables aloud in Tables Teacher</p>
                </div>
              </div>
              <button
                onClick={toggleVoice}
                className={`px-3 py-1 rounded-xl font-bold transition ${
                  voiceOn ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {voiceOn ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Local Data Management */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Data Management</h4>
            <p className="text-slate-500">
              Clear or reset tasks and customizations stored in your browser's local cache.
            </p>
            <button
              onClick={clearAllData}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold p-3 rounded-2xl transition border border-rose-200 flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset All Stored Data</span>
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition text-xs shadow-sm"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};
