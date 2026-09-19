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

const SAMPLE_RAW_TEXT = `1. हड़प्पा सभ्यता की खोज किस वर्ष में हुई थी?
A. 1905
B. 1921
C. 1935
D. 1947
Ans. B
Exp: रायबहादुर दयाराम साहनी ने 1921 में हड़प्पा की खोज की थी।

2. सिंधु सभ्यता का प्रमुख पत्तन नगर (बंदरगाह) कौन-सा था?
A. कालीबंगन
B. लोथल
C. रोपड़
D. मोहनजोदड़ो
Ans. B
Exp: लोथल गुजरात के भोगवा नदी तट पर स्थित हड़प्पा कालीन प्रमुख बंदरगाह था।`;

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
      alert('कृपया लेसन का शीर्षक (Title) दर्ज करें।');
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
      iconEmoji: lessonEmoji,
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
    if (!lessonTitle) {
      setLessonTitle('सिंधु घाटी सभ्यता - अभ्यास टेस्ट');
    }
  };

  const filteredLessons = lessons.filter(l =>
    l.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
    (l.description && l.description.toLowerCase().includes(lessonSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-100/70 pb-32 text-slate-900">
      {/* Top Mobile-First Header */}
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
              MCQ प्रश्न, श्रेणियां व पाठ्य सामग्री प्रबंधन
            </p>
          </div>

          {/* Data Management Action */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            title="डेटा साफ़ करें या डिफ़ॉल्ट रीसेट करें"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>डेटा प्रबंधन</span>
          </button>
        </div>
      </div>

      {/* Main Container - Arranged to fit 100% on mobile screens */}
      <div className="max-w-4xl mx-auto px-3 sm:px-5 py-3 space-y-3">
        {/* Mobile Navigation Tabs */}
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
              {editingLessonId ? 'एडिट लेसन' : 'MCQ अपलोड'}
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
            <span className="truncate">लेसन ({lessons.length})</span>
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

        {/* TAB 1: MCQ RAW UPLOAD FORM */}
        {activeTab === 'upload' && (
          <form onSubmit={handleSaveLesson} className="space-y-4">
            {/* Header notification if editing */}
            {editingLessonId && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 font-medium">
                <span className="flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-amber-700 shrink-0" />
                  मौजूदा लेसन संपादित किया जा रहा है: <strong>{lessonTitle}</strong>
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
                  className="px-2 py-1 bg-white rounded-lg border border-amber-300 text-amber-800 font-bold hover:bg-amber-100"
                >
                  रद्द करें
                </button>
              </div>
            )}

            {/* Step 1: Category & Basic Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                  1
                </span>
                लेसन की मूल जानकारी (Basic Info)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Select Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    श्रेणी चुनें (Target Category) *
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={e => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-900"
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
                    लेसन / अध्याय का नाम (Title) *
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. सिंधु घाटी सभ्यता - टेस्ट 1"
                    value={lessonTitle}
                    onChange={e => setLessonTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3.5">
                {/* Lesson Emoji with custom keyboard support */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      आइकॉन इमोजी (Emoji - कीबोर्ड से कोई भी इमोजी टाइप/पेस्ट करें)
                    </label>
                    <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                      चयनित: {lessonEmoji || '📖'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                    {/* Direct Keyboard Input */}
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="text"
                        value={lessonEmoji}
                        onChange={e => setLessonEmoji(e.target.value)}
                        placeholder="📖"
                        className="w-16 h-11 text-center text-2xl bg-white border-2 border-indigo-400 focus:border-indigo-600 rounded-xl font-bold shadow-xs focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                        title="यहाँ कीबोर्ड से कोई भी कस्टम इमोजी टाइप या पेस्ट करें"
                      />
                      <span className="text-xs text-slate-500 font-medium">
                        ← कीबोर्ड से टाइप करें
                      </span>
                    </div>

                    {/* Quick Select Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto py-1">
                      {['📖', '📜', '🌍', '⚖️', '🔬', '💡', '🎯', '🏛️', '💻', '🇮🇳', '⚡', '🧬', '📐', '💰', '🏹', '🌿', '🧠', '📊', '👑', '📝', '🧪', '🗺️'].map(emoji => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => setLessonEmoji(emoji)}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                            lessonEmoji === emoji
                              ? 'bg-indigo-100 border-indigo-600 scale-110 shadow-xs'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    संक्षिप्त विवरण (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. हड़प्पा कालीन महत्वपूर्ण 20 वस्तुनिष्ठ प्रश्न"
                    value={lessonDesc}
                    onChange={e => setLessonDesc(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Study Notes (Optional Theory / Quick Revision) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                    2
                  </span>
                  अध्याय के अध्ययन नोट्स व थ्योरी (Study Notes - Optional)
                </h2>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200 self-start sm:self-auto">
                  छात्र नोट्स भी पढ़ सकेंगे और क्विज़ भी दे सकेंगे
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  विस्तृत नोट्स (Markdown, तालिकायें, महत्वपूर्ण बिंदु • व 📌 समर्थित)
                </label>
                <textarea
                  rows={4}
                  placeholder={`## मुख्य बिंदु\n• हड़प्पा सभ्यता 2500 ईसा पूर्व से 1750 ईसा पूर्व तक फली-फूली।\n📌 परीक्षा उपयोगी बिंदु: मोहनजोदड़ो से विशाल स्नानागार मिला।`}
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
                  कच्चा प्रश्न टेक्स्ट (Raw MCQ with 1-Liner Explanation) *
                </h2>

                <button
                  type="button"
                  onClick={handlePasteSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  + 1-लाइनर नमूना पेस्ट करें
                </button>
              </div>

              {/* Helpful Hint Card */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 text-xs text-slate-800 space-y-1.5">
                <div className="font-bold text-indigo-950 flex items-center gap-1">
                  <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>सही 1-लाइनर फॉर्मेट (सुझाया गया तरीका):</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-indigo-150 font-mono text-xs text-slate-800 leading-relaxed overflow-x-auto">
                  1. प्रश्न यहाँ लिखें?<br />
                  A. पहला विकल्प<br />
                  B. दूसरा विकल्प<br />
                  C. तीसरा विकल्प<br />
                  D. चौथा विकल्प<br />
                  <strong className="text-emerald-700">Ans. B</strong><br />
                  <strong className="text-indigo-700">Exp: यहाँ अपनी 1-लाइनर व्याख्या लिखें।</strong>
                </div>
              </div>

              {/* Textarea */}
              <div>
                <textarea
                  rows={9}
                  placeholder={`यहाँ अपने प्रश्न पेस्ट करें...\n1. सिंधु सभ्यता की खोज कब हुई?\nA. 1905\nB. 1921\nAns. B\nExp: दयाराम साहनी ने 1921 में हड़प्पा की खोज की थी।`}
                  value={rawMCQText}
                  onChange={e => setRawMCQText(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs sm:text-sm text-slate-900 leading-relaxed placeholder:text-slate-400 focus:bg-white"
                ></textarea>
              </div>

              {/* Parser Real-time Analysis Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    पहचाने गए प्रश्न:
                  </span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full border text-xs ${
                      parseResult.questions.length > 0
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {parseResult.questions.length} प्रश्न
                  </span>
                </div>

                {parseResult.questions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showPreview ? 'प्रिव्यू छुपाएं' : 'प्रश्नों का प्रिव्यू देखें'}</span>
                  </button>
                )}
              </div>

              {/* Optional Live Preview Drawer */}
              {showPreview && parseResult.questions.length > 0 && (
                <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-3 space-y-3 max-h-64 overflow-y-auto">
                  <div className="font-bold text-xs text-indigo-950">
                    पहचाने गए प्रश्नों की झलक (Preview):
                  </div>
                  {parseResult.questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-900">
                        Q{idx + 1}. {q.questionText}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-slate-700 text-xs pt-1">
                        {q.options.map(opt => (
                          <div
                            key={opt.label}
                            className={`px-2 py-1 rounded ${
                              opt.label === q.correctAnswer
                                ? 'bg-emerald-100 font-bold text-emerald-900 border border-emerald-300'
                                : 'bg-slate-50'
                            }`}
                          >
                            <strong>{opt.label}.</strong> {opt.text}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="mt-1 text-xs text-indigo-900 bg-indigo-50 p-2 rounded border border-indigo-150">
                          <strong>व्याख्या:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Success Banner */}
            {lessonSaveSuccess && (
              <div className="bg-emerald-100 border border-emerald-400 text-emerald-900 p-3.5 rounded-2xl flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>लेसन सफलतापूर्वक सहेज लिया गया! लेसन सूची पर जा रहे हैं...</span>
              </div>
            )}

            {/* Submit Action Button */}
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
                <span>
                  {editingLessonId ? 'संशोधन सुरक्षित करें (Update Lesson)' : 'नया लेसन सहेजें और जोड़ें'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: LESSON FOLDERS LIST */}
        {activeTab === 'lessons' && (
          <div className="space-y-3.5">
            {/* Search and count header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-xs font-bold text-slate-800">
                कुल उपलब्ध लेसन्स: {lessons.length}
              </div>
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="लेसन का नाम खोजें..."
                  value={lessonSearch}
                  onChange={e => setLessonSearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>

            {/* Lessons List */}
            {filteredLessons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredLessons.map((lesson, idx) => {
                  const cat = categories.find(c => c.id === lesson.categoryId);
                  const qCount = lesson.questions?.length || 0;

                  return (
                    <div
                      key={lesson.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 shadow-xs flex flex-col justify-between group space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                            {lesson.iconEmoji || '📖'}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-150">
                              {cat?.name || 'अध्ययन'}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                              {lesson.title}
                            </h3>
                            {lesson.description && (
                              <p className="text-xs text-slate-700 line-clamp-2 mt-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom bar with action buttons */}
                      <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800">
                            {qCount} MCQs
                          </span>
                          {lesson.notes && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              📖 नोट्स
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onStartQuiz && (
                            <button
                              type="button"
                              onClick={() => onStartQuiz(lesson.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                              title="क्विज़ शुरू करें"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>क्विज़</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEditLesson(lesson)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold flex items-center gap-1 border border-indigo-200 cursor-pointer"
                            title="प्रश्नों को एडिट करें"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>एडिट</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`क्या आप "${lesson.title}" को हटाना चाहते हैं?`)) {
                                onDeleteLesson(lesson.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="लेसन हटाएं"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-700 text-xs">
                कोई लेसन नहीं मिला। नया लेसन जोड़ने के लिए पहले टैब "MCQ अपलोड" पर जाएं।
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CATEGORY MANAGER */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            {/* Add / Edit Category Form */}
            <form
              onSubmit={handleSaveCategory}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5"
            >
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>
                  {editingCatId ? 'श्रेणी संपादित करें (Edit Category)' : '+ नई श्रेणी जोड़ें'}
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    श्रेणी का नाम (Category Name) *
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. अर्थशास्त्र (Economics)"
                    value={catName}
                    onChange={e => setCatName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    रंग थीम (Color Theme)
                  </label>
                  <select
                    value={catColor}
                    onChange={e => setCatColor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs text-slate-900 font-medium"
                  >
                    <option value="amber">अंबर पीला (Amber)</option>
                    <option value="emerald">पन्ना हरा (Emerald)</option>
                    <option value="indigo">गहरा नीला (Indigo)</option>
                    <option value="rose">गुलाबी / लाल (Rose)</option>
                    <option value="sky">आसमानी नीला (Sky)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3.5">
                {/* Category Emoji with custom keyboard support */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      आइकॉन इमोजी (Emoji - कीबोर्ड से कोई भी इमोजी टाइप/पेस्ट करें)
                    </label>
                    <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                      चयनित: {catEmoji || '📜'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                    {/* Direct Keyboard Input */}
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="text"
                        value={catEmoji}
                        onChange={e => setCatEmoji(e.target.value)}
                        placeholder="📜"
                        className="w-16 h-11 text-center text-2xl bg-white border-2 border-indigo-400 focus:border-indigo-600 rounded-xl font-bold shadow-xs focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                        title="यहाँ कीबोर्ड से कोई भी कस्टम इमोजी टाइप या पेस्ट करें"
                      />
                      <span className="text-xs text-slate-500 font-medium">
                        ← कीबोर्ड से टाइप करें
                      </span>
                    </div>

                    {/* Quick Select Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto py-1">
                      {['📜', '🌍', '⚖️', '🔬', '📈', '🏛️', '💡', '📚', '🎯', '💻', '🇮🇳', '⚡', '🧬', '💰', '🌿', '🧠', '📊', '👑', '⚔️', '📝'].map(em => (
                        <button
                          type="button"
                          key={em}
                          onClick={() => setCatEmoji(em)}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                            catEmoji === em
                              ? 'bg-indigo-100 border-indigo-600 scale-110 shadow-xs'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    विवरण (Description - संक्षिप्त परिचय)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. भारतीय अर्थव्यवस्था, बजट और महत्वपूर्ण सिद्धांत"
                    value={catDesc}
                    onChange={e => setCatDesc(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-900 font-medium"
                  />
                </div>
              </div>

              {catSaveSuccess && (
                <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>श्रेणी सफलतापूर्वक सहेज ली गई!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                {editingCatId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(null);
                      setCatName('');
                      setCatDesc('');
                    }}
                    className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
                  >
                    रद्द करें
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingCatId ? 'श्रेणी अपडेट करें' : '+ श्रेणी जोड़ें'}
                </button>
              </div>
            </form>

            {/* Existing Categories Cards */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800">
                मौजूदा श्रेणियां ({categories.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat, idx) => {
                  const catLessons = lessons.filter(l => l.categoryId === cat.id);
                  const mcqCount = catLessons.reduce((sum, l) => sum + (l.questions?.length || 0), 0);

                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-slate-50 border border-slate-200">
                          {cat.iconEmoji}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                          <span className="text-xs font-semibold text-slate-700">
                            {catLessons.length} लेसन्स • {mcqCount} प्रश्न
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditCat(cat)}
                          className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          title="श्रेणी संपादित करें"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`क्या आप श्रेणी "${cat.name}" और इसके सभी लेसन्स को हटाना चाहते हैं?`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="श्रेणी हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Data Management (Clear Data or Load Standard) */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 border-b border-slate-200 pb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">डेटा प्रबंधन (Data Management)</h3>
                <p className="text-xs text-slate-600">डेटा साफ़ करें या डिफ़ॉल्ट सिलेबस बहाल करें</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              {/* Option 1: Clear All Data */}
              <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>सारा डेटा साफ़ करें (Clear All Data / Fresh Start)</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  सभी मौजूदा श्रेणियां, लेसन्स और टेस्ट इतिहास हटा दिए जाएंगे ताकि आप अपनी खुद की सामग्री शून्य से जोड़ सकें।
                </p>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    if (onClearAllData) {
                      onClearAllData();
                    }
                  }}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer active:scale-95 shadow-xs"
                >
                  हाँ, सारा डेटा साफ़ करें (0 आइटम)
                </button>
              </div>

              {/* Option 2: Restore Standard NCERT/UPSC Syllabus */}
              <div className="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>प्रमाणिक सिलेबस लोड करें (Load Standard Syllabus)</span>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  इतिहास, भूगोल, राजव्यवस्था और विज्ञान के वास्तविक NCERT/PYQ वस्तुनिष्ठ प्रश्न व नोट्स लोड करें।
                </p>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    onResetData();
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer active:scale-95 shadow-xs"
                >
                  मानक सिलेबस पुनर्स्थापित करें
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
