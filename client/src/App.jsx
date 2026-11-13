import React, { useState } from 'react';
import { 
  HashRouter, 
  Routes, 
  Route, 
  Navigate, 
  Outlet, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import { 
  CampusShelfProvider, 
  useCampusShelf 
} from './context/CampusShelfContext';

// Components
import Welcome from './components/Welcome';
import Register from './components/Register';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import ActiveListings from './components/ActiveListings';
import MyLibrary from './components/MyLibrary';
import History from './components/History';
import Chat from './components/Chat';
import PendingRequests from './components/PendingRequests';
import CreditsLedger from './components/CreditsLedger';
import ProfileSettings from './components/ProfileSettings';
import ListBookModal from './components/ListBookModal';
import Logout from './components/Logout';
import Toast from './components/Toast';
import NotFound from './components/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

// Icons
import { 
  BookOpen, 
  Search, 
  Plus, 
  MessageSquare, 
  User, 
  Menu, 
  X, 
  Coins, 
  ShieldCheck, 
  Bell,
  SlidersHorizontal 
} from 'lucide-react';

/**
 * Responsive Dashboard Layout containing Desktop Sidebar, Top Navigation Header & Mobile Nav
 */
function DashboardLayout() {
  const { currentUser, isGuest, setIsListModalOpen, requests } = useCampusShelf();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/active-listings')) return { section: 'My Shelf', title: 'Active Listings' };
    if (path.includes('/dashboard/library')) return { section: 'My Shelf', title: 'My Digital Library' };
    if (path.includes('/dashboard/history')) return { section: 'My Shelf', title: 'Exchange History' };
    if (path.includes('/dashboard/chat')) return { section: 'Communications', title: 'Messages & Handoffs' };
    if (path.includes('/dashboard/requests')) return { section: 'Communications', title: 'Swap Requests' };
    if (path.includes('/dashboard/credits')) return { section: 'Account', title: 'Credits & Ledger' };
    if (path.includes('/dashboard/profile')) return { section: 'Account', title: 'Profile & Settings' };
    return { section: 'Marketplace', title: 'Browse Textbooks' };
  };

  const breadcrumb = getBreadcrumb();
  const isChatRoute = location.pathname.startsWith('/dashboard/chat');

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/chat')) return 'chat';
    if (path.includes('/dashboard/profile')) return 'profile';
    return 'feed';
  };

  const activeTab = getActiveTab();

  return (
    <div className="h-screen h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden bg-slate-50 text-slate-900">
      {/* Mobile Top Header */}
      <header className="md:hidden h-14 flex-shrink-0 bg-[#0A1628] text-white px-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 shadow-subtle">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          aria-label="Toggle mobile navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div 
          onClick={() => navigate('/dashboard/feed')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Campus<span className="text-indigo-400">Shelf</span></span>
        </div>

        <button
          onClick={() => navigate('/dashboard/profile')}
          className="w-7 h-7 rounded-full overflow-hidden border border-slate-700"
          aria-label="Profile settings"
        >
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
            alt=""
            className="w-full h-full object-cover"
          />
        </button>
      </header>

      {/* Mobile Collapsible Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/70 md:hidden flex animate-in fade-in duration-200" 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="w-64 bg-[#0A1628] h-full shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <Sidebar setCurrentView={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:flex md:w-64 h-full flex-col flex-shrink-0 bg-[#0A1628] border-r border-slate-800 overflow-hidden">
        <Sidebar />
      </div>

      {/* Main Fluid Application Shell */}
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-14 flex-shrink-0 bg-white border-b border-slate-200 px-6 items-center justify-between z-20 shadow-subtle">
          {/* Breadcrumb Context */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">{breadcrumb.section}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">{breadcrumb.title}</span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            {/* Campus Verified Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>MVJCE Campus Network</span>
            </div>

            {/* Credit Wallet Pill */}
            {!isGuest && (
              <button
                onClick={() => navigate('/dashboard/credits')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 text-indigo-800 text-xs font-medium border border-indigo-100 hover:bg-indigo-100 transition-colors"
                title="View Credits & Wallet Ledger"
              >
                <Coins className="w-3.5 h-3.5 text-indigo-600" />
                <span>{currentUser?.credit_balance ?? 0} Credits</span>
              </button>
            )}

            {/* List Book Primary Action */}
            <button
              onClick={() => {
                if (isGuest) {
                  alert('Please sign in with your MVJCE email to list a book.');
                  return;
                }
                setIsListModalOpen(true);
              }}
              className="app-btn-primary py-1.5 px-3 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List Book</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className={`flex-1 min-h-0 w-full flex flex-col ${
          isChatRoute 
            ? 'overflow-hidden p-2.5 sm:p-4 lg:p-5 pb-16 md:pb-5' 
            : 'overflow-y-auto pb-20 md:pb-8'
        }`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Fixed Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-subtle">
        <button
          onClick={() => navigate('/dashboard/feed')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'feed' ? 'text-indigo-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Browse</span>
        </button>

        <button
          onClick={() => {
            if (isGuest) {
              alert('Please sign in with your MVJCE email to list a book.');
              return;
            }
            setIsListModalOpen(true);
          }}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-700"
        >
          <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>List</span>
        </button>

        <button
          onClick={() => navigate('/dashboard/chat')}
          className={`relative flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'chat' ? 'text-indigo-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messages</span>
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          onClick={() => navigate('/dashboard/profile')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'profile' ? 'text-indigo-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CampusShelfProvider>
        <HashRouter>
          <Routes>
            {/* Public Entry & Authentication */}
            <Route path="/" element={<Welcome />} />
            <Route path="/welcome" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Authenticated / Guest Dashboard Sub-Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Navigate to="feed" replace />} />
              <Route path="feed" element={<Feed />} />
              <Route path="active-listings" element={<ActiveListings />} />
              <Route path="library" element={<MyLibrary />} />
              <Route path="history" element={<History />} />
              <Route path="chat" element={<Chat />} />
              <Route path="chat/:chatId" element={<Chat />} />
              <Route path="requests" element={<PendingRequests />} />
              <Route path="credits" element={<CreditsLedger />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Global Modals & Notifications */}
          <ListBookModal />
          <Logout />
          <Toast />
        </HashRouter>
      </CampusShelfProvider>
    </ErrorBoundary>
  );
}
