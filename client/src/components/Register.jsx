import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  Building2, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  MapPin,
  Inbox
} from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import { signUpUser, signInWithGoogle } from '../lib/supabase';
import { isApprovedInstitutionalDomain } from '../lib/institutionalConfig';
import { MVJCE_DEPARTMENTS } from '../data/initialData';

export default function Register({ onNavigate }) {
  const navigate = useNavigate();
  const { performLogin, showToast } = useCampusShelf();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState(MVJCE_DEPARTMENTS[0]);
  const [year, setYear] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const go = (route) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      if (route === 'welcome') navigate('/');
      else if (route === 'auth') navigate('/auth');
      else if (route === 'onboarding') navigate('/onboarding');
      else navigate('/dashboard/feed');
    }
  };

  const isPhoneValid = phone.trim() ? /^\d{10}$/.test(phone.replace(/\D/g, '')) : true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (!fullName || fullName.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters.');
      return;
    }

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    if (phone && !/^\d{10}$/.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signUpUser({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: cleanPhone ? `+91${cleanPhone}` : '',
        branch,
        year: Number(year)
      });

      setIsLoading(false);

      if (error) {
        if (error.message?.includes('already registered')) {
          setErrorMsg('An account with this email already exists. Please sign in instead.');
        } else {
          setErrorMsg(error.message || 'Registration could not be completed.');
        }
        return;
      }

      // Check if session established directly or verification required
      if (data?.session) {
        const isInst = isApprovedInstitutionalDomain(email.trim());
        performLogin({
          id: data.user?.id,
          official_email: isInst ? email.trim() : '',
          personal_email: email.trim(),
          full_name: fullName.trim(),
          branch,
          year: Number(year),
          verification_status: isInst ? 'verified' : 'pending'
        });
        showToast('Account created successfully! Welcome to CampusShelf.');
        if (isInst) {
          go('feed');
        } else {
          navigate('/verify');
        }
      } else {
        // Verification email sent
        setIsSuccess(true);
        showToast('Verification email sent to your inbox!');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'An unexpected registration error occurred.');
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      const { data, error } = await signInWithGoogle();
      if (error) {
        setIsGoogleLoading(false);
        setErrorMsg(error.message || 'Google sign-up could not be completed.');
        return;
      }
      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (err) {
      setIsGoogleLoading(false);
      setErrorMsg(err.message || 'Google OAuth failed.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      {/* ─────────────────────────────────────────────────────────────────────────────
          LEFT PANEL: Academic Identity & Institutional Photography (Desktop Only)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-[#002147] text-white p-12 flex-col justify-between relative overflow-hidden select-none">
        {/* Academic Photography with Subtle Navy Gradient Wash */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1400&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#002147]/90 to-[#002147]/80" />

        {/* Brand Header */}
        <div className="relative z-10 space-y-6">
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

          <div className="pt-8 space-y-3 max-w-md">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
              Create Your Student Shelf Account.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Join thousands of MVJCE engineering students exchanging books every semester. Keep textbooks in active campus circulation.
            </p>
          </div>
        </div>

        {/* Benefits Checklist */}
        <div className="relative z-10 space-y-4 pt-8">
          <div className="space-y-3 max-w-md">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <strong className="text-white font-medium block">+1 Welcome Credit:</strong>
                <span className="text-slate-300">Every newly registered student receives 1 complimentary exchange token.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <strong className="text-white font-medium block">Verified Peer Community:</strong>
                <span className="text-slate-300">Zero spammers or outside commercial book vendors allowed.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <strong className="text-white font-medium block">Campus Delivery Points:</strong>
                <span className="text-slate-300">Fast, safe handoffs at campus gates, department lobbies, and library.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>MVJCE Academic Security</span>
            <span>Bengaluru 560067</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          RIGHT PANEL: Clean, Centered Registration Surface
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-5 sm:p-8 lg:p-14 overflow-y-auto">
        <div className="max-w-md w-full space-y-6 my-auto">
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

          {/* Heading */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Register Student Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter your student details to activate your campus book exchange account.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* SUCCESS STATE: Verification Email Sent */}
          {isSuccess ? (
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-card text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Check Your College Email
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                We sent a confirmation link to <strong className="text-slate-900">{email}</strong>. Click the link in the message to activate your student account and claim your welcome credit token.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => go('auth')}
                  className="w-full app-btn-primary py-2.5 text-xs font-medium"
                >
                  Proceed to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <div className="space-y-4">
              {/* Google OAuth Quick Registration */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
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

              <div className="relative text-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-slate-50 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  or with email
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal / Campus Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g., Rahul Varma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="app-input w-full pl-9 py-2 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="you@gmail.com or name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="app-input w-full pl-9 py-2 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Academic Metadata: Department & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <div className="relative">
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="app-input w-full py-2 text-xs cursor-pointer font-medium"
                      >
                        {MVJCE_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Year of Study
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="app-input w-full py-2 text-xs cursor-pointer font-medium"
                    >
                      <option value={1}>1st Year (FE)</option>
                      <option value={2}>2nd Year (SE)</option>
                      <option value={3}>3rd Year (TE)</option>
                      <option value={4}>4th Year (BE)</option>
                    </select>
                  </div>
                </div>

                {/* Mobile Phone (Masked on Profile) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Mobile Number</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Private • Masked</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="9876543210 (10 digits)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="app-input w-full pl-9 py-2 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password (min 6) <span className="text-rose-500">*</span>
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
                      Confirm Password <span className="text-rose-500">*</span>
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
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full app-btn-primary py-2.5 text-xs sm:text-sm font-medium shadow-subtle mt-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    'Create Student Account'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Navigation link to Login */}
          <div className="p-3 rounded-lg bg-white border border-slate-200 text-center text-xs text-slate-600">
            <span>Already have a CampusShelf account? </span>
            <button
              type="button"
              onClick={() => go('auth')}
              className="text-brand-navy font-semibold hover:underline"
            >
              Sign in →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
