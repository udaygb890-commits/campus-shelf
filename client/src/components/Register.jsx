import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Mail, Phone, Lock, User } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import { signUpUser, signInWithGoogle, sendPhoneOtp, verifyPhoneOtp } from '../lib/supabase';

export default function Register({ onNavigate }) {
  const navigate = useNavigate();
  const { updateProfile, performLogin, showToast } = useCampusShelf();

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

  const isPhoneValid = /^\d{10}$/.test(phone.replace(/\D/g, ''));
  const isPasswordValid = password.length >= 6;
  const isPasswordMatch = password === confirmPassword && password.length > 0;
  const isFormComplete = fullName.trim().length >= 2 && isPhoneValid && isPasswordMatch && email.includes('@');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (fullName.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid college email address.');
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

    try {
      // 1. Supabase Signup request
      const { data: signUpData, error: signUpError } = await signUpUser({
        email,
        password,
        fullName: fullName.trim(),
        phone: `+91${phone}`
      });

      if (signUpError && !signUpError.message?.includes('already registered')) {
        setIsLoading(false);
        setErrorMsg(signUpError.message);
        return;
      }

      // 2. Request OTP
      await sendPhoneOtp(phone);
      setIsLoading(false);
      setStep('OTP');
      showToast(`Verification code sent to +91 ******${phone.slice(-4)}`);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to initiate registration.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMsg('Please enter the verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await verifyPhoneOtp(phone, otpCode);
      setIsLoading(false);

      if (error) {
        setErrorMsg(error.message || 'Invalid or expired OTP code.');
        return;
      }

      updateProfile({
        full_name: fullName,
        official_email: email,
        phone_number: `+91 ${phone}`,
        onboarding_completed: false
      });
      performLogin({
        full_name: fullName,
        official_email: email,
        phone_number: `+91 ${phone}`,
      });
      showToast('Phone verified! Please complete your academic details.');
      go('onboarding');
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'OTP verification failed.');
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      setIsLoading(false);
      if (error) {
        setErrorMsg(error.message || 'Google authentication failed.');
        return;
      }
      updateProfile({
        full_name: fullName || 'MVJCE Student',
        official_email: email || 'student@mvjce.edu.in',
        onboarding_completed: false
      });
      performLogin({
        full_name: fullName || 'MVJCE Student',
        official_email: email || 'student@mvjce.edu.in',
      });
      showToast('Authenticated via Google');
      go('onboarding');
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Google Sign Up failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Top Back Link */}
        <button
          onClick={() => go('welcome')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-4 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        {/* Card */}
        <div className="app-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#002147] text-white flex items-center justify-center font-bold shadow-sm">
              <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900">CampusShelf</span>
          </div>

          {step === 'FORM' ? (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Create your account</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Connect with fellow MVJ College of Engineering students
                </p>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Varma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="app-input w-full pl-9"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">College Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="e.g. student@mvjce.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="app-input w-full pl-9"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 text-xs font-medium border-r border-slate-200 pr-2">
                      <Phone className="w-3.5 h-3.5" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="app-input w-full pl-18"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
                    <input
                      type="password"
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="app-input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Confirm</label>
                    <input
                      type="password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="app-input w-full"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isFormComplete || isLoading}
                  className="w-full app-btn-primary py-2.5 mt-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    'Continue with Mobile Verification'
                  )}
                </button>
              </form>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-2.5 text-[11px] text-slate-400 uppercase tracking-wider">
                  or
                </span>
              </div>

              <button
                onClick={handleGoogleSignup}
                type="button"
                className="w-full app-btn-secondary py-2 text-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign up with Google Workspace</span>
              </button>
            </>
          ) : (
            /* Step 2: OTP Verification */
            <div className="py-2 text-center">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">Verify Mobile Number</h2>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Enter the 6-digit verification code sent to <strong className="text-slate-800">+91 {phone}</strong>
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 text-left flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="••••••"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="app-input w-full text-center tracking-[0.5em] text-xl font-mono py-2.5 font-bold"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full app-btn-primary py-2.5"
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
                    onClick={() => showToast('New verification code resent')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Didn't receive code? Resend via SMS
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 text-center border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => go('auth')}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
