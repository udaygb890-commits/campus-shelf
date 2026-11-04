import React, { useState } from 'react';
import { Repeat, Banknote, MapPin, Eye, User, Sparkles, Send } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function BookGrid({ listings, onSelectBook }) {
  if (listings.length === 0) {
    return (
      <div className="glass-card p-12 text-center my-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-xl font-medium text-slate-800 mb-1">No matching textbooks found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Try clearing your search query or selecting a different department/semester tag.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {listings.map((book) => (
        <BookCard key={book.id} book={book} onSelectBook={onSelectBook} />
      ))}
    </div>
  );
}

function BookCard({ book, onSelectBook }) {
  const isSwap = book.exchange_type === 'swap';

  return (
    <div 
      onClick={() => onSelectBook(book)}
      className="glass-card group overflow-hidden border border-white/80 hover:border-indigo-300 transition-all duration-300 hover:shadow-[0_12px_35px_rgba(0,33,71,0.12)] hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Cover Thumbnail Container */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={book.image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Exchange Type Badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            {isSwap ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-600/90 text-white backdrop-blur-md shadow-sm">
                <Repeat className="w-3 h-3" />
                <span>Swap</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-600/90 text-white backdrop-blur-md shadow-sm">
                <Banknote className="w-3 h-3" />
                <span>Sale ₹{book.price}</span>
              </span>
            )}
          </div>

          {/* Owner Avatar / Mini Pill */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900/70 text-white text-[10px] backdrop-blur-md">
            <img
              src={book.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
              alt={book.user_name}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="font-medium max-w-[70px] truncate">{book.user_name}</span>
          </div>

          {/* Condition tag */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/90 text-slate-700 backdrop-blur-sm shadow-sm">
              {book.condition}
            </span>
          </div>
        </div>

        {/* Book Details */}
        <div className="p-4">
          <div className="flex items-center justify-between text-[11px] text-indigo-600 font-semibold mb-1">
            <span>{book.subject_code || 'MVJCE Core'}</span>
            <span className="text-slate-400 font-normal">Sem {book.semester}</span>
          </div>

          <h4 className="font-serif text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
            {book.title}
          </h4>

          <p className="text-xs text-slate-500 mb-3">
            by {book.author || 'Author not listed'}
          </p>

          {/* Landmark Handoff */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="truncate">{book.handoff_spot}</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-100/60 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          <span>{book.views} views</span>
        </div>
        <span className="text-[11px] font-medium text-indigo-600 group-hover:underline">
          Request Swap →
        </span>
      </div>
    </div>
  );
}

