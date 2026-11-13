import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Eye, MapPin, Plus, BookOpen, Layers, X, Check } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import { MVJCE_LANDMARKS } from '../data/initialData';

export default function ActiveListings() {
  const { listings, currentUser, setIsListModalOpen, updateListing, deleteListing, showToast } = useCampusShelf();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Edit modal state
  const [editingBook, setEditingBook] = useState(null);

  // Current user's listings
  const myListings = useMemo(() => {
    return listings.filter(item => {
      if (item.user_id !== currentUser.id) return false;
      if (selectedStatus !== 'All' && item.status !== selectedStatus.toLowerCase()) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!item.title.toLowerCase().includes(q) && !item.author.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [listings, currentUser.id, selectedStatus, search]);

  const stats = useMemo(() => {
    const userItems = listings.filter(l => l.user_id === currentUser.id);
    return {
      total: userItems.length,
      available: userItems.filter(l => l.status === 'available').length,
      reserved: userItems.filter(l => l.status === 'reserved').length,
      completed: userItems.filter(l => l.status === 'completed').length
    };
  }, [listings, currentUser.id]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBook) return;
    await updateListing(editingBook.id, {
      title: editingBook.title.trim(),
      author: editingBook.author.trim(),
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            My Active Listings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your books currently active or reserved in the MVJCE marketplace
          </p>
        </div>

        <button
          onClick={() => setIsListModalOpen(true)}
          className="app-btn-primary text-xs py-2 px-3.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>List Another Book</span>
        </button>
      </div>

      {/* Metrics Row (Disciplined, non-bloated counters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="app-card p-3.5">
          <span className="text-[11px] font-medium text-slate-500 block">Total Listed</span>
          <span className="text-xl font-semibold text-slate-900 mt-0.5 block">{stats.total}</span>
        </div>
        <div className="app-card p-3.5">
          <span className="text-[11px] font-medium text-slate-500 block">Available</span>
          <span className="text-xl font-semibold text-emerald-700 mt-0.5 block">{stats.available}</span>
        </div>
        <div className="app-card p-3.5">
          <span className="text-[11px] font-medium text-slate-500 block">Reserved in Chat</span>
          <span className="text-xl font-semibold text-amber-700 mt-0.5 block">{stats.reserved}</span>
        </div>
        <div className="app-card p-3.5">
          <span className="text-[11px] font-medium text-slate-500 block">Completed Swaps</span>
          <span className="text-xl font-semibold text-slate-700 mt-0.5 block">{stats.completed}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="app-card p-3.5 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search your listings by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-input w-full pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="app-input text-xs py-2 px-3 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Listings Collection */}
      {myListings.length === 0 ? (
        <div className="app-card p-12 text-center">
          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">No listings found</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            You don't have any textbooks matching the selected filter.
          </p>
          <button
            onClick={() => setIsListModalOpen(true)}
            className="app-btn-primary text-xs"
          >
            List a Textbook
          </button>
        </div>
      ) : (
        <div className="app-card divide-y divide-slate-100 overflow-hidden">
          {myListings.map((book) => {
            const isAvailable = book.status === 'available';
            const isReserved = book.status === 'reserved';

            return (
              <div
                key={book.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={book.image_url}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded border border-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-indigo-700 uppercase">
                        {book.subject_code || book.category}
                      </span>
                      <span className="text-[11px] text-slate-400">• Sem {book.semester}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 truncate">
                      {book.title}
                    </h4>

                    <p className="text-xs text-slate-500 truncate">
                      by {book.author || 'Author unknown'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isReserved
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isAvailable ? 'Available' : isReserved ? 'Reserved in Chat' : 'Completed'}
                      </span>

                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" /> {book.views} views
                      </span>

                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {book.handoff_spot}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setEditingBook(book)}
                    className="app-btn-secondary text-xs py-1.5 px-3"
                    title="Edit listing details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(book.id, book.title)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                    title="Delete listing"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card max-w-md w-full p-6 shadow-modal relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setEditingBook(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-semibold text-slate-900 mb-4">
              Edit Listing
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Book Title</label>
                <input
                  type="text"
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  className="app-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Author Name</label>
                <input
                  type="text"
                  value={editingBook.author}
                  onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                  className="app-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Handoff Landmark</label>
                <select
                  value={editingBook.handoff_spot}
                  onChange={(e) => setEditingBook({ ...editingBook, handoff_spot: e.target.value })}
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
                  onClick={() => setEditingBook(null)}
                  className="app-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn-primary text-xs"
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
