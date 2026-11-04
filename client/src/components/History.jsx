import React, { useState, useMemo } from 'react';
import { Search, Repeat, Banknote, CheckCircle2, User, Clock, Calendar, ArrowUpRight } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function History() {
  const { history } = useCampusShelf();

  // Tab state: 'swaps' | 'sales'
  const [activeTab, setActiveTab] = useState('swaps');
  const [search, setSearch] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // Tab filter
      if (activeTab === 'swaps' && item.type !== 'swap') return false;
      if (activeTab === 'sales' && item.type !== 'sale') return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !item.book_title.toLowerCase().includes(q) &&
          !item.counterparty_name.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [history, activeTab, search]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Book Swapped & History
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your completed physical handoffs, peer swaps, and sales at MVJCE
        </p>
      </div>

      {/* Controls & Data Organization */}
      <div className="glass-card p-4 border border-white/70 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Segmented Control Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('swaps')}
              className={`flex-1 sm:flex-none py-1.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'swaps'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Repeat className="w-3.5 h-3.5 text-emerald-600" />
              <span>Swap History</span>
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              className={`flex-1 sm:flex-none py-1.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'sales'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Banknote className="w-3.5 h-3.5 text-amber-600" />
              <span>Sales History</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history by title or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input text-xs pl-10"
            />
          </div>
        </div>
      </div>

      {/* History Timeline / Table */}
      {filteredHistory.length === 0 ? (
        <div className="glass-card p-12 text-center border border-white/60">
          <Clock className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-medium text-slate-800 mb-1">
            No history records found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your completed swaps and sales will appear here once finalized through secure chat.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="glass-card p-4 border border-white/80 hover:border-indigo-300 transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Date & Book Details */}
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={item.book_image}
                  alt={item.book_title}
                  className="w-14 h-18 sm:w-16 sm:h-20 object-cover rounded-xl shadow-sm border border-slate-100 flex-shrink-0"
                />

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Completed on {item.date}</span>
                  </div>

                  <h4 className="font-serif text-sm font-semibold text-slate-900 truncate">
                    {item.book_title}
                  </h4>

                  {/* Counterparty with anonymized profile */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="text-slate-400">Counterparty:</span>
                    <span className="font-semibold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100/60 inline-flex items-center gap-1">
                      <User className="w-3 h-3 text-indigo-500" />
                      {item.counterparty_name} ({item.counterparty_dept})
                    </span>
                  </div>

                  {/* Value / Type */}
                  <p className="text-xs font-medium text-slate-700 pt-0.5">
                    {item.value_text}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-end sm:self-center flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{item.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

