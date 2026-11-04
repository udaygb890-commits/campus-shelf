import React, { useState, useMemo } from 'react';
import { Search, MapPin, SlidersHorizontal, Sparkles, X, Repeat, Banknote, ShieldCheck } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import BookGrid from './BookGrid';
import { MVJCE_LANDMARKS, MVJCE_DEPARTMENTS } from '../data/initialData';

export default function Feed({ onOpenChat }) {
  const { listings, currentUser, isGuest, requests, acceptRequest, showToast } = useCampusShelf();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [activeTag, setActiveTag] = useState('All');
  const [selectedBookForProposal, setSelectedBookForProposal] = useState(null);
  const [offerType, setOfferType] = useState('swap_credit'); // 'swap_credit' | 'swap_book' | 'cash'
  const [cashOfferAmount, setCashOfferAmount] = useState('150');
  const [proposalHandoff, setProposalHandoff] = useState('ECE Block Lobby');

  // Tag options from specification
  const TAG_PILLS = [
    'All',
    '1st Semester',
    'Maths 3rd Sem',
    'Electronics',
    'Novels',
    'Notes & PYQs'
  ];

  // Filter listings dynamically
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      if (item.status !== 'available') return false;

      // Search match
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesAuthor = item.author?.toLowerCase().includes(q);
        const matchesCode = item.subject_code?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesCode) return false;
      }

      // Year match
      if (selectedYear !== 'All') {
        const yrNum = parseInt(selectedYear, 10);
        // Approximation by semester
        const sem = item.semester;
        if (yrNum === 1 && (sem !== 1 && sem !== 2)) return false;
        if (yrNum === 2 && (sem !== 3 && sem !== 4)) return false;
        if (yrNum === 3 && (sem !== 5 && sem !== 6)) return false;
        if (yrNum === 4 && (sem !== 7 && sem !== 8)) return false;
      }

      // Dept match
      if (selectedDept !== 'All') {
        const matchesDept = (item.user_branch && item.user_branch.includes(selectedDept)) ||
                            (item.subject_code && item.subject_code.includes(selectedDept));
        if (!matchesDept) return false;
      }

      // Tag match
      if (activeTag === '1st Semester' && item.semester !== 1) return false;
      if (activeTag === 'Maths 3rd Sem' && !item.title.toLowerCase().includes('math') && item.semester !== 3) return false;
      if (activeTag === 'Electronics' && item.category !== 'Engineering Textbook' && !item.title.toLowerCase().includes('electronic')) return false;
      if (activeTag === 'Novels' && item.category !== 'General Novel') return false;
      if (activeTag === 'Notes & PYQs' && item.category !== 'Notes & PYQs') return false;

      return true;
    });
  }, [listings, searchTerm, selectedYear, selectedDept, activeTag]);

  const handleSendProposal = (e) => {
    e.preventDefault();
    if (isGuest) {
      alert('Please log in with your MVJCE email to send an exchange offer.');
      return;
    }
    if (selectedBookForProposal.user_id === currentUser.id) {
      alert('You cannot propose a swap on your own listing.');
      return;
    }

    showToast(`Swap proposal sent to ${selectedBookForProposal.user_name}!`);
    setSelectedBookForProposal(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Search & Explore Books
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified student textbooks, peer notes, and novels available for handoff at MVJCE
          </p>
        </div>

        {/* Hyperlocal pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-sm text-xs text-slate-600 self-start md:self-auto">
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-medium text-slate-800">MVJ College Campus, Whitefield</span>
        </div>
      </div>

      {/* Search & Filters Container */}
      <div className="glass-card p-4 sm:p-5 border border-white/70 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Wide Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Type a word to search (e.g. Mathematics, 18EC32, Harper Lee)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input text-sm pl-10 pr-10"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="glass-input text-xs font-medium py-2.5 px-3 bg-white/70 pr-8 cursor-pointer"
              >
                <option value="All">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="glass-input text-xs font-medium py-2.5 px-3 bg-white/70 pr-8 cursor-pointer"
              >
                <option value="All">All Depts</option>
                <option value="ECE">ECE</option>
                <option value="CSE">CSE</option>
                <option value="ISE">ISE</option>
                <option value="Mech">Mech</option>
                <option value="EEE">EEE</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tag Pills (Horizontal Scrolling Row) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {TAG_PILLS.map((tag) => {
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`py-1.5 px-4 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white/70 text-slate-600 border border-slate-200/80 hover:bg-white hover:text-indigo-600'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Book Grid */}
      <BookGrid
        listings={filteredListings}
        onSelectBook={(book) => setSelectedBookForProposal(book)}
      />

      {/* Proposal / Quick Exchange Modal */}
      {selectedBookForProposal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 border border-white/80 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedBookForProposal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4 mb-5">
              <img
                src={selectedBookForProposal.image_url}
                alt={selectedBookForProposal.title}
                className="w-20 h-28 object-cover rounded-xl shadow-md border border-slate-100 flex-shrink-0"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {selectedBookForProposal.category}
                </span>
                <h3 className="font-serif text-lg font-semibold text-slate-900 leading-snug">
                  {selectedBookForProposal.title}
                </h3>
                <p className="text-xs text-slate-500 mb-2">by {selectedBookForProposal.author}</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{selectedBookForProposal.handoff_spot}</span>
                </div>
              </div>
            </div>

            {/* Seller info with safety check */}
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <img
                  src={selectedBookForProposal.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-800">{selectedBookForProposal.user_name}</p>
                  <p className="text-[10px] text-slate-500">{selectedBookForProposal.user_branch} • {selectedBookForProposal.user_year}</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Student
              </span>
            </div>

            {/* Offer Form */}
            <form onSubmit={handleSendProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Choose Your Proposal Type
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOfferType('swap_credit')}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                      offerType === 'swap_credit'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-semibold">
                      <Repeat className="w-3.5 h-3.5" />
                      <span>1 Credit Token</span>
                    </div>
                    <span className="text-[10px] text-slate-500">From wallet (Bal: {currentUser.credit_balance})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOfferType('cash')}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                      offerType === 'cash'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-semibold">
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Cash Purchase</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Pay on physical handoff</span>
                  </button>
                </div>
              </div>

              {offerType === 'cash' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Offered Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={cashOfferAmount}
                    onChange={(e) => setCashOfferAmount(e.target.value)}
                    className="w-full glass-input text-sm"
                    placeholder="e.g. 150"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed MVJCE Meetup Location
                </label>
                <select
                  value={proposalHandoff}
                  onChange={(e) => setProposalHandoff(e.target.value)}
                  className="w-full glass-input text-xs cursor-pointer"
                >
                  {MVJCE_LANDMARKS.map(spot => (
                    <option key={spot} value={spot}>{spot}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookForProposal(null)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Send Exchange Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

