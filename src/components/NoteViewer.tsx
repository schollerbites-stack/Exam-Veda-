import React, { useState } from 'react';
import { Lesson, Category } from '../types';
import {
  ArrowLeft,
  Play,
  Download,
  Copy,
  Check,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface NoteViewerProps {
  lesson: Lesson;
  category?: Category;
  allCategoryLessons?: Lesson[];
  onBack: () => void;
  onStartQuiz: (lessonId: string) => void;
  onSelectLesson?: (lessonId: string) => void;
  onToggleSaveOffline?: (lessonId: string) => void;
  isSavedOffline?: boolean;
  onAskAI?: (query: string) => void;
}

export const NoteViewer: React.FC<NoteViewerProps> = ({
  lesson,
  category,
  allCategoryLessons = [],
  onBack,
  onStartQuiz,
  onSelectLesson,
  onToggleSaveOffline,
  isSavedOffline = false,
  onAskAI,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  const handleCopyNotes = async () => {
    try {
      const content = `${lesson.title}\n${category ? `विषय: ${category.name}\n` : ''}\n${lesson.notes || lesson.description || ''}`;
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadNotes = () => {
    const content = `======================================================
${lesson.title}
विषय/श्रेणी: ${category ? category.name : 'सामान्य ज्ञान'}
तारीख: ${new Date().toLocaleDateString('hi-IN')}
======================================================

${lesson.notes || lesson.description || 'नोट्स सामग्री उपलब्ध नहीं है।'}

======================================================
संबंधित बहुविकल्पीय प्रश्न (MCQs) की संख्या: ${lesson.questions?.length || 0}
GK Mock Test App
======================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (lesson.title || 'lesson-notes').replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_');
    link.download = `${safeTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);

    // Auto-mark as offline saved as well
    if (onToggleSaveOffline && !isSavedOffline) {
      onToggleSaveOffline(lesson.id);
    }
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
          <p className="text-sm font-semibold">इस पाठ के लिए विस्तृत नोट्स अभी उपलब्ध नहीं हैं।</p>
          <p className="text-xs text-slate-400 mt-1">आप सीधे मॉक टेस्ट दे सकते हैं या एडमिन से नोट्स जोड़ सकते हैं।</p>
        </div>
      );
    }

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableBuffer: string[] = [];

    const flushTable = (index: number) => {
      if (tableBuffer.length < 2) {
        tableBuffer = [];
        inTable = false;
        return;
      }

      const rows = tableBuffer.map(row =>
        row
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
            className="text-base sm:text-lg font-bold text-indigo-900 mt-4 mb-2 flex items-center gap-2"
          >
            {renderInlineText(trimmed.replace(/^###\s+/, ''))}
          </h3>
        );
        return;
      }

      // H4 Heading
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4
            key={idx}
            className="text-sm sm:text-base font-bold text-slate-800 mt-3 mb-1.5"
          >
            {renderInlineText(trimmed.replace(/^####\s+/, ''))}
          </h4>
        );
        return;
      }

      // Bullet List
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <div key={idx} className="flex items-start gap-2.5 my-1.5 ml-1 text-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
            <div className="leading-relaxed">{renderInlineText(trimmed.replace(/^[-*]\s+/, ''))}</div>
          </div>
        );
        return;
      }

      // Numbered List
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div key={idx} className="flex items-start gap-2.5 my-1.5 ml-1 text-slate-800">
            <span className="font-bold text-indigo-600 shrink-0 text-xs mt-0.5 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
              {numMatch[1]}
            </span>
            <div className="leading-relaxed">{renderInlineText(numMatch[2])}</div>
          </div>
        );
        return;
      }

      // Empty line
      if (!trimmed) {
        elements.push(<div key={idx} className="h-2" />);
        return;
      }

      // Standard paragraph
      elements.push(
        <p key={idx} className="my-1.5 leading-relaxed text-slate-800">
          {renderInlineText(line)}
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
              <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-300 mb-1 flex-wrap">
                {category && (
                  <span className="bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-400/30">
                    {category.name}
                  </span>
                )}
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ऑफलाइन रेडी
                </span>
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

          <div className="sm:self-center flex items-center gap-2">
            <button
              onClick={handleDownloadNotes}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 backdrop-blur-xs transition cursor-pointer"
              title="नोट्स फाइल (.txt) डिवाइस पर डाउनलोड करें"
            >
              {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloaded ? 'डाउनलोड हुआ' : 'ऑफलाइन डाउनलोड'}</span>
            </button>
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
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            सामान्य
          </button>
          <button
            onClick={() => setFontSize(prev => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'xl'))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="फॉन्ट बड़ा करें"
          >
            A+
          </button>
        </div>

        {/* Right: Copy & Bookmark Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyNotes}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="नोट्स कॉपी करें"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'कॉपी हुआ' : 'कॉपी नोट्स'}</span>
          </button>

          {onToggleSaveOffline && (
            <button
              onClick={() => onToggleSaveOffline(lesson.id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                isSavedOffline
                  ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="नोट्स ऑफलाइन सेव करें"
            >
              {isSavedOffline ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>सहेजा गया</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                  <span>ऑफलाइन सहेजें</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Article */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-7 shadow-xs">
        <div className={`prose max-w-none text-slate-800 ${getFontSizeClass()}`}>
          {renderFormattedNotes(lesson.notes || lesson.description || '')}
        </div>
      </div>

      {/* Bottom Floating Navigation (Prev Lesson / Next Lesson / Quiz CTA) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Prev Lesson Button */}
        <div className="flex-1">
          {prevLesson && onSelectLesson ? (
            <button
              onClick={() => onSelectLesson(prevLesson.id)}
              className="w-full sm:w-auto inline-flex items-center gap-2 text-left p-2 rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer group"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  पिछला पाठ
                </div>
                <div className="text-xs font-bold text-slate-800 truncate max-w-44 group-hover:text-indigo-600">
                  {prevLesson.title}
                </div>
              </div>
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* Center Quiz CTA */}
        <div className="flex justify-center">
          <button
            onClick={() => onStartQuiz(lesson.id)}
            disabled={qCount === 0}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all ${
              qCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>इस पाठ का मॉक टेस्ट दें ({qCount} प्रश्न)</span>
          </button>
        </div>

        {/* Next Lesson Button */}
        <div className="flex-1 flex justify-end">
          {nextLesson && onSelectLesson ? (
            <button
              onClick={() => onSelectLesson(nextLesson.id)}
              className="w-full sm:w-auto inline-flex items-center justify-end gap-2 text-right p-2 rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer group"
            >
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  अगला पाठ
                </div>
                <div className="text-xs font-bold text-slate-800 truncate max-w-44 group-hover:text-indigo-600">
                  {nextLesson.title}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};
