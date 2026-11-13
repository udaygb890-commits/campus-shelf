import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full p-6 text-center border border-slate-200 rounded-xl shadow-modal relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-3">
          <LogOut className="w-5 h-5" />
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1.5">
          Sign Out of CampusShelf?
        </h3>

        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          You will need your MVJCE student credentials or verified phone number to sign back in.
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(false)}
            className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium shadow-subtle transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
