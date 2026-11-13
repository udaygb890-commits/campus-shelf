import React from 'react';
import { Repeat, Banknote, MapPin, Eye, BookOpen, ArrowRight } from 'lucide-react';

export default function BookGrid({ listings, onSelectBook }) {
  if (listings.length === 0) {
    return (
      <div className="app-card p-12 text-center my-6">
        <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">No matching textbooks found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Try clearing your search query or selecting a different department or semester filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      className="app-card overflow-hidden hover:border-slate-300 hover:shadow-dropdown transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Cover Thumbnail Container */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
          <img
            src={book.image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />

          {/* Exchange Type Badge */}
          <div className="absolute top-2 left-2 z-10">
            {isSwap ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-700 text-white shadow-sm">
                <Repeat className="w-2.5 h-2.5" />
                <span>Swap</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-white shadow-sm">
                <span>Sale ₹{book.price}</span>
              </span>
            )}
          </div>

          {/* Condition Tag */}
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/95 text-slate-700 shadow-sm border border-slate-200/80">
              {book.condition}
            </span>
          </div>

          {/* Owner Identity Pill */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] backdrop-blur-sm">
            <img
              src={book.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
              alt=""
              className="w-3.5 h-3.5 rounded-full object-cover"
            />
            <span className="max-w-[70px] truncate">{book.user_name}</span>
          </div>
        </div>

        {/* Book Details */}
        <div className="p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-indigo-700 uppercase">{book.subject_code || book.category}</span>
            <span>Sem {book.semester}</span>
          </div>

          <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {book.title}
          </h4>

          <p className="text-xs text-slate-500 truncate">
            by {book.author || 'Author not listed'}
          </p>

          <div className="pt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{book.handoff_spot}</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{book.views}</span>
        </span>
        <span className="text-xs font-medium text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>Propose</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
