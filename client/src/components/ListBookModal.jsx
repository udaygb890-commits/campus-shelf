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
    showToast(`Imported "${libBook.title}" from your library`);
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
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full p-6 sm:p-7 border border-slate-200 rounded-xl shadow-modal relative my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            List a Book on Campus Marketplace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Make your textbooks or study material available to fellow MVJCE students for swap or sale.
          </p>
        </div>

        {/* Segmented Switch (Source Selector) */}
        <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 mb-5 max-w-sm">
          <button
            type="button"
            onClick={() => setImportSource('manual')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              importSource === 'manual'
                ? 'bg-white text-brand-navy shadow-subtle'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>+ Manual Entry</span>
          </button>

          <button
            type="button"
            onClick={() => setImportSource('library')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              importSource === 'library'
                ? 'bg-white text-brand-navy shadow-subtle'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>From My Library</span>
          </button>
        </div>

        {importSource === 'library' ? (
          /* Library Picker Mode */
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Select a book saved in your Digital Shelf:
            </h3>

            {library.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-2">No books saved in your digital shelf yet.</p>
                <button
                  type="button"
                  onClick={() => setImportSource('manual')}
                  className="text-xs font-medium text-brand-navy hover:underline"
                >
                  Switch to manual entry →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {library.map((libBook) => (
                  <button
                    key={libBook.id}
                    type="button"
                    onClick={() => handleSelectFromLibrary(libBook)}
                    className="p-3 text-left rounded-lg border border-slate-200 bg-white hover:border-brand-navy hover:bg-slate-50 cursor-pointer flex gap-3 transition-colors shadow-subtle"
                  >
                    <img
                      src={libBook.image_url}
                      alt={libBook.title}
                      className="w-12 h-16 object-cover rounded border border-slate-200 flex-shrink-0"
                    />
                    <div className="overflow-hidden min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{libBook.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">by {libBook.author}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {libBook.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Manual Entry Mode */
          <form onSubmit={handlePublish} className="space-y-4">
            {/* Step 1: Book Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                1. Book Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Book Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Higher Engineering Mathematics"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full app-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Author / Publication <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., B.S. Grewal (Khanna Publishers)"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full app-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject / Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 21MAT31 or CS Core"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full app-input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Category & Condition Tags */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                2. Category & Condition
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-1.5 px-3 rounded-md text-xs font-medium border transition-colors ${
                        category === cat
                          ? 'bg-brand-navy text-white border-brand-navy shadow-subtle'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Physical Condition</label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setCondition(cond)}
                      className={`py-1.5 px-3 rounded-md text-xs font-medium border transition-colors ${
                        condition === cond
                          ? 'bg-slate-900 text-white border-slate-900 shadow-subtle'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
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
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                3. Exchange Preference
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExchangeType('swap')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    exchangeType === 'swap'
                      ? 'border-brand-navy bg-slate-50 text-slate-900 shadow-subtle'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                    <Repeat className="w-4 h-4 text-emerald-600" />
                    <span>Swap for 1 Credit</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Receive 1 exchange credit token upon meetup confirmation</p>
                </button>

                <button
                  type="button"
                  onClick={() => setExchangeType('cash')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    exchangeType === 'cash'
                      ? 'border-brand-navy bg-slate-50 text-slate-900 shadow-subtle'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                    <Banknote className="w-4 h-4 text-blue-600" />
                    <span>Sell for Cash (₹)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Direct peer payment received in cash during campus meetup</p>
                </button>
              </div>

              {exchangeType === 'cash' && (
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price (₹ INR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    placeholder="150"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full app-input text-xs max-w-xs"
                    required
                  />
                </div>
              )}
            </div>

            {/* Step 4: On-Campus Handoff Location */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                4. On-Campus Handoff Location (Mandatory)
              </h3>
              <select
                value={handoffSpot}
                onChange={(e) => setHandoffSpot(e.target.value)}
                className="w-full app-input text-xs cursor-pointer font-medium"
                required
              >
                {MVJCE_LANDMARKS.map((landmark) => (
                  <option key={landmark} value={landmark}>{landmark}</option>
                ))}
              </select>
            </div>

            {/* Step 5: Book Image Upload & Preview */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                5. Book Cover Image
              </h3>

              {imagePreview ? (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-14 h-18 object-cover rounded border border-slate-200"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-800">Cover photo selected</p>
                    <label className="text-xs text-brand-navy font-medium hover:underline cursor-pointer block">
                      Replace Image
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
                <label className="block border border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                  <span className="text-xs font-semibold text-slate-700 block">
                    Upload or drag a photo of the book cover
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    PNG, JPG, or WebP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Sample cover options */}
              {!imagePreview && (
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span>Or use sample:</span>
                  <button
                    type="button"
                    onClick={() => handleSetStockImage('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80')}
                    className="text-brand-navy underline"
                  >
                    Engineering Textbook
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleSetStockImage('https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80')}
                    className="text-brand-navy underline"
                  >
                    Fiction Novel
                  </button>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="py-2 px-4 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="py-2 px-5 rounded-lg bg-brand-navy hover:bg-slate-900 text-white text-xs font-medium shadow-subtle disabled:opacity-40 transition-colors"
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
