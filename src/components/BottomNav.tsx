import React from 'react';
import { Home, History, Sparkles, PlusCircle, BookOpen } from 'lucide-react';
import { ActiveView } from '../types';

interface BottomNavProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onOpenAdmin: (tab?: 'upload' | 'categories' | 'lessons') => void;
  historyCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onNavigate,
  onOpenAdmin,
  historyCount,
}) => {
  const isHome = activeView.type === 'categories' || activeView.type === 'category_detail';
  const isNotes = activeView.type === 'notes_hub' || activeView.type === 'note_viewer';
  const isHistory = activeView.type === 'history';
  const isAITutor = activeView.type === 'ai_tutor';
  const isAdmin = activeView.type === 'admin';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-md py-1 px-1.5 sm:px-2">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* 1. Home / Categories */}
        <button
          onClick={() => onNavigate({ type: 'categories' })}
          className={`flex flex-col items-center py-0.5 px-2 rounded-lg transition-all cursor-pointer ${
            isHome
              ? 'text-indigo-600 font-bold'
              : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-all ${
              isHome ? 'bg-indigo-50 scale-105' : 'bg-transparent'
            }`}
          >
            <Home className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold mt-0.5 tracking-tight">होम</span>
        </button>

        {/* 2. Notes Section */}
        <button
          onClick={() => onNavigate({ type: 'notes_hub' })}
          className={`flex flex-col items-center py-0.5 px-2 rounded-lg transition-all cursor-pointer ${
            isNotes
              ? 'text-indigo-600 font-bold'
              : 'text-slate-700 hover:text-slate-950'
          }`}
          title="स्टडी नोट्स पढ़ें"
        >
          <div
            className={`p-1 rounded-lg transition-all ${
              isNotes ? 'bg-indigo-50 scale-105' : 'bg-transparent'
            }`}
          >
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold mt-0.5 tracking-tight">नोट्स</span>
        </button>

        {/* 3. Record / Test History */}
        <button
          onClick={() => onNavigate({ type: 'history' })}
          className={`flex flex-col items-center py-0.5 px-2 rounded-lg transition-all relative cursor-pointer ${
            isHistory
              ? 'text-indigo-600 font-bold'
              : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-all ${
              isHistory ? 'bg-indigo-50 scale-105' : 'bg-transparent'
            }`}
          >
            <History className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold mt-0.5 tracking-tight">हिस्ट्री</span>
          {historyCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-3.5 h-3.5 px-1 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
              {historyCount > 9 ? '9+' : historyCount}
            </span>
          )}
        </button>

        {/* 4. Veda AI Multi-Agent Study Tutor */}
        <button
          onClick={() => onNavigate({ type: 'ai_tutor' })}
          className={`flex flex-col items-center py-0.5 px-2 rounded-lg transition-all cursor-pointer ${
            isAITutor
              ? 'text-indigo-600 font-bold'
              : 'text-slate-700 hover:text-slate-950'
          }`}
          title="Veda AI (वेद AI) से पूछें"
        >
          <div
            className={`p-1 rounded-lg transition-all relative ${
              isAITutor ? 'bg-indigo-50 scale-105' : 'bg-transparent'
            }`}
          >
            <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
            <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-600"></span>
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold mt-0.5 tracking-tight">Veda AI</span>
        </button>

        {/* 5. Admin Portal (+) */}
        <button
          onClick={() => onOpenAdmin('upload')}
          className={`flex flex-col items-center py-0.5 px-2 rounded-lg transition-all cursor-pointer ${
            isAdmin
              ? 'text-indigo-600 font-bold'
              : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-all ${
              isAdmin
                ? 'bg-indigo-600 text-white scale-105 shadow-xs'
                : 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
            }`}
          >
            <PlusCircle className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold mt-0.5 tracking-tight">
            + एडमिन
          </span>
        </button>
      </div>
    </nav>
  );
};

