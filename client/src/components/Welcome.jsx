import React from 'react';
import { BookOpen, ArrowRight, ShieldCheck, Sparkles, MapPin, Repeat } from 'lucide-react';

export default function Welcome({ onNavigate }) {
  return (
    <div className="min-h-screen campus-canvas flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Hero Card */}
      <div className="glass-card max-w-xl w-full p-8 sm:p-12 text-center relative z-10 border border-white/60 shadow-[0_20px_50px_rgba(0,33,71,0.08)]">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#002147] text-white flex items-center justify-center shadow-md shadow-navy-900/20">
            <BookOpen className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#002147] font-sans">
            Campus<span className="text-indigo-600">Shelf</span>
          </span>
        </div>

        {/* Serif Headline */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-slate-900 tracking-tight leading-tight mb-4">
          Welcome to <br />
          <span className="font-semibold text-[#002147]">CampusShelf</span>
        </h1>

        {/* Subtitle / Value Prop */}
        <p className="text-slate-600 text-base sm:text-lg max-w-md mx-auto mb-8 font-light leading-relaxed">
          The ultimate peer-to-peer textbook and book exchange for college students. Swap, sell, or read.
        </p>

        {/* Hyperlocal Campus Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-8">
          <MapPin className="w-3.5 h-3.5" />
          <span>Exclusive for MVJ College of Engineering (MVJCE)</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xs mx-auto mb-6">
          <button
            onClick={() => onNavigate('register')}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2"
          >
            Register.
          </button>
          
          <button
            onClick={() => onNavigate('auth')}
            className="w-full py-3.5 px-6 rounded-xl border-2 border-indigo-200/80 hover:border-indigo-600 hover:bg-indigo-50/50 text-indigo-700 font-medium transition-all active:scale-[0.98] text-sm"
          >
            Login.
          </button>
        </div>

        {/* Guest Read-Only Pass */}
        <div>
          <button
            onClick={() => onNavigate('guest')}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors underline underline-offset-4"
          >
            Explore marketplace as Guest (Read-Only)
          </button>
        </div>
      </div>

      {/* Feature Highlights Footer */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl w-full text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verified Campus Handoff</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <Repeat className="w-4 h-4 text-indigo-600" />
          <span>Dual Token & Cash Exchange</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Masked Privacy Chat</span>
        </div>
      </div>
    </div>
  );
}

