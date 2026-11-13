import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MapPin, GraduationCap, Building2, Check, RefreshCw, ArrowRight } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import { MVJCE_DEPARTMENTS, CAMPUS_ZONES, MVJCE_LANDMARKS } from '../data/initialData';

export default function Onboarding({ onNavigate }) {
  const navigate = useNavigate();
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
      if (onNavigate) {
        onNavigate('feed');
      } else {
        navigate('/dashboard/feed');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        <div className="app-card p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#002147] text-white flex items-center justify-center font-bold shadow-sm">
              <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900">CampusShelf</span>
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Academic Details</h1>
            <p className="text-xs text-slate-500 mt-1">
              Personalize your course recommendations and physical handoff locations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Branch / Department */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Department / Branch <span className="text-red-500">*</span></span>
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="app-input w-full bg-white cursor-pointer"
                required
              >
                <option value="" disabled>Select Department</option>
                {MVJCE_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* 2. Academic Year */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Current Year <span className="text-red-500">*</span></span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="app-input w-full bg-white cursor-pointer"
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
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Campus Zone / Residence <span className="text-red-500">*</span></span>
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="app-input w-full bg-white cursor-pointer"
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
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Default MVJCE Handoff Landmark</span>
              </label>
              <select
                value={defaultHandoff}
                onChange={(e) => setDefaultHandoff(e.target.value)}
                className="app-input w-full bg-white cursor-pointer"
              >
                {MVJCE_LANDMARKS.map((spot) => (
                  <option key={spot} value={spot}>{spot}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full app-btn-primary py-2.5 mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Complete Setup & Enter Shelf</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
