import React, { useState } from 'react';
import { BookOpen, MapPin, GraduationCap, Building2, Calendar, Check, RefreshCw } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import { MVJCE_DEPARTMENTS, CAMPUS_ZONES, MVJCE_LANDMARKS } from '../data/initialData';

export default function Onboarding({ onNavigate }) {
  const { currentUser, updateProfile, showToast } = useCampusShelf();

  const [branch, setBranch] = useState(currentUser.branch || '');
  const [year, setYear] = useState(currentUser.year ? `${currentUser.year}` : '');
  const [zone, setZone] = useState(currentUser.campus_zone || '');
  const [defaultHandoff, setDefaultHandoff] = useState(currentUser.default_handoff || 'ECE Block Lobby');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = Boolean(branch && year && zone);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      updateProfile({
        branch,
        year: parseInt(year, 10),
        campus_zone: zone,
        default_handoff: defaultHandoff,
        onboarding_completed: true
      });
      showToast('Welcome to MVJCE CampusShelf!');
      onNavigate('feed');
    }, 800);
  };

  return (
    <div className="min-h-screen campus-canvas flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="glass-card max-w-lg w-full p-8 sm:p-10 relative z-10 border border-white/70 shadow-[0_20px_50px_rgba(0,33,71,0.08)]">
        {/* App Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#002147] text-white flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#002147]">
            Campus<span className="text-indigo-600">Shelf</span>
          </span>
        </div>

        {/* Header */}
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-center text-slate-900 mb-2">
          Just a Few Details...
        </h2>
        <p className="text-xs text-center text-slate-500 mb-8 max-w-xs mx-auto">
          Help us personalize your exchange feed with peer courses and nearby handoff spots.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Branch / Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Branch / Department (Required)</span>
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full glass-input text-sm bg-white/70 cursor-pointer"
              required
            >
              <option value="" disabled>Select Department (e.g., ECE, CSE)</option>
              {MVJCE_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* 2. Academic Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Current Year (Required)</span>
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full glass-input text-sm bg-white/70 cursor-pointer"
              required
            >
              <option value="" disabled>Select Year</option>
              <option value="1">1st Year (Freshman)</option>
              <option value="2">2nd Year (Sophomore)</option>
              <option value="3">3rd Year (Junior)</option>
              <option value="4">4th Year (Senior)</option>
            </select>
          </div>

          {/* 3. Campus Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Campus Zone / Residence (Required)</span>
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full glass-input text-sm bg-white/70 cursor-pointer"
              required
            >
              <option value="" disabled>Select Residence Zone</option>
              {CAMPUS_ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* 4. Preferred Handoff Landmark */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Default MVJCE Handoff Landmark</span>
            </label>
            <select
              value={defaultHandoff}
              onChange={(e) => setDefaultHandoff(e.target.value)}
              className="w-full glass-input text-sm bg-white/70 cursor-pointer"
            >
              {MVJCE_LANDMARKS.map((spot) => (
                <option key={spot} value={spot}>{spot}</option>
              ))}
            </select>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Configuring Profile...</span>
                </>
              ) : (
                'Confirm & Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

