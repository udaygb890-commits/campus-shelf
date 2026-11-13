import React, { useState, useMemo } from 'react';
import { Search, MapPin, X, Repeat, Banknote, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import BookGrid from './BookGrid';
import { MVJCE_LANDMARKS } from '../data/initialData';

export default function Feed({ onOpenChat }) {
  const { listings, currentUser, isGuest, createRequest, showToast } = useCampusShelf();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [activeTag, setActiveTag] = useState('All');
  const [selectedBookForProposal, setSelectedBookForProposal] = useState(null);
  const [offerType, setOfferType] = useState('swap_credit'); // 'swap_credit' | 'cash'
  const [cashOfferAmount, setCashOfferAmount] = useState('150');
  const [proposalHandoff, setProposalHandoff] = useState('ECE Block Lobby');

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

  const handleSendProposal = async (e) => {
    e.preventDefault();
    if (isGuest) {
      showToast('Please log in with your MVJCE email to send an exchange offer.');
      return;
    }
    if (selectedBookForProposal.user_id === currentUser.id) {
      showToast('You cannot propose a swap on your own listing.');
      return;
    }

    await createRequest({
      listing: selectedBookForProposal,
      offerType,
      cashAmount: cashOfferAmount,
      handoffSpot: proposalHandoff
    });
    setSelectedBookForProposal(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Textbook Marketplace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified academic textbooks and course materials available for physical exchange at MVJCE
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-600 shadow-subtle self-start sm:self-auto">
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          <span>MVJCE Campus, Whitefield</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="app-card p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, author, course code (e.g. Signals, 18EC32, Oppenheim)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="app-input w-full pl-9 pr-8"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Year & Dept Filters */}
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="app-input text-xs py-2 px-3 bg-white cursor-pointer"
            >
              <option value="All">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="app-input text-xs py-2 px-3 bg-white cursor-pointer"
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

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {TAG_PILLS.map((tag) => {
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`py-1 px-3 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#002147] text-white shadow-subtle'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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

      {/* Exchange Proposal Modal */}
      {selectedBookForProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card max-w-lg w-full p-6 shadow-modal relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedBookForProposal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Book Info Summary */}
            <div className="flex gap-4 pb-4 border-b border-slate-200 mb-4">
              <img
                src={selectedBookForProposal.image_url}
                alt={selectedBookForProposal.title}
                className="w-16 h-22 object-cover rounded-md border border-slate-200 flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                  {selectedBookForProposal.subject_code || selectedBookForProposal.category}
                </span>
                <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-1">
                  {selectedBookForProposal.title}
                </h3>
                <p className="text-xs text-slate-500 mb-2">by {selectedBookForProposal.author}</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-xs text-slate-600">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{selectedBookForProposal.handoff_spot}</span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedBookForProposal.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-medium text-slate-900">{selectedBookForProposal.user_name}</p>
                  <p className="text-[10px] text-slate-500">{selectedBookForProposal.user_branch} • {selectedBookForProposal.user_year}</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Student
              </span>
            </div>

            {/* Offer Form */}
            <form onSubmit={handleSendProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Proposal Type
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOfferType('swap_credit')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      offerType === 'swap_credit'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-semibold">
                      <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                      <span>1 Credit Token</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">From balance ({currentUser.credit_balance} available)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOfferType('cash')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      offerType === 'cash'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-semibold">
                      <Banknote className="w-3.5 h-3.5 text-slate-800" />
                      <span>Cash Settlement</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Pay at physical meetup</span>
                  </button>
                </div>
              </div>

              {offerType === 'cash' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Offered Cash Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={cashOfferAmount}
                    onChange={(e) => setCashOfferAmount(e.target.value)}
                    className="app-input w-full"
                    placeholder="e.g. 150"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Proposed Meetup Landmark
                </label>
                <select
                  value={proposalHandoff}
                  onChange={(e) => setProposalHandoff(e.target.value)}
                  className="app-input w-full cursor-pointer"
                >
                  {MVJCE_LANDMARKS.map(spot => (
                    <option key={spot} value={spot}>{spot}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedBookForProposal(null)}
                  className="app-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn-primary text-xs"
                >
                  <span>Submit Exchange Offer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
