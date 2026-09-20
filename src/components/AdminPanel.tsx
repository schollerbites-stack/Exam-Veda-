import React, { useState, useEffect } from 'react';
import { Category, Lesson, Question } from '../types';
import { parseRawMCQText, formatQuestionsToRaw } from '../utils/parser';
import {
  Upload,
  FolderKanban,
  Layers,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Check,
  Eye,
  FileText,
  BookOpen,
  Play
} from 'lucide-react';

interface AdminPanelProps {
  categories: Category[];
  lessons: Lesson[];
  initialTab?: 'upload' | 'categories' | 'lessons';
  defaultCategoryId?: string;
  onAddCategory: (category: Category) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onSaveLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onResetData: () => void;
  onClearAllData?: () => void;
  onNavigateHome: () => void;
  onStartQuiz?: (lessonId: string) => void;
}

const SAMPLE_RAW_TEXT = `1. भारतीय संविधान में मौलिक अधिकार किस देश से लिए गए हैं?
A. ब्रिटेन
B. संयुक्त राज्य अमेरिका (USA)
C. आयरलैंड
D. रूस
Ans. B
Exp: मौलिक अधिकार (Fundamental Rights) अमेरिकी संविधान के बिल ऑफ राइट्स से प्रेरित हैं।

2. संविधान के किस भाग को 'भारत का मैग्नाकार्टा' कहा जाता है?
A. भाग II
B. भाग III
C. भाग IV
D. भाग IV-A
Ans. B
Exp: भाग III (अनुच्छेद 12 से 35) में मौलिक अधिकारों का उल्लेख है, जिसे मैग्नाकार्टा कहा जाता है।`;

export const AdminPanel: React.FC<AdminPanelProps> = ({
  categories,
  lessons,
  initialTab = 'upload',
  defaultCategoryId,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onSaveLesson,
  onDeleteLesson,
  onResetData,
  onClearAllData,
  onNavigateHome,
  onStartQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'categories' | 'lessons'>(initialTab);

  // Lesson Form State
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    defaultCategoryId || categories[0]?.id || ''
  );
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonEmoji, setLessonEmoji] = useState('📖');
  const [lessonNotes, setLessonNotes] = useState('');
  const [rawMCQText, setRawMCQText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [lessonSaveSuccess, setLessonSaveSuccess] = useState(false);

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('📜');
  const [catColor, setCatColor] = useState('amber');
  const [catDesc, setCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catSaveSuccess, setCatSaveSuccess] = useState(false);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Search filter for lessons
  const [lessonSearch, setLessonSearch] = useState('');

  // Sync default category if categories change
  useEffect(() => {
    if (defaultCategoryId) {
      setSelectedCategoryId(defaultCategoryId);
    } else if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [defaultCategoryId, categories]);

  // Live Parser Result
  const parseResult = parseRawMCQText(rawMCQText);

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      alert('कृपया पहले एक श्रेणी चुनें।');
      return;
    }
    if (!lessonTitle.trim()) {
      alert('कृपया पाठ का शीर्षक दर्ज करें।');
      return;
    }
    if (parseResult.questions.length === 0) {
      alert('कोई मान्य प्रश्न नहीं मिला। कृपया दिए गए फॉर्मेट में कम से कम 1 प्रश्न पेस्ट करें।');
      return;
    }

    const lesson: Lesson = {
      id: editingLessonId || `les_${Date.now()}`,
      categoryId: selectedCategoryId,
      title: lessonTitle.trim(),
      description: lessonDesc.trim() || undefined,
      iconEmoji: lessonEmoji || '📖',
      notes: lessonNotes.trim() || undefined,
      questions: parseResult.questions,
      rawText: rawMCQText,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSaveLesson(lesson);
    setLessonSaveSuccess(true);
    setTimeout(() => {
      setLessonSaveSuccess(false);
      setEditingLessonId(null);
      setLessonTitle('');
      setLessonDesc('');
      setLessonNotes('');
      setRawMCQText('');
      setShowPreview(false);
      setActiveTab('lessons');
    }, 1200);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setSelectedCategoryId(lesson.categoryId);
    setLessonTitle(lesson.title);
    setLessonDesc(lesson.description || '');
    setLessonEmoji(lesson.iconEmoji || '📖');
    setLessonNotes(lesson.notes || '');
    setRawMCQText(lesson.rawText || formatQuestionsToRaw(lesson.questions || []));
    setActiveTab('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      alert('कृपया श्रेणी का नाम दर्ज करें।');
      return;
    }

    if (editingCatId) {
      const existing = categories.find(c => c.id === editingCatId);
      if (existing) {
        onUpdateCategory({
          ...existing,
          name: catName.trim(),
          iconEmoji: catEmoji,
          color: catColor,
          description: catDesc.trim() || undefined,
        });
      }
    } else {
      const newCat: Category = {
        id: `cat_${Date.now()}`,
        name: catName.trim(),
        iconEmoji: catEmoji,
        color: catColor,
        description: catDesc.trim() || undefined,
        createdAt: Date.now(),
      };
      onAddCategory(newCat);
      setSelectedCategoryId(newCat.id);
    }

    setCatSaveSuccess(true);
    setTimeout(() => {
      setCatSaveSuccess(false);
      setEditingCatId(null);
      setCatName('');
      setCatDesc('');
    }, 1000);
  };

  const handleStartEditCat = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatEmoji(cat.iconEmoji);
    setCatColor(cat.color);
    setCatDesc(cat.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePasteSample = () => {
    setRawMCQText(SAMPLE_RAW_TEXT);
    setLessonTitle('मौलिक अधिकार (Fundamental Rights)');
    setLessonDesc('भाग 3: अनुच्छेद 12 से 35 की संपूर्ण व्याख्या');
    setLessonEmoji('⚖️');
  };

  // Filter lessons
  const filteredLessons = lessons.filter(l => {
    return (
      l.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(lessonSearch.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-slate-100/70 pb-32 text-slate-900">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-3 sm:px-5 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Back to Home */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-700" />
            <span>होम</span>
          </button>

          {/* Title */}
          <div className="text-center flex-1">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              एडमिन डेटा पोर्टल
            </h1>
            <p className="text-[11px] text-slate-600 hidden sm:block leading-none mt-0.5">
              विषय, पाठ, अध्ययन नोट्स व प्रश्न प्रबंधन
            </p>
          </div>

          {/* Reset Action */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            title="डेटा साफ़ करें या डिफ़ॉल्ट रीसेट करें"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>डेटा रीसेट</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-3 sm:px-5 py-3 space-y-3">
        {/* Navigation Tabs */}
        <div className="bg-white p-0.5 rounded-xl border border-slate-200 shadow-xs grid grid-cols-3 gap-0.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1.5 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {editingLessonId ? 'एडिट पाठ' : '+ नया पाठ जोड़ें'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('lessons')}
            className={`py-2 px-1.5 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center ${
              activeTab === 'lessons'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">सभी पाठ ({lessons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1.5 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center ${
              activeTab === 'categories'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">श्रेणियां ({categories.length})</span>
          </button>
        </div>

        {/* TAB 1: LESSON FORM */}
        {activeTab === 'upload' && (
          <form onSubmit={handleSaveLesson} className="space-y-4">
            {editingLessonId && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 font-medium">
                <span className="flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-amber-700 shrink-0" />
                  मौजूदा पाठ संपादित किया जा रहा है: <strong>{lessonTitle}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingLessonId(null);
                    setLessonTitle('');
                    setLessonDesc('');
                    setLessonNotes('');
                    setRawMCQText('');
                  }}
                  className="px-2 py-1 bg-white rounded-lg border border-amber-300 text-amber-800 font-bold hover:bg-amber-100 cursor-pointer"
                >
                  रद्द करें
                </button>
              </div>
            )}

            {/* Step 1: Basic Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                  1
                </span>
                विषय व पाठ विवरण (Subject & Lesson Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Select Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    1. विषय / श्रेणी चुनें (Subject) *
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={e => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-900 cursor-pointer"
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.iconEmoji} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lesson Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    2. पाठ का नाम (Lesson Title) *
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. सिंधु घाटी सभ्यता या मौलिक अधिकार"
                    value={lessonTitle}
                    onChange={e => setLessonTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Emoji & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    इमोजी आइकॉन
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={lessonEmoji}
                      onChange={e => setLessonEmoji(e.target.value)}
                      placeholder="📖"
                      className="w-14 h-10 text-center text-xl bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    />
                    <div className="flex items-center gap-1 overflow-x-auto py-1">
                      {['⚖️', '📖', '📜', '🌍', '🔬', '💡', '🎯', '🏛️'].map(em => (
                        <button
                          type="button"
                          key={em}
                          onClick={() => setLessonEmoji(em)}
                          className="w-7 h-7 rounded-lg text-sm bg-slate-100 hover:bg-indigo-100 flex items-center justify-center cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    संक्षिप्त विवरण (Description - वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. महत्वपूर्ण 25 प्रश्न व संपूर्ण व्याख्या"
                    value={lessonDesc}
                    onChange={e => setLessonDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Study Notes (Optional Theory) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                    2
                  </span>
                  अध्ययन नोट्स व थ्योरी (Study Notes - Optional)
                </h2>
              </div>

              <div>
                <textarea
                  rows={4}
                  placeholder={`## मुख्य बिंदु\n• महत्वपूर्ण तथ्य यहाँ लिखें\n📌 परीक्षा उपयोगी बिंदु...`}
                  value={lessonNotes}
                  onChange={e => setLessonNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 leading-relaxed"
                />
              </div>
            </div>

            {/* Step 3: Raw MCQ Text Area */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                    3
                  </span>
                  कच्चा प्रश्न टेक्स्ट (Raw MCQ with Explanation) *
                </h2>

                <button
                  type="button"
                  onClick={handlePasteSample}
                  className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>नमूना टेक्स्ट भरें</span>
                </button>
              </div>

              <div>
                <textarea
                  rows={8}
                  placeholder={`1. प्रश्न यहाँ लिखें?
A. विकल्प 1
B. विकल्प 2
C. विकल्प 3
D. विकल्प 4
Ans. B
Exp: विस्तृत व्याख्या यहाँ...`}
                  value={rawMCQText}
                  onChange={e => setRawMCQText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span
                  className={`px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                    parseResult.questions.length > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{parseResult.questions.length} प्रश्न पहचाने गए</span>
                </span>

                {parseResult.questions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showPreview ? 'प्रिव्यू छिपाएं' : 'प्रिव्यू देखें'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Save Success Alert */}
            {lessonSaveSuccess && (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>पाठ सफलतापूर्वक सहेज लिया गया!</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={parseResult.questions.length === 0 || !lessonTitle.trim()}
                className={`w-full py-3.5 px-6 rounded-2xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                  parseResult.questions.length > 0 && lessonTitle.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5" />
                <span>{editingLessonId ? 'अपडेट सुरक्षित करें' : 'पाठ सहेजें और जोड़ें'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: LESSONS LIST */}
        {activeTab === 'lessons' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-xs font-bold text-slate-800">
                कुल उपलब्ध पाठ: {filteredLessons.length}
              </div>
              <input
                type="text"
                placeholder="पाठ खोजें..."
                value={lessonSearch}
                onChange={e => setLessonSearch(e.target.value)}
                className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {filteredLessons.map(lesson => {
                const cat = categories.find(c => c.id === lesson.categoryId);
                const qCount = lesson.questions?.length || 0;

                return (
                  <div
                    key={lesson.id}
                    className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl p-1 bg-slate-50 rounded-lg border border-slate-200 shrink-0">
                        {lesson.iconEmoji || '📖'}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          {cat?.name || 'विषय'}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                          {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded hidden sm:inline">
                        {qCount} MCQs
                      </span>

                      <button
                        type="button"
                        onClick={() => handleEditLesson(lesson)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        एडिट
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`क्या आप "${lesson.title}" को हटाना चाहते हैं?`)) {
                            onDeleteLesson(lesson.id);
                          }
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <form
              onSubmit={handleSaveCategory}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5"
            >
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>{editingCatId ? 'श्रेणी संपादित करें' : '+ नई श्रेणी जोड़ें'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    श्रेणी का नाम *
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. अर्थशास्त्र"
                    value={catName}
                    onChange={e => setCatName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    इमोजी आइकॉन
                  </label>
                  <input
                    type="text"
                    value={catEmoji}
                    onChange={e => setCatEmoji(e.target.value)}
                    placeholder="📜"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCatId ? 'अपडेट करें' : '+ श्रेणी जोड़ें'}</span>
                </button>
              </div>
            </form>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-700">मौजूदा श्रेणियां ({categories.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{cat.iconEmoji}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{cat.name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditCat(cat)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`क्या आप श्रेणी "${cat.name}" को हटाना चाहते हैं?`)) {
                            onDeleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
              <span>डेटा रीसेट</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              क्या आप डिफ़ॉल्ट विषय व लेसन्स को पुनः लोड करना चाहते हैं?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                डिफ़ॉल्ट डेटा लोड करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
