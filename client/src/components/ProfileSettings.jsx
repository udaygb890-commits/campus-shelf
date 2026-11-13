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
  Upload,
  Lock
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
      showToast('Profile settings saved successfully');
    }, 400);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Account & Academic Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your verified student profile, department affiliation, and privacy controls.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Student Identity & Academic Details */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-card space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Student Identity & Academic Record
            </h3>
            <p className="text-xs text-slate-500">Verified institutional data for peer exchanges</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-1">
            {/* Profile Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                />
                <label className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <label className="text-xs font-medium text-brand-navy hover:underline cursor-pointer">
                Change Photo
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal / Campus Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full app-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <span>Institutional Email</span>
                  <Lock className="w-3 h-3 text-slate-400" />
                </label>
                <input
                  type="email"
                  value={currentUser.official_email}
                  readOnly
                  disabled
                  className="w-full app-input text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Branch
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full app-input text-xs cursor-pointer font-medium"
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
                    className="app-input text-xs cursor-pointer"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>

                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="app-input text-xs cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Sem {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campus Residence Area
                </label>
                <select
                  value={currentUser.campus_zone}
                  onChange={(e) => updateProfile({ campus_zone: e.target.value })}
                  className="w-full app-input text-xs cursor-pointer"
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
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-card space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Campus Handoff Logistics
            </h3>
            <p className="text-xs text-slate-500">Default physical meetup spot pre-selected when listing textbooks</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-navy" />
              <span>Default MVJCE Handoff Landmark</span>
            </label>
            <select
              value={defaultHandoff}
              onChange={(e) => setDefaultHandoff(e.target.value)}
              className="w-full app-input text-xs cursor-pointer font-medium max-w-md"
            >
              {MVJCE_LANDMARKS.map((spot) => (
                <option key={spot} value={spot}>{spot}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Account Security & Privacy */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-card space-y-5">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Privacy & Communication Protection
              </h3>
              <p className="text-xs text-slate-500">Prevent unsolicited contact from marketplace counterparties</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Zero Contact Exposure
            </span>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Mask Phone Number and Personal Email
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                All communications and meetups must happen through authenticated CampusShelf chat.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={privacyEnabled}
                onChange={(e) => setPrivacyEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-navy"></div>
            </label>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-semibold text-slate-700">Notification Alerts</label>
            <div className="space-y-2 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="rounded border-slate-300 text-brand-navy focus:ring-brand-navy w-4 h-4"
                />
                <span>Email alerts for incoming exchange and swap proposals</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={(e) => setPushNotifs(e.target.checked)}
                  className="rounded border-slate-300 text-brand-navy focus:ring-brand-navy w-4 h-4"
                />
                <span>In-app notifications when an exchange partner sends a message</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto py-2.5 px-6 rounded-lg bg-brand-navy hover:bg-slate-900 text-white font-medium text-xs shadow-subtle transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
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
