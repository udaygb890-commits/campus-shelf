import React from 'react';
import { Check, X, MapPin, Repeat, Banknote, Inbox, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function PendingRequests({ onOpenChat }) {
  const { requests, acceptRequest, declineRequest } = useCampusShelf();

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleAccept = (requestId) => {
    const chatId = acceptRequest(requestId);
    if (onOpenChat) onOpenChat(chatId);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Pending Swap Requests
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review incoming swap offers or cash purchase requests from other students on campus.
        </p>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="glass-card p-12 text-center border border-white/60">
          <Inbox className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-medium text-slate-800 mb-1">
            No pending requests
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When another MVJCE student requests one of your books, their proposal will appear here for you to accept or decline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pendingRequests.map((req) => {
            const isSwapCredit = req.offer_type === 'swap_credit';
            const isSwapBook = req.offer_type === 'swap_book';
            const isCash = req.offer_type === 'cash';

            return (
              <div
                key={req.id}
                className="glass-card p-5 border border-white/80 hover:border-indigo-300 transition-all hover:shadow-lg flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Requester Profile Banner */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <img
                      src={req.requester_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt={req.requester_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900">
                        {req.requester_name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {req.requester_branch}, {req.requester_year}
                      </p>
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="py-3 flex items-center gap-3">
                    <img
                      src={req.listing_image}
                      alt={req.listing_title}
                      className="w-12 h-16 object-cover rounded-lg shadow-sm border border-slate-100 flex-shrink-0"
                    />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Book Targeted</span>
                      <p className="font-serif text-xs font-semibold text-slate-900 line-clamp-2">
                        {req.listing_title}
                      </p>
                    </div>
                  </div>

                  {/* Offer Details Badge */}
                  <div className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Offer Details</span>
                    {isSwapBook && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Swap Offer: Offered [{req.offered_item_name}]</span>
                      </span>
                    )}

                    {isSwapCredit && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Swap Offer: Offered [1 Credit Token]</span>
                      </span>
                    )}

                    {isCash && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 px-2 py-1 rounded-lg">
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Cash Purchase Offer: ₹{req.offer_amount_inr}</span>
                      </span>
                    )}

                    {/* Proposed Handoff Location */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="truncate">{req.handoff_spot}</span>
                    </div>
                  </div>
                </div>

                {/* Decision Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Accept & Open Chat</span>
                  </button>

                  <button
                    onClick={() => declineRequest(req.id)}
                    className="w-full py-2 px-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

