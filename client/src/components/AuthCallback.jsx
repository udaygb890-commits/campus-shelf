import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, BookOpen } from 'lucide-react';
import { supabase, isConfigured } from '../lib/supabase';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { performLogin, showToast } = useCampusShelf();

  useEffect(() => {
    async function handleAuth() {
      if (!isConfigured) {
        navigate('/dashboard/feed');
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
          performLogin({
            id: session.user.id,
            official_email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
          });
          showToast('Successfully authenticated with Google!');
          navigate('/dashboard/feed');
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
          Completing Student Sign-In
        </h2>
        <p className="text-xs text-slate-500">
          Verifying your institutional credentials with MVJCE directory...
        </p>
        <RefreshCw className="w-5 h-5 text-[#002147] animate-spin mx-auto pt-1" />
      </div>
    </div>
  );
}
