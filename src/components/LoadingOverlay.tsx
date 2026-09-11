import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message = 'Processing...' }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-800">{message}</p>
      </div>
    </div>
  );
};
