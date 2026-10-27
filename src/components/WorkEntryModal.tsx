import React, { useState, useEffect } from 'react';
import { WorkEntry, Department, TaskStatus } from '../types/kpi';
import { X, Save, Calendar, CheckCircle, Link } from 'lucide-react';

interface WorkEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<WorkEntry, 'id' | 'createdAt'>, editingId?: string) => void;
  editingEntry?: WorkEntry | null;
  defaultDepartment?: Department;
  defaultMonth?: string;
}

export const WorkEntryModal: React.FC<WorkEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  defaultDepartment = 'Humas',
  defaultMonth,
}) => {
  const [tanggal, setTanggal] = useState('');
  const [bidang, setBidang] = useState<Department>('Humas');
  const [namaPekerjaan, setNamaPekerjaan] = useState('');
  const [targetHasil, setTargetHasil] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Proses');
  const [persentase, setPersentase] = useState<number>(50);
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    if (editingEntry) {
      setTanggal(editingEntry.tanggal);
      setBidang(editingEntry.bidang);
      setNamaPekerjaan(editingEntry.namaPekerjaan);
      setTargetHasil(editingEntry.targetHasil);
      setStatus(editingEntry.status);
      setPersentase(editingEntry.persentase);
      setCatatan(editingEntry.catatan || '');
    } else {
      const today = new Date().toISOString().substring(0, 10);
      setTanggal(today);
      setBidang(defaultDepartment);
      setNamaPekerjaan('');
      setTargetHasil('');
      setStatus('Proses');
      setPersentase(50);
      setCatatan('');
    }
  }, [editingEntry, isOpen, defaultDepartment]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPekerjaan.trim() || !targetHasil.trim()) return;

    onSave(
      {
        tanggal,
        bidang,
        namaPekerjaan: namaPekerjaan.trim(),
        targetHasil: targetHasil.trim(),
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
    if (newStatus === 'Selesai') {
      setPersentase(100);
    } else if (newStatus === 'Belum dikerjakan') {
      setPersentase(0);
    } else if (persentase === 100 || persentase === 0) {
      setPersentase(50);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-4">
            {/* Tanggal */}
            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Tanggal Pekerjaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

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
          </div>

          {/* Nama Pekerjaan */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1">
              Nama Pekerjaan / Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pembuatan Banner Publikasi Milad Parabek"
              value={namaPekerjaan}
              onChange={(e) => setNamaPekerjaan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Target / Hasil Diharapkan */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1">
              Target / Hasil yang Diharapkan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Contoh: Flyer digital disebar ke seluruh grup WhatsApp wali santri"
              value={targetHasil}
              onChange={(e) => setTargetHasil(e.target.value)}
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
              placeholder="https://drive.google.com/... atau catatan kendala"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
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
