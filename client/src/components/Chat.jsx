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
  Smile, 
  Sparkles,
  AlertCircle
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
      <div className="p-8 text-center glass-card max-w-md mx-auto my-12">
        <p className="text-slate-500 text-sm">No active chats yet. Accept an incoming swap request to start a secure conversation.</p>
      </div>
    );
  }

  const QUICK_CHIPS = [
    "Is this book still available?",
    "I'm at the lobby!",
    "Can we meet around 3 PM?",
    "Got the book, thank you!"
  ];

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      {/* Privacy Notice Pill */}
      <div className="mb-3 px-4 py-2 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span><strong>Privacy Protocol:</strong> Student phone numbers & private emails are masked. Coordinate physical handoffs safely at MVJCE landmarks.</span>
        </div>
        <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider hidden sm:inline">
          Encrypted Session
        </span>
      </div>

      {/* Split-panel Chat Layout */}
      <div className="glass-card flex-1 flex flex-col md:flex-row overflow-hidden border border-white/80 shadow-2xl">
        {/* Left Panel: Conversation List (Desktop) */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200/80 bg-white/40 flex flex-col">
          <div className="p-4 border-b border-slate-200/60 bg-white/50">
            <h3 className="font-serif text-lg font-semibold text-slate-900">
              Messages
            </h3>
            <p className="text-[11px] text-slate-500">Active campus exchanges</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
            {chats.map((chat) => {
              const isSelected = chat.id === activeChat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-white/60'
                  }`}
                >
                  <img
                    src={chat.partner_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                    alt={chat.partner_name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-900 truncate">{chat.partner_name}</p>
                      <span className="text-[10px] text-slate-400">{chat.last_message_time}</span>
                    </div>
                    <p className="text-[11px] text-indigo-600 truncate font-medium">{chat.listing_title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{chat.last_message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Active Chat Thread */}
        <div className="flex-1 flex flex-col bg-white/60">
          {/* Privacy-First Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-white/80 flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={activeChat.partner_avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80'}
                alt=""
                className="w-9 h-9 rounded-full object-cover border border-indigo-200"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900">
                    {activeChat.partner_name}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    ({activeChat.partner_branch}, {activeChat.partner_year})
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Student ID Verified • Phone/Email Masked</span>
                </p>
              </div>
            </div>

            {/* Atomic Complete Swap CTA for Owner */}
            {activeChat.status === 'completed' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Swap Finalized</span>
              </span>
            ) : (
              <button
                onClick={() => confirmSwap(activeChat.id)}
                className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm Swap</span>
              </button>
            )}
          </div>

          {/* Pinned Handoff Banner */}
          <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100/80 flex items-center justify-between text-xs text-indigo-900 flex-shrink-0">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 animate-bounce" />
              <span>
                <strong>Meet at:</strong> {activeChat.handoff_spot}
              </span>
            </div>

            <button
              onClick={() => setShowLandmarkPicker(!showLandmarkPicker)}
              className="text-[11px] font-semibold text-indigo-600 hover:underline"
            >
              Change Landmark
            </button>
          </div>

          {showLandmarkPicker && (
            <div className="p-3 bg-white border-b border-slate-200 text-xs flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">Select Landmark:</span>
              {MVJCE_LANDMARKS.map(spot => (
                <button
                  key={spot}
                  onClick={() => {
                    activeChat.handoff_spot = spot;
                    setShowLandmarkPicker(false);
                    showToast(`Handoff landmark updated to ${spot}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 font-medium text-[11px] transition-colors"
                >
                  {spot}
                </button>
              ))}
            </div>
          )}

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-white/40 to-slate-50/40">
            {activeChat.messages.map((msg) => {
              if (msg.is_system) {
                return (
                  <div key={msg.id} className="text-center my-3">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-medium bg-indigo-100/80 text-indigo-800 border border-indigo-200/80">
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
                    className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
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
          <div className="px-4 py-2 border-t border-slate-200/60 bg-white/70 flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickChip(chip)}
                className="py-1 px-3 rounded-full text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200/80 whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Composer */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 border-t border-slate-200/80 bg-white flex items-center gap-2 flex-shrink-0"
          >
            <button
              type="button"
              onClick={() => showToast('Photo attachment allowed on live physical handoff')}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 glass-input text-xs sm:text-sm py-2 px-3.5"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-md shadow-indigo-600/20 disabled:opacity-40 transition-all active:scale-95 flex items-center gap-1.5"
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

