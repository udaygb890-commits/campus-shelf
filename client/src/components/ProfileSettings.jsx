import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  GraduationCap, 
  MapPin, 
  ShieldCheck, 
  Bell, 
  Check, 
  RefreshCw, 
  Upload 
} from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import { MVJCE_DEPARTMENTS, MVJCE_LANDMARKS, CAMPUS_ZONES } from '../data/initialData';

export default function ProfileSettings() {
  const { currentUser, updateProfile, showToast } = useCampusShelf();

  // Local form state
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [branch, setBranch] = useState(currentUser.branch || '');
  const [year, setYear] = useState(currentUser.year || 2);
  const [semester, setSemester] = useState(currentUser.semester || 3);
  const [defaultHandoff, setDefaultHandoff] = useState(currentUser.default_handoff || 'ECE Block Lobby');
  const [privacyEnabled, setPrivacyEnabled] = useState(currentUser.privacy_enabled ?? true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url);
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      updateProfile({
        full_name: fullName,
        branch,
        year: Number(year),
        semester: Number(semester),
        default_handoff: defaultHandoff,
        privacy_enabled: privacyEnabled,
        avatar_url: avatarUrl
      });
      setIsLoading(false);
      showToast('Profile updated successfully!');
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          My Profile & Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your student profile, department details, and account preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Student Identity & Academic Details */}
        <div className="glass-card p-6 border border-white/80 space-y-5">
          <h3 className="font-serif text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Student Identity & Academic Details
          </h3>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Profile Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                />
                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <label className="text-[11px] font-medium text-indigo-600 hover:underline cursor-pointer">
                Change Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Inputs Grid */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email (Read-Only)
                </label>
                <input
                  type="email"
                  value={currentUser.official_email}
                  readOnly
                  disabled
                  className="w-full glass-input text-xs bg-slate-100/70 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Branch / Department
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full glass-input text-xs cursor-pointer font-medium"
                >
                  {MVJCE_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Year & Semester
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="glass-input text-xs cursor-pointer"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>

                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="glass-input text-xs cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Sem {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campus Residence Zone
                </label>
                <select
                  value={currentUser.campus_zone}
                  onChange={(e) => updateProfile({ campus_zone: e.target.value })}
                  className="w-full glass-input text-xs cursor-pointer"
                >
                  {CAMPUS_ZONES.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Campus Handoff Preferences */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <h3 className="font-serif text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Campus Handoff Preferences
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Default MVJCE Handoff Spot (pre-filled on your listings)</span>
            </label>
            <select
              value={defaultHandoff}
              onChange={(e) => setDefaultHandoff(e.target.value)}
              className="w-full glass-input text-xs cursor-pointer font-medium"
            >
              {MVJCE_LANDMARKS.map((spot) => (
                <option key={spot} value={spot}>{spot}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Account Security & Privacy */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <h3 className="font-serif text-base font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Account Security & Privacy</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Zero Contact Exposure
            </span>
          </h3>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Hide my email and phone number from other students
              </p>
              <p className="text-[11px] text-slate-500">
                Enforces secure in-app chat only for all negotiations & handoffs.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacyEnabled}
                onChange={(e) => setPrivacyEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-slate-700">Notification Preferences</label>
            <div className="space-y-2 text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>Email Notifications regarding new swap requests</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={(e) => setPushNotifs(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>Push Notifications regarding new swap messages</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto py-3 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

