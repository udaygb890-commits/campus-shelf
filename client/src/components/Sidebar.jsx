import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  PlusCircle, 
  Search, 
  Layers, 
  Clock, 
  MessageSquare, 
  Inbox, 
  Wallet, 
  User, 
  LogOut,
  ChevronRight
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

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const activeChatCount = chats.filter(c => c.status === 'active').length;

  const NAV_SECTIONS = [
    {
      title: 'Marketplace',
      items: [
        { id: 'feed', path: '/dashboard/feed', label: 'Browse Feed', icon: Search },
      ],
    },
    {
      title: 'My Shelf',
      items: [
        { id: 'active_listings', path: '/dashboard/active-listings', label: 'Active Listings', icon: Layers },
        { id: 'my_library', path: '/dashboard/library', label: 'My Library', icon: BookOpen },
        { id: 'history', path: '/dashboard/history', label: 'Exchange History', icon: Clock },
      ],
    },
    {
      title: 'Communications',
      items: [
        { 
          id: 'chat', 
          path: '/dashboard/chat', 
          label: 'Messages', 
          icon: MessageSquare,
          badge: activeChatCount > 0 ? activeChatCount : null,
          badgeColor: 'bg-indigo-500 text-white'
        },
        { 
          id: 'pending_requests', 
          path: '/dashboard/requests', 
          label: 'Swap Requests', 
          icon: Inbox,
          badge: pendingCount > 0 ? pendingCount : null,
          badgeColor: 'bg-amber-400 text-slate-950 font-semibold'
        },
      ],
    },
    {
      title: 'Account',
      items: [
        { 
          id: 'credits', 
          path: '/dashboard/credits', 
          label: 'Credits & Ledger', 
          icon: Wallet,
          badge: `${currentUser?.credit_balance ?? 0} Credits`,
          badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700 text-[10px]'
        },
        { id: 'profile', path: '/dashboard/profile', label: 'Profile & Settings', icon: User },
      ],
    },
  ];

  const isItemActive = (item) => {
    if (currentView) return currentView === item.id;
    if (location.pathname === item.path) return true;
    if (item.id === 'chat' && location.pathname.startsWith('/dashboard/chat')) return true;
    return false;
  };

  const handleNav = (item) => {
    if (setCurrentView) setCurrentView(item.id);
    navigate(item.path);
  };

  return (
    <aside className="w-full h-full bg-[#0A1628] text-slate-300 flex flex-col flex-shrink-0 overflow-hidden select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div 
          onClick={() => {
            if (setCurrentView) setCurrentView('feed');
            navigate('/dashboard/feed');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
            <BookOpen className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-white">CampusShelf</span>
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">MVJCE</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">Peer Textbook Exchange</span>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => {
            if (isGuest) {
              alert('Please sign in with your MVJCE email to list or sell books.');
              return;
            }
            setIsListModalOpen(true);
          }}
          className="mt-4 w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 text-white font-medium text-xs border border-white/10 flex items-center justify-center gap-2 transition-all shadow-subtle"
        >
          <PlusCircle className="w-3.5 h-3.5 stroke-[2.2] text-indigo-400" />
          <span>List a Textbook</span>
        </button>
      </div>

      {/* Navigation Stack */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto no-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
              {section.title}
            </p>
            {section.items.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Info & Log Out Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {!isGuest && currentUser && (
          <div 
            onClick={() => {
              if (setCurrentView) setCurrentView('profile');
              navigate('/dashboard/profile');
            }}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer mb-1 group"
          >
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
              alt={currentUser.full_name || 'User'}
              className="w-7 h-7 rounded-full object-cover border border-slate-700 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate group-hover:text-indigo-300 transition-colors">
                {currentUser.full_name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser.branch ? currentUser.branch.split('(')[0].trim() : 'MVJCE Student'} • Yr {currentUser.year || 1}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
          </div>
        )}

        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
