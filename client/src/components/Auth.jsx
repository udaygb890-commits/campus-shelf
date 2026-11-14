import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  ArrowRight,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import { signInUser, signInWithGoogle } from '../lib/supabase';
import { isApprovedInstitutionalDomain } from '../lib/institutionalConfig';

export default function Auth({ onNavigate }) {
  const navigate = useNavigate();
  const { performLogin, setIsGuest, showToast, sendPasswordReset } = useCampusShelf();

  // Mode: 'login' | 'forgot_password'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email format.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signInUser({ email: email.trim(), password });
      setIsLoading(false);

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
        return;
      }

      performLogin({
        id: data?.user?.id,
        official_email: email.trim(),
        personal_email: email.trim(),
        full_name: data?.user?.user_metadata?.full_name || email.split('@')[0],
        verification_status: 'verified'
      });

      showToast('Welcome back to CampusShelf!');
      go('feed');
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Authentication service temporarily unreachable.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      const { data, error } = await signInWithGoogle();
      setIsGoogleLoading(false);
      if (error) {
        setErrorMsg(error.message || 'Google sign-in could not be completed.');
        return;
      }
      if (data?.session) {
        performLogin({
          id: data.user?.id,
          official_email: data.user?.email,
          personal_email: data.user?.email,
          full_name: data.user?.user_metadata?.full_name || 'Google User',
          avatar_url: data.user?.user_metadata?.avatar_url,
          verification_status: 'verified'
        });
        showToast('Signed in with Google!');
        go('feed');
      }
    } catch (err) {
      setIsGoogleLoading(false);
      setErrorMsg(err.message || 'Google OAuth failed.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResetSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter your registered college email.');
      return;
    }

    setIsLoading(true);
    const result = await sendPasswordReset(email.trim());
    setIsLoading(false);

    if (result?.success) {
      setResetSuccessMsg(`Recovery instructions have been sent to ${email.trim()}. Please check your college inbox.`);
    } else {
      setErrorMsg(result?.error || 'Failed to send password recovery link.');
    }
  };

  const handleGuestAccess = () => {
    setIsGuest(true);
    showToast('Browsing in Guest Mode (Read-Only)');
    go('feed');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      {/* ─────────────────────────────────────────────────────────────────────────────
          LEFT PANEL: Academic Identity & Institutional Photography (Desktop Only)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-[#002147] text-white p-12 flex-col justify-between relative overflow-hidden select-none">
        {/* Academic Photography with Subtle Navy Gradient Wash */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#002147]/90 to-[#002147]/80" />

        {/* Content Layer */}
        <div className="relative z-10 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => go('welcome')}>
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-subtle">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight text-white">CampusShelf</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/15">
                  MVJCE
                </span>
              </div>
              <p className="text-xs text-slate-300">MVJ College of Engineering</p>
            </div>
          </div>

          {/* Headline & Description */}
          <div className="pt-8 space-y-3 max-w-md">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
              Hyperlocal Textbook & Academic Book Exchange.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              A private peer-to-peer network for MVJCE engineering students. Trade textbooks, semester notes, and reference books safely on campus.
            </p>
          </div>
        </div>

        {/* Institutional Pillars */}
        <div className="relative z-10 space-y-4 pt-8">
          <div className="space-y-3 max-w-md">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <strong className="text-white font-medium block">Institutional Network:</strong>
                <span className="text-slate-300">Access gated exclusively to verified @mvjce.edu.in students.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <strong className="text-white font-medium block">Zero Contact Exposure:</strong>
                <span className="text-slate-300">Personal numbers and emails are masked. Messages remain in-app.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <strong className="text-white font-medium block">On-Campus Handoffs:</strong>
                <span className="text-slate-300">Coordinate handoffs safely at designated campus landmarks.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Official Student Platform</span>
            <span>Whitefield, Bengaluru</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          RIGHT PANEL: Clean, Centered Authentication Surface
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-5 sm:p-8 lg:p-14 overflow-y-auto">
        <div className="max-w-md w-full space-y-6">
          {/* Mobile Header Branding */}
          <div className="lg:hidden flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => go('welcome')}>
              <div className="w-8 h-8 rounded-lg bg-[#002147] text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-semibold text-base tracking-tight text-slate-900">CampusShelf</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              MVJCE
            </span>
          </div>

          {/* Form Context Heading */}
          <div>
            {mode === 'forgot_password' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setResetSuccessMsg('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Recover Your Account
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Enter your registered email and we will send a password reset link.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Sign In
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Access your textbook shelf and active exchange conversations.
                </p>
              </>
            )}
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Success Banner (Password Recovery) */}
          {resetSuccessMsg && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{resetSuccessMsg}</div>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot_password' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="you@gmail.com or name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="app-input w-full pl-9 py-2.5 text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full app-btn-primary py-2.5 text-xs sm:text-sm font-medium shadow-subtle"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Recovery Link...</span>
                  </>
                ) : (
                  'Send Password Reset Link'
                )}
              </button>
            </form>
          ) : (
            /* STANDARD LOGIN FORM */
            <div className="space-y-4">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium shadow-subtle transition-colors disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {/* Restrained Divider */}
              <div className="relative text-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-slate-50 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  or with email
                </span>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="you@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="app-input w-full pl-9 py-2 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setErrorMsg('');
                        setResetSuccessMsg('');
                      }}
                      className="text-xs font-medium text-brand-navy hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="app-input w-full pl-9 pr-10 py-2 text-xs sm:text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-brand-navy focus:ring-brand-navy w-3.5 h-3.5"
                    />
                    <span>Remember session</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Institutional SSO</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full app-btn-primary py-2.5 text-xs sm:text-sm font-medium shadow-subtle"
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
            </div>
          )}

          {/* Secondary Actions & Registration Links */}
          <div className="pt-2 space-y-3">
            <div className="p-3 rounded-lg bg-white border border-slate-200 text-center text-xs text-slate-600">
              <span>New to CampusShelf? </span>
              <button
                type="button"
                onClick={() => go('register')}
                className="text-brand-navy font-semibold hover:underline"
              >
                Register with college email →
              </button>
            </div>

            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full py-2 px-3 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors text-center"
            >
              Continue in Guest Mode (Read-Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
