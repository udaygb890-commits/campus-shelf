import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, BookOpen } from 'lucide-react';
import { supabase, isConfigured } from '../lib/supabase';
import { isApprovedInstitutionalDomain } from '../lib/institutionalConfig';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { performLogin, showToast } = useCampusShelf();

  useEffect(() => {
    async function handleAuth() {
      if (!isConfigured) {
        navigate('/verify');
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('OAuth callback error:', error);
          showToast('Authentication callback failed. Please sign in again.');
          navigate('/auth');
          return;
        }

        if (session?.user) {
          // Check profile verification status from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const isDomainVerified = profile?.verification_status === 'verified' || isApprovedInstitutionalDomain(session.user.email);

          performLogin({
            id: session.user.id,
            official_email: profile?.institutional_email || session.user.email,
            personal_email: session.user.email,
            full_name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            verification_status: isDomainVerified ? 'verified' : (profile?.verification_status || 'pending')
          });

          if (isDomainVerified) {
            showToast('Welcome back! Verified student access granted.');
            navigate('/dashboard/feed');
          } else {
            showToast('Identity authenticated. Complete MVJCE student verification to continue.');
            navigate('/verify');
          }
        } else {
          navigate('/auth');
        }
      } catch (err) {
        console.error('Unexpected callback exception:', err);
        navigate('/auth');
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
        <h2 className="text-base font-semibold text-slate-900">
          Establishing Secure Session
        </h2>
        <p className="text-xs text-slate-500">
          Checking your institutional student verification status...
        </p>
        <RefreshCw className="w-5 h-5 text-[#002147] animate-spin mx-auto pt-1" />
      </div>
    </div>
  );
}
