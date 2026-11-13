import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function Toast() {
  const { toastMessage } = useCampusShelf();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-slate-900 text-white shadow-modal border border-slate-800 text-xs font-medium">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
