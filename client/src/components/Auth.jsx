import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Lock, Mail, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import { signInUser } from '../lib/supabase';

export default function Auth({ onNavigate }) {
  const navigate = useNavigate();
  const { performLogin, setIsGuest, showToast, sendPasswordReset } = useCampusShelf();
  const [email, setEmail] = useState('student.name@mvjce.edu.in');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const go = (route) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      if (route === 'register') navigate('/register');
      else if (route === 'welcome') navigate('/');
      else navigate('/dashboard/feed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please enter your college email.');
      return;
    }

    if (!email.endsWith('@mvjce.edu.in') && !email.includes('@')) {
      setErrorMsg('Please use your official @mvjce.edu.in college email.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signInUser({ email, password });
      setIsLoading(false);

      if (error) {
        setErrorMsg(error.message || 'Login failed. Please verify credentials.');
        return;
      }

      performLogin({
        official_email: email,
        full_name: data?.user?.user_metadata?.full_name || 'Rahul Varma'
      });
      showToast('Welcome back to CampusShelf!');
      go('feed');
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    }
  };

  const handleGuestAccess = () => {
    setIsGuest(true);
    showToast('Browsing in Guest Mode (Read-Only)');
    go('feed');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left Information Panel */}
        <div className="space-y-6 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#002147] text-white flex items-center justify-center font-bold shadow-sm">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-slate-900 block leading-tight">
                CampusShelf
              </span>
              <span className="text-xs text-slate-500 font-medium">MVJ College of Engineering</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight leading-snug">
              Sign in to your campus account
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Connect with fellow students to exchange textbooks, manage your shelf inventory, and coordinate on-campus handoffs.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-xs text-slate-600 border-t border-slate-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Restricted to verified @mvjce.edu.in student accounts</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Zero exposure of personal phone numbers or private emails</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Physical handoffs verified at official campus landmarks</span>
            </div>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="app-card p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Student Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your MVJCE institutional credentials to continue
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="student.name@mvjce.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="app-input w-full pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    if (!email || !email.includes('@')) {
                      setErrorMsg('Please enter your college email to receive a password reset link.');
                      return;
                    }
                    sendPasswordReset(email);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="app-input w-full pl-9"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-brand-navy w-3.5 h-3.5"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full app-btn-primary py-2.5 mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-2.5 text-[11px] text-slate-400 uppercase tracking-wider">
              or
            </span>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full app-btn-secondary text-xs py-2"
            >
              Continue as Guest (Read-Only)
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => go('register')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Register with college email
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
