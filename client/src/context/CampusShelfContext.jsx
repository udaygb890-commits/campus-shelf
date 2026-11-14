import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  INITIAL_USER, 
  INITIAL_LISTINGS, 
  INITIAL_LIBRARY, 
  INITIAL_REQUESTS, 
  INITIAL_CHATS, 
  INITIAL_LEDGERS, 
  INITIAL_HISTORY 
} from '../data/initialData';
import confetti from 'canvas-confetti';
import { 
  supabase, 
  isConfigured, 
  signUpUser, 
  signInUser, 
  signInWithGoogle, 
  sendPhoneOtp, 
  verifyPhoneOtp, 
  signOutUser,
  resetPassword,
  updatePassword,
  requestInstitutionalVerification,
  verifyInstitutionalCode,
  requestManualVerification,
  createListing as supabaseCreateListing,
  updateListing as supabaseUpdateListing,
  deleteListing as supabaseDeleteListing,
  createRequest as supabaseCreateRequest,
  updateRequestStatus as supabaseUpdateRequestStatus,
  sendMessage as supabaseSendMessage,
  subscribeToChatMessages
} from '../lib/supabase';
import { 
  isApprovedInstitutionalDomain, 
  getApprovedDomains, 
  getDomainHelperText 
} from '../lib/institutionalConfig';

const CampusShelfContext = createContext();

export function CampusShelfProvider({ children }) {
  // 1. Session & User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_user_data');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('cs_is_guest') === 'true';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('cs_auth_state') === 'true';
  });

  // 2. Core Entities State
  const [listings, setListings] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_listings');
      return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
    } catch {
      return INITIAL_LISTINGS;
    }
  });

  const [library, setLibrary] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_library');
      return saved ? JSON.parse(saved) : INITIAL_LIBRARY;
    } catch {
      return INITIAL_LIBRARY;
    }
  });

  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_requests');
      return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
    } catch {
      return INITIAL_REQUESTS;
    }
  });

  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_chats');
      return saved ? JSON.parse(saved) : INITIAL_CHATS;
    } catch {
      return INITIAL_CHATS;
    }
  });

  const [activeChatId, setActiveChatId] = useState('chat_301');

  const [ledgers, setLedgers] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_ledgers');
      return saved ? JSON.parse(saved) : INITIAL_LEDGERS;
    } catch {
      return INITIAL_LEDGERS;
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('cs_history');
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });

  // 3. UI Modals & Feedback
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedBookForListing, setSelectedBookForListing] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync state to localStorage for persistence
  useEffect(() => {
    localStorage.setItem('cs_user_data', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cs_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('cs_library', JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    localStorage.setItem('cs_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('cs_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('cs_ledgers', JSON.stringify(ledgers));
  }, [ledgers]);

  useEffect(() => {
    localStorage.setItem('cs_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('cs_is_guest', String(isGuest));
    localStorage.setItem('cs_auth_state', String(isAuthenticated));
  }, [isGuest, isAuthenticated]);

  const [isAuthLoading, setIsAuthLoading] = useState(isConfigured);

  // Supabase Auth State Change & Session Restoration
  useEffect(() => {
    if (!isConfigured) {
      setIsAuthLoading(false);
      return;
    }

    // 1. Initial Session Retrieval
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setIsGuest(false);
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setCurrentUser(prev => ({ ...prev, ...profile }));
          } else {
            // Profile fallback if trigger delayed or OAuth first sign-in
            const isInst = isApprovedInstitutionalDomain(session.user.email);
            const newProfile = {
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
              college_email: session.user.email,
              personal_email: session.user.email,
              institutional_email: isInst ? session.user.email : null,
              branch: session.user.user_metadata?.branch || 'First Year Basic Sciences',
              year: Number(session.user.user_metadata?.year) || 1,
              credit_balance: isInst ? 1 : 0,
              campus_zone: 'Day Scholar',
              default_handoff: 'ECE Block Lobby',
              role: 'student',
              verification_status: isInst ? 'verified' : 'pending',
              verification_method: isInst ? 'domain_sso' : null,
              verified_at: isInst ? new Date().toISOString() : null,
            };
            await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' }).catch(() => {});
            setCurrentUser(prev => ({ ...prev, ...newProfile }));
          }
        } catch (err) {
          console.warn('Profile sync error:', err);
        }
      }
      setIsAuthLoading(false);
    });

    // 2. Real-time Auth Event Subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setIsAuthenticated(true);
          setIsGuest(false);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setCurrentUser(prev => ({ ...prev, ...profile }));
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsGuest(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  /* =========================================================================
     LISTING OPERATIONS
     ========================================================================= */

  const addListing = async (newListing) => {
    const listingId = `list_${Date.now()}`;
    const listingWithDefaults = {
      id: listingId,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_branch: currentUser.branch.includes('ECE') ? 'ECE' : 'MVJCE',
      user_year: `${currentUser.year}${currentUser.year === 1 ? 'st' : currentUser.year === 2 ? 'nd' : currentUser.year === 3 ? 'rd' : 'th'} Year`,
      user_avatar: currentUser.avatar_url,
      views: 1,
      status: 'available',
      created_at: new Date().toISOString(),
      ...newListing
    };

    setListings(prev => [listingWithDefaults, ...prev]);

    // Backend sync
    await supabaseCreateListing(listingWithDefaults).catch(console.error);

    // Reward token for swap listings
    if (newListing.exchange_type === 'swap') {
      const newLedger = {
        id: `led_${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' - ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'credit',
        description: `Earned 1 Credit Token for listing '${newListing.title}' (Swap)`,
        amount_text: '+1 Token',
        amount_color: 'text-emerald-600',
        status: 'Verified & Cleared',
        raw_amount: 1
      };
      setLedgers(prev => [newLedger, ...prev]);
      setCurrentUser(prev => ({
        ...prev,
        credit_balance: prev.credit_balance + 1
      }));
    }

    showToast(`"${newListing.title}" published to MVJCE feed!`);
    return listingWithDefaults;
  };

  const updateListing = async (id, updates) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    await supabaseUpdateListing(id, updates).catch(console.error);
    showToast(`Updated "${updates.title || 'listing'}"`);
  };

  const deleteListing = async (id) => {
    const target = listings.find(l => l.id === id);
    setListings(prev => prev.filter(l => l.id !== id));
    await supabaseDeleteListing(id).catch(console.error);
    showToast(`Listing "${target?.title || ''}" removed`);
  };

  /* =========================================================================
     LIBRARY OPERATIONS
     ========================================================================= */

  const addToLibrary = (book) => {
    const newBook = {
      id: `lib_${Date.now()}`,
      user_id: currentUser.id,
      created_at: new Date().toISOString(),
      ...book
    };
    setLibrary(prev => [newBook, ...prev]);
    showToast(`Added "${book.title}" to your digital shelf`);
    return newBook;
  };

  const removeFromLibrary = (id) => {
    setLibrary(prev => prev.filter(b => b.id !== id));
    showToast('Book removed from digital library');
  };

  const openListFromLibrary = (book) => {
    setSelectedBookForListing(book);
    setIsListModalOpen(true);
  };

  /* =========================================================================
     REQUEST & EXCHANGE WORKFLOWS (CRITICAL FIX FOR PROPOSALS)
     ========================================================================= */

  const createRequest = async ({ listing, offerType, cashAmount, handoffSpot, offeredListingId = null }) => {
    if (!currentUser?.id) {
      showToast('Please sign in to send an exchange request.');
      return null;
    }

    if (listing.user_id === currentUser.id) {
      showToast('You cannot propose an exchange on your own listing.');
      return null;
    }

    // Check duplicate pending request
    const existing = requests.find(
      r => r.listing_id === listing.id && r.requester_id === currentUser.id && r.status === 'pending'
    );
    if (existing) {
      showToast('You already have a pending proposal for this textbook.');
      return existing;
    }

    const newRequest = {
      id: `req_${Date.now()}`,
      listing_id: listing.id,
      listing_title: listing.title,
      listing_image: listing.image_url,
      owner_id: listing.user_id,
      requester_id: currentUser.id,
      requester_name: currentUser.full_name,
      requester_branch: currentUser.branch.includes('ECE') ? 'ECE' : 'MVJCE',
      requester_year: `${currentUser.year}${currentUser.year === 1 ? 'st' : currentUser.year === 2 ? 'nd' : currentUser.year === 3 ? 'rd' : 'th'} Year`,
      requester_avatar: currentUser.avatar_url,
      offer_type: offerType, // 'swap_credit' | 'swap_book' | 'cash'
      offered_listing_id: offeredListingId,
      offered_item_name: offerType === 'swap_credit' ? '1 Credit Token' : (offerType === 'cash' ? `Cash ₹${cashAmount}` : 'Textbook Swap'),
      offer_amount_inr: offerType === 'cash' ? Number(cashAmount) : 0,
      handoff_spot: handoffSpot,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setRequests(prev => [newRequest, ...prev]);
    await supabaseCreateRequest(newRequest).catch(console.error);

    showToast(`Swap proposal sent to ${listing.user_name}!`);
    return newRequest;
  };

  const acceptRequest = (requestId) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // 1. Mark request accepted
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r));
    supabaseUpdateRequestStatus(requestId, 'accepted').catch(console.error);

    // 2. Reserve listing
    setListings(prev => prev.map(l => l.id === req.listing_id ? { ...l, status: 'reserved' } : l));
    supabaseUpdateListing(req.listing_id, { status: 'reserved' }).catch(console.error);

    // 3. Create or find chat
    const existingChat = chats.find(c => c.request_id === requestId);
    let chatId = existingChat ? existingChat.id : `chat_${Date.now()}`;

    if (!existingChat) {
      const newChat = {
        id: chatId,
        request_id: requestId,
        listing_id: req.listing_id,
        listing_title: req.listing_title,
        partner_id: req.requester_id,
        partner_name: req.requester_name,
        partner_branch: req.requester_branch,
        partner_year: req.requester_year,
        partner_avatar: req.requester_avatar,
        handoff_spot: req.handoff_spot,
        status: 'active',
        last_message: `Swap request accepted for ${req.listing_title}! Meet at ${req.handoff_spot}.`,
        last_message_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: false,
        messages: [
          {
            id: `msg_sys_${Date.now()}`,
            sender_id: 'system',
            sender_name: 'CampusShelf SafeBot',
            text: `📍 Handoff Locked at MVJCE Landmark: ${req.handoff_spot}. Contact info is masked for your security.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            is_me: false,
            is_system: true
          },
          {
            id: `msg_acc_${Date.now()}`,
            sender_id: currentUser.id,
            sender_name: currentUser.full_name,
            text: `Hi ${req.requester_name}! I accepted your offer for "${req.listing_title}". Are you around ${req.handoff_spot}?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            is_me: true
          }
        ]
      };
      setChats(prev => [newChat, ...prev]);
    }

    setActiveChatId(chatId);
    showToast(`Request accepted! Chat created with ${req.requester_name}`);
    return chatId;
  };

  const declineRequest = (requestId) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'declined' } : r));
    supabaseUpdateRequestStatus(requestId, 'declined').catch(console.error);
    showToast('Request politely declined');
  };

  /* =========================================================================
     MESSAGING & REALTIME
     ========================================================================= */

  const sendMessage = async (chatId, text) => {
    if (!text.trim()) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `msg_${Date.now()}`,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      text: text.trim(),
      time: timeStr,
      is_me: true
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          last_message: text.trim(),
          last_message_time: timeStr,
          messages: [...chat.messages, newMsg]
        };
      }
      return chat;
    }));

    // Realtime Supabase broadcast
    await supabaseSendMessage({
      chatId,
      senderId: currentUser.id,
      content: text.trim(),
    }).catch(console.error);
  };

  const confirmSwap = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.status === 'completed') return;

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    // 1. Mark chat completed
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, status: 'completed' } : c));

    // 2. Mark listing completed
    setListings(prev => prev.map(l => l.id === chat.listing_id ? { ...l, status: 'completed' } : l));
    supabaseUpdateListing(chat.listing_id, { status: 'completed' }).catch(console.error);

    // 3. Add to ledger
    const newLedger = {
      id: `led_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' - ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'credit',
      description: `Completed Swap for '${chat.listing_title}' with ${chat.partner_name}`,
      amount_text: '+1 Token',
      amount_color: 'text-emerald-600',
      status: 'Verified & Cleared',
      raw_amount: 1
    };
    setLedgers(prev => [newLedger, ...prev]);

    // 4. Add to history
    const newHistory = {
      id: `hist_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      book_title: chat.listing_title,
      book_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80',
      counterparty_name: chat.partner_name,
      counterparty_dept: `${chat.partner_branch}, ${chat.partner_year}`,
      type: 'swap',
      value_text: 'Swapped for: [Credit Token]',
      status: 'Completed'
    };
    setHistory(prev => [newHistory, ...prev]);

    // 5. Update user state
    setCurrentUser(prev => ({
      ...prev,
      credit_balance: prev.credit_balance + 1
    }));

    showToast(`🎉 Swap finalized at ${chat.handoff_spot}! Token credited.`);
  };

  /* =========================================================================
     PROFILE & AUTH WRAPPERS
     ========================================================================= */

  const updateProfile = (fields) => {
    setCurrentUser(prev => ({ ...prev, ...fields }));
    showToast('Profile updated successfully!');
  };

  const performLogin = (userData) => {
    setIsAuthenticated(true);
    setIsGuest(false);
    if (userData) {
      setCurrentUser(prev => ({ ...prev, ...userData }));
    }
  };

  const performLogout = async () => {
    setIsGuest(false);
    setIsAuthenticated(false);
    setIsLogoutModalOpen(false);
    await signOutUser().catch(console.error);
    showToast('Signed out of CampusShelf');
  };

  const sendPasswordReset = async (email) => {
    try {
      const { data, error } = await resetPassword(email);
      if (error) {
        showToast(error.message || 'Failed to send recovery link');
        return { success: false, error: error.message };
      }
      showToast(`Password recovery link sent to ${email}`);
      return { success: true };
    } catch (err) {
      showToast(err.message || 'Error sending recovery link');
      return { success: false, error: err.message };
    }
  };

  const updateStudentPassword = async (newPassword) => {
    try {
      const { data, error } = await updatePassword(newPassword);
      if (error) {
        showToast(error.message || 'Failed to update password');
        return { success: false, error: error.message };
      }
      showToast('Password updated successfully!');
      return { success: true };
    } catch (err) {
      showToast(err.message || 'Error updating password');
      return { success: false, error: err.message };
    }
  };

  /* =========================================================================
     INSTITUTIONAL STUDENT VERIFICATION
     ========================================================================= */

  const sendInstitutionalVerification = async (institutionalEmail) => {
    if (!isApprovedInstitutionalDomain(institutionalEmail)) {
      const helper = getDomainHelperText();
      showToast(`Invalid institutional email domain. ${helper}`);
      return { success: false, error: `Invalid institutional email domain. ${helper}` };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    try {
      const { data, error } = await requestInstitutionalVerification(institutionalEmail, code, expiresAt);
      if (error) {
        showToast(error.message || 'Failed to send verification code');
        return { success: false, error: error.message };
      }

      setCurrentUser(prev => ({
        ...prev,
        institutional_email: institutionalEmail,
        verification_status: 'email_verification_sent'
      }));

      if (data?.simulated || !isConfigured) {
        showToast(`Verification code sent to ${institutionalEmail}! (Dev OTP: ${code})`);
      } else {
        showToast(`Verification code sent to ${institutionalEmail}`);
      }

      return { success: true, simulatedCode: code };
    } catch (err) {
      showToast(err.message || 'Error requesting verification');
      return { success: false, error: err.message };
    }
  };

  const confirmInstitutionalCode = async (code) => {
    try {
      const { data, error } = await verifyInstitutionalCode(code);
      if (error) {
        showToast(error.message || 'Invalid or expired code');
        return { success: false, error: error.message };
      }

      setCurrentUser(prev => ({
        ...prev,
        verification_status: 'verified',
        verification_method: 'outlook_otp',
        verified_at: new Date().toISOString(),
        credit_balance: prev.credit_balance === 0 ? 1 : prev.credit_balance
      }));

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      showToast('MVJCE Student verification successful! Welcome aboard.');
      return { success: true };
    } catch (err) {
      showToast(err.message || 'Failed to verify code');
      return { success: false, error: err.message };
    }
  };

  const submitManualVerification = async ({ institutionalEmail, usn, notes, proofUrl }) => {
    try {
      const { data, error } = await requestManualVerification({ institutionalEmail, usn, notes, proofUrl });
      if (error) {
        showToast(error.message || 'Failed to submit manual review');
        return { success: false, error: error.message };
      }

      setCurrentUser(prev => ({
        ...prev,
        institutional_email: institutionalEmail,
        usn,
        manual_review_notes: notes,
        verification_status: 'manual_review',
        verification_method: 'admin_manual'
      }));

      showToast('Verification request submitted for admin review.');
      return { success: true };
    } catch (err) {
      showToast(err.message || 'Error submitting manual review');
      return { success: false, error: err.message };
    }
  };

  return (
    <CampusShelfContext.Provider value={{
      currentUser,
      setCurrentUser,
      isAuthenticated,
      setIsAuthenticated,
      isAuthLoading,
      isGuest,
      setIsGuest,
      listings,
      library,
      requests,
      chats,
      activeChatId,
      setActiveChatId,
      ledgers,
      history,
      isListModalOpen,
      setIsListModalOpen,
      selectedBookForListing,
      setSelectedBookForListing,
      openListFromLibrary,
      isLogoutModalOpen,
      setIsLogoutModalOpen,
      addListing,
      updateListing,
      deleteListing,
      addToLibrary,
      removeFromLibrary,
      createRequest,
      acceptRequest,
      declineRequest,
      sendMessage,
      confirmSwap,
      updateProfile,
      performLogin,
      performLogout,
      sendPasswordReset,
      updateStudentPassword,
      sendInstitutionalVerification,
      confirmInstitutionalCode,
      submitManualVerification,
      toastMessage,
      showToast
    }}>
      {children}
    </CampusShelfContext.Provider>
  );
}

export function useCampusShelf() {
  const context = useContext(CampusShelfContext);
  if (!context) {
    throw new Error('useCampusShelf must be used within a CampusShelfProvider');
  }
  return context;
}
