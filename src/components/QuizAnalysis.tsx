import React, { useState } from 'react';
import { Lesson, QuizResult } from '../types';
import { CheckCircle2, XCircle, AlertCircle, RotateCcw, ArrowLeft, Home, Trophy, Clock, Check, X, Filter, Bot } from 'lucide-react';

interface QuizAnalysisProps {
  result: QuizResult;
  lesson: Lesson;
  onRetake: () => void;
  onBackToCategory: () => void;
  onNavigateHome: () => void;
  onReadNotes?: () => void;
  onAskAI?: (query: string) => void;
}

export const QuizAnalysis: React.FC<QuizAnalysisProps> = ({
  result,
  lesson,
  onRetake,
  onBackToCategory,
  onNavigateHome,
  onReadNotes,
  onAskAI,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'wrong' | 'correct'>('all');

  const accuracy = Math.round((result.correctCount / (result.totalQuestions || 1)) * 100);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins} मिनट ${s} सेकंड`;
  };

  const questions = lesson.questions || [];

  const filteredQuestions = questions.filter(q => {
    const userAns = result.userAnswers[q.id];
    if (filterType === 'correct') {
      return userAns === q.correctAnswer;
    }
    if (filterType === 'wrong') {
      return userAns !== undefined && userAns !== q.correctAnswer;
    }
    return true;
  });

  const getPerformanceMessage = (scorePercent: number) => {
    if (scorePercent >= 90) {
      return {
        badge: 'उत्कृष्ट प्रदर्शन! (Outstanding)',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        emoji: '🏆',
        message: 'अद्भुत! आपकी तैयारी इस विषय में बेहद मजबूत है।',
      };
    } else if (scorePercent >= 70) {
      return {
        badge: 'बहुत अच्छा! (Very Good)',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        emoji: '🌟',
        message: 'अच्छा स्कोर! कुछ गलतियों को सुधार कर आप 100% ला सकते हैं।',
      };
    } else if (scorePercent >= 40) {
      return {
        badge: 'संतोषजनक (Average)',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        emoji: '🎯',
        message: 'पुनरावलोकन की आवश्यकता है। गलत प्रश्नों को दोबारा पढ़ें।',
      };
    } else {
      return {
        badge: 'अभ्यास की आवश्यकता (Needs Practice)',
        color: 'bg-rose-100 text-rose-800 border-rose-300',
        emoji: '📚',
        message: 'निराश न हों! पाठ को ध्यान से पढ़ें और पुनः टेस्ट का प्रयास करें।',
      };
    }
  };

  const perf = getPerformanceMessage(accuracy);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-5 py-4 sm:py-5 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToCategory}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          लेसन्स पर वापस जाएं
        </button>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {onReadNotes && lesson.notes && (
            <button
              onClick={onReadNotes}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              title="इस अध्याय के अध्ययन नोट्स पढ़ें"
            >
              📖 नोट्स पढ़ें
            </button>
          )}
          <button
            onClick={onRetake}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            पुनः टेस्ट दें
          </button>
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            होम
          </button>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs text-center relative overflow-hidden">
        <div className="text-3xl sm:text-4xl mb-1.5">{perf.emoji}</div>
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mb-2 ${perf.color}`}>
          {perf.badge}
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          मॉक टेस्ट विश्लेषण (Quiz Analysis)
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1 max-w-md mx-auto">
          {lesson.title} • {perf.message}
        </p>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-200 text-left">
          {/* Total */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-slate-700 block mb-0.5">कुल प्रश्न</span>
            <div className="text-xl font-bold text-slate-900">{result.totalQuestions}</div>
            <span className="text-[11px] text-slate-600 mt-0.5 block font-medium">100% पूर्णता</span>
          </div>

          {/* Correct */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-emerald-800 block mb-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              सही उत्तर
            </span>
            <div className="text-xl font-bold text-emerald-700">{result.correctCount}</div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
              +{result.correctCount} अंक
            </span>
          </div>

          {/* Wrong */}
          <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-rose-800 block mb-0.5 flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-600" />
              गलत उत्तर
            </span>
            <div className="text-xl font-bold text-rose-700">{result.wrongCount}</div>
            <span className="text-[11px] text-rose-700 font-semibold mt-0.5 block">
              सुधार की जरूरत
            </span>
          </div>

          {/* Accuracy */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3">
            <span className="text-[11px] font-semibold text-indigo-800 block mb-0.5 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-indigo-600" />
              सटीकता (Accuracy)
            </span>
            <div className="text-xl font-bold text-indigo-700">{accuracy}%</div>
            <span className="text-[11px] text-indigo-700 font-semibold mt-0.5 block flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {result.timeSpentSeconds}s समय
            </span>
          </div>
        </div>
      </div>

      {/* Review Section with Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>प्रश्नों का संपूर्ण विवरण</span>
            <span className="text-xs font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700">
              {filteredQuestions.length} प्रश्न
            </span>
          </h2>

          {/* Filters */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सभी ({questions.length})
            </button>
            <button
              onClick={() => setFilterType('wrong')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                filterType === 'wrong'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <X className="w-3 h-3" />
              गलत ({result.wrongCount})
            </button>
            <button
              onClick={() => setFilterType('correct')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                filterType === 'correct'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <Check className="w-3 h-3" />
              सही ({result.correctCount})
            </button>
          </div>
        </div>

        {/* Questions Detailed List */}
        <div className="space-y-2.5">
          {filteredQuestions.map((q, idx) => {
            const userAns = result.userAnswers[q.id];
            const isAns = userAns !== undefined;
            const isRight = isAns && userAns === q.correctAnswer;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 transition-all ${
                  !isAns
                    ? 'border-slate-200'
                    : isRight
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2.5 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5.5 h-5.5 rounded bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {q.number || idx + 1}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        !isAns
                          ? 'bg-slate-100 text-slate-700'
                          : isRight
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {!isAns ? (
                        'अनुत्तरित (Unanswered)'
                      ) : isRight ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          सही उत्तर (+1)
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-600" />
                          गलत उत्तर (0)
                        </>
                      )}
                    </span>
                  </div>

                  {/* Summary of User Choice */}
                  <div className="text-[11px] font-medium text-slate-700">
                    आपका उत्तर: <strong className={isRight ? 'text-emerald-700' : 'text-rose-700'}>{userAns || 'छोड़ा'}</strong> | सही: <strong className="text-emerald-700">{q.correctAnswer}</strong>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 leading-relaxed">
                  {q.questionText}
                </h3>

                {/* Options Review */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
                  {q.options.map(opt => {
                    const isUserChoice = userAns === opt.label;
                    const isActualAnswer = opt.label === q.correctAnswer;

                    let optStyle = 'border-slate-200 bg-slate-50 text-slate-700';
                    let badge = null;

                    if (isActualAnswer) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-300';
                      badge = (
                        <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                          सही उत्तर
                        </span>
                      );
                    } else if (isUserChoice && !isRight) {
                      optStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold';
                      badge = (
                        <span className="text-xs font-bold bg-rose-600 text-white px-2 py-0.5 rounded">
                          आपका चयन (गलत)
                        </span>
                      );
                    }

                    return (
                      <div
                        key={opt.label}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-2 ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold shrink-0 w-5 h-5 rounded flex items-center justify-center bg-white/80 border text-slate-800">
                            {opt.label}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {badge}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                    <strong className="font-bold">व्याख्या (Explanation):</strong> {q.explanation}
                  </div>
                )}

                {onAskAI && (
                  <div className="mt-2.5 flex justify-end">
                    <button
                      onClick={() =>
                        onAskAI(
                          `कृपया इस प्रश्न की विस्तृत व्याख्या और याद रखने की ट्रिक बताएं:\n"${q.questionText}"\nसही उत्तर: ${q.correctAnswer}. ${
                            q.options.find(o => o.label === q.correctAnswer)?.text || ''
                          }`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                    >
                      <Bot className="w-3 h-3 text-indigo-600" />
                      <span>Groq AI से इस प्रश्न की विस्तृत व्याख्या पूछें</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Bar */}
      <div className="sticky bottom-4 bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold text-slate-700">
          स्कोर: <strong>{result.correctCount} / {result.totalQuestions}</strong> ({accuracy}% सटीकता)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRetake}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            टेस्ट दोबारा दें
          </button>
          <button
            onClick={onBackToCategory}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            अन्य लेसन्स देखें
          </button>
        </div>
      </div>
    </div>
  );
};
