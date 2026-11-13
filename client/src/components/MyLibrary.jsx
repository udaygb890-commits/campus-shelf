import React, { useState, useMemo } from 'react';
import { BookOpen, Plus, Search, Sparkles, Upload, CheckCircle2, RefreshCw, X, ArrowRight, Trash2 } from 'lucide-react';
import { useCampusShelf } from '../context/CampusShelfContext';

export default function MyLibrary() {
  const { library, addToLibrary, removeFromLibrary, openListFromLibrary, showToast } = useCampusShelf();

  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add to library form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [semester, setSemester] = useState('3');
  const [category, setCategory] = useState('Engineering Textbook');
  const [imageUrl, setImageUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const TAGS = ['All', 'Engineering', 'Novels', 'Notes', 'Saved'];

  const filteredLibrary = useMemo(() => {
    return library.filter((book) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!book.title.toLowerCase().includes(q) && !book.author.toLowerCase().includes(q)) {
          return false;
        }
      }

      if (activeTag === 'Engineering' && book.category !== 'Engineering Textbook') return false;
      if (activeTag === 'Novels' && book.category !== 'General Novel') return false;
      if (activeTag === 'Notes' && !book.category.includes('Notes')) return false;

      return true;
    });
  }, [library, search, activeTag]);

  // AI OCR extraction simulation
  const handleSimulateAiOcr = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setTitle('Signals & Systems: VTU Complete Analysis');
      setAuthor('Alan V. Oppenheim & Alan S. Willsky');
      setSubjectCode('18EC35');
      setSemester('3');
      setCategory('Engineering Textbook');
      setImageUrl('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80');
      setIsExtracting(false);
      showToast('✨ AI Vision extracted title, author & subject code from spine!');
    }, 1200);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
      // Trigger AI OCR automatically
      handleSimulateAiOcr();
    }
  };

  const handleSaveToLibrary = (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    addToLibrary({
      title: title.trim(),
      author: author.trim(),
      subject_code: subjectCode.trim() || 'MVJCE Core',
      semester: parseInt(semester, 10),
      category,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    });

    setIsAddModalOpen(false);
    // Reset
    setTitle('');
    setAuthor('');
    setSubjectCode('');
    setImageUrl('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            My Library
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your personal digital bookshelf. Quickly list items to the campus marketplace anytime.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Book to Library</span>
        </button>
      </div>

      {/* Search & Tag Pills */}
      <div className="glass-card p-4 border border-white/70 space-y-3.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search my library by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input text-xs pl-10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`py-1 px-3.5 rounded-full text-xs font-medium transition-all ${
                activeTag === tag
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/70 text-slate-600 border border-slate-200/80 hover:bg-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Library Grid */}
      {filteredLibrary.length === 0 ? (
        <div className="glass-card p-12 text-center border border-white/60">
          <BookOpen className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-medium text-slate-800 mb-1">
            Your library is empty
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Scan textbooks or add books to your personal shelf so you can list them with 1 click.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-medium"
          >
            Add First Book
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLibrary.map((item) => (
            <div
              key={item.id}
              className="glass-card p-4 border border-white/80 hover:border-indigo-300 transition-all hover:shadow-md flex gap-4"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-16 h-22 object-cover rounded-xl shadow-sm border border-slate-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                    {item.subject_code || item.category}
                  </span>
                  <h4 className="font-serif text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mt-0.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">by {item.author}</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100/60 mt-2">
                  <span className="text-[10px] text-slate-400">Sem {item.semester}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove "${item.title}" from your library?`)) {
                          removeFromLibrary(item.id);
                        }
                      }}
                      title="Remove from Library"
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openListFromLibrary(item)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>List on Feed</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* "+ Add Book to Library" Modal with AI Vision OCR */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-3xl w-full p-6 sm:p-8 border border-white/80 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="font-serif text-2xl font-semibold text-slate-900">
                Add Book to Library
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Catalog your textbook using manual entry or AI Vision OCR text extraction
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Book Details & Metadata */}
              <form onSubmit={handleSaveToLibrary} id="library-form" className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Book Details
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., To Kill a Mockingbird"
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
                    placeholder="e.g., Harper Lee"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Course Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 18EC35"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      className="w-full glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Semester
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full glass-input text-xs cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Sem {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <div className="flex gap-2">
                    {['Engineering Textbook', 'General Novel', 'Notes & PYQs'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-1 px-2.5 rounded-lg text-[11px] font-medium transition-all ${
                          category === cat
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white/80 border border-slate-200 text-slate-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              {/* Right Column: Book Image & AI Assistant */}
              <div className="space-y-3.5 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center justify-between">
                    <span>Book Image & AI Assist</span>
                    <span className="text-[10px] font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      OCR Powered
                    </span>
                  </h3>

                  {/* Upload Dropzone */}
                  <label className="mt-3 block border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-5 text-center cursor-pointer bg-white/70 hover:bg-white transition-all">
                    {imageUrl ? (
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src={imageUrl}
                          alt=""
                          className="w-14 h-18 object-cover rounded-lg border border-slate-200 shadow-sm"
                        />
                        <div className="text-left text-xs">
                          <p className="font-semibold text-slate-800">Photo Attached</p>
                          <span className="text-[11px] text-indigo-600 underline">Upload different photo</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-indigo-500 mx-auto mb-1.5" />
                        <span className="text-xs font-semibold text-slate-700 block">
                          Tap to take or upload photo(s) of the book cover & spine
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          High accuracy on VTU textbooks & novels
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* AI Extraction State */}
                  <div className="mt-4 p-3 rounded-xl bg-white border border-indigo-100 shadow-sm">
                    {isExtracting ? (
                      <div className="flex items-center gap-2.5 text-xs text-indigo-700 font-medium">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>✨ AI Assistant is extracting details from cover & spine...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>AI Text Recognition</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleSimulateAiOcr}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60"
                        >
                          Upload & Process
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="library-form"
                    disabled={!title.trim() || !author.trim()}
                    className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    Add to Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

