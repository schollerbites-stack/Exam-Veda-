import React, { useState } from 'react';
import { Category, Lesson } from '../types';
import { ArrowLeft, Play, Plus, BookOpen, Layers, Edit2, Trash2, Search, FileText, CheckCircle2 } from 'lucide-react';

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

export const CategoryDetail: React.FC<CategoryDetailProps> = ({
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

  const categoryLessons = lessons.filter(l => l.categoryId === category.id);
  const filteredLessons = categoryLessons.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.notes && l.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalQuestions = categoryLessons.reduce((sum, l) => sum + (l.questions?.length || 0), 0);
  const lessonsWithNotesCount = categoryLessons.filter(l => Boolean(l.notes)).length;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-5 py-4 sm:py-5 space-y-4">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          सभी श्रेणियों पर वापस जाएं
        </button>

        <button
          onClick={() => onOpenAdmin('upload', category.id)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          + नया लेसन / नोट्स
        </button>
      </div>

      {/* Category Banner */}
      <div className="rounded-xl border border-slate-200 bg-linear-to-r from-slate-900 to-indigo-950 text-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl sm:text-3xl p-2 bg-white/10 backdrop-blur rounded-xl border border-white/20 shrink-0">
              {category.iconEmoji || '📚'}
            </span>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 mb-0.5">
                <span>श्रेणी / विषय</span>
                <span>•</span>
                <span>{categoryLessons.length} लेसन्स</span>
                <span>•</span>
                <span>{totalQuestions} कुल प्रश्न</span>
                <span>•</span>
                <span>{lessonsWithNotesCount} अध्याय नोट्स</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side Section Tabs: Questions vs Notes (Same bar / bagal me) */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>📝 प्रश्न व मॉक टेस्ट ({categoryLessons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 अध्ययन नोट्स (Notes)</span>
          </button>
        </div>

        <div className="hidden sm:block text-xs text-slate-500 font-medium pr-2">
          {activeTab === 'questions' ? 'प्रश्नों का अभ्यास करें' : 'थ्योरी व नोट्स पढ़ें'}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {activeTab === 'questions'
              ? `उपलब्ध लेसन्स एवं मॉक क्विज़ (${filteredLessons.length})`
              : `उपलब्ध अध्ययन नोट्स एवं थ्योरी (${filteredLessons.length})`}
          </h2>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'questions' ? 'लेसन खोजें (जैसे: वैदिक काल)...' : 'नोट्स में खोजें...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Lesson Cards List */}
      {filteredLessons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredLessons.map((lesson, idx) => {
            const qCount = lesson.questions?.length || 0;
            const hasNotes = Boolean(lesson.notes);

            return (
              <div
                key={lesson.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-lg bg-slate-50 border border-slate-200 group-hover:scale-105 transition-transform shrink-0">
                        {lesson.iconEmoji || '📖'}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-700">
                            अध्याय #{idx + 1}
                          </span>
                          {hasNotes && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              नोट्स उपलब्ध
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {lesson.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditLesson(lesson)}
                        className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="प्रश्नों/नोट्स को एडिट करें"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteLesson(lesson.id)}
                        className="p-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="लेसन हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {lesson.description && (
                    <p className="text-xs text-slate-600 mb-2.5 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  )}

                  {/* Notes snippet preview if in notes tab */}
                  {activeTab === 'notes' && lesson.notes && (
                    <div
                      onClick={() => onReadNote(lesson.id)}
                      className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 mb-3 cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors line-clamp-2"
                    >
                      {lesson.notes.replace(/[#*`_~|]/g, '').replace(/---/g, ' ').slice(0, 130)}...
                    </div>
                  )}
                </div>

                {/* Bottom Stats & Actions: Both Notes & Quiz side-by-side */}
                <div className="pt-2.5 border-t border-slate-150 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md">
                    <Layers className="w-3 h-3 text-indigo-600" />
                    <span>{qCount} MCQs</span>
                  </div>

                  {/* Dual Action Buttons: Read Notes + Take Quiz */}
                  <div className="flex items-center gap-1.5">
                    {/* 1. Read Notes */}
                    <button
                      onClick={() => onReadNote(lesson.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 border border-indigo-200 transition-all cursor-pointer"
                      title="इस अध्याय के नोट्स पढ़ें"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>नोट्स पढ़ें</span>
                    </button>

                    {/* 2. Take Quiz */}
                    <button
                      onClick={() => onStartQuiz(lesson.id)}
                      disabled={qCount === 0}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                        qCount > 0
                          ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                      title="इस अध्याय का मॉक टेस्ट दें"
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
            {searchTerm ? 'कोई मेल खाता परिणाम नहीं मिला' : 'इस श्रेणी में अभी कोई सामग्री नहीं है'}
          </h3>
          <p className="text-xs text-slate-650 mt-1 max-w-sm mx-auto">
            एडमिन पैनल से कच्चा (Raw) प्रश्न डेटा या थ्योरी नोट्स पेस्ट करके आसानी से नया पाठ जोड़ें।
          </p>
          <button
            onClick={() => onOpenAdmin('upload', category.id)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + इस श्रेणी में नया लेसन अपलोड करें
          </button>
        </div>
      )}
    </div>
  );
};

