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

// Mobile Navigation primitives
import { BookOpen, Search, PlusCircle, MessageSquare, User, Menu, X } from 'lucide-react';

/**
 * Responsive Dashboard Layout containing Desktop Sidebar, Mobile Header & Bottom Navigation
 */
function DashboardLayout() {
  const { currentUser, isGuest, setIsListModalOpen, requests } = useCampusShelf();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/chat')) return 'chat';
    if (path.includes('/dashboard/profile')) return 'profile';
    if (path.includes('/dashboard/active-listings')) return 'active_listings';
    if (path.includes('/dashboard/library')) return 'library';
    return 'feed';
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen campus-canvas flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#002147] text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10 sticky top-0 z-30 shadow-md">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div 
          onClick={() => navigate('/dashboard/feed')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">Campus<span className="text-indigo-400">Shelf</span></span>
        </div>

        <button
          onClick={() => navigate('/dashboard/profile')}
          className="w-8 h-8 rounded-full overflow-hidden border border-indigo-400/40"
          aria-label="Profile settings"
        >
          <img
            src={currentUser.avatar_url}
            alt={currentUser.full_name || 'User Avatar'}
            className="w-full h-full object-cover"
          />
        </button>
      </header>

      {/* Mobile Collapsible Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden flex animate-in fade-in duration-200" 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="w-72 bg-[#002147] h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <Sidebar setCurrentView={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Fluid Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Fixed Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => navigate('/dashboard/feed')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'feed' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            if (isGuest) {
              alert('Please sign in with your MVJCE email to list a book.');
              return;
            }
            setIsListModalOpen(true);
          }}
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-indigo-600"
        >
          <div className="w-9 h-9 -mt-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 border-2 border-white">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span>List Book</span>
        </button>

        <button
          onClick={() => navigate('/dashboard/chat')}
          className={`relative flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'chat' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat</span>
          {pendingRequestsCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          onClick={() => navigate('/dashboard/profile')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'profile' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
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
