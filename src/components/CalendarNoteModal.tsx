import React, { useState, useEffect } from 'react';
import { CalendarNote, NoteCategory, NoteColor, Department } from '../types/kpi';
import { autoCapitalizeText } from '../utils/textUtils';
import { getHijriDateFull } from '../utils/hijriDate';
import { X, Save, Calendar, Clock, Pin, Tag, Building2, CheckSquare } from 'lucide-react';

interface CalendarNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<CalendarNote, 'id' | 'createdAt'>, editingId?: string) => void;
  editingNote?: CalendarNote | null;
  defaultDate?: string;
  defaultDepartment?: Department | 'Semua';
}

const CATEGORY_OPTIONS: NoteCategory[] = ['Pengingat', 'Penting', 'Koordinasi', 'Tugas', 'Umum'];

const COLOR_OPTIONS: { id: NoteColor; label: string; bgClass: string; borderClass: string }[] = [
  { id: 'emerald', label: 'Hijau (Humas/Normal)', bgClass: 'bg-emerald-500', borderClass: 'border-emerald-600' },
  { id: 'blue', label: 'Biru (IT/Operasional)', bgClass: 'bg-blue-500', borderClass: 'border-blue-600' },
  { id: 'amber', label: 'Kuning (Koordinasi)', bgClass: 'bg-amber-500', borderClass: 'border-amber-600' },
  { id: 'rose', label: 'Merah (Penting/Urgent)', bgClass: 'bg-rose-500', borderClass: 'border-rose-600' },
  { id: 'purple', label: 'Ungu (Umum/Event)', bgClass: 'bg-purple-500', borderClass: 'border-purple-600' },
];

export const CalendarNoteModal: React.FC<CalendarNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingNote,
  defaultDate,
  defaultDepartment = 'Semua',
}) => {
  const todayStr = new Date().toISOString().substring(0, 10);

  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [tanggal, setTanggal] = useState(todayStr);
  const [waktu, setWaktu] = useState('');
  const [kategori, setKategori] = useState<NoteCategory>('Pengingat');
  const [warna, setWarna] = useState<NoteColor>('emerald');
  const [bidang, setBidang] = useState<Department | 'Semua'>('Semua');
  const [isPinned, setIsPinned] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingNote) {
      setJudul(autoCapitalizeText(editingNote.judul || ''));
      setIsi(editingNote.isi || '');
      setTanggal(editingNote.tanggal || todayStr);
      setWaktu(editingNote.waktu || '');
      setKategori(editingNote.kategori || 'Pengingat');
      setWarna(editingNote.warna || 'emerald');
      setBidang(editingNote.bidang || 'Semua');
      setIsPinned(Boolean(editingNote.isPinned));
      setIsCompleted(Boolean(editingNote.isCompleted));
    } else {
      setJudul('');
      setIsi('');
      setTanggal(defaultDate || todayStr);
      setWaktu('');
      setKategori('Pengingat');
      setWarna('emerald');
      setBidang(defaultDepartment || 'Semua');
      setIsPinned(false);
      setIsCompleted(false);
    }
  }, [editingNote, isOpen, defaultDate, defaultDepartment, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !tanggal) return;

    onSave(
      {
        judul: autoCapitalizeText(judul.trim()),
        isi: isi.trim(),
        tanggal,
        waktu: waktu.trim() || undefined,
        kategori,
        warna,
        bidang,
        isPinned,
        isCompleted,
      },
      editingNote?.id
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85dvh] sm:max-h-[90dvh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 cursor-default"
      >
        {/* Header */}
        <div className="bg-[#1b4332] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-300" />
            <h3 className="text-base font-bold">
              {editingNote ? 'Edit Catatan Kalender' : 'Tambah Catatan / Note Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 text-xs text-slate-700 overflow-y-auto flex-1">
            {/* Judul Catatan */}
            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Judul Catatan / Note <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoCapitalize="words"
                placeholder="Contoh: Pengingat Rapat Koordinasi, Beli Kabel FO..."
                value={judul}
                onChange={(e) => setJudul(autoCapitalizeText(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Tanggal & Waktu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  <span>Tanggal <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
                {tanggal && (
                  <p className="text-[11px] font-medium text-emerald-800 mt-1 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="font-bold">☪</span>
                    <span>{getHijriDateFull(tanggal)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Waktu (Opsional)</span>
                </label>
                <input
                  type="time"
                  value={waktu}
                  onChange={(e) => setWaktu(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* Kategori & Bidang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-600" />
                  <span>Kategori</span>
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as NoteCategory)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Bidang / Bagian</span>
                </label>
                <select
                  value={bidang}
                  onChange={(e) => setBidang(e.target.value as Department | 'Semua')}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Semua">Semua (Humas & IT)</option>
                  <option value="Humas">HUMAS</option>
                  <option value="IT">IT</option>
                  <option value="Umum">UMUM</option>
                </select>
              </div>
            </div>

            {/* Pilihan Warna Label */}
            <div>
              <label className="block font-semibold text-slate-900 mb-1.5">
                Warna Label
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_OPTIONS.map((col) => {
                  const isSelected = warna === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setWarna(col.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-slate-800 ring-2 ring-slate-800/20 bg-slate-100 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${col.bgClass}`}></span>
                      <span>{col.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Isi Catatan / Detail */}
            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Isi Catatan / Detail Memo
              </label>
              <textarea
                rows={3}
                placeholder="Tulis detail catatan, hasil diskusi, atau daftar poin pengingat..."
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {/* Checkbox Options: Pin & Selesai */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sematkan Catatan (Pin ke atas)</span>
                </span>
              </label>

              {editingNote && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tandai Sudah Selesai</span>
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
