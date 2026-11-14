import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Lock, Eye, EyeOff, RefreshCw, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { updateStudentPassword, showToast } = useCampusShelf();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password || password.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await updateStudentPassword(password);
    setIsLoading(false);

    if (res?.success) {
      setIsSuccess(true);
    } else {
      setErrorMsg(res?.error || 'Failed to update password. Link may have expired.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-xl border border-slate-200 shadow-card space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-[#002147] text-white flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-slate-900">CampusShelf • MVJCE</span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Set New Password
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose a new secure password for your student shelf account.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Password Reset Complete!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
            <div className="pt-2">
              <Link
                to="/auth"
                className="app-btn-primary w-full py-2 text-xs font-medium"
              >
                Sign In to CampusShelf
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (min 6 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="app-input w-full pl-9 pr-9 py-2 text-xs sm:text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="app-input w-full pl-9 pr-9 py-2 text-xs sm:text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full app-btn-primary py-2.5 text-xs sm:text-sm font-medium shadow-subtle mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                'Update Password'
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

