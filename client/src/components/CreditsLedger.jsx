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
  Sparkles 
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
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Credits & Ledger
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Track your available reading credit tokens, credit balance history, and peer-to-peer exchange ledger.
        </p>
      </div>

      {/* Credit Summary Card (Top Section Wallet Widget) */}
      <div className="glass-card-dark p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Subtle Decorative Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10 flex-1">
            {/* 1. Current Balance */}
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-slate-300 font-medium flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Current Balance
              </span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-white">
                  {currentUser.credit_balance}
                </span>
                <span className="text-xs font-medium text-amber-300">
                  Credits Available
                </span>
              </div>
              {/* Token icons */}
              <div className="flex items-center gap-1.5 pt-1.5">
                {Array.from({ length: Math.min(currentUser.credit_balance, 5) }).map((_, i) => (
                  <span key={i} className="text-lg">🪙</span>
                ))}
              </div>
            </div>

            {/* 2. Total Swaps */}
            <div className="sm:pl-8 space-y-1 pt-4 sm:pt-0">
              <span className="text-xs uppercase tracking-wider text-slate-300 font-medium flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                Total Swaps Completed
              </span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-white">5</span>
                <span className="text-xs font-medium text-emerald-300">Books Swapped</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">Verified on-campus handoffs</p>
            </div>

            {/* 3. Earned via Sales */}
            <div className="sm:pl-8 space-y-1 pt-4 sm:pt-0">
              <span className="text-xs uppercase tracking-wider text-slate-300 font-medium flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-indigo-400" />
                Earned via Sales
              </span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-white">₹550</span>
                <span className="text-xs font-medium text-indigo-300">Total Cash Earned</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">Direct physical settlement</p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setIsListModalOpen(true)}
            className="self-start md:self-center py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-950/50 border border-indigo-400/40 flex items-center gap-2 transition-all active:scale-95 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Earn More Credits</span>
          </button>
        </div>
      </div>

      {/* Ledger History Table / Timeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-serif text-xl font-semibold text-slate-900">
            Ledger History
          </h3>

          {/* Segmented Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('tokens')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'tokens'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🪙 Credit Token Activity</span>
            </button>

            <button
              onClick={() => setActiveTab('cash')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'cash'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>💵 Cash Ledger</span>
            </button>
          </div>
        </div>

        {/* Audit Log Rows */}
        <div className="glass-card divide-y divide-slate-100 border border-white/80 overflow-hidden shadow-md">
          {filteredLedgers.map((item, index) => (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-6 text-center text-xs text-slate-400 font-mono">
                  {index + 1}.
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    {item.date}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-800">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pl-9 sm:pl-0">
                <span className={`text-xs sm:text-sm font-bold font-mono ${item.amount_color}`}>
                  {item.amount_text}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{item.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

