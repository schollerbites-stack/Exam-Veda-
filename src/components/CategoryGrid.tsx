import React, { useState } from 'react';
import { Category, Lesson } from '../types';
import { ChevronRight, Plus, BookOpen, Layers, Search, Sparkles } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  lessons: Lesson[];
  onSelectCategory: (categoryId: string, initialTab?: 'questions' | 'notes') => void;
  onOpenNotes?: () => void;
  onOpenAdmin: (initialTab?: 'upload' | 'categories' | 'lessons', defaultCategoryId?: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  lessons,
  onSelectCategory,
  onOpenNotes,
  onOpenAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryStats = (categoryId: string) => {
    const categoryLessons = lessons.filter(l => l.categoryId === categoryId);
    const totalMCQs = categoryLessons.reduce((sum, l) => sum + (l.questions?.length || 0), 0);
    const notesCount = categoryLessons.filter(l => Boolean(l.notes)).length;
    return {
      lessonCount: categoryLessons.length,
      mcqCount: totalMCQs,
      notesCount,
    };
  };

  const getCardColorClasses = (color: string) => {
    switch (color) {
      case 'amber':
        return {
          bg: 'hover:border-amber-400 bg-linear-to-br from-amber-50/50 via-white to-orange-50/30',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          accent: 'text-amber-600',
          btnHover: 'hover:bg-amber-50 text-amber-700',
        };
      case 'emerald':
        return {
          bg: 'hover:border-emerald-400 bg-linear-to-br from-emerald-50/50 via-white to-teal-50/30',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          accent: 'text-emerald-600',
          btnHover: 'hover:bg-emerald-50 text-emerald-700',
        };
      case 'indigo':
        return {
          bg: 'hover:border-indigo-400 bg-linear-to-br from-indigo-50/50 via-white to-blue-50/30',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          accent: 'text-indigo-600',
          btnHover: 'hover:bg-indigo-50 text-indigo-700',
        };
      case 'rose':
        return {
          bg: 'hover:border-rose-400 bg-linear-to-br from-rose-50/50 via-white to-pink-50/30',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          accent: 'text-rose-600',
          btnHover: 'hover:bg-rose-50 text-rose-700',
        };
      default:
        return {
          bg: 'hover:border-sky-400 bg-linear-to-br from-sky-50/50 via-white to-cyan-50/30',
          badge: 'bg-sky-100 text-sky-800 border-sky-200',
          accent: 'text-sky-600',
          btnHover: 'hover:bg-sky-50 text-sky-700',
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-5 py-4 sm:py-5 space-y-4">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              अध्ययन विषय एवं श्रेणियां
            </h1>
            <span className="text-base">✨</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
            नीचे दी गई श्रेणियों (2-2 के जोड़ों में) से विषय चुनें और मॉक टेस्ट शुरू करें।
          </p>
        </div>

        {/* Search Input & Quick Add */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="विषय या श्रेणी खोजें..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs"
            />
          </div>

          <button
            onClick={() => onOpenAdmin('categories')}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-colors cursor-pointer"
            title="नई श्रेणी जोड़ें"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">नई श्रेणी</span>
          </button>
        </div>
      </div>

      {/* Section Switcher: Questions/Quizzes vs Study Notes */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-indigo-600 text-white shadow-xs">
            <Layers className="w-3.5 h-3.5" />
            <span>📝 प्रश्न व मॉक क्विज़ ({categories.length} विषय)</span>
          </div>

          {onOpenNotes && (
            <button
              onClick={onOpenNotes}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-150 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>📖 अध्ययन नोट्स (Notes)</span>
            </button>
          )}
        </div>

        <div className="hidden sm:block text-xs text-slate-500 font-medium pr-2">
          {lessons.length} कुल पाठ • छात्र नोट्स व क्विज़ दोनों एक साथ कर सकते हैं
        </div>
      </div>

      {/* 2-by-2 Pair Grid as requested by user ("2- 2 ke pair me arrange hogi neeche tkk") */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {filteredCategories.map((category, index) => {
            const stats = getCategoryStats(category.id);
            const style = getCardColorClasses(category.color);

            return (
              <div
                key={category.id}
                className={`group relative rounded-xl border border-slate-200 p-4 sm:p-4.5 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between ${style.bg}`}
                onClick={() => onSelectCategory(category.id)}
              >
                {/* Top Section */}
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-white shadow-xs border border-slate-200 group-hover:scale-105 transition-transform">
                        {category.iconEmoji || '📚'}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md border bg-white/80 text-slate-700">
                            #{index + 1}
                          </span>
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md border ${style.badge}`}>
                            {stats.lessonCount} लेसन्स
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mt-0.5">
                          {category.name}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-xs text-slate-700 line-clamp-2 mb-3 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Bottom Stats & Action Bar */}
                <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs mt-1">
                  <div className="flex items-center gap-2 text-slate-700 font-medium text-[11px] sm:text-xs flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      {stats.mcqCount} MCQs
                    </span>
                    {stats.notesCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-indigo-700 font-bold">
                          <BookOpen className="w-3 h-3 text-indigo-600" />
                          {stats.notesCount} नोट्स
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCategory(category.id, 'notes');
                      }}
                      className="px-2 py-0.5 rounded-md text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="इस श्रेणी के नोट्स पढ़ें"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>नोट्स</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAdmin('upload', category.id);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium border border-transparent transition-colors ${style.btnHover}`}
                      title="इस श्रेणी में नया लेसन अपलोड करें"
                    >
                      + लेसन
                    </button>

                    <span className="flex items-center gap-0.5 font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform text-xs">
                      खोलें
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-base font-bold text-slate-800">कोई श्रेणी नहीं मिली</h3>
          <p className="text-xs text-slate-700 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `"${searchTerm}" से संबंधित कोई श्रेणी मौजूद नहीं है।`
              : 'अभी तक कोई श्रेणी नहीं जोड़ी गई है। + आइकन दबाकर पहली श्रेणी जोड़ें!'}
          </p>
          <button
            onClick={() => onOpenAdmin('categories')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            नई श्रेणी बनाएं
          </button>
        </div>
      )}
    </div>
  );
};
