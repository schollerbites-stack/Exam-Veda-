import React from 'react';
import {
  Plus,
  FolderKanban,
  Volume2,
  VolumeX,
  Home,
  Sparkles,
  History,
  BookOpen,
  Cloud,
  CloudOff,
  RefreshCw,
  Zap
} from 'lucide-react';
import { ActiveView, CloudSyncStatus } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { EduVedaEmblem } from './EduVedaLogo';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onNavigateHome?: () => void;
  onOpenAdmin: (initialTab?: 'upload' | 'categories' | 'lessons' | 'sync') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  totalCategories: number;
  totalLessons: number;
  totalQuestions: number;
  historyCount: number;
  syncStatus?: CloudSyncStatus;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({
  activeView,
  onNavigate,
  onOpenAdmin,
  soundEnabled,
  onToggleSound,
  totalCategories,
  totalLessons,
  totalQuestions,
  historyCount,
  syncStatus,
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
            className="flex items-center gap-2 text-left group focus:outline-hidden cursor-pointer active:scale-98"
            title="होम डैशबोर्ड पर जाएं"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform shrink-0 bg-white border border-slate-200/80 p-0.5 flex items-center justify-center">
              <EduVedaEmblem className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight transition-colors">
                  <span className="text-[#0c2340]">Edu</span> <span className="text-[#f97316]">Veda</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-bold bg-orange-50 text-orange-700 rounded-md border border-orange-200">
                  क्विज़ व नोट्स
                </span>
              </div>
              <p className="text-[11px] text-slate-600 hidden md:block leading-none mt-0.5">
                Edu Veda - नोट्स, 1-लाइनर व AI अध्ययन साथी
              </p>
            </div>
          </button>
        </div>

        {/* Middle Navigation Tabs (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => onNavigate({ type: 'categories' })}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-97 ${
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
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-97 ${
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
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 relative cursor-pointer active:scale-97 ${
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
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-97 ${
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
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-97 ${
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

        {/* Right Actions: Cloud Sync indicator, Web to App (PWA), Sound, and + Admin Button */}
        <div className="flex items-center gap-1.5">
          {/* Cloud Database Sync Status Indicator */}
          {syncStatus && (
            <button
              onClick={() => onOpenAdmin('sync')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer active:scale-95 ${
                syncStatus.isSyncing
                  ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                  : syncStatus.isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={
                syncStatus.isSyncing
                  ? 'क्लाउड सिंक हो रहा है...'
                  : syncStatus.isConnected
                  ? `क्लाउड डेटाबेस सक्रिय • ${syncStatus.totalCloudLessons} शेयर्ड लेसन्स • रियल-टाइम कनेक्टेड`
                  : 'क्लाउड ऑफलाइन'
              }
            >
              {syncStatus.isSyncing ? (
                <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
              ) : syncStatus.isConnected ? (
                <Cloud className="w-3 h-3 text-emerald-600" />
              ) : (
                <CloudOff className="w-3 h-3 text-slate-400" />
              )}
              <span className="hidden lg:inline">
                {syncStatus.isSyncing ? 'सिंक...' : 'क्लाउड DB'}
              </span>
            </button>
          )}

          {/* Web to App Install Button */}
          <PWAInstallButton variant="compact" />

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200 active:scale-95 ${
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
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all group cursor-pointer active:scale-95"
            title="नया डेटा / प्रश्न / श्रेणी जोड़ें (+ एडमिन पोर्टल)"
          >
            <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-200" />
            <span>+ एडमिन</span>
          </button>
        </div>
      </div>
    </header>
  );
});

export default Navbar;
