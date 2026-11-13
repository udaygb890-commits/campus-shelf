import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="bg-white max-w-md w-full p-8 sm:p-10 border border-slate-200 rounded-xl shadow-card space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>

        <span className="text-3xl font-bold text-slate-900 block font-mono">404</span>
        <h2 className="text-base font-semibold text-slate-900">
          Page Not Found on CampusShelf
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          The requested shelf, book link, or page could not be located in the MVJCE catalog.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="py-2 px-4 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/dashboard/feed"
            className="py-2 px-4 rounded-lg bg-brand-navy hover:bg-slate-900 text-white text-xs font-medium shadow-subtle flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Campus Feed</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
