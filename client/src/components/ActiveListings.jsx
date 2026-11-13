import React, { useState, useMemo } from 'react';
import { Search, Edit3, Trash2, Eye, MapPin, Repeat, Banknote, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function ActiveListings() {
  const { listings, currentUser, setIsListModalOpen, updateListing, deleteListing, showToast } = useCampusShelf();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeTag, setActiveTag] = useState('All');

  // Edit modal state
  const [editingBook, setEditingBook] = useState(null);

  const TAGS = ['All', 'Engineering', 'Novels', 'Notes', 'PyQs'];

  // Current user's listings
  const myListings = useMemo(() => {
    return listings.filter(item => {
      // Must belong to current user
      if (item.user_id !== currentUser.id) return false;

      // Status
      if (selectedStatus !== 'All' && item.status !== selectedStatus.toLowerCase()) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!item.title.toLowerCase().includes(q) && !item.author.toLowerCase().includes(q)) return false;
      }

      // Tag filter
      if (activeTag === 'Engineering' && item.category !== 'Engineering Textbook') return false;
      if (activeTag === 'Novels' && item.category !== 'General Novel') return false;
      if (activeTag === 'Notes' && !item.category.includes('Notes')) return false;
      if (activeTag === 'PyQs' && !item.category.includes('PYQs')) return false;

      return true;
    });
  }, [listings, currentUser.id, selectedStatus, search, activeTag]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBook) return;
    await updateListing(editingBook.id, {
      title: editingBook.title,
      author: editingBook.author,
      handoff_spot: editingBook.handoff_spot,
    });
    setEditingBook(null);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from your active listings?`)) {
      await deleteListing(id);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Active Listings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your textbooks and active book listings in the campus exchange
          </p>
        </div>

        <button
          onClick={() => setIsListModalOpen(true)}
          className="self-start sm:self-auto py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>List Another Book</span>
        </button>
      </div>

      {/* Controls Section */}
      <div className="glass-card p-4 border border-white/70 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search my listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input text-xs pl-10"
            />
          </div>

          {/* Filter Dropdowns: Year, Dept, Status */}
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="glass-input text-xs py-2 px-3 bg-white/70 cursor-pointer"
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
              className="glass-input text-xs py-2 px-3 bg-white/70 cursor-pointer"
            >
              <option value="All">All Depts</option>
              <option value="ECE">ECE</option>
              <option value="CSE">CSE</option>
              <option value="Mech">Mech</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="glass-input text-xs py-2 px-3 bg-white/70 cursor-pointer font-medium text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Filter Tags: Horizontal scrollable row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {TAGS.map((tag) => {
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`py-1 px-3.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white/70 text-slate-600 border border-slate-200/80 hover:bg-white'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Listings Feed (Scrollable Vertical Stack) */}
      {myListings.length === 0 ? (
        <div className="glass-card p-12 text-center border border-white/60">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-medium text-slate-800 mb-1">
            No active listings found
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            You don't have any books listed under this filter.
          </p>
          <button
            onClick={() => setIsListModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-medium"
          >
            List a Book Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {myListings.map((book) => {
            const isAvailable = book.status === 'available';
            const isReserved = book.status === 'reserved';

            return (
              <div
                key={book.id}
                className="glass-card p-3 sm:p-4 border border-white/80 hover:border-indigo-300 transition-all hover:shadow-md flex items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={book.image_url}
                    alt={book.title}
                    className="w-14 h-18 sm:w-16 sm:h-20 object-cover rounded-xl shadow-sm border border-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                        {book.subject_code || book.category}
                      </span>
                      <span className="text-[10px] text-slate-400">• Sem {book.semester}</span>
                    </div>

                    <h4 className="font-serif text-sm font-semibold text-slate-900 truncate">
                      {book.title}
                    </h4>

                    <p className="text-xs text-slate-500 truncate">
                      by {book.author || 'Author unknown'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {/* Status Tag */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-700'
                            : isReserved
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isAvailable ? 'Available' : isReserved ? 'Reserved in Chat' : 'Completed'}
                      </span>

                      {/* Views Count */}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Views: {book.views}
                      </span>

                      {/* Handoff Spot */}
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 hidden sm:flex">
                        <MapPin className="w-3 h-3 text-indigo-500" /> {book.handoff_spot}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditingBook(book)}
                    title="Edit listing details"
                    className="p-2.5 rounded-xl border border-slate-200/80 hover:border-indigo-400 bg-white/70 hover:bg-white text-slate-700 hover:text-indigo-600 transition-all shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(book.id, book.title)}
                    title="Remove listing"
                    className="p-2.5 rounded-xl border border-red-200/80 hover:border-red-400 bg-red-50/50 hover:bg-red-50 text-red-600 transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Listing Modal */}
      {editingBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 border border-white/80 shadow-2xl relative">
            <h3 className="font-serif text-lg font-semibold text-slate-900 mb-3">
              Edit Listing: {editingBook.title}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Author</label>
                <input
                  type="text"
                  value={editingBook.author}
                  onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Handoff Landmark</label>
                <input
                  type="text"
                  value={editingBook.handoff_spot}
                  onChange={(e) => setEditingBook({ ...editingBook, handoff_spot: e.target.value })}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="py-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

