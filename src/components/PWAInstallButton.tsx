import React, { useState } from 'react';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Direct install prompt (Android Chrome, Desktop Chrome/Edge)
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-xs transition-colors cursor-pointer shrink-0 ${
          compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
        }`}
        title="Install aplikasi ke layar utama perangkat"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>{compact ? 'Install' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari fallback instructions
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg bg-emerald-700/90 hover:bg-emerald-600 border border-emerald-500/50 text-white font-semibold transition-colors cursor-pointer shrink-0 ${
            compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
          }`}
          title="Cara install di iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span>Install</span>
        </button>

        {showGuide && (
          <div
            onClick={() => setShowGuide(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl text-slate-800 space-y-3 border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-700" />
                  <span>Install di iPhone / iPad</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4 leading-relaxed">
                <li>
                  Ketuk tombol <strong className="inline-flex items-center gap-1 text-slate-900"><Share className="w-3.5 h-3.5 text-blue-600" /> Bagikan (Share)</strong> di bar browser Safari.
                </li>
                <li>
                  Gulir ke bawah lalu pilih <strong className="text-slate-900">Tambah ke Layar Utama (Add to Home Screen)</strong>.
                </li>
                <li>
                  Ketuk <strong className="text-slate-900">Tambah (Add)</strong> di pojok kanan atas.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
