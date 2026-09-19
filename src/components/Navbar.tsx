import React from 'react';
import {
  Plus,
  FolderKanban,
  Volume2,
  VolumeX,
  Home,
  Sparkles,
  History,
  Bot,
  Layers,
  Smartphone,
  BookOpen
} from 'lucide-react';
import { ActiveView } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onNavigateHome?: () => void;
  onOpenAdmin: (initialTab?: 'upload' | 'categories' | 'lessons') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  totalCategories: number;
  totalLessons: number;
  totalQuestions: number;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onOpenAdmin,
  soundEnabled,
  onToggleSound,
  totalCategories,
  totalLessons,
  totalQuestions,
  historyCount,
}) => {
  const isHome = activeView.type === 'categories' || activeView.type === 'category_detail';
  const isNotes = activeView.type === 'notes_hub' || activeView.type === 'note_viewer';
  const isHistory = activeView.type === 'history';
  const isAITutor = activeView.type === 'ai_tutor';
  const isAdmin = activeView.type === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-5 h-13 sm:h-14 flex items-center justify-between gap-2.5">
        {/* Left: Brand / Home Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate({ type: 'categories' })}
            className="flex items-center gap-2 text-left group focus:outline-hidden cursor-pointer"
            title="होम डैशबोर्ड पर जाएं"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-xs group-hover:scale-105 transition-transform flex-shrink-0 bg-indigo-600">
              <img
                src={`${import.meta.env.BASE_URL}icon.svg`}
                alt="Exam Veda Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback if SVG fails to load
                  const img = e.currentTarget;
                  if (!img.src.includes('pwa-192x192.png')) {
                    img.src = `${import.meta.env.BASE_URL}pwa-192x192.png`;
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-indigo-600 transition-colors">
                  Exam Veda
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                  क्विज़ व नोट्स
                </span>
              </div>
              <p className="text-[11px] text-slate-600 hidden md:block leading-none mt-0.5">
                Exam Veda - नोट्स, 1-लाइनर व AI अध्ययन साथी
              </p>
            </div>
          </button>
        </div>

        {/* Middle Navigation Tabs (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => onNavigate({ type: 'categories' })}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              isHome
                ? 'bg-white text-indigo-600 shadow-xs font-bold'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>होम (विषय)</span>
          </button>

          <button
            onClick={() => onNavigate({ type: 'notes_hub' })}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              isNotes
                ? 'bg-white text-indigo-600 shadow-xs font-bold'
                : 'text-slate-700 hover:text-slate-950'
            }`}
            title="सभी विषयों के अध्ययन नोट्स पढ़ें"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>📖 अध्ययन नोट्स</span>
          </button>

          <button
            onClick={() => onNavigate({ type: 'history' })}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 relative cursor-pointer ${
              isHistory
                ? 'bg-white text-indigo-600 shadow-xs font-bold'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>टेस्ट हिस्ट्री</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate({ type: 'ai_tutor' })}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              isAITutor
                ? 'bg-white text-indigo-600 shadow-xs font-bold'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Veda AI</span>
          </button>

          <button
            onClick={() => onOpenAdmin('lessons')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              isAdmin
                ? 'bg-white text-indigo-600 shadow-xs font-bold'
                : 'text-slate-700 hover:text-slate-950'
            }`}
            title="लेसन फोल्डर देखें व मैनेज करें"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>लेसन फोल्डर</span>
          </button>
        </div>

        {/* Right Actions: Web to App (PWA), Sound, and + Admin Button */}
        <div className="flex items-center gap-1.5">
          {/* Web to App Install Button */}
          <PWAInstallButton variant="compact" />

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200 ${
              soundEnabled
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
            title={soundEnabled ? 'ध्वनि चालू है (Sound On)' : 'ध्वनि बंद है (Sound Muted)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Prominent + Icon Button for Admin Portal */}
          <button
            onClick={() => onOpenAdmin('upload')}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:shadow transition-all group cursor-pointer"
            title="नया डेटा / प्रश्न / श्रेणी जोड़ें (+ एडमिन पोर्टल)"
          >
            <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-200" />
            <span>+ एडमिन</span>
          </button>
        </div>
      </div>
    </header>
  );
};
