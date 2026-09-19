import React, { useState } from 'react';
import { Lesson, Category } from '../types';
import {
  ArrowLeft,
  Play,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Bot,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  Share2
} from 'lucide-react';

interface NoteViewerProps {
  lesson: Lesson;
  category?: Category;
  allCategoryLessons?: Lesson[];
  onBack: () => void;
  onStartQuiz: (lessonId: string) => void;
  onSelectLesson?: (lessonId: string) => void;
  onAskAI?: (query: string) => void;
}

export const NoteViewer: React.FC<NoteViewerProps> = ({
  lesson,
  category,
  allCategoryLessons = [],
  onBack,
  onStartQuiz,
  onSelectLesson,
  onAskAI,
}) => {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [copied, setCopied] = useState(false);

  const handleCopyNotes = () => {
    const textToCopy = `${lesson.title}\n\n${lesson.notes || lesson.description || ''}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Find next and previous lessons in the same category
  const currentIndex = allCategoryLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allCategoryLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allCategoryLessons.length - 1
      ? allCategoryLessons[currentIndex + 1]
      : null;

  const qCount = lesson.questions?.length || 0;

  // Simple and robust parser for markdown notes
  const renderFormattedNotes = (text: string) => {
    if (!text) {
      return (
        <div className="py-8 text-center text-slate-500">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-semibold">इस लेसन के लिए विस्तृत नोट्स अभी उपलब्ध नहीं हैं।</p>
          <p className="text-xs text-slate-400 mt-1">आप सीधे मॉक टेस्ट दे सकते हैं या एडमिन से नोट्स जोड़ सकते हैं।</p>
        </div>
      );
    }

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let tableBuffer: string[] = [];
    let inTable = false;

    const flushTable = (index: number) => {
      if (tableBuffer.length === 0) return;
      const rows = tableBuffer.map(r =>
        r
          .split('|')
          .map(c => c.trim())
          .filter((_, i, arr) => i > 0 && i < arr.length - 1)
      );

      const headerRow = rows[0] || [];
      const dataRows = rows.slice(2); // row 1 is delimiter |---|---|

      elements.push(
        <div key={`table-${index}`} className="my-4 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200">
                {headerRow.map((h, hi) => (
                  <th key={hi} className="p-2.5 font-bold text-slate-800 border-r border-slate-200 last:border-r-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {dataRows.map((r, ri) => (
                <tr key={ri} className="hover:bg-slate-50/70 transition-colors">
                  {r.map((cell, ci) => (
                    <td key={ci} className="p-2.5 text-slate-700 border-r border-slate-150 last:border-r-0">
                      {renderInlineText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableBuffer = [];
      inTable = false;
    };

    const renderInlineText = (str: string) => {
      // Bold **text**
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-bold text-slate-950">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check for table lines
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        tableBuffer.push(trimmed);
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      // Horizontal rule
      if (trimmed === '---') {
        elements.push(<hr key={idx} className="my-4 border-slate-200" />);
        return;
      }

      // H2 Heading
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2
            key={idx}
            className="text-lg sm:text-xl font-extrabold text-slate-900 mt-5 mb-2.5 flex items-center gap-2 pb-1 border-b border-slate-200"
          >
            {renderInlineText(trimmed.replace(/^##\s+/, ''))}
          </h2>
        );
        return;
      }

      // H3 Heading
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3
            key={idx}
            className="text-sm sm:text-base font-bold text-indigo-900 mt-4 mb-2 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
            {renderInlineText(trimmed.replace(/^###\s+/, ''))}
          </h3>
        );
        return;
      }

      // Exam point / Callout
      if (trimmed.startsWith('📌')) {
        elements.push(
          <div
            key={idx}
            className="my-2 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-950 flex items-start gap-2 shadow-2xs"
          >
            <span className="text-base shrink-0">📌</span>
            <div className="text-xs sm:text-sm leading-relaxed font-medium">
              {renderInlineText(trimmed.replace(/^📌\s*/, ''))}
            </div>
          </div>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        const indentLevel = line.search(/\S/);
        elements.push(
          <div
            key={idx}
            className={`flex items-start gap-2 my-1 text-slate-800 leading-relaxed ${
              indentLevel > 2 ? 'ml-5' : 'ml-1'
            }`}
          >
            <span className="text-indigo-600 font-bold text-xs mt-1 shrink-0">•</span>
            <div className="flex-1">{renderInlineText(trimmed.replace(/^[•\-]\s+/, ''))}</div>
          </div>
        );
        return;
      }

      // Numbered items
      if (/^\d+\.\s/.test(trimmed)) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 my-1.5 ml-1 text-slate-800 leading-relaxed">
            <span className="font-bold text-indigo-700 text-xs mt-0.5 shrink-0 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-150">
              {trimmed.match(/^\d+\./)?.[0]}
            </span>
            <div className="flex-1">{renderInlineText(trimmed.replace(/^\d+\.\s+/, ''))}</div>
          </div>
        );
        return;
      }

      // Empty line
      if (!trimmed) {
        elements.push(<div key={idx} className="h-2" />);
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={idx} className="my-1.5 text-slate-800 leading-relaxed">
          {renderInlineText(trimmed)}
        </p>
      );
    });

    if (inTable) {
      flushTable(lines.length);
    }

    return elements;
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-xs sm:text-sm';
      case 'lg':
        return 'text-base sm:text-lg';
      case 'xl':
        return 'text-lg sm:text-xl';
      default:
        return 'text-sm sm:text-base';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-5 py-3 sm:py-5 space-y-4">
      {/* Top Bar with Navigation & Actions */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>वापस जाएं</span>
        </button>

        {/* Action Button: Start Quiz right away */}
        <button
          onClick={() => onStartQuiz(lesson.id)}
          disabled={qCount === 0}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer ${
            qCount > 0
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
          title="इस पाठ के प्रश्नों का मॉक टेस्ट दें"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>मॉक टेस्ट दें ({qCount} प्रश्न)</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl sm:text-4xl p-2 bg-white/10 backdrop-blur rounded-2xl border border-white/20 shrink-0">
              {lesson.iconEmoji || '📖'}
            </span>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-300 mb-1">
                {category && (
                  <span className="bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-400/30">
                    {category.name}
                  </span>
                )}
                <span>•</span>
                <span className="text-slate-300">स्टडी नोट्स व थ्योरी</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                {lesson.title}
              </h1>
              {lesson.description && (
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {lesson.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reader Controls Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        {/* Left: Font Size Adjustment */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">फॉन्ट:</span>
          <button
            onClick={() => setFontSize(prev => (prev === 'xl' ? 'lg' : prev === 'lg' ? 'base' : 'sm'))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="फॉन्ट छोटा करें"
          >
            A-
          </button>
          <button
            onClick={() => setFontSize('base')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              fontSize === 'base'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            मानक
          </button>
          <button
            onClick={() => setFontSize(prev => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'xl'))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="फॉन्ट बड़ा करें"
          >
            A+
          </button>
        </div>

        {/* Right: Copy & Veda AI Tutor */}
        <div className="flex items-center gap-1.5">
          {/* Copy Button */}
          <button
            onClick={handleCopyNotes}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="नोट्स कॉपी करें"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'कॉपी हुआ' : 'कॉपी'}</span>
          </button>

          {/* Ask Veda AI about this lesson */}
          {onAskAI && (
            <button
              onClick={() => onAskAI(`${lesson.title} के बारे में मुझे सरल भाषा में समझाएं और मुख्य बिंदु बताएं`)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
              title="Veda AI (वेद AI) से डाउट पूछें"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Veda AI से समझें</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Notes Content Box */}
      <article
        className={`bg-white rounded-2xl border border-slate-200 p-4 sm:p-7 shadow-xs ${getFontSizeClass()}`}
      >
        {renderFormattedNotes(lesson.notes || lesson.description || '')}
      </article>

      {/* Bottom Completion Card: Ready for Quiz? */}
      <div className="rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50 via-teal-50/40 to-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0 shadow-2xs">
              🎯
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                नोट्स पढ़ लिए? अब अपनी तैयारी का टेस्ट लें!
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                इस अध्याय पर आधारित {qCount} वस्तुनिष्ठ प्रश्नों का लाइव मॉक टेस्ट दें।
              </p>
            </div>
          </div>

          <button
            onClick={() => onStartQuiz(lesson.id)}
            disabled={qCount === 0}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
              qCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white active:scale-98'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>मॉक टेस्ट शुरू करें ({qCount} MCQs)</span>
          </button>
        </div>
      </div>

      {/* Prev / Next Lesson Navigation */}
      {(prevLesson || nextLesson) && (
        <div className="flex items-center justify-between gap-3 pt-2">
          {prevLesson ? (
            <button
              onClick={() => onSelectLesson && onSelectLesson(prevLesson.id)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 p-2 rounded-xl hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer max-w-[48%]"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <div className="text-left truncate">
                <span className="text-[10px] text-slate-650 block">पिछला पाठ</span>
                <span className="truncate block font-bold">{prevLesson.title}</span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <button
              onClick={() => onSelectLesson && onSelectLesson(nextLesson.id)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 p-2 rounded-xl hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer max-w-[48%] ml-auto"
            >
              <div className="text-right truncate">
                <span className="text-[10px] text-slate-650 block">अगला पाठ</span>
                <span className="truncate block font-bold">{nextLesson.title}</span>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
};
