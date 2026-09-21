import React, { useState, useEffect } from 'react';
import { Lesson, Question, QuizResult } from '../types';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Clock, RotateCcw, Award, Lightbulb, AlertTriangle } from 'lucide-react';
import { playSuccessSound, playWrongSound } from '../utils/audio';

interface QuizRunnerProps {
  lesson: Lesson;
  categoryName: string;
  soundEnabled: boolean;
  onFinishQuiz: (result: QuizResult) => void;
  onExitQuiz: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = React.memo(({
  lesson,
  categoryName,
  soundEnabled,
  onFinishQuiz,
  onExitQuiz,
}) => {
  const questions: Question[] = lesson.questions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">इस लेसन में कोई प्रश्न उपलब्ध नहीं है</h2>
        <p className="text-sm text-slate-600 mt-2">
          कृपया एडमिन पैनल में जाकर इस लेसन में प्रश्न जोड़ें।
        </p>
        <button
          onClick={onExitQuiz}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
        >
          वापस जाएं
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedOption = userAnswers[currentQ.id];
  const isAnswered = selectedOption !== undefined;
  const isCorrect = isAnswered && selectedOption === currentQ.correctAnswer;

  const handleSelectOption = (optionLabel: string) => {
    if (isAnswered) return; // Prevent changing after selection for instant feedback mode

    const isRight = optionLabel === currentQ.correctAnswer;
    if (soundEnabled) {
      if (isRight) {
        playSuccessSound();
      } else {
        playWrongSound();
      }
    }

    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionLabel,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finalizeQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const finalizeQuiz = () => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    questions.forEach(q => {
      const ans = userAnswers[q.id];
      if (!ans) {
        unattempted++;
      } else if (ans === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const result: QuizResult = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      categoryId: lesson.categoryId,
      categoryName,
      totalQuestions: questions.length,
      correctCount: correct,
      wrongCount: wrong,
      unattemptedCount: unattempted,
      userAnswers,
      timeSpentSeconds: secondsElapsed,
      completedAt: Date.now(),
    };

    onFinishQuiz(result);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Controls & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="text-xs font-semibold text-slate-700 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              क्विज़ छोड़ें
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[180px] sm:max-w-xs">
              {lesson.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
              प्रश्न {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        {/* Question Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1.5">
            <span>प्रश्न #{currentIndex + 1}</span>
            {isAnswered && (
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                  isCorrect
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isCorrect ? '✓ सही उत्तर' : '✗ गलत उत्तर'}
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentQ.questionText}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-2.5">
          {currentQ.options.map(option => {
            const isSelected = selectedOption === option.label;
            const isOptionCorrect = option.label === currentQ.correctAnswer;

            // Determine styling based on whether question has been answered
            let containerClass =
              'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-800';
            let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
            let icon = null;

            if (isAnswered) {
              if (isSelected) {
                if (isCorrect) {
                  // User chose this and it's correct
                  containerClass =
                    'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                  badgeClass = 'bg-emerald-600 text-white border-emerald-600';
                  icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
                } else {
                  // User chose this and it's WRONG
                  containerClass =
                    'border-rose-500 bg-rose-50/80 text-rose-950 font-semibold ring-1 ring-rose-400';
                  badgeClass = 'bg-rose-600 text-white border-rose-600';
                  icon = <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
                }
              } else if (isOptionCorrect) {
                // Not chosen by user, but this IS the correct answer!
                containerClass =
                  'border-emerald-400 bg-emerald-50/50 text-emerald-900 font-semibold';
                badgeClass = 'bg-emerald-600 text-white border-emerald-600';
                icon = (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    सही उत्तर
                  </span>
                );
              } else {
                containerClass = 'border-slate-200 bg-slate-50/90 text-slate-700';
                badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
              }
            }

            return (
              <button
                key={option.label}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option.label)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center justify-between gap-2.5 text-xs sm:text-sm ${containerClass} ${
                  !isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6.5 h-6.5 rounded-md flex items-center justify-center font-bold text-xs border shrink-0 transition-colors ${badgeClass}`}
                  >
                    {option.label}
                  </span>
                  <span className="leading-snug">{option.text}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Live Feedback Banner (Right vs Wrong UI interface as requested) */}
        {isAnswered && (
          <div
            className={`mt-4 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
              isCorrect
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
                : 'bg-rose-50/90 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-bold">
                  {isCorrect ? 'शाबाश! आपका उत्तर बिल्कुल सही है।' : 'गलत उत्तर!'}
                </h4>
                <p className="text-[11px] mt-0.5 opacity-90">
                  {isCorrect
                    ? `विकल्प (${currentQ.correctAnswer}) सही है।`
                    : `सही उत्तर विकल्प (${currentQ.correctAnswer}) है।`}
                </p>
                {currentQ.explanation && (
                  <div className="mt-1.5 text-xs bg-white/90 p-2 rounded-lg border border-current/20 text-slate-900 flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>व्याख्या:</strong> {currentQ.explanation}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>{currentIndex === questions.length - 1 ? 'परिणाम देखें' : 'अगला प्रश्न'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              currentIndex === 0
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-800 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            पिछला प्रश्न
          </button>

          <div className="flex items-center gap-2">
            {!isAnswered ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <span>छोड़ें (Skip)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>{currentIndex === questions.length - 1 ? 'समाप्त करें' : 'अगला प्रश्न'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Index Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 mb-2">प्रश्न सूची (Question Navigator):</h3>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, idx) => {
            const ans = userAnswers[q.id];
            const isCur = idx === currentIndex;
            let btnClass = 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';

            if (ans) {
              if (ans === q.correctAnswer) {
                btnClass = 'bg-emerald-500 text-white border-emerald-600';
              } else {
                btnClass = 'bg-rose-500 text-white border-rose-600';
              }
            } else if (isCur) {
              btnClass = 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 text-xs font-bold rounded-lg border flex items-center justify-center transition-all ${btnClass}`}
                title={`प्रश्न ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-900">क्विज़ छोड़ना चाहते हैं?</h3>
            <p className="text-xs text-slate-600">
              यदि आप अभी बाहर निकलते हैं, तो आपका वर्तमान स्कोर सहेजा नहीं जाएगा। क्या आप वाकई बाहर जाना चाहते हैं?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                नहीं, टेस्ट जारी रखें
              </button>
              <button
                onClick={onExitQuiz}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
              >
                हाँ, बाहर निकलें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default QuizRunner;
