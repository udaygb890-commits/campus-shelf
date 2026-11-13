import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  PlusCircle, 
  Search, 
  BookMarked, 
  MessageSquare, 
  Wallet, 
  User, 
  LogOut, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Inbox,
  Clock,
  Layers,
  Coins
} from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function Sidebar({ currentView, setCurrentView }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    currentUser, 
    requests, 
    chats, 
    setIsListModalOpen, 
    setIsLogoutModalOpen,
    isGuest 
  } = useCampusShelf();

  // Accordion toggle states
  const [isMyBooksOpen, setIsMyBooksOpen] = useState(true);
  const [isChatsOpen, setIsChatsOpen] = useState(true);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const activeChatCount = chats.filter(c => c.status === 'active').length;

  const VIEW_TO_PATH = {
    feed: '/dashboard/feed',
    active_listings: '/dashboard/active-listings',
    my_library: '/dashboard/library',
    history: '/dashboard/history',
    chat: '/dashboard/chat',
    pending_requests: '/dashboard/requests',
    credits: '/dashboard/credits',
    profile: '/dashboard/profile'
  };

  const PATH_TO_VIEW = {
    '/dashboard/feed': 'feed',
    '/dashboard/active-listings': 'active_listings',
    '/dashboard/library': 'my_library',
    '/dashboard/history': 'history',
    '/dashboard/chat': 'chat',
    '/dashboard/requests': 'pending_requests',
    '/dashboard/credits': 'credits',
    '/dashboard/profile': 'profile'
  };

  const effectiveView = currentView || PATH_TO_VIEW[location?.pathname] || 'feed';

  const navigateTo = (view) => {
    if (setCurrentView) setCurrentView(view);
    const targetPath = VIEW_TO_PATH[view];
    if (targetPath && navigate && location?.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <aside className="w-full md:w-[280px] bg-[#002147] text-white flex flex-col flex-shrink-0 md:min-h-screen border-r border-white/10 shadow-2xl z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <div 
          onClick={() => navigateTo('feed')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600/90 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight block leading-tight font-sans">
              Campus<span className="text-indigo-400">Shelf</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-slate-300 font-medium">
              MVJCE Hyperlocal
            </span>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={() => {
            if (isGuest) {
              alert('Please sign in with your MVJCE email to list or sell books.');
              return;
            }
            setIsListModalOpen(true);
          }}
          className="mt-5 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm shadow-lg shadow-indigo-900/40 border border-indigo-400/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>+ List / Sell a Book</span>
        </button>
      </div>

      {/* Navigation Stack */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto no-scrollbar text-sm font-medium">
        {/* Direct Link: Browse Feed */}
        <button
          onClick={() => navigateTo('feed')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
            effectiveView === 'feed'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4 text-indigo-400" />
          <span>Browse Feed</span>
        </button>

        {/* Accordion 1: My Books */}
        <div>
          <button
            onClick={() => setIsMyBooksOpen(!isMyBooksOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookMarked className="w-4 h-4 text-emerald-400" />
              <span>My Books</span>
            </div>
            {isMyBooksOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isMyBooksOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <button
                onClick={() => navigateTo('active_listings')}
                className={`w-full text-left py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                  effectiveView === 'active_listings'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Active Listings</span>
              </button>

              <button
                onClick={() => navigateTo('my_library')}
                className={`w-full text-left py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                  effectiveView === 'my_library'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>My Library</span>
              </button>

              <button
                onClick={() => navigateTo('history')}
                className={`w-full text-left py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                  effectiveView === 'history'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Book Swapped & History</span>
              </button>
            </div>
          )}
        </div>

        {/* Accordion 2: Chats & Requests */}
        <div>
          <button
            onClick={() => setIsChatsOpen(!isChatsOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Chats & Requests</span>
            </div>
            {isChatsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isChatsOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <button
                onClick={() => navigateTo('chat')}
                className={`w-full text-left py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  effectiveView === 'chat'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Secure Messages</span>
                </div>
                {activeChatCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500 text-white">
                    {activeChatCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigateTo('pending_requests')}
                className={`w-full text-left py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  effectiveView === 'pending_requests'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Pending Swap Requests</span>
                </div>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-900 font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Accordion 3: Credits & Ledger */}
        <div>
          <button
            onClick={() => setIsCreditsOpen(!isCreditsOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>Credits & Ledger</span>
            </div>
            {isCreditsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isCreditsOpen && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <button
                onClick={() => navigateTo('credits')}
                className={`w-full text-left py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                  effectiveView === 'credits'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Credit Balance ({currentUser.credit_balance})</span>
              </button>

              <button
                onClick={() => navigateTo('credits')}
                className={`w-full text-left py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                  effectiveView === 'credits'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Transaction History</span>
              </button>
            </div>
          )}
        </div>

        {/* Direct Link: Profile & Settings */}
        <button
          onClick={() => navigateTo('profile')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
            effectiveView === 'profile'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 text-purple-400" />
          <span>My Profile & Settings</span>
        </button>
      </nav>

      {/* User Info & Log Out Footer */}
      <div className="p-4 border-t border-white/10 bg-[#001733]/60">
        {!isGuest && (
          <div className="flex items-center gap-2.5 mb-3 px-2">
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-full object-cover border border-indigo-400/40"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{currentUser.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.branch.split('(')[0]}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
