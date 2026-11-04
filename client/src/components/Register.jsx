import React, { useState } from 'react';
import { BookOpen, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function Register({ onNavigate }) {
  const { updateProfile, showToast } = useCampusShelf();

  // Form State
  const [step, setStep] = useState('FORM'); // 'FORM' | 'OTP'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Validation
  const isEmailValid = email.includes('@') && email.endsWith('.edu.in');
  const isPhoneValid = /^\d{10}$/.test(phone.replace(/\D/g, ''));
  const isPasswordValid = password.length >= 6;
  const isPasswordMatch = password === confirmPassword && password.length > 0;
  const isFormComplete = fullName.trim().length >= 2 && isPhoneValid && isPasswordMatch;

  const handleSendOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (fullName.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!isPhoneValid) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('OTP');
      showToast(`Verification code sent to +91 ******${phone.slice(-4)}`);
    }, 700);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMsg('Please enter the verification code (try 123456).');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Save metadata
      updateProfile({
        full_name: fullName,
        official_email: email,
        phone_number: `+91 ${phone}`,
        onboarding_completed: false
      });
      showToast('Phone verified! Please complete your academic details.');
      onNavigate('onboarding');
    }, 800);
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      updateProfile({
        full_name: fullName || 'MVJCE Student',
        official_email: email || 'student@mvjce.edu.in',
        onboarding_completed: false
      });
      showToast('Authenticated via Google');
      onNavigate('onboarding');
    }, 800);
  };

  return (
    <div className="min-h-screen campus-canvas flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="glass-card max-w-md w-full p-8 relative z-10 border border-white/60 shadow-[0_20px_50px_rgba(0,33,71,0.08)]">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('welcome')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Welcome
        </button>

        {/* Branding & Logo */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#002147] text-white flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#002147]">
            Campus<span className="text-indigo-600">Shelf</span>
          </span>
        </div>

        {step === 'FORM' ? (
          <>
            <h2 className="font-serif text-2xl font-normal text-center text-slate-900 mb-1">
              Create Your CampusShelf Account
            </h2>
            <p className="text-xs text-center text-slate-500 mb-6">
              Connect exclusively with MVJ College of Engineering peers
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full glass-input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Email</label>
                <input
                  type="email"
                  placeholder="student@mvjce.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-semibold text-slate-500">+91</span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full glass-input text-sm pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full glass-input text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!isFormComplete || isLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <span className="relative bg-white/80 px-3 text-xs text-slate-500 uppercase tracking-wider">
                or continue with
              </span>
            </div>

            <button
              onClick={handleGoogleSignup}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200/90 hover:bg-white bg-white/60 text-slate-700 font-medium text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Sign up with Google
            </button>
          </>
        ) : (
          /* Step 2: OTP Verification */
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-2xl text-slate-900 mb-1">
              Verify your Mobile Number
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Enter the 6-digit code sent to <strong className="text-slate-800">+91 {phone || 'XXXXXX5432'}</strong>
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3 glass-input font-bold"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1">Hint: enter any 6 digits (e.g. 123456)</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  'Verify & Create Account'
                )}
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => showToast('New OTP resent via SMS')}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Didn't receive the code? Resend in 30s
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('auth')}
              className="text-indigo-600 font-medium hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

