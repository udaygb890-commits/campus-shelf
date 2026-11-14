/**
 * Supabase Client & Service Integration Layer for CampusShelf
 * Supports:
 * - Supabase Authentication (Email/Password, Google OAuth, Phone OTP)
 * - PostgreSQL CRUD with Row-Level Security (profiles, listings, library, requests, chats, messages, ledgers)
 * - Realtime Subscriptions
 * - Storage Buckets (book-covers, avatars)
 * - Resilient Offline / Demo Mode fallback for unconfigured environments
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://campus-shelf-mvjce.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_campus_shelf_mvjce';

// Detect whether credentials are real or placeholder
export const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('dummy') && 
  !supabaseAnonKey.includes('dummy') &&
  supabaseUrl.startsWith('https://')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/* =========================================================================
   AUTH SERVICES
   ========================================================================= */

export async function signUpUser({ email, password, fullName, phone, branch, year }) {
  if (!isConfigured) {
    return {
      data: {
        user: {
          id: `usr_${Date.now()}`,
          email,
          user_metadata: { full_name: fullName, phone, branch, year }
        },
        session: { access_token: `mock_token_${Date.now()}` }
      },
      error: null
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phone,
        branch: branch || 'Computer Science & Engineering',
        year: year || 1,
      },
      emailRedirectTo: `${window.location.origin}${window.location.pathname}#/dashboard/feed`,
    },
  });

  return { data, error };
}

export async function signInUser({ email, password }) {
  if (!isConfigured) {
    return {
      data: {
        user: {
          id: 'usr_mvjce_001',
          email,
          user_metadata: { full_name: 'Rahul Varma' }
        },
        session: { access_token: `mock_token_${Date.now()}` }
      },
      error: null
    };
  }

  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  if (!isConfigured) {
    return {
      data: { url: null, provider: 'google' },
      error: null
    };
  }

  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}${window.location.pathname}#/auth/callback`,
      queryParams: {
        hd: 'mvjce.edu.in', // Request institutional domain restriction
        prompt: 'select_account',
      },
    },
  });
}

export async function resetPassword(email) {
  if (!isConfigured) {
    return { data: { message: 'Reset email simulated' }, error: null };
  }
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${window.location.pathname}#/auth/reset-password`,
  });
}

export async function updatePassword(newPassword) {
  if (!isConfigured) {
    return { data: { message: 'Password updated successfully' }, error: null };
  }
  return await supabase.auth.updateUser({ password: newPassword });
}

/* =========================================================================
   STUDENT VERIFICATION SERVICES
   ========================================================================= */

export async function requestInstitutionalVerification(institutionalEmail, code, expiresAt) {
  if (!isConfigured) {
    return { data: { success: true, simulated: true, code }, error: null };
  }

  // 1. Attempt server-side RPC validation
  const { data, error } = await supabase.rpc('request_institutional_verification', {
    p_institutional_email: institutionalEmail,
    p_code: code,
    p_expires_at: expiresAt
  });

  if (!error) {
    return { data, error: null };
  }

  // Fallback direct table update if RPC migration not executed yet
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('User not authenticated') };

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      institutional_email: institutionalEmail,
      verification_status: 'email_verification_sent',
      verification_code: code,
      verification_expires_at: expiresAt,
      verification_method: 'outlook_otp',
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  return { data: { success: !updateError }, error: updateError };
}

export async function verifyInstitutionalCode(code) {
  if (!isConfigured) {
    return { data: { success: true, simulated: true }, error: null };
  }

  // 1. Attempt server-side RPC validation
  const { data, error } = await supabase.rpc('verify_institutional_code', {
    p_code: code
  });

  if (!error && data?.success) {
    return { data, error: null };
  }

  // Fallback direct table verification
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('User not authenticated') };

  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_code, verification_expires_at')
    .eq('id', user.id)
    .single();

  if (profile?.verification_code === code) {
    const { error: markError } = await supabase
      .from('profiles')
      .update({
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        verification_code: null
      })
      .eq('id', user.id);

    return { data: { success: !markError }, error: markError };
  }

  return { data: null, error: new Error('Invalid verification code entered.') };
}

export async function requestManualVerification({ institutionalEmail, usn, notes, proofUrl }) {
  if (!isConfigured) {
    return { data: { success: true, simulated: true }, error: null };
  }

  const { data, error } = await supabase.rpc('request_manual_student_review', {
    p_institutional_email: institutionalEmail,
    p_usn: usn || '',
    p_notes: notes || '',
    p_id_proof_url: proofUrl || null
  });

  if (!error) return { data, error: null };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('User not authenticated') };

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      institutional_email: institutionalEmail,
      usn: usn,
      manual_review_notes: notes,
      verification_status: 'manual_review',
      verification_method: 'admin_manual',
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  return { data: { success: !updateError }, error: updateError };
}

export async function sendPhoneOtp(phone) {
  if (!isConfigured) {
    return { data: { message: 'OTP Sent' }, error: null };
  }

  return await supabase.auth.signInWithOtp({
    phone: phone.startsWith('+') ? phone : `+91${phone}`,
  });
}

export async function verifyPhoneOtp(phone, token) {
  if (!isConfigured) {
    return {
      data: {
        user: { id: `usr_${Date.now()}`, phone },
        session: { access_token: `mock_token_${Date.now()}` }
      },
      error: null
    };
  }

  return await supabase.auth.verifyOtp({
    phone: phone.startsWith('+') ? phone : `+91${phone}`,
    token,
    type: 'sms',
  });
}

export async function signOutUser() {
  if (!isConfigured) {
    return { error: null };
  }
  return await supabase.auth.signOut();
}

export async function getSession() {
  if (!isConfigured) {
    return { data: { session: null }, error: null };
  }
  return await supabase.auth.getSession();
}

export function onAuthChange(callback) {
  if (!isConfigured) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
}

/* =========================================================================
   DATABASE SERVICES (CRUD)
   ========================================================================= */

// Profiles
export async function getProfile(userId) {
  if (!isConfigured) return { data: null, error: null };
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
}

export async function upsertProfile(profile) {
  if (!isConfigured) return { data: profile, error: null };
  return await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();
}

// Listings
export async function fetchListings() {
  if (!isConfigured) return { data: null, error: null };
  return await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });
}

export async function createListing(listing) {
  if (!isConfigured) return { data: listing, error: null };
  return await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single();
}

export async function updateListing(id, updates) {
  if (!isConfigured) return { data: { id, ...updates }, error: null };
  return await supabase
    .from('listings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}

export async function deleteListing(id) {
  if (!isConfigured) return { error: null };
  return await supabase
    .from('listings')
    .delete()
    .eq('id', id);
}

// Requests
export async function fetchRequests(userId) {
  if (!isConfigured) return { data: null, error: null };
  return await supabase
    .from('requests')
    .select('*')
    .or(`owner_id.eq.${userId},requester_id.eq.${userId}`)
    .order('created_at', { ascending: false });
}

export async function createRequest(request) {
  if (!isConfigured) return { data: request, error: null };
  return await supabase
    .from('requests')
    .insert(request)
    .select()
    .single();
}

export async function updateRequestStatus(id, status) {
  if (!isConfigured) return { data: { id, status }, error: null };
  return await supabase
    .from('requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}

// Accept Request via RPC
export async function acceptRequestRPC(requestId) {
  if (!isConfigured) return { data: `chat_${Date.now()}`, error: null };
  return await supabase.rpc('accept_request', { p_request_id: requestId });
}

// Chats & Messages
export async function fetchChats(userId) {
  if (!isConfigured) return { data: null, error: null };
  return await supabase
    .from('chats')
    .select('*, messages(*)')
    .or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`)
    .order('created_at', { ascending: false });
}

export async function sendMessage({ chatId, senderId, content, messageType = 'text' }) {
  if (!isConfigured) {
    return {
      data: {
        id: `msg_${Date.now()}`,
        chat_id: chatId,
        sender_id: senderId,
        content,
        message_type: messageType,
        created_at: new Date().toISOString(),
      },
      error: null
    };
  }

  return await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      content,
      message_type: messageType,
    })
    .select()
    .single();
}

export function subscribeToChatMessages(chatId, onNewMessage) {
  if (!isConfigured) {
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel(`chat_${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// Library
export async function fetchLibrary(userId) {
  if (!isConfigured) return { data: null, error: null };
  return await supabase
    .from('library')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function addLibraryItem(item) {
  if (!isConfigured) return { data: item, error: null };
  return await supabase
    .from('library')
    .insert(item)
    .select()
    .single();
}

export async function removeLibraryItem(id) {
  if (!isConfigured) return { error: null };
  return await supabase
    .from('library')
    .delete()
    .eq('id', id);
}

// Ledgers
export async function fetchLedgers(userId) {
  if (!isConfigured) return { data: null, error: null };
  return await supabase
    .from('ledgers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function createLedgerEntry(entry) {
  if (!isConfigured) return { data: entry, error: null };
  return await supabase
    .from('ledgers')
    .insert(entry)
    .select()
    .single();
}

// Storage Upload Helper
export async function uploadFile(bucket, path, file) {
  if (!isConfigured) {
    // In unconfigured mode, use data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ data: { publicUrl: reader.result }, error: null });
      reader.readAsDataURL(file);
    });
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) return { data: null, error };

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return { data: { publicUrl: publicUrlData.publicUrl }, error: null };
}

