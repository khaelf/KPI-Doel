import React, { useState, useEffect } from 'react';
import { WorkEntry, KpiIndicator, Department, TaskStatus } from '../types/kpi';
import { autoCapitalizeText } from '../utils/textUtils';
import { X, Save, Calendar, Target } from 'lucide-react';

interface WorkEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<WorkEntry, 'id' | 'createdAt'>, editingId?: string) => void;
  editingEntry?: WorkEntry | null;
  defaultDepartment?: Department;
  defaultMonth?: string;
  kpiIndicators?: KpiIndicator[];
}

export const WorkEntryModal: React.FC<WorkEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  defaultDepartment = 'Humas',
  defaultMonth,
  kpiIndicators = [],
}) => {
  const [tanggalMasuk, setTanggalMasuk] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [jumlahRevisi, setJumlahRevisi] = useState<number>(0);
  const [bidang, setBidang] = useState<Department>('Humas');
  const [namaPekerjaan, setNamaPekerjaan] = useState('');
  const [indikatorKpi, setIndikatorKpi] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Proses');
  const [persentase, setPersentase] = useState<number>(50);
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    if (editingEntry) {
      setTanggalMasuk(editingEntry.tanggalMasuk || editingEntry.tanggal || today);
      setTanggalMulai(editingEntry.tanggalMulai || editingEntry.tanggal || today);
      setTanggalSelesai(editingEntry.tanggalSelesai || '');
      setJumlahRevisi(editingEntry.jumlahRevisi ?? 0);
      setBidang(editingEntry.bidang);
      setNamaPekerjaan(autoCapitalizeText(editingEntry.namaPekerjaan));
      setIndikatorKpi(editingEntry.indikatorKpi || '');
      setStatus(editingEntry.status);
      setPersentase(editingEntry.persentase);
      setCatatan(editingEntry.catatan || '');
    } else {
      setTanggalMasuk(today);
      setTanggalMulai(today);
      setTanggalSelesai('');
      setJumlahRevisi(0);
      setBidang(defaultDepartment);
      setNamaPekerjaan('');
      setIndikatorKpi('');
      setStatus('Proses');
      setPersentase(50);
      setCatatan('');
    }
  }, [editingEntry, isOpen, defaultDepartment]);

  if (!isOpen) return null;

  // Filter KPI indicators for the selected department
  const currentMonth = (tanggalMasuk || defaultMonth || '').substring(0, 7);
  const monthMatchIndicators = kpiIndicators.filter(
    (ind) => ind.bidang === bidang && (!currentMonth || ind.periodeBulan === currentMonth)
  );
  const departmentIndicators = monthMatchIndicators.length > 0
    ? monthMatchIndicators
    : kpiIndicators.filter((ind) => ind.bidang === bidang);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPekerjaan.trim()) return;

    onSave(
      {
        tanggalMasuk,
        tanggalMulai: tanggalMulai || tanggalMasuk,
        tanggalSelesai: tanggalSelesai.trim() ? tanggalSelesai.trim() : '',
        jumlahRevisi: Number(jumlahRevisi) || 0,
        tanggal: tanggalMasuk, // fallback for month filters
        bidang,
        namaPekerjaan: autoCapitalizeText(namaPekerjaan.trim()),
        indikatorKpi: indikatorKpi.trim(),
        status,
        persentase: Number(persentase),
        catatan: catatan.trim(),
      },
      editingEntry?.id
    );

    onClose();
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    const today = new Date().toISOString().substring(0, 10);
    if (newStatus === 'Selesai') {
      setPersentase(100);
      if (!tanggalSelesai) setTanggalSelesai(today);
    } else if (newStatus === 'Belum dikerjakan') {
      setPersentase(0);
      setTanggalSelesai('');
    } else if (persentase === 100 || persentase === 0) {
      setPersentase(50);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 cursor-default"
      >
        {/* Modal Header */}
        <div className="bg-[#1b4332] text-white p-5 flex items-center justify-between">
          <h3 className="text-base font-bold">
            {editingEntry ? 'Edit Catatan Pekerjaan' : 'Tambah Catatan Pekerjaan Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700 max-h-[85vh] overflow-y-auto">
          {/* Bidang */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1">
              Bidang / Dept <span className="text-rose-500">*</span>
            </label>
            <select
              value={bidang}
              onChange={(e) => setBidang(e.target.value as Department)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Humas">Humas (Hubungan Masyarakat)</option>
              <option value="IT">IT (Teknologi Informasi)</option>
            </select>
          </div>

          {/* Indikator KPI */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-700" />
                <span>Indikator KPI Terkait <span className="text-slate-400 font-normal">(Opsional)</span></span>
              </span>
              <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                KPI Bulanan
              </span>
            </label>
            <select
              value={indikatorKpi}
              onChange={(e) => setIndikatorKpi(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="">-- Tanpa Indikator KPI --</option>
              {departmentIndicators.map((ind) => (
                <option key={ind.id} value={ind.namaIndikator}>
                  {ind.namaIndikator} ({ind.periodeBulan})
                </option>
              ))}
            </select>
            {departmentIndicators.length === 0 && (
              <p className="text-[11px] text-slate-400 mt-1 italic">
                Belum ada Indikator KPI terdaftar untuk bidang {bidang}.
              </p>
            )}
          </div>

          {/* Group 4 Dates & Revision Fields */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Jadwal & Riwayat Revisi</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Tanggal Masuk */}
              <div>
                <label className="block font-semibold text-slate-900 mb-1">
                  Tanggal Masuk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalMasuk}
                  onChange={(e) => setTanggalMasuk(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Tanggal Mulai */}
              <div>
                <label className="block font-semibold text-slate-900 mb-1">
                  Tanggal Mulai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Tanggal Selesai */}
              <div>
                <label className="block font-semibold text-slate-900 mb-1">
                  Tanggal Selesai <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Jumlah Revisi */}
              <div>
                <label className="block font-semibold text-slate-900 mb-1">
                  Jumlah Revisi
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={jumlahRevisi}
                  onChange={(e) => setJumlahRevisi(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Nama Pekerjaan */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1">
              Nama Pekerjaan / Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoCapitalize="sentences"
              placeholder="Contoh: Pembuatan Banner Publikasi Milad Parabek"
              value={namaPekerjaan}
              onChange={(e) => setNamaPekerjaan(autoCapitalizeText(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Status & Persentase */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Status Pekerjaan</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Belum dikerjakan">Belum dikerjakan</option>
                <option value="Proses">Proses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Nilai Pencapaian (%): <span className="font-mono text-emerald-700 font-bold">{persentase}%</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={persentase}
                onChange={(e) => setPersentase(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Slider */}
          <div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={persentase}
              onChange={(e) => setPersentase(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Catatan / Documentation Link */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1">
              Catatan / Tautan Dokumentasi (Opsional)
            </label>
            <input
              type="text"
              autoCapitalize="sentences"
              placeholder="https://drive.google.com/... atau catatan kendala"
              value={catatan}
              onChange={(e) => setCatatan(autoCapitalizeText(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pekerjaan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
