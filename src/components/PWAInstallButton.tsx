import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Info } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');

  // If already installed and opened in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-[11px] sm:text-xs rounded-lg transition-all shadow-sm cursor-pointer shrink-0"
        title="Pasang Aplikasi KPI di HP"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span className="whitespace-nowrap">Install di HP</span>
      </button>

      {/* Installation Guide Modal (Android + iOS) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl text-slate-800 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    Pasang Aplikasi di HP
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Akses cepat dari layar utama seperti aplikasi bawaan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Trigger Button if native prompt is supported */}
            {isInstallable && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="text-xs text-emerald-900">
                  <span className="font-bold">Browser mendukung instalasi langsung!</span>
                  <p className="text-[11px] text-emerald-700">Ketuk untuk memasang tanpa manual:</p>
                </div>
                <button
                  onClick={async () => {
                    await install();
                    setShowGuide(false);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm whitespace-nowrap"
                >
                  Instal Sekarang
                </button>
              </div>
            )}

            {/* Platform Selector Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1 mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-1.5 rounded-md transition-all text-center ${
                  activeTab === 'android'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Android / Chrome
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-1.5 rounded-md transition-all text-center ${
                  activeTab === 'ios'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                iPhone / iPad (Safari)
              </button>
            </div>

            {/* Android Instructions */}
            {activeTab === 'android' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900">Buka Menu Browser</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ketuk ikon titik tiga (<strong>⋮</strong>) di pojok kanan atas browser Google Chrome atau browser HP Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900">Pilih &quot;Instal Aplikasi&quot;</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilih opsi <strong>&quot;Instal aplikasi&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> (<em>Add to Home screen</em>).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900">Konfirmasi Pemasangan</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tekan tombol <strong>&quot;Instal&quot;</strong>. Ikon aplikasi akan langsung muncul di layar HP Anda dan dapat digunakan offline!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* iOS Safari Instructions */}
            {activeTab === 'ios' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900">Buka di Browser Safari</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pastikan tautan dibuka melalui browser Safari resmi bawaan iPhone / iPad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900">Tekan Tombol Share (Bagikan)</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ketuk tombol <strong>Share</strong> (ikon kotak dengan tanda panah ke atas) di bagian bawah layar Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900">Pilih &quot;Tambah ke Layar Utama&quot;</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Geser ke bawah lalu ketuk <strong>&quot;Tambah ke Layar Utama&quot;</strong> (<em>Add to Home Screen</em>), lalu tekan <strong>Tambah</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits Badge */}
            <div className="mt-4 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Aplikasi berjalan lancar tanpa kuota tambahan dengan ikon tersendiri di HP.</span>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </>
  );
};
