import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Repeat, Lock, MapPin, CheckCircle2 } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function Welcome({ onNavigate }) {
  const navigate = useNavigate();
  const { setIsGuest } = useCampusShelf();

  const go = (target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      if (target === 'register') navigate('/register');
      else if (target === 'auth') navigate('/auth');
      else if (target === 'guest') {
        setIsGuest(true);
        navigate('/dashboard/feed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-slate-200">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#002147] text-white flex items-center justify-center font-bold shadow-sm">
            <BookOpen className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight text-slate-900">CampusShelf</span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">MVJCE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => go('auth')}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => go('register')}
            className="app-btn-primary text-xs py-1.5 px-3.5"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 sm:py-16 flex flex-col justify-center">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Exclusively for MVJ College of Engineering Students</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-tight">
            Peer-to-peer textbook & academic book exchange
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Trade course syllabus textbooks, semester reference guides, and engineering notes with fellow students on campus. Coordinate safe physical handoffs at verified MVJCE landmarks.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
            <button
              onClick={() => go('register')}
              className="w-full sm:w-auto app-btn-primary px-6 py-2.5 text-sm"
            >
              <span>Get Started with College Email</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => go('guest')}
              className="w-full sm:w-auto app-btn-secondary px-5 py-2.5 text-sm"
            >
              Browse Catalog as Guest
            </button>
          </div>
        </div>

        {/* Feature Cards Grid (Disciplined, minimal cards) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="app-card p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Verified Campus Handoffs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exchanges take place exclusively at official campus locations: ECE Block Lobby, Main Library Entrance, or CSE/ISE Block.
            </p>
          </div>

          <div className="app-card p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mb-3">
              <Repeat className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Dual Exchange Economy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exchange textbooks using platform credit tokens earned by listing books, or settle direct cash purchases on physical handoff.
            </p>
          </div>

          <div className="app-card p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Privacy-Masked In-App Chat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your personal mobile number and private email address remain completely unexposed. Coordinate handoffs safely inside the app.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 px-4 sm:px-8 bg-white text-center text-xs text-slate-500">
        <p>© 2026 CampusShelf • Designed for MVJ College of Engineering, Channasandra, Bangalore.</p>
      </footer>
    </div>
  );
}
