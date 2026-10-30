import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Share } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If app is already installed and running in standalone display mode, hide install button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs shadow-xs transition-colors ${className}`}
          title="Instal Aplikasi ke Layar Utama HP / PC"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instal App</span>
        </button>

        {showGuideModal && <GuideModal onClose={() => setShowGuideModal(false)} isIOS={isIOS} />}
      </>
    );
  }

  if (variant === 'banner') {
    return (
      <>
        <div className={`bg-gradient-to-r from-emerald-800 to-teal-900 border border-emerald-600/50 rounded-xl p-3.5 sm:p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h4 className="font-bold text-sm leading-snug">Instal Aplikasi KPI Humas & IT</h4>
              <p className="text-xs text-emerald-200">
                Akses cepat dari layar utama HP tanpa buka browser & bekerja offline
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Instal Sekarang</span>
          </button>
        </div>

        {showGuideModal && <GuideModal onClose={() => setShowGuideModal(false)} isIOS={isIOS} />}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition-all ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Instal Aplikasi</span>
      </button>

      {showGuideModal && <GuideModal onClose={() => setShowGuideModal(false)} isIOS={isIOS} />}
    </>
  );
};

// Guide Modal for Android/iOS if native beforeinstallprompt wasn't automatically opened
const GuideModal: React.FC<{ onClose: () => void; isIOS: boolean }> = ({ onClose, isIOS }) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-5 border border-slate-200 text-slate-800 animate-in fade-in zoom-in-95 cursor-default"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Petunjuk Instal Aplikasi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-3 text-xs text-slate-600">
            <p className="font-medium text-slate-800">
              Untuk menginstal di iPhone / iPad (Safari):
            </p>
            <ol className="space-y-2 list-decimal list-inside pl-1">
              <li className="leading-tight">
                Tekan tombol <strong className="text-slate-900">Bagikan (Share)</strong>{' '}
                <Share className="w-3.5 h-3.5 inline text-emerald-600" /> di bagian bawah layar Safari.
              </li>
              <li className="leading-tight">
                Gulir ke bawah dan pilih <strong className="text-slate-900">Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
              </li>
              <li className="leading-tight">
                Tekan <strong className="text-emerald-700">Tambah</strong> di pojok kanan atas.
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3 text-xs text-slate-600">
            <p className="font-medium text-slate-800">
              Cara menginstal di HP Android / Google Chrome:
            </p>
            <ol className="space-y-2 list-decimal list-inside pl-1">
              <li className="leading-tight">
                Tekan titik tiga <strong className="text-slate-900">(⋮)</strong> di pojok kanan atas browser Chrome.
              </li>
              <li className="leading-tight">
                Pilih menu <strong className="text-emerald-700">"Instal aplikasi"</strong> atau <strong className="text-emerald-700">"Tambahkan ke Layar Utama"</strong>.
              </li>
              <li className="leading-tight">
                Tekan <strong className="text-slate-900">Instal</strong> pada konfirmasi pop-up.
              </li>
            </ol>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Saya Mengerti</span>
          </button>
        </div>
      </div>
    </div>
  );
};
