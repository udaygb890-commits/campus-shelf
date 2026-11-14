import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Lock, 
  BookOpen, 
  ArrowRight, 
  HelpCircle, 
  FileText, 
  Upload, 
  LogOut,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import { 
  isApprovedInstitutionalDomain, 
  getApprovedDomains, 
  getDomainHelperText 
} from '../lib/institutionalConfig';
import { MVJCE_DEPARTMENTS } from '../data/initialData';

export default function StudentVerification() {
  const navigate = useNavigate();
  const { 
    currentUser, 
    sendInstitutionalVerification, 
    confirmInstitutionalCode, 
    submitManualVerification, 
    performLogout, 
    showToast 
  } = useCampusShelf();

  // Active Tab: 'outlook' | 'manual'
  const [activeTab, setActiveTab] = useState('outlook');

  // Outlook Verification Flow
  const [instEmail, setInstEmail] = useState(currentUser?.institutional_email || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  // Manual Review Form
  const [usn, setUsn] = useState(currentUser?.usn || '');
  const [branch, setBranch] = useState(currentUser?.branch || MVJCE_DEPARTMENTS[0]);
  const [manualNotes, setManualNotes] = useState('');
  const [proofFile, setProofFile] = useState(null);

  const verificationStatus = currentUser?.verification_status || 'pending';
  const approvedDomains = getApprovedDomains();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setDevOtpHint('');

    if (!instEmail || !instEmail.includes('@')) {
      setErrorMsg('Please enter your official institutional college email.');
      return;
    }

    if (!isApprovedInstitutionalDomain(instEmail)) {
      setErrorMsg(`Unrecognized institutional domain. ${getDomainHelperText()}`);
      return;
    }

    setIsLoading(true);
    const res = await sendInstitutionalVerification(instEmail.trim());
    setIsLoading(false);

    if (res?.success) {
      if (res.simulatedCode) {
        setDevOtpHint(res.simulatedCode);
      }
    } else {
      setErrorMsg(res?.error || 'Failed to send verification code. Please check email address.');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!verificationCode || verificationCode.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    const res = await confirmInstitutionalCode(verificationCode.trim());
    setIsLoading(false);

    if (res?.success) {
      navigate('/dashboard/feed');
    } else {
      setErrorMsg(res?.error || 'Invalid or expired code. Please request a new one.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!usn || usn.trim().length < 4) {
      setErrorMsg('Please enter a valid MVJCE University Seat Number (USN).');
      return;
    }

    if (!instEmail || !instEmail.includes('@')) {
      setErrorMsg('Please enter your college email or student portal username.');
      return;
    }

    setIsLoading(true);
    const res = await submitManualVerification({
      institutionalEmail: instEmail.trim(),
      usn: usn.trim().toUpperCase(),
      notes: `Branch: ${branch}. Notes: ${manualNotes.trim()}`,
      proofUrl: proofFile ? 'uploaded_proof_ref' : null
    });
    setIsLoading(false);

    if (res?.success) {
      showToast('Manual review request submitted successfully.');
    } else {
      setErrorMsg(res?.error || 'Failed to submit manual review.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 text-slate-900">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-[#002147] text-white p-6 sm:p-8 relative">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-base tracking-tight text-white block">CampusShelf</span>
                <span className="text-xs text-slate-300">MVJ College of Engineering</span>
              </div>
            </div>

            <button
              type="button"
              onClick={performLogout}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="pt-4 space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <span>MVJCE Student Verification</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Verify your institutional affiliation to unlock textbook trading and peer messaging.
            </p>
          </div>

          {/* Connected Identity Pill */}
          <div className="mt-4 p-2.5 rounded-lg bg-white/10 border border-white/15 text-xs text-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-400">Signed In:</span>
              <strong className="text-white truncate">{currentUser?.full_name || 'Student'}</strong>
              <span className="text-slate-400">({currentUser?.official_email || currentUser?.personal_email})</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-medium">
              Verification Required
            </span>
          </div>
        </div>

        {/* Verification Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Status Banners */}
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {devOtpHint && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <span><strong>Dev Mode Simulated Code:</strong> Enter <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-300">{devOtpHint}</span></span>
              <button 
                type="button" 
                onClick={() => setVerificationCode(devOtpHint)}
                className="text-[11px] font-semibold text-brand-navy underline"
              >
                Autofill
              </button>
            </div>
          )}

          {/* VIEW: VERIFIED STATE */}
          {verificationStatus === 'verified' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-subtle">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Institutional Status Verified
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Your college affiliation has been confirmed. You now have full access to browse listings, initiate peer textbook swaps, and message students.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/feed')}
                  className="app-btn-primary py-2.5 px-6 text-xs sm:text-sm font-medium"
                >
                  Enter Marketplace Feed →
                </button>
              </div>
            </div>
          )}

          {/* VIEW: MANUAL REVIEW IN PROGRESS */}
          {verificationStatus === 'manual_review' && (
            <div className="p-6 rounded-xl bg-amber-50/70 border border-amber-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Manual Verification In Review
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Your college USN and student identification proof have been submitted to the MVJCE CampusShelf moderation team. Approvals are typically completed within 12–24 hours.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('outlook')}
                  className="text-xs font-semibold text-brand-navy hover:underline"
                >
                  Try Instant Outlook Verification Instead
                </button>
              </div>
            </div>
          )}

          {/* VIEW: PENDING OR CODE SENT */}
          {verificationStatus !== 'verified' && verificationStatus !== 'manual_review' && (
            <>
              {/* Verification Method Tabs */}
              <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('outlook')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'outlook'
                      ? 'bg-white text-brand-navy shadow-subtle'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>College Outlook Email (Instant)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'manual'
                      ? 'bg-white text-brand-navy shadow-subtle'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Admin Manual Review</span>
                </button>
              </div>

              {/* METHOD 1: OUTLOOK EMAIL OTP */}
              {activeTab === 'outlook' && (
                <div className="space-y-5">
                  {verificationStatus === 'email_verification_sent' ? (
                    /* Step 2: Code Confirmation */
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                        <div>
                          <p className="text-slate-500">Verification code sent to:</p>
                          <p className="font-semibold text-slate-900 font-mono">{instEmail}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            sendInstitutionalVerification(instEmail);
                          }}
                          className="text-xs font-medium text-brand-navy hover:underline"
                        >
                          Resend Code
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Enter 6-Digit Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g., 492810"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          className="app-input w-full text-center tracking-widest font-mono text-lg font-bold py-2.5"
                          autoFocus
                          required
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            // reset to step 1
                            currentUser.verification_status = 'pending';
                            setVerificationCode('');
                          }}
                          className="py-2.5 px-4 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Change Email
                        </button>

                        <button
                          type="submit"
                          disabled={isLoading || verificationCode.length < 6}
                          className="flex-1 app-btn-primary py-2.5 text-xs sm:text-sm font-medium shadow-subtle disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Verifying Code...</span>
                            </>
                          ) : (
                            'Confirm & Unlock Marketplace'
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Step 1: Request Code */
                    <form onSubmit={handleSendCode} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Official MVJCE Outlook Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            placeholder="username@mvjce.edu.in or 1mv21cs001@mvjce.onmicrosoft.com"
                            value={instEmail}
                            onChange={(e) => setInstEmail(e.target.value)}
                            className="app-input w-full pl-9 py-2.5 text-xs sm:text-sm"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{getDomainHelperText()}</span>
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || !instEmail.trim()}
                        className="w-full app-btn-primary py-2.5 text-xs sm:text-sm font-medium shadow-subtle"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Sending Verification Email...</span>
                          </>
                        ) : (
                          'Send Verification Code to Outlook'
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* METHOD 2: ADMIN MANUAL REVIEW */}
              {activeTab === 'manual' && (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    If your college Outlook inbox is not yet active or you encounter delivery issues, submit your MVJCE University Seat Number (USN) for admin approval.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      MVJCE College USN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 1MV21CS042"
                      value={usn}
                      onChange={(e) => setUsn(e.target.value)}
                      className="app-input w-full py-2 text-xs uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Institutional College Email (or Portal Username) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="student.name@mvjce.edu.in"
                      value={instEmail}
                      onChange={(e) => setInstEmail(e.target.value)}
                      className="app-input w-full py-2 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Branch / Department
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="app-input w-full py-2 text-xs cursor-pointer font-medium"
                    >
                      {MVJCE_DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Additional Details / Remarks (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Mention your semester, section, or reason if Outlook inbox is inaccessible..."
                      value={manualNotes}
                      onChange={(e) => setManualNotes(e.target.value)}
                      className="app-input w-full py-2 text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full app-btn-primary py-2.5 text-xs sm:text-sm font-medium shadow-subtle"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting for Review...</span>
                      </>
                    ) : (
                      'Submit for Admin Verification'
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Privacy Footnote */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>MVJCE Campus Network Security</span>
            <span>Zero Commercial Gating</span>
          </div>
        </div>
      </div>
    </div>
  );
}
