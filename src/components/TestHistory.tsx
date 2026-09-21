import React, { useState } from 'react';
import { QuizResult, Category, Lesson } from '../types';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Eye,
  Trash2,
  Calendar,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Award,
  BookOpen,
  Download,
  WifiOff
} from 'lucide-react';

interface TestHistoryProps {
  history: QuizResult[];
  categories: Category[];
  lessons: Lesson[];
  onReviewAttempt: (result: QuizResult) => void;
  onRetakeLesson: (lessonId: string) => void;
  onDeleteAttempt: (attemptId: string) => void;
  onClearHistory: () => void;
  onNavigateHome: () => void;
}

export const TestHistory: React.FC<TestHistoryProps> = React.memo(({
  history,
  categories,
  lessons,
  onReviewAttempt,
  onRetakeLesson,
  onDeleteAttempt,
  onClearHistory,
  onNavigateHome,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');

  // Overall calculations
  const totalTests = history.length;
  const totalCorrect = history.reduce((sum, r) => sum + r.correctCount, 0);
  const totalWrong = history.reduce((sum, r) => sum + r.wrongCount, 0);
  const totalQuestions = history.reduce((sum, r) => sum + r.totalQuestions, 0);
  const avgAccuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalTimeSeconds = history.reduce((sum, r) => sum + (r.timeSpentSeconds || 0), 0);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    if (mins === 0) return `${s} सेकंड`;
    return `${mins} मि ${s} से`;
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filtered attempts
  const filteredHistory = history.filter(r => {
    const matchesSearch =
      r.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCatFilter === 'all' || r.categoryId === selectedCatFilter;
    return matchesSearch && matchesCat;
  });

  // Category wise accuracy analysis
  const categoryStats = categories.map(cat => {
    const catAttempts = history.filter(h => h.categoryId === cat.id);
    const catCorrect = catAttempts.reduce((s, a) => s + a.correctCount, 0);
    const catTotal = catAttempts.reduce((s, a) => s + a.totalQuestions, 0);
    const acc = catTotal > 0 ? Math.round((catCorrect / catTotal) * 100) : 0;
    return {
      category: cat,
      testCount: catAttempts.length,
      accuracy: acc,
      totalCorrect: catCorrect,
      totalQuestions: catTotal,
    };
  });

  const handleDownloadReport = () => {
    if (history.length === 0) return;
    let report = `Edu Veda - विद्यार्थी टेस्ट रिकॉर्ड व प्रोग्रेस कार्ड\n`;
    report += `दिनांक: ${new Date().toLocaleDateString('hi-IN')}\n`;
    report += `कुल टेस्ट: ${totalTests} | कुल प्रश्न: ${totalQuestions} | औसत सटीकता: ${avgAccuracy}%\n`;
    report += `सही उत्तर: ${totalCorrect} | गलत उत्तर: ${totalWrong}\n`;
    report += `========================================================\n\n`;

    history.forEach((h, idx) => {
      report += `${idx + 1}. [${h.categoryName}] ${h.lessonTitle}\n`;
      report += `   तारीख: ${formatDate(h.completedAt)}\n`;
      report += `   स्कोर: ${h.correctCount}/${h.totalQuestions} (${Math.round((h.correctCount / (h.totalQuestions || 1)) * 100)}%)\n`;
      report += `   समय: ${formatTime(h.timeSpentSeconds || 0)}\n\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ExamVeda_Test_History_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-5 py-4 sm:py-5 space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              विद्यार्थी टेस्ट रिकॉर्ड व प्रोग्रेस हिस्ट्री
            </h1>
            <span className="text-base">📊</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              100% ऑफ़लाइन सुरक्षित
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            आपके दिए गए सभी मॉक टेस्ट के परिणाम, गलत व सही उत्तरों का विवरण और ऑफलाइन समीक्षा।
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {history.length > 0 && (
            <>
              <button
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                title="संपूर्ण टेस्ट रिपोर्ट टेक्स्ट फाइल में डाउनलोड करें"
              >
                <Download className="w-3.5 h-3.5" />
                रिपोर्ट डाउनलोड
              </button>

              <button
                onClick={() => {
                  if (confirm('क्या आप वाकई संपूर्ण टेस्ट हिस्ट्री को साफ करना चाहते हैं?')) {
                    onClearHistory();
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                हिस्ट्री साफ करें
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4 Cumulative Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Tests */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-700 mb-0.5 text-[11px] font-semibold">
            <span>कुल टेस्ट दिए</span>
            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {totalTests}
          </div>
          <span className="text-[11px] text-slate-600 font-medium mt-0.5 block">
            {totalQuestions} कुल प्रश्न हल किए
          </span>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-indigo-700 mb-0.5 text-[11px] font-semibold">
            <span>औसत सटीकता</span>
            <Trophy className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-indigo-600">
            {avgAccuracy}%
          </div>
          <span className="text-[11px] text-indigo-700 font-semibold mt-0.5 block">
            {avgAccuracy >= 75 ? 'उत्कृष्ट स्तर 🌟' : 'सुधार की संभावना 🎯'}
          </span>
        </div>

        {/* Total Correct */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-0.5 text-[11px] font-semibold">
            <span>सही उत्तर</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">
            {totalCorrect}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
            अंक अर्जित किए
          </span>
        </div>

        {/* Total Wrong */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-0.5 text-[11px] font-semibold">
            <span>गलत उत्तर</span>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-600">
            {totalWrong}
          </div>
          <span className="text-[11px] text-rose-700 font-semibold mt-0.5 block">
            पुनः अभ्यास आवश्यक
          </span>
        </div>
      </div>

      {/* Subject-Wise Performance Breakdown */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            विषयवार प्रदर्शन प्रगति (Subject-wise Accuracy)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryStats.map(stat => (
              <div
                key={stat.category.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span>{stat.category.iconEmoji}</span>
                    <span>{stat.category.name}</span>
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[11px] font-semibold ${
                      stat.testCount === 0
                        ? 'bg-slate-200 text-slate-700'
                        : stat.accuracy >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {stat.testCount === 0 ? 'कोई टेस्ट नहीं' : `${stat.accuracy}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${stat.accuracy}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>{stat.testCount} टेस्ट पूरे किए</span>
                  <span>
                    {stat.totalCorrect} / {stat.totalQuestions} सही प्रश्न
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            विगत टेस्ट सूची ({filteredHistory.length})
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCatFilter}
            onChange={e => setSelectedCatFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">सभी विषय (All Subjects)</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.iconEmoji} {c.name}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="लेसन खोजें..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Detailed Chronological Test Attempts List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map(item => {
            const acc = Math.round((item.correctCount / (item.totalQuestions || 1)) * 100);
            const isHigh = acc >= 75;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {item.categoryName}
                    </span>
                    <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.completedAt)}
                    </span>
                    <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.timeSpentSeconds || 0)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {item.lessonTitle}
                  </h3>

                  {/* Pills */}
                  <div className="flex items-center gap-2 text-xs flex-wrap pt-0.5">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {item.correctCount} सही
                    </span>
                    <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {item.wrongCount} गलत
                    </span>
                    {item.unattemptedCount > 0 && (
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.unattemptedCount} अनुत्तरित
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Score & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-150">
                  {/* Score circle */}
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-black text-slate-900">
                      {item.correctCount} / {item.totalQuestions}
                    </div>
                    <span
                      className={`text-2xs font-bold px-2 py-0.5 rounded-full inline-block ${
                        isHigh
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {acc}% सटीकता
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onReviewAttempt(item)}
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="इस टेस्ट के सभी प्रश्नों व उत्तरों का रिव्यू देखें"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      रिव्यू देखें
                    </button>

                    <button
                      onClick={() => onRetakeLesson(item.lessonId)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                      title="पुनः टेस्ट दें"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteAttempt(item.id)}
                      className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="यह टेस्ट रिकॉर्ड हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl border-2 border-dashed border-slate-200 bg-white space-y-3">
          <div className="text-4xl">📝</div>
          <h3 className="text-base font-bold text-slate-900">
            {searchTerm || selectedCatFilter !== 'all'
              ? 'कोई मेल खाता रिकॉर्ड नहीं मिला'
              : 'अभी तक कोई टेस्ट रिकॉर्ड नहीं है'}
          </h3>
          <p className="text-xs text-slate-700 max-w-sm mx-auto">
            जब आप कोई मॉक टेस्ट पूरा करेंगे, तो आपके अंक, सही और गलत उत्तरों का पूरा विश्लेषण यहाँ सुरक्षित हो जाएगा।
          </p>
          <button
            onClick={onNavigateHome}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            विषय सूची देखें और पहला टेस्ट दें
          </button>
        </div>
      )}
    </div>
  );
});

export default TestHistory;
