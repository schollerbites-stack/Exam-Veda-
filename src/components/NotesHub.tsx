import React, { useState, useMemo } from 'react';
import { Category, Lesson } from '../types';
import {
  BookOpen,
  Search,
  Layers,
  Play,
  ArrowRight,
  Sparkles,
  Clock,
  Filter,
  CheckCircle2,
  Plus,
  Bookmark,
  BookmarkCheck,
  Download,
  WifiOff
} from 'lucide-react';

interface NotesHubProps {
  categories: Category[];
  lessons: Lesson[];
  selectedCategoryId?: string;
  savedOfflineNoteIds?: string[];
  onReadNote: (lessonId: string) => void;
  onStartQuiz: (lessonId: string) => void;
  onOpenAdmin: (initialTab?: 'upload' | 'categories' | 'lessons', defaultCategoryId?: string) => void;
  onNavigateHome: () => void;
}

export const NotesHub: React.FC<NotesHubProps> = React.memo(({
  categories,
  lessons,
  selectedCategoryId,
  savedOfflineNoteIds = [],
  onReadNote,
  onStartQuiz,
  onOpenAdmin,
  onNavigateHome,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    selectedCategoryId || 'all'
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Filter lessons by selected category (or 'saved')
  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      // 1. Category Filter
      if (activeCategoryId === 'saved') {
        if (!savedOfflineNoteIds.includes(lesson.id)) return false;
      } else if (activeCategoryId !== 'all' && lesson.categoryId !== activeCategoryId) {
        return false;
      }

      // 2. Search Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = lesson.title.toLowerCase().includes(q);
        const matchDesc = lesson.description?.toLowerCase().includes(q);
        const matchNotes = lesson.notes?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchNotes;
      }

      return true;
    });
  }, [lessons, activeCategoryId, savedOfflineNoteIds, searchTerm]);

  const getCategoryForLesson = (catId: string) => {
    return categories.find(c => c.id === catId);
  };

  const calculateReadTime = (text?: string) => {
    if (!text) return '1 मिनट';
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 120);
    return `${minutes} मिनट`;
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-5 py-4 sm:py-5 space-y-4 text-slate-900">
      {/* Top Banner Header */}
      <div className="rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl sm:text-4xl p-2.5 bg-white/10 backdrop-blur rounded-2xl border border-white/20 shrink-0">
              📖
            </span>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 mb-0.5">
                <span>अध्ययन सामग्री</span>
                <span>•</span>
                <span>{lessons.length} अध्याय उपलब्ध</span>
                <span>•</span>
                <span>परीक्षा उपयोगी थ्योरी</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                स्टडी नोट्स पोर्टल (Study Notes)
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                अध्यायवार संक्षिप्त नोट्स, 1-लाइनर फैक्ट्स और परीक्षा उपयोगी बिंदु पढ़ें, फिर तुरंत उसी पाठ का मॉक टेस्ट दें!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onNavigateHome()}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
            >
              होम (विषय)
            </button>
            <button
              onClick={() => onOpenAdmin('upload')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ नया नोट्स</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
              activeCategoryId === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            सभी विषय ({lessons.length})
          </button>

          {/* Saved / Downloaded Offline Notes Tab */}
          <button
            onClick={() => setActiveCategoryId('saved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeCategoryId === 'saved'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="ऑफलाइन अध्ययन के लिए सहेजे गए नोट्स"
          >
            <BookmarkCheck className={`w-3.5 h-3.5 ${activeCategoryId === 'saved' ? 'text-white' : 'text-amber-600'}`} />
            <span>सहेजे गए / डाउनलोड नोट्स</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeCategoryId === 'saved' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {savedOfflineNoteIds.length}
            </span>
          </button>

          {categories.map(category => {
            const count = lessons.filter(l => l.categoryId === category.id).length;
            const isSelected = activeCategoryId === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{category.iconEmoji || '📁'}</span>
                <span>{category.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="नोट्स या विषय खोजें..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs text-slate-900"
          />
        </div>
      </div>

      {/* Grid of Notes Cards */}
      {filteredLessons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredLessons.map(lesson => {
            const category = getCategoryForLesson(lesson.categoryId);
            const readTime = calculateReadTime(lesson.notes);
            const isSaved = savedOfflineNoteIds.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                onClick={() => onReadNote(lesson.id)}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Category & Read Time Tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-150 truncate">
                        {category?.name || 'सामान्य अध्ययन'}
                      </span>
                      {isSaved && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                          <BookmarkCheck className="w-3 h-3 text-amber-600" />
                          <span>ऑफलाइन सेव</span>
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 shrink-0">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {readTime} पठन
                    </span>
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 group-hover:scale-105 transition-transform">
                      {lesson.iconEmoji || '📖'}
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Excerpt Snippet */}
                  {lesson.notes && (
                    <div className="bg-slate-50/80 rounded-xl p-2.5 text-xs text-slate-700 border border-slate-150 line-clamp-2 mb-3 leading-relaxed">
                      {lesson.notes.replace(/[#*`_~|]/g, '').replace(/---/g, ' ')}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div
                  className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="text-xs font-semibold text-slate-500">
                    {lesson.questions?.length || 0} वस्तुनिष्ठ प्रश्न
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onReadNote(lesson.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>नोट्स पढ़ें</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartQuiz(lesson.id)}
                      disabled={!lesson.questions || lesson.questions.length === 0}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        lesson.questions && lesson.questions.length > 0
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>टेस्ट</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
          <div className="text-4xl mb-3">
            {activeCategoryId === 'saved' ? '📑' : '📖'}
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {activeCategoryId === 'saved'
              ? 'कोई सहेजा हुआ ऑफलाइन नोट्स नहीं मिला'
              : searchTerm
              ? 'कोई मेल खाता नोट्स नहीं मिला'
              : 'इस विषय में अभी कोई नोट्स उपलब्ध नहीं है'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
            {activeCategoryId === 'saved'
              ? 'किसी भी अध्याय को पढ़ते समय "सहेजें" बटन पर क्लिक करके ऑफलाइन एक्सेस करें।'
              : 'एडमिन पोर्टल से अपने नोट्स और परीक्षा सारांश आसानी से जोड़ें।'}
          </p>
          <button
            onClick={() => onOpenAdmin('upload')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + नया नोट्स जोड़ें
          </button>
        </div>
      )}
    </div>
  );
});

export default NotesHub;
