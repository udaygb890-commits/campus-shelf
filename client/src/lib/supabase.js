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

export async function signUpUser({ email, password, fullName, phone }) {
  if (!isConfigured) {
    return {
      data: {
        user: {
          id: `usr_${Date.now()}`,
          email,
          user_metadata: { full_name: fullName, phone }
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
      },
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
      redirectTo: `${window.location.origin}/#/dashboard/feed`,
      queryParams: {
        hd: 'mvjce.edu.in', // Request institutional domain restriction
      },
    },
  });
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

