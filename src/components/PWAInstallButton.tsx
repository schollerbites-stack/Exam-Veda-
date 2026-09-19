import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, WifiOff } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'full' }> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside standalone app, don't show prompt
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
        <Check className="w-3 h-3" />
        ऐप मोड में चालू
      </span>
    );
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
    }
  };

  // Android / Desktop / Chrome
  if (isInstallable) {
    return (
      <>
        <button
          onClick={handleInstall}
          className={`flex items-center gap-1.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer ${
            variant === 'full'
              ? 'w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 text-xs'
          }`}
          title="वेबसाइट को ऐप के रूप में इनस्टॉल करें (Web to App)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ऐप इनस्टॉल करें</span>
        </button>

        {installSuccess && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            ऐप सफलतापूर्वक आपकी होम स्क्रीन पर इनस्टॉल हो गया!
          </div>
        )}
      </>
    );
  }

  // iOS Safari Flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 transition cursor-pointer"
          title="iPhone/iPad पर ऐप की तरह सेव करें"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>ऐप बनाएं (iOS)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  iPhone / iPad पर ऐप इनस्टॉल करें
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 my-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                <p>
                  1. सफारी (Safari) ब्राउज़र में नीचे दिए गए <strong>शेयर (Share)</strong> आइकन पर टैप करें।
                </p>
                <p>
                  2. नीचे स्क्रॉल करें और <strong>'होम स्क्रीन में जोड़ें' (Add to Home Screen)</strong> चुनें।
                </p>
                <p>
                  3. अब यह ऐप सीधे आपकी मोबाइल होम स्क्रीन पर ऐप की तरह ऑफलाइन भी काम करेगा!
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
              >
                समझ गया (Close)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic prompt button if browser doesn't dispatch beforeinstallprompt yet
  return (
    <button
      onClick={() => {
        alert(
          'ऐप इनस्टॉल करने के लिए अपने ब्राउज़र के 3-डॉट मेनू (⋮) पर टैप करें और "Install App" या "Add to Home Screen" चुनें। इसके बाद सभी क्विज़ पूरी तरह ऑफलाइन चलेंगे!'
        );
      }}
      className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-2xs font-semibold text-slate-700 transition cursor-pointer"
      title="वेब टू ऐप सहायता"
    >
      <Smartphone className="w-3 h-3 text-indigo-600" />
      <span>Web to App</span>
    </button>
  );
};

export const OfflineIndicator: React.FC<{
  onNavigateToNotes?: () => void;
  onNavigateToHistory?: () => void;
}> = ({ onNavigateToNotes, onNavigateToHistory }) => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline || dismissed) return null;

  return (
    <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl flex items-center justify-between gap-2 rounded-2xl bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white shadow-xl border border-amber-400/40">
      <div className="flex items-center gap-2 min-w-0">
        <span className="p-1 rounded-lg bg-amber-700/80 shrink-0">
          <WifiOff className="w-3.5 h-3.5 text-amber-100 animate-pulse" />
        </span>
        <span className="truncate text-2xs sm:text-xs">
          <strong>ऑफलाइन मोड:</strong> कैश्ड नोट्स व टेस्ट हिस्ट्री सुरक्षित व उपलब्ध हैं!
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onNavigateToNotes && (
          <button
            onClick={onNavigateToNotes}
            className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-colors cursor-pointer"
          >
            नोट्स
          </button>
        )}
        {onNavigateToHistory && (
          <button
            onClick={onNavigateToHistory}
            className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-colors cursor-pointer"
          >
            हिस्ट्री
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
          title="बंद करें"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
