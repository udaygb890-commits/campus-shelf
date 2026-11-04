import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function Toast() {
  const { toastMessage } = useCampusShelf();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#002147] text-white shadow-2xl border border-white/20 text-xs sm:text-sm font-medium">
        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}

