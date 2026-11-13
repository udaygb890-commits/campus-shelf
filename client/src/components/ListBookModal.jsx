import React, { useState, useEffect } from 'react';
import { X, Upload, BookOpen, Layers, Repeat, Banknote, MapPin, Check, Image as ImageIcon } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';
import { MVJCE_LANDMARKS } from '../data/initialData';

export default function ListBookModal() {
  const { 
    isListModalOpen, 
    setIsListModalOpen, 
    selectedBookForListing,
    setSelectedBookForListing,
    library, 
    addListing, 
    showToast,
    currentUser 
  } = useCampusShelf();

  // Mode: 'manual' | 'library'
  const [importSource, setImportSource] = useState('manual');

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [category, setCategory] = useState('Engineering Textbook');
  const [condition, setCondition] = useState('Like New');
  const [exchangeType, setExchangeType] = useState('swap'); // 'swap' | 'cash'
  const [price, setPrice] = useState('');
  const [handoffSpot, setHandoffSpot] = useState(currentUser.default_handoff || 'ECE Block Lobby');
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isListModalOpen) return null;

  const CATEGORIES = ['Engineering Textbook', 'General Novel', 'Notes & PYQs'];
  const CONDITIONS = ['Like New', 'Good / Highlights', 'Worn / Usable'];

  // Pre-fill from selected library book if any
  useEffect(() => {
    if (selectedBookForListing) {
      setTitle(selectedBookForListing.title || '');
      setAuthor(selectedBookForListing.author || '');
      setSubjectCode(selectedBookForListing.subject_code || '');
      setCategory(selectedBookForListing.category || 'Engineering Textbook');
      setImagePreview(selectedBookForListing.image_url || '');
      setImportSource('manual');
    }
  }, [selectedBookForListing]);

  const handleClose = () => {
    setIsListModalOpen(false);
    setSelectedBookForListing(null);
  };

  const handleSelectFromLibrary = (libBook) => {
    setTitle(libBook.title);
    setAuthor(libBook.author);
    setSubjectCode(libBook.subject_code || '');
    setCategory(libBook.category || 'Engineering Textbook');
    setImagePreview(libBook.image_url || '');
    setImportSource('manual'); // switch back to review
    showToast(`Imported "${libBook.title}" from your library!`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetStockImage = (url) => {
    setImagePreview(url);
  };

  const isFormValid = Boolean(
    title.trim() &&
    author.trim() &&
    category &&
    handoffSpot &&
    (imagePreview || importSource === 'library') &&
    (exchangeType === 'swap' || (exchangeType === 'cash' && Number(price) > 0))
  );

  const handlePublish = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);

    setTimeout(() => {
      addListing({
        title: title.trim(),
        author: author.trim(),
        subject_code: subjectCode.trim() || 'MVJCE Core',
        semester: currentUser.semester || 3,
        category,
        condition,
        exchange_type: exchangeType,
        price: exchangeType === 'cash' ? Number(price) : 0,
        handoff_spot: handoffSpot,
        image_url: imagePreview || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      });

      setIsLoading(false);
      handleClose();
      // Reset form
      setTitle('');
      setAuthor('');
      setSubjectCode('');
      setPrice('');
      setImagePreview('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 sm:p-8 border border-white/80 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            List or Sell a Book
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Share your textbooks or novels with fellow MVJCE students on campus.
          </p>
        </div>

        {/* Segmented Switch (Source Selector) */}
        <div className="flex p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 mb-6 max-w-sm">
          <button
            type="button"
            onClick={() => setImportSource('manual')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              importSource === 'manual'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>+ List New Book</span>
          </button>

          <button
            type="button"
            onClick={() => setImportSource('library')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              importSource === 'library'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Choose from My Library</span>
          </button>
        </div>

        {importSource === 'library' ? (
          /* Library Picker Mode */
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Select a book saved in your Digital Shelf:
            </h3>

            {library.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-500 mb-2">No books found in your library yet.</p>
                <button
                  onClick={() => setImportSource('manual')}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Switch to manual entry →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {library.map((libBook) => (
                  <div
                    key={libBook.id}
                    onClick={() => handleSelectFromLibrary(libBook)}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white/60 hover:bg-white hover:border-indigo-400 cursor-pointer flex gap-3 transition-all hover:shadow-md"
                  >
                    <img
                      src={libBook.image_url}
                      alt={libBook.title}
                      className="w-12 h-16 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">{libBook.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">by {libBook.author}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                        {libBook.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Manual Entry Mode */
          <form onSubmit={handlePublish} className="space-y-5">
            {/* Step 1: Book Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <span>Step 1: Book Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Engineering Mathematics-III"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., B.S. Grewal"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course / Subject Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 18EC53 or CSE Core"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Category & Condition Tags */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Step 2: Category & Condition
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                        category === cat
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Condition</label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setCondition(cond)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                        condition === cond
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Exchange Preference */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Step 3: Exchange Preference
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExchangeType('swap')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    exchangeType === 'swap'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-800 shadow-sm'
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                    <Repeat className="w-4 h-4 text-emerald-600" />
                    <span>Swap for 1 Credit</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Earn 1 credit token to acquire another book</p>
                </button>

                <button
                  type="button"
                  onClick={() => setExchangeType('cash')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    exchangeType === 'cash'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-800 shadow-sm'
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                    <Banknote className="w-4 h-4 text-amber-600" />
                    <span>Sell for Cash (₹)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Receive cash directly on physical handoff</p>
                </button>
              </div>

              {exchangeType === 'cash' && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter Cash Price in ₹ (e.g., 150)
                  </label>
                  <input
                    type="number"
                    min="10"
                    placeholder="150"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>
              )}
            </div>

            {/* Step 4: On-Campus Handoff Location (Mandatory restricted dropdown) */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Step 4: On-Campus Handoff Location (Mandatory)
              </h3>
              <select
                value={handoffSpot}
                onChange={(e) => setHandoffSpot(e.target.value)}
                className="w-full glass-input text-xs cursor-pointer font-medium"
                required
              >
                {MVJCE_LANDMARKS.map((landmark) => (
                  <option key={landmark} value={landmark}>{landmark}</option>
                ))}
              </select>
            </div>

            {/* Step 5: Book Image Upload & Preview */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Step 5: Book Image Upload & Preview
              </h3>

              {imagePreview ? (
                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-20 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-800">Cover image attached</p>
                    <label className="text-xs text-indigo-600 font-medium hover:underline cursor-pointer block">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-5 text-center cursor-pointer bg-white/40 hover:bg-white/70 transition-colors">
                  <Upload className="w-6 h-6 text-indigo-500 mx-auto mb-1.5" />
                  <span className="text-xs font-semibold text-slate-700 block">
                    Tap or drag a clear photo of the book cover
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    PNG, JPG, WebP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Quick sample image picker for convenience */}
              {!imagePreview && (
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span>Or use sample:</span>
                  <button
                    type="button"
                    onClick={() => handleSetStockImage('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80')}
                    className="text-indigo-600 underline"
                  >
                    Textbook Cover
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleSetStockImage('https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80')}
                    className="text-indigo-600 underline"
                  >
                    Novel Cover
                  </button>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsListModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="glass-btn-primary text-xs py-2.5 px-6 font-semibold"
              >
                {isLoading ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

