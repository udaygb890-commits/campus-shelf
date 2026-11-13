import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  Repeat, 
  Banknote, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function CreditsLedger() {
  const { currentUser, ledgers, setIsListModalOpen } = useCampusShelf();

  // Tab: 'tokens' | 'cash'
  const [activeTab, setActiveTab] = useState('tokens');

  const filteredLedgers = useMemo(() => {
    return ledgers.filter(entry => {
      if (activeTab === 'tokens' && entry.type !== 'credit') return false;
      if (activeTab === 'cash' && entry.type !== 'cash') return false;
      return true;
    });
  }, [ledgers, activeTab]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Credits & Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track reading credits, peer exchange quotas, and physical cash settlements.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsListModalOpen(true)}
          className="self-start sm:self-center py-2 px-4 rounded-lg bg-brand-navy hover:bg-slate-900 text-white font-medium text-xs shadow-subtle flex items-center gap-2 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Book to Earn Credits</span>
        </button>
      </div>

      {/* Credit Summary Cards (Three Clean Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Current Balance */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Available Credits
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-mono">
                {currentUser.credit_balance}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Credits
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              1 credit unlocks 1 peer-to-peer textbook swap
            </p>
          </div>
        </div>

        {/* 2. Total Swaps */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Books Swapped
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-mono">
                5
              </span>
              <span className="text-xs font-medium text-emerald-700">
                Exchanges
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Verified campus physical handoffs
            </p>
          </div>
        </div>

        {/* 3. Earned via Sales */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cash Volume Earned
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-mono">
                ₹550
              </span>
              <span className="text-xs font-medium text-blue-700">
                Direct Cash
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Physical handoff cash settlement
            </p>
          </div>
        </div>
      </div>

      {/* Ledger History Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Transaction Audit Trail
            </h3>
            <p className="text-xs text-slate-500">Immutable record of all exchange events</p>
          </div>

          {/* Segmented Tabs */}
          <div className="flex p-0.5 rounded-lg bg-slate-200/70 border border-slate-300/50 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('tokens')}
              className={`py-1.5 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'tokens'
                  ? 'bg-white text-brand-navy shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Credit Tokens</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cash')}
              className={`py-1.5 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'cash'
                  ? 'bg-white text-brand-navy shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Cash Ledger</span>
            </button>
          </div>
        </div>

        {/* Audit Log Rows */}
        <div className="divide-y divide-slate-100">
          {filteredLedgers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No transactions recorded for this ledger category.
            </div>
          ) : (
            filteredLedgers.map((item, index) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-6 text-center text-xs text-slate-400 font-mono">
                    {index + 1}.
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-slate-400 block font-mono">
                      {item.date}
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-slate-800">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 pl-9 sm:pl-0">
                  <span className={`text-xs sm:text-sm font-semibold font-mono ${item.amount_color}`}>
                    {item.amount_text}
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{item.status}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
