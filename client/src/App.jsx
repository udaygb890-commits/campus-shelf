import React, { useState } from 'react';
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

// Mobile Navigation primitives
import { BookOpen, Search, PlusCircle, MessageSquare, User, Menu, X } from 'lucide-react';

function CampusShelfApp() {
  const { currentUser, isGuest, setIsListModalOpen, requests, chats } = useCampusShelf();

  // Root view: 'welcome' | 'register' | 'auth' | 'onboarding' | 'dashboard'
  const [rootRoute, setRootRoute] = useState('welcome');

  // Sub-view in dashboard: 'feed' | 'active_listings' | 'my_library' | 'history' | 'chat' | 'pending_requests' | 'credits' | 'profile'
  const [dashboardView, setDashboardView] = useState('feed');

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  const navigateTo = (view) => {
    if (view === 'guest') {
      setRootRoute('dashboard');
      setDashboardView('feed');
      return;
    }
    if (['welcome', 'register', 'auth', 'onboarding'].includes(view)) {
      setRootRoute(view);
      return;
    }
    // Otherwise it's a dashboard view
    setRootRoute('dashboard');
    setDashboardView(view);
    setIsMobileMenuOpen(false);
  };

  // Render standalone auth flows
  if (rootRoute === 'welcome') {
    return <Welcome onNavigate={navigateTo} />;
  }
  if (rootRoute === 'register') {
    return <Register onNavigate={navigateTo} />;
  }
  if (rootRoute === 'auth') {
    return <Auth onNavigate={navigateTo} />;
  }
  if (rootRoute === 'onboarding') {
    return <Onboarding onNavigate={navigateTo} />;
  }

  // Dashboard layout
  return (
    <div className="min-h-screen campus-canvas flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#002147] text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10 sticky top-0 z-30 shadow-md">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div 
          onClick={() => setDashboardView('feed')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">Campus<span className="text-indigo-400">Shelf</span></span>
        </div>

        <button
          onClick={() => setDashboardView('profile')}
          className="w-8 h-8 rounded-full overflow-hidden border border-indigo-400/40"
        >
          <img
            src={currentUser.avatar_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </button>
      </header>

      {/* Mobile Collapsible Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden flex" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-72 bg-[#002147] h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <Sidebar currentView={dashboardView} setCurrentView={navigateTo} />
          </div>
        </div>
      )}

      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar currentView={dashboardView} setCurrentView={navigateTo} />
      </div>

      {/* Main Fluid Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-6">
        {dashboardView === 'feed' && <Feed onOpenChat={() => setDashboardView('chat')} />}
        {dashboardView === 'active_listings' && <ActiveListings />}
        {dashboardView === 'my_library' && <MyLibrary />}
        {dashboardView === 'history' && <History />}
        {dashboardView === 'chat' && <Chat />}
        {dashboardView === 'pending_requests' && (
          <PendingRequests onOpenChat={() => setDashboardView('chat')} />
        )}
        {dashboardView === 'credits' && <CreditsLedger />}
        {dashboardView === 'profile' && <ProfileSettings />}
      </main>

      {/* Mobile Bottom Fixed Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setDashboardView('feed')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            dashboardView === 'feed' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            if (isGuest) {
              alert('Please sign in to list a book.');
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
          onClick={() => setDashboardView('chat')}
          className={`relative flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            dashboardView === 'chat' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat</span>
          {pendingRequestsCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          onClick={() => setDashboardView('profile')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            dashboardView === 'profile' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* Global Modals & Notifications */}
      <ListBookModal />
      <Logout onConfirmLogout={() => setRootRoute('welcome')} />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <CampusShelfProvider>
      <CampusShelfApp />
    </CampusShelfProvider>
  );
}

