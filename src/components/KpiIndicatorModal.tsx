import React, { useState, useEffect } from 'react';
import { KpiIndicator, Department } from '../types/kpi';
import { X, Save, Target } from 'lucide-react';

interface KpiIndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (indicator: Omit<KpiIndicator, 'id'>, editingId?: string) => void;
  editingIndicator?: KpiIndicator | null;
  defaultDepartment?: Department;
  defaultMonth?: string;
}

export const KpiIndicatorModal: React.FC<KpiIndicatorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingIndicator,
  defaultDepartment = 'Humas',
  defaultMonth = '2026-10',
}) => {
  const [bidang, setBidang] = useState<Department>('Humas');
  const [namaIndikator, setNamaIndikator] = useState('');
  const [satuan, setSatuan] = useState('Kegiatan');
  const [target, setTarget] = useState<number>(10);
  const [realisasi, setRealisasi] = useState<number>(10);
  const [bobot, setBobot] = useState<number>(20);
  const [periodeBulan, setPeriodeBulan] = useState('2026-10');

  useEffect(() => {
    if (editingIndicator) {
      setBidang(editingIndicator.bidang);
      setNamaIndikator(editingIndicator.namaIndikator);
      setSatuan(editingIndicator.satuan);
      setTarget(editingIndicator.target);
      setRealisasi(editingIndicator.realisasi);
      setBobot(editingIndicator.bobot);
      setPeriodeBulan(editingIndicator.periodeBulan);
    } else {
      setBidang(defaultDepartment);
      setNamaIndikator('');
      setSatuan('Kegiatan');
      setTarget(10);
      setRealisasi(0);
      setBobot(20);
      setPeriodeBulan(defaultMonth);
    }
  }, [editingIndicator, isOpen, defaultDepartment, defaultMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaIndikator.trim()) return;

    onSave(
      {
        bidang,
        namaIndikator: namaIndikator.trim(),
        satuan: satuan.trim(),
        target: Number(target),
        realisasi: Number(realisasi),
        bobot: Number(bobot),
        periodeBulan,
      },
      editingIndicator?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        {/* Modal Header */}
        <div className="bg-[#1b4332] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-300" />
            <h3 className="text-base font-bold">
              {editingIndicator ? 'Edit Indikator KPI' : 'Tambah Indikator KPI Baru'}
            </h3>
          </div>
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
                <option value="Humas">Humas</option>
                <option value="IT">IT</option>
              </select>
            </div>

            {/* Periode Bulan */}
            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Periode Bulan <span className="text-rose-500">*</span>
              </label>
              <input
                type="month"
                required
                value={periodeBulan}
                onChange={(e) => setPeriodeBulan(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Nama Indikator */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1">
              Nama Indikator KPI <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Publikasi berita dan kegiatan"
              value={namaIndikator}
              onChange={(e) => setNamaIndikator(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Satuan */}
          <div>
            <label className="block font-semibold text-slate-900 mb-1">
              Satuan Pengukuran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Berita, Konten, Laporan, %, Maintenance, Event"
              value={satuan}
              onChange={(e) => setSatuan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Target, Realisasi, Bobot */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Target Bulanan</label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={target}
                onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Realisasi Saat Ini</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={realisasi}
                onChange={(e) => setRealisasi(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Bobot (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                required
                value={bobot}
                onChange={(e) => setBobot(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
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
              <span>Simpan Indikator</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
