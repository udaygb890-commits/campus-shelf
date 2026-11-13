import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen campus-canvas flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="glass-card max-w-md w-full p-8 sm:p-10 border border-white/70 shadow-2xl space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
          <BookOpen className="w-7 h-7" />
        </div>

        <span className="text-4xl font-serif font-bold text-[#002147] block">404</span>
        <h2 className="font-serif text-xl font-semibold text-slate-800">
          Page Not Found on CampusShelf
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          The requested shelf location, book link, or page could not be located in the MVJCE catalog.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/dashboard/feed"
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Campus Feed</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
