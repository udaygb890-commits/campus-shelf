import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase, isConfigured } from '../lib/supabase';
import { isApprovedInstitutionalDomain } from '../lib/institutionalConfig';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { performLogin, showToast } = useCampusShelf();
  const isHandledRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isHandledRef.current) return;
    isHandledRef.current = true;

    async function handleAuth() {
      // 1. Check for OAuth errors or cancellation in URL parameters
      const hashPart = window.location.hash || '';
      const searchPart = window.location.search || '';
      
      const params = new URLSearchParams(
        searchPart || (hashPart.includes('?') ? hashPart.substring(hashPart.indexOf('?')) : '')
      );

      const oauthError = params.get('error') || params.get('error_code');
      const errorDescription = params.get('error_description');

      if (oauthError) {
        const readableMsg = errorDescription || 'Google authentication was cancelled or declined.';
        console.warn('OAuth Error:', oauthError, readableMsg);
        setErrorMessage(readableMsg);
        showToast(readableMsg);
        setTimeout(() => navigate('/auth', { replace: true }), 2500);
        return;
      }

      if (!isConfigured) {
        setErrorMessage('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env.');
        showToast('Supabase configuration missing');
        setTimeout(() => navigate('/auth', { replace: true }), 2500);
        return;
      }

      try {
        // 2. Retrieve existing or in-flight session
        let session = null;
        const { data: initialData, error: initialError } = await supabase.auth.getSession();

        if (initialError) {
          console.error('Session retrieval error:', initialError);
          setErrorMessage(initialError.message || 'Authentication failed. Please sign in again.');
          showToast('Failed to establish session');
          setTimeout(() => navigate('/auth', { replace: true }), 2000);
          return;
        }

        session = initialData?.session;

        // If session not ready yet (e.g. PKCE auth code exchange in progress), wait briefly
        if (!session) {
          session = await new Promise((resolve) => {
            const timeoutId = setTimeout(() => resolve(null), 3500);
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, updatedSession) => {
              if (updatedSession?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                clearTimeout(timeoutId);
                subscription.unsubscribe();
                resolve(updatedSession);
              }
            });
          });
        }

        if (!session?.user) {
          setErrorMessage('No authenticated user session found. Please try signing in again.');
          showToast('No active session found.');
          setTimeout(() => navigate('/auth', { replace: true }), 2000);
          return;
        }

        const user = session.user;
        const userEmail = user.email || '';
        const isInstDomain = isApprovedInstitutionalDomain(userEmail);

        // 3. Check whether CampusShelf profile already exists in Supabase
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        let finalProfile = existingProfile;

        // If profile does not exist, create initial student profile with pending status
        if (!finalProfile) {
          const newProfileData = {
            id: user.id,
            full_name: user.user_metadata?.full_name || userEmail.split('@')[0],
            college_email: userEmail,
            personal_email: userEmail,
            institutional_email: isInstDomain ? userEmail : null,
            branch: user.user_metadata?.branch || 'First Year Basic Sciences',
            year: Number(user.user_metadata?.year) || 1,
            credit_balance: 0,
            campus_zone: 'Day Scholar',
            default_handoff: 'ECE Block Lobby',
            role: 'student',
            verification_status: isInstDomain ? 'verified' : 'pending',
            verification_method: isInstDomain ? 'domain_sso' : null,
            verified_at: isInstDomain ? new Date().toISOString() : null,
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString()
          };

          const { data: createdProfile } = await supabase
            .from('profiles')
            .upsert(newProfileData, { onConflict: 'id' })
            .select()
            .maybeSingle();

          finalProfile = createdProfile || newProfileData;
        }

        const isVerified = finalProfile.verification_status === 'verified';

        // 4. Update application session state
        performLogin({
          id: user.id,
          official_email: finalProfile.institutional_email || '',
          personal_email: userEmail,
          full_name: finalProfile.full_name || user.user_metadata?.full_name || userEmail.split('@')[0],
          avatar_url: finalProfile.avatar_url || user.user_metadata?.avatar_url,
          branch: finalProfile.branch || 'First Year Basic Sciences',
          year: finalProfile.year || 1,
          credit_balance: finalProfile.credit_balance || 0,
          verification_status: finalProfile.verification_status || 'pending'
        });

        // 5. Route to marketplace or student verification
        if (isVerified) {
          showToast(`Welcome back, ${finalProfile.full_name}!`);
          navigate('/dashboard/feed', { replace: true });
        } else {
          showToast('Google account linked! Please verify your MVJCE student status to access the marketplace.');
          navigate('/verify', { replace: true });
        }
      } catch (err) {
        console.error('Unexpected OAuth callback exception:', err);
        setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
        setTimeout(() => navigate('/auth', { replace: true }), 2500);
      }
    }

    handleAuth();
  }, [navigate, performLogin, showToast]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-card max-w-sm w-full space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#002147] text-white flex items-center justify-center mx-auto shadow-subtle">
          <BookOpen className="w-6 h-6" />
        </div>

        {errorMessage ? (
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              Authentication Notice
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/auth', { replace: true })}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 pt-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">
              Establishing Secure Session
            </h2>
            <p className="text-xs text-slate-500">
              Validating Google credentials and student profile...
            </p>
            <RefreshCw className="w-5 h-5 text-[#002147] animate-spin mx-auto pt-2" />
          </div>
        )}
      </div>
    </div>
  );
}
