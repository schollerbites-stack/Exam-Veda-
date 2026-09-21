import React, { useState, useMemo } from 'react';
import { Category, Lesson } from '../types';
import {
  ArrowLeft,
  Play,
  Plus,
  BookOpen,
  Layers,
  Edit2,
  Trash2,
  Search
} from 'lucide-react';

interface CategoryDetailProps {
  category: Category;
  lessons: Lesson[];
  initialTab?: 'questions' | 'notes';
  onBack: () => void;
  onStartQuiz: (lessonId: string) => void;
  onReadNote: (lessonId: string) => void;
  onOpenAdmin: (initialTab?: 'upload' | 'categories' | 'lessons', defaultCategoryId?: string) => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
}

export const CategoryDetail: React.FC<CategoryDetailProps> = React.memo(({
  category,
  lessons,
  initialTab = 'questions',
  onBack,
  onStartQuiz,
  onReadNote,
  onOpenAdmin,
  onEditLesson,
  onDeleteLesson,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'notes'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter lessons belonging to this category
  const categoryLessons = useMemo(() => {
    return lessons.filter(l => l.categoryId === category.id);
  }, [lessons, category.id]);

  // Filter by Search
  const filteredLessons = useMemo(() => {
    if (!searchTerm.trim()) return categoryLessons;
    const query = searchTerm.toLowerCase();
    return categoryLessons.filter(lesson => {
      const matchesTitle = lesson.title.toLowerCase().includes(query);
      const matchesDesc = lesson.description?.toLowerCase().includes(query);
      const matchesNotes = lesson.notes?.toLowerCase().includes(query);
      return matchesTitle || matchesDesc || matchesNotes;
    });
  }, [categoryLessons, searchTerm]);

  const totalQuestions = useMemo(() => {
    return categoryLessons.reduce(
      (sum, l) => sum + (l.questions?.length || 0),
      0
    );
  }, [categoryLessons]);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-5 py-4 sm:py-5 space-y-4 text-slate-900">
      {/* Top Navigation & Action */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>सभी विषयों पर वापस जाएं</span>
        </button>

        <button
          onClick={() => onOpenAdmin('upload', category.id)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ नया पाठ / टॉपिक जोड़ें</span>
        </button>
      </div>

      {/* Category Banner Card */}
      <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl sm:text-4xl p-2.5 bg-white/10 backdrop-blur rounded-2xl border border-white/20 shrink-0">
              {category.iconEmoji || '📚'}
            </span>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 mb-1 flex-wrap">
                <span>विषय</span>
                <span>•</span>
                <span>{categoryLessons.length} अध्याय / पाठ</span>
                <span>•</span>
                <span>{totalQuestions} कुल प्रश्न</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Questions/Mock vs Notes */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-start gap-1">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>📝 अभ्यास व मॉक टेस्ट</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📖 अध्ययन नोट्स (Notes)</span>
        </button>
      </div>

      {/* Search Bar & Count */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="text-xs sm:text-sm font-bold text-slate-800">
          {activeTab === 'questions' ? 'उपलब्ध अध्याय व टेस्ट' : 'उपलब्ध अध्ययन नोट्स'} ({filteredLessons.length})
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="अध्याय खोजें..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-2xs text-slate-900"
          />
        </div>
      </div>

      {/* Grid of Lessons */}
      {filteredLessons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredLessons.map(lesson => {
            const qCount = lesson.questions?.length || 0;
            const hasNotes = Boolean(lesson.notes);

            return (
              <div
                key={lesson.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 p-4 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Icon, Title & Badges */}
                  <div className="flex items-start justify-between gap-2.5 mb-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl sm:text-3xl p-2 bg-slate-50 border border-slate-200 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                        {lesson.iconEmoji || '📖'}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {hasNotes && (
                            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              थ्योरी नोट्स
                            </span>
                          )}
                          {lesson.sharedBy && (
                            <span className="inline-block text-[9px] font-semibold text-slate-600 bg-slate-100 px-1 py-0.2 rounded">
                              शेयर्ड
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {lesson.title}
                        </h3>
                      </div>
                    </div>

                    {/* Quick Edit/Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditLesson(lesson)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        title="एडिट करें"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`क्या आप "${lesson.title}" को हटाना चाहते हैं?`)) {
                            onDeleteLesson(lesson.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {lesson.description && (
                    <p className="text-xs text-slate-600 mb-2 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    {qCount} प्रश्न
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onReadNote(lesson.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>नोट्स पढ़ें</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onStartQuiz(lesson.id)}
                      disabled={qCount === 0}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        qCount > 0
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-98'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>मॉक टेस्ट दें</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
          <div className="text-4xl mb-3">📖</div>
          <h3 className="text-base font-bold text-slate-800">
            {searchTerm ? 'कोई मेल खाता पाठ नहीं मिला' : 'इस विषय में अभी कोई पाठ नहीं है'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
            एडमिन पोर्टल से नए पाठ, प्रश्न और थ्योरी नोट्स आसानी से जोड़ें।
          </p>
          <button
            onClick={() => onOpenAdmin('upload', category.id)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + नया पाठ जोड़ें
          </button>
        </div>
      )}
    </div>
  );
});

export default CategoryDetail;
