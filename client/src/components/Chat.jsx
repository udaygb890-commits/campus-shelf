import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Send, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Paperclip, 
  Lock, 
  ChevronLeft, 
  MessageSquare
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
  const [mobileView, setMobileView] = useState('chat'); // 'list' | 'chat'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (urlChatId && urlChatId !== activeChatId) {
      setActiveChatId(urlChatId);
      setMobileView('chat');
    }
  }, [urlChatId, activeChatId, setActiveChatId]);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat) return;
    sendMessage(activeChat.id, inputMessage);
    setInputMessage('');
  };

  const handleQuickChip = (chipText) => {
    if (!activeChat) return;
    sendMessage(activeChat.id, chipText);
  };

  if (!activeChat) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 text-center bg-white border border-slate-200 rounded-xl shadow-card">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">No Active Conversations</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Accept an incoming book exchange proposal or send a request to start coordinating a safe campus handoff.
          </p>
        </div>
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
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col gap-2.5 sm:gap-3 min-h-0 overflow-hidden">
      {/* Campus Privacy Information Banner */}
      <div className="flex-shrink-0 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700 shadow-subtle">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="truncate sm:overflow-visible sm:whitespace-normal">
            <strong className="text-slate-900 font-semibold">Campus Privacy Guard:</strong> Personal phone numbers and emails are masked. Coordinate handoffs safely at MVJCE landmarks.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hidden sm:flex flex-shrink-0 ml-3">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Institutional Channel</span>
        </div>
      </div>

      {/* Messaging Workspace (Split-panel Layout occupying exact vertical space) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Conversation Sidebar */}
        <div className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 h-full flex-col flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 overflow-hidden`}>
          <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Conversations
              </h3>
              <p className="text-xs text-slate-500">Active campus book handoffs</p>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {chats.length} Active
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
            {chats.map((chat) => {
              const isSelected = chat.id === activeChat.id;
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => {
                    setActiveChatId(chat.id);
                    setMobileView('chat');
                  }}
                  className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                    isSelected 
                      ? 'bg-white border-l-2 border-brand-navy shadow-subtle' 
                      : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.partner_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt={chat.partner_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    {chat.status === 'active' && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>
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

        {/* Right Panel: Active Conversation Thread */}
        <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 min-w-0 h-full flex flex-col bg-white overflow-hidden`}>
          {/* Active Conversation Header */}
          <div className="p-3 sm:p-3.5 border-b border-slate-200 flex items-center justify-between gap-3 flex-shrink-0 bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Mobile Back Button */}
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Back to conversations list"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <img
                src={activeChat.partner_avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80'}
                alt=""
                className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                    {activeChat.partner_name}
                  </h4>
                  <span className="text-[11px] text-slate-500 truncate">
                    ({activeChat.partner_branch}, {activeChat.partner_year})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium whitespace-nowrap">
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
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Exchange Completed</span>
                  <span className="sm:hidden">Completed</span>
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

          {/* Pinned Meetup Location Banner */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0 truncate">
              <MapPin className="w-3.5 h-3.5 text-brand-navy flex-shrink-0" />
              <span className="truncate">
                <strong className="text-slate-900 font-semibold">Designated Meetup:</strong> {activeChat.handoff_spot}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowLandmarkPicker(!showLandmarkPicker)}
              className="text-xs font-medium text-brand-navy hover:text-slate-900 underline whitespace-nowrap ml-2"
            >
              {showLandmarkPicker ? 'Close' : 'Change Location'}
            </button>
          </div>

          {/* Landmark Picker Dropdown */}
          {showLandmarkPicker && (
            <div className="p-2.5 bg-slate-50 border-b border-slate-200 text-xs flex items-center gap-1.5 flex-wrap flex-shrink-0 animate-in fade-in duration-150">
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
                  className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                    activeChat.handoff_spot === spot
                      ? 'bg-brand-navy text-white border-brand-navy shadow-subtle'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {spot}
                </button>
              ))}
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/40">
            {activeChat.messages.map((msg) => {
              if (msg.is_system) {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shadow-subtle">
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
          <div className="px-3 py-1.5 border-t border-slate-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickChip(chip)}
                className="py-1 px-2.5 rounded-full text-[11px] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Composer Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-2.5 sm:p-3 border-t border-slate-200 bg-white flex items-center gap-2 flex-shrink-0"
          >
            <button
              type="button"
              onClick={() => showToast('Photo proof enabled during active campus handoff')}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
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
              className="py-2 px-3.5 sm:px-4 rounded-lg bg-brand-navy hover:bg-slate-900 text-white text-xs font-medium shadow-subtle disabled:opacity-40 transition-colors flex items-center gap-1.5 flex-shrink-0"
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
