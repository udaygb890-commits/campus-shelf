import React, { createContext, useContext, useState, useEffect } from 'react';
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

const CampusShelfContext = createContext();

export function CampusShelfProvider({ children }) {
  // Load state from localStorage or initial dummy data
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cs_user_data');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('cs_is_guest') === 'true';
  });

  const [listings, setListings] = useState(() => {
    const saved = localStorage.getItem('cs_listings');
    return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
  });

  const [library, setLibrary] = useState(() => {
    const saved = localStorage.getItem('cs_library');
    return saved ? JSON.parse(saved) : INITIAL_LIBRARY;
  });

  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('cs_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('cs_chats');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [activeChatId, setActiveChatId] = useState('chat_301');

  const [ledgers, setLedgers] = useState(() => {
    const saved = localStorage.getItem('cs_ledgers');
    return saved ? JSON.parse(saved) : INITIAL_LEDGERS;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('cs_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage
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
  }, [isGuest]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add listing
  const addListing = (newListing) => {
    const listingWithDefaults = {
      id: `list_${Date.now()}`,
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

    // If it was a swap listing, reward 1 token under approved credit rules
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

  // Add to library
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

  // Accept request -> Create chat atomically + reserve listing
  const acceptRequest = (requestId) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // 1. Mark request accepted
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r));

    // 2. Reserve listing
    setListings(prev => prev.map(l => l.id === req.listing_id ? { ...l, status: 'reserved' } : l));

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
        last_message: `Swap request accepted for ${req.listing_title}! Let's meet at ${req.handoff_spot}.`,
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

  // Decline request
  const declineRequest = (requestId) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
    showToast('Request politely declined');
  };

  // Send chat message
  const sendMessage = (chatId, text) => {
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
  };

  // Confirm Swap / Complete Transaction
  const confirmSwap = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.status === 'completed') return;

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    // 1. Mark chat completed
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, status: 'completed' } : c));

    // 2. Mark listing completed
    setListings(prev => prev.map(l => l.id === chat.listing_id ? { ...l, status: 'completed' } : l));

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

  // Update profile
  const updateProfile = (fields) => {
    setCurrentUser(prev => ({ ...prev, ...fields }));
    showToast('Profile updated successfully!');
  };

  // Logout
  const performLogout = () => {
    setIsGuest(false);
    setIsLogoutModalOpen(false);
    showToast('Signed out of CampusShelf');
  };

  return (
    <CampusShelfContext.Provider value={{
      currentUser,
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
      isLogoutModalOpen,
      setIsLogoutModalOpen,
      addListing,
      addToLibrary,
      acceptRequest,
      declineRequest,
      sendMessage,
      confirmSwap,
      updateProfile,
      performLogout,
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

