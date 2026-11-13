import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function Logout({ onConfirmLogout }) {
  const navigate = useNavigate();
  const { isLogoutModalOpen, setIsLogoutModalOpen, performLogout } = useCampusShelf();

  if (!isLogoutModalOpen) return null;

  const handleConfirm = () => {
    performLogout();
    if (onConfirmLogout) {
      onConfirmLogout();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-sm w-full p-6 text-center border border-white/80 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsLogoutModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <LogOut className="w-6 h-6 stroke-[2.2]" />
        </div>

        <h3 className="font-serif text-xl font-semibold text-slate-900 mb-2">
          Log Out of CampusShelf?
        </h3>

        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Are you sure you want to log out? You will need to sign back in to swap books, list items, and view your messages.
        </p>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(false)}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-[#002147] hover:bg-[#001733] text-white text-xs font-semibold shadow-md shadow-navy-900/20 active:scale-95 transition-all"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

