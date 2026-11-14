import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCampusShelf } from '../context/CampusShelfContext';
import { BookOpen, RefreshCw } from 'lucide-react';

export default function ProtectedRoute() {
  const { currentUser, isAuthenticated, isGuest, isAuthLoading } = useCampusShelf();

  if (isAuthLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#002147] text-white flex items-center justify-center shadow-subtle">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#002147]" />
            <span>Restoring secure session...</span>
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated and not guest -> redirect to login
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/auth" replace />;
  }

  // Authenticated student whose institutional verification is pending -> redirect to verification
  if (isAuthenticated && !isGuest && currentUser?.verification_status !== 'verified') {
    return <Navigate to="/verify" replace />;
  }

  return <Outlet />;
}
