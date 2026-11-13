import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, RefreshCw } from 'lucide-react';
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
    <div className="min-h-screen campus-canvas flex items-center justify-center p-4 sm:p-6 lg:p-12 relative">
      {/* Container */}
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Hero & Branding Panel */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MVJCE Campus Network Active</span>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#002147] text-white flex items-center justify-center shadow-lg shadow-navy-900/20">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#002147]">
              Campus<span className="text-indigo-600">Shelf</span>
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-slate-900 leading-tight">
            Welcome Back to <br />
            <span className="font-semibold text-[#002147]">CampusShelf:</span> <br />
            <span className="text-2xl sm:text-3xl text-slate-700">Your College Book Exchange.</span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
            Sign in with your official college email to securely swap textbooks, earn credits, and connect with fellow students at MVJCE.
          </p>

          <div className="pt-2 hidden lg:flex items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Restricted to @mvjce.edu.in</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Zero-exposure Contact Masking</span>
            </div>
          </div>
        </div>

        {/* Right Authentication Card */}
        <div className="glass-card p-8 sm:p-10 border border-white/70 shadow-[0_20px_50px_rgba(0,33,71,0.08)]">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#002147] mb-2">
            Student Sign In
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter your MVJCE credentials to access your digital shelf and messages
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official College Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="email"
                  placeholder="e.g., student.name@mvjce.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input text-sm pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    if (!email || !email.includes('@')) {
                      setErrorMsg('Please enter your college email to receive a password reset link.');
                      return;
                    }
                    sendPasswordReset(email);
                  }}
                  className="text-[11px] text-indigo-600 hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input text-sm pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>Remember Me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#002147] hover:bg-[#001733] text-white font-medium text-sm shadow-md shadow-navy-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 pt-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                'Securely Sign In'
              )}
            </button>
          </form>

          {/* Social / Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <span className="relative bg-white/90 px-3 text-xs text-slate-500 uppercase tracking-wider">
              options
            </span>
          </div>

          {/* Guest and Register Links */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200/90 hover:bg-slate-50 bg-white/60 text-slate-700 font-medium text-xs transition-all flex items-center justify-center gap-2"
            >
              Continue as Guest (Read-Only)
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-600">
                New to CampusShelf?{' '}
                <button
                  onClick={() => go('register')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Create your account.
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

