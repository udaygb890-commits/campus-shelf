import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, MapPin, Repeat, Banknote, Inbox, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function PendingRequests({ onOpenChat }) {
  const navigate = useNavigate();
  const { requests, acceptRequest, declineRequest } = useCampusShelf();

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleAccept = (requestId) => {
    const chatId = acceptRequest(requestId);
    if (onOpenChat) {
      onOpenChat(chatId);
    } else {
      navigate('/dashboard/chat');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          Exchange & Purchase Proposals
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review proposals from students offering tokens, textbook swaps, or cash for your listings
        </p>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="app-card p-12 text-center">
          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            No pending requests
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When another MVJCE student proposes a swap or cash offer for one of your books, it will appear here for review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingRequests.map((req) => {
            const isSwapCredit = req.offer_type === 'swap_credit';
            const isSwapBook = req.offer_type === 'swap_book';
            const isCash = req.offer_type === 'cash';

            return (
              <div
                key={req.id}
                className="app-card p-4 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-3.5">
                  {/* Requester Profile Banner */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={req.requester_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900">
                          {req.requester_name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {req.requester_branch}, {req.requester_year}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  </div>

                  {/* Book Details */}
                  <div className="flex items-center gap-3">
                    <img
                      src={req.listing_image}
                      alt={req.listing_title}
                      className="w-12 h-16 object-cover rounded border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Requested Book</span>
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {req.listing_title}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{req.handoff_spot}</span>
                      </div>
                    </div>
                  </div>

                  {/* Offer Details Badge */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Proposed Terms</span>
                    {isSwapBook && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-800">
                        <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Swap: [{req.offered_item_name}]</span>
                      </span>
                    )}

                    {isSwapCredit && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800">
                        <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Swap: 1 Platform Credit Token</span>
                      </span>
                    )}

                    {isCash && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-900">
                        <Banknote className="w-3.5 h-3.5 text-slate-700" />
                        <span>Cash Purchase: ₹{req.offer_amount_inr} at handoff</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => declineRequest(req.id)}
                    className="app-btn-secondary text-xs py-1.5 px-3 flex-1"
                  >
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => handleAccept(req.id)}
                    className="app-btn-primary text-xs py-1.5 px-3 flex-1 bg-emerald-700 hover:bg-emerald-800"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept & Chat</span>
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
