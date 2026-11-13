import React, { useState, useMemo } from 'react';
import { BookOpen, Plus, Search, Upload, RefreshCw, X, ArrowRight, Trash2, Camera } from 'lucide-react';
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

  const TAGS = ['All', 'Engineering Textbook', 'General Novel', 'Notes & PYQs'];

  const filteredLibrary = useMemo(() => {
    return library.filter((book) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!book.title.toLowerCase().includes(q) && !book.author.toLowerCase().includes(q)) {
          return false;
        }
      }

      if (activeTag !== 'All' && book.category !== activeTag) return false;
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
      showToast('Metadata successfully extracted from book cover');
    }, 800);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
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
    setTitle('');
    setAuthor('');
    setSubjectCode('');
    setImageUrl('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            My Digital Library
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Catalog your personal textbooks and course notes for quick listing to the MVJCE marketplace
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="app-btn-primary text-xs py-2 px-3.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Book to Library</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="app-card p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search personal shelf..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-input w-full pl-9"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`py-1 px-3 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeTag === tag
                  ? 'bg-[#002147] text-white shadow-subtle'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tag === 'Engineering Textbook' ? 'Engineering' : (tag === 'General Novel' ? 'Novels' : (tag === 'Notes & PYQs' ? 'Notes' : 'All'))}
            </button>
          ))}
        </div>
      </div>

      {/* Library Grid */}
      {filteredLibrary.length === 0 ? (
        <div className="app-card p-12 text-center">
          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Your library is empty</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Scan your books once into your library so you can list them to the campus feed with a single click.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="app-btn-primary text-xs"
          >
            Add First Book
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLibrary.map((item) => (
            <div
              key={item.id}
              className="app-card p-4 hover:border-slate-300 transition-all flex gap-3.5 group"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-16 h-22 object-cover rounded border border-slate-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-indigo-700 uppercase">
                    {item.subject_code || item.category}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mt-0.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">by {item.author}</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
                  <span className="text-[11px] text-slate-400">Sem {item.semester}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove "${item.title}" from your library?`)) {
                          removeFromLibrary(item.id);
                        }
                      }}
                      title="Remove from Library"
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openListFromLibrary(item)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="app-card max-w-2xl w-full p-6 shadow-modal relative my-auto animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 pb-3 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">
                Add Book to Digital Library
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter details manually or scan the cover to auto-extract course info
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Form Column */}
              <form onSubmit={handleSaveToLibrary} id="library-form" className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Signals & Systems"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="app-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oppenheim"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="app-input w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 18EC35"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      className="app-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="app-input w-full cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Sem {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="app-input w-full cursor-pointer"
                  >
                    <option value="Engineering Textbook">Engineering Textbook</option>
                    <option value="General Novel">General Novel</option>
                    <option value="Notes & PYQs">Notes & PYQs</option>
                  </select>
                </div>
              </form>

              {/* Cover / OCR Column */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-800">Cover Scan & Vision</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Auto-Extract
                    </span>
                  </div>

                  {/* Dropzone */}
                  <label className="block border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-4 text-center cursor-pointer bg-white transition-colors">
                    {imageUrl ? (
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src={imageUrl}
                          alt=""
                          className="w-12 h-16 object-cover rounded border border-slate-200"
                        />
                        <div className="text-left text-xs">
                          <p className="font-medium text-slate-800">Photo Attached</p>
                          <span className="text-[11px] text-indigo-600 underline">Change photo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                        <span className="text-xs font-medium text-slate-700 block">
                          Upload photo of book cover or spine
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Extracts title, author, and syllabus code
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Extraction Trigger */}
                  <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    {isExtracting ? (
                      <div className="flex items-center gap-2 text-xs text-indigo-700 font-medium">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing textbook cover...</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs text-slate-600">Test Vision Scan</span>
                        <button
                          type="button"
                          onClick={handleSimulateAiOcr}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
                        >
                          Auto-populate sample
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="app-btn-secondary text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="library-form"
                    disabled={!title.trim() || !author.trim()}
                    className="app-btn-primary text-xs py-1.5 px-4"
                  >
                    Save to Library
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
