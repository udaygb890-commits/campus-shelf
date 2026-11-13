import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Send, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Paperclip, 
  Lock, 
  ChevronRight, 
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import { MVJCE_LANDMARKS } from '../data/initialData';

export default function Chat() {
  const { chatId: urlChatId } = useParams();
  const { 
    chats, 
    activeChatId, 
    setActiveChatId, 
    sendMessage, 
    confirmSwap, 
    currentUser, 
    showToast 
  } = useCampusShelf();

  const [inputMessage, setInputMessage] = useState('');
  const [showLandmarkPicker, setShowLandmarkPicker] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (urlChatId && urlChatId !== activeChatId) {
      setActiveChatId(urlChatId);
    }
  }, [urlChatId, activeChatId, setActiveChatId]);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(activeChat.id, inputMessage);
    setInputMessage('');
  };

  const handleQuickChip = (chipText) => {
    sendMessage(activeChat.id, chipText);
  };

  if (!activeChat) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white border border-slate-200 rounded-xl shadow-card">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">No Active Conversations</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Accept an incoming book exchange proposal or send a request to start coordinating a safe campus handoff.
        </p>
      </div>
    );
  }

  const QUICK_CHIPS = [
    "Is this book still available?",
    "I'm at the handoff point!",
    "Can we meet around 3:30 PM?",
    "Received the book in good condition, thank you!"
  ];

  return (
    <div className="p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col gap-3">
      {/* Privacy Notice Pill */}
      <div className="px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700 shadow-subtle flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong className="text-slate-900 font-semibold">Campus Privacy Guard:</strong> Personal phone numbers and emails are masked. Coordinate physical handoffs safely at designated MVJCE campus landmarks.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hidden sm:flex">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Institutional Channel</span>
        </div>
      </div>

      {/* Split-panel Chat Layout */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Conversation List (Desktop) */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/60 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="text-sm font-semibold text-slate-900">
              Conversations
            </h3>
            <p className="text-xs text-slate-500">Active campus book handoffs</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
            {chats.map((chat) => {
              const isSelected = chat.id === activeChat.id;
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => setActiveChatId(chat.id)}
                  className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                    isSelected 
                      ? 'bg-white border-l-2 border-brand-navy shadow-subtle' 
                      : 'hover:bg-slate-100/60'
                  }`}
                >
                  <img
                    src={chat.partner_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                    alt={chat.partner_name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{chat.partner_name}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{chat.last_message_time}</span>
                    </div>
                    <p className="text-[11px] text-brand-navy truncate font-medium">{chat.listing_title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{chat.last_message}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Active Chat Thread */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Privacy-First Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between gap-3 flex-shrink-0 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={activeChat.partner_avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80'}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-900 truncate">
                    {activeChat.partner_name}
                  </h4>
                  <span className="text-xs text-slate-500">
                    ({activeChat.partner_branch}, {activeChat.partner_year})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    MVJCE Verified
                  </span>
                  <span>•</span>
                  <span className="truncate">{activeChat.listing_title}</span>
                </div>
              </div>
            </div>

            {/* Atomic Complete Swap CTA for Owner */}
            <div className="flex-shrink-0">
              {activeChat.status === 'completed' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Exchange Completed</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => confirmSwap(activeChat.id)}
                  className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-subtle flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                  <span>Confirm Handoff</span>
                </button>
              )}
            </div>
          </div>

          {/* Pinned Handoff Banner */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-brand-navy flex-shrink-0" />
              <span>
                <strong className="text-slate-900 font-semibold">Designated Meetup:</strong> {activeChat.handoff_spot}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowLandmarkPicker(!showLandmarkPicker)}
              className="text-xs font-medium text-brand-navy hover:text-slate-900 underline"
            >
              {showLandmarkPicker ? 'Close' : 'Change Location'}
            </button>
          </div>

          {showLandmarkPicker && (
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">Campus Points:</span>
              {MVJCE_LANDMARKS.map(spot => (
                <button
                  key={spot}
                  type="button"
                  onClick={() => {
                    activeChat.handoff_spot = spot;
                    setShowLandmarkPicker(false);
                    showToast(`Handoff landmark updated to ${spot}`);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    activeChat.handoff_spot === spot
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {spot}
                </button>
              ))}
            </div>
          )}

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
            {activeChat.messages.map((msg) => {
              if (msg.is_system) {
                return (
                  <div key={msg.id} className="text-center my-3">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isMe = msg.is_me;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-brand-navy text-white rounded-br-sm shadow-subtle'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-subtle'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-4 py-2 border-t border-slate-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickChip(chip)}
                className="py-1 px-3 rounded-full text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Composer */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2 flex-shrink-0"
          >
            <button
              type="button"
              onClick={() => showToast('Photo proof enabled during active campus handoff')}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Attach photo proof"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="Write a message to coordinate pickup..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 app-input text-xs sm:text-sm py-2 px-3"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="py-2 px-4 rounded-lg bg-brand-navy hover:bg-slate-900 text-white text-xs font-medium shadow-subtle disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
