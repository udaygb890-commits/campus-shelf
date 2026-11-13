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
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Exchange History
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Verified record of completed peer book swaps and physical handoffs at MVJCE.
        </p>
      </div>

      {/* Controls & Filter Toolbar */}
      <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Segmented Control Tabs */}
        <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('swaps')}
            className={`flex-1 sm:flex-none py-1.5 px-3.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'swaps'
                ? 'bg-white text-brand-navy shadow-subtle'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-emerald-600" />
            <span>Peer Swaps</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`flex-1 sm:flex-none py-1.5 px-3.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'sales'
                ? 'bg-white text-brand-navy shadow-subtle'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Banknote className="w-3.5 h-3.5 text-blue-600" />
            <span>Cash Sales</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full app-input text-xs pl-9 py-2"
          />
        </div>
      </div>

      {/* History Timeline / Table */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white p-12 text-center border border-slate-200 rounded-xl shadow-card">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">
            No history records found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your completed exchanges will automatically be logged here once marked finalized during campus handoff.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 border border-slate-200 rounded-xl shadow-card hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Date & Book Details */}
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={item.book_image}
                  alt={item.book_title}
                  className="w-14 h-18 sm:w-16 sm:h-20 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                />

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Completed {item.date}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 truncate">
                    {item.book_title}
                  </h4>

                  {/* Counterparty */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="text-slate-400">Exchange Partner:</span>
                    <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {item.counterparty_name} ({item.counterparty_dept})
                    </span>
                  </div>

                  {/* Value / Type */}
                  <p className="text-xs font-semibold text-brand-navy pt-0.5">
                    {item.value_text}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-end sm:self-center flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
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
