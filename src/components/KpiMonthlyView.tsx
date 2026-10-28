import React, { useState } from 'react';
import { KpiIndicator, Department } from '../types/kpi';
import {
  calculateIndicatorAchievement,
  formatMonthLabel,
  getKpiStatusBadge,
} from '../utils/kpiCalculations';
import {
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Target,
  Megaphone,
  Monitor,
  Sparkles,
  FileText,
  Printer,
  TrendingUp,
  Award,
} from 'lucide-react';

interface KpiMonthlyViewProps {
  kpiIndicators: KpiIndicator[];
  selectedMonth: string;
  selectedDepartment: 'Semua' | Department;
  onAddIndicator: (dept: Department) => void;
  onEditIndicator: (indicator: KpiIndicator) => void;
  onDeleteIndicator: (id: string) => void;
  onQuickUpdateRealisasi: (id: string, newRealisasi: number) => void;
}

export const KpiMonthlyView: React.FC<KpiMonthlyViewProps> = ({
  kpiIndicators,
  selectedMonth,
  selectedDepartment,
  onAddIndicator,
  onEditIndicator,
  onDeleteIndicator,
  onQuickUpdateRealisasi,
}) => {
  const [showRekapan, setShowRekapan] = useState(true);
  const monthLabel = formatMonthLabel(selectedMonth);

  // Filter indicators by month
  const humasIndicators = kpiIndicators.filter(
    (i) => i.bidang === 'Humas' && i.periodeBulan === selectedMonth
  );

  const itIndicators = kpiIndicators.filter(
    (i) => i.bidang === 'IT' && i.periodeBulan === selectedMonth
  );

  // Calculations for Humas
  let humasTotalBobot = 0;
  let humasTotalScore = 0;
  let humasAchievedCount = 0;
  humasIndicators.forEach((ind) => {
    humasTotalBobot += ind.bobot;
    const calc = calculateIndicatorAchievement(ind);
    humasTotalScore += calc.weightedScore;
    if (calc.rawPercentage >= 100) humasAchievedCount++;
  });

  // Calculations for IT
  let itTotalBobot = 0;
  let itTotalScore = 0;
  let itAchievedCount = 0;
  itIndicators.forEach((ind) => {
    itTotalBobot += ind.bobot;
    const calc = calculateIndicatorAchievement(ind);
    itTotalScore += calc.weightedScore;
    if (calc.rawPercentage >= 100) itAchievedCount++;
  });

  const humasBadge = getKpiStatusBadge(humasTotalScore);
  const itBadge = getKpiStatusBadge(itTotalScore);

  // Rekapan Total Calculations
  const allCurrentIndicators =
    selectedDepartment === 'Humas'
      ? humasIndicators
      : selectedDepartment === 'IT'
      ? itIndicators
      : [...humasIndicators, ...itIndicators];

  const totalAchievedCount =
    selectedDepartment === 'Humas'
      ? humasAchievedCount
      : selectedDepartment === 'IT'
      ? itAchievedCount
      : humasAchievedCount + itAchievedCount;

  const combinedAvgScore =
    selectedDepartment === 'Humas'
      ? humasTotalScore
      : selectedDepartment === 'IT'
      ? itTotalScore
      : (humasTotalScore + itTotalScore) / 2;

  const combinedBadge = getKpiStatusBadge(combinedAvgScore);

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Indikator KPI Bulanan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengaturan target, realisasi, dan bobot indikator kinerja bulan {monthLabel}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Rekapan Bulanan Button */}
          <button
            onClick={() => setShowRekapan(!showRekapan)}
            className={`px-3.5 py-2 font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${
              showRekapan
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>{showRekapan ? 'Sembunyikan Rekapan' : 'Rekapan Bulanan'}</span>
          </button>

          {(selectedDepartment === 'Semua' || selectedDepartment === 'Humas') && (
            <button
              onClick={() => onAddIndicator('Humas')}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Indikator Humas</span>
            </button>
          )}

          {(selectedDepartment === 'Semua' || selectedDepartment === 'IT') && (
            <button
              onClick={() => onAddIndicator('IT')}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Indikator IT</span>
            </button>
          )}
        </div>
      </div>

      {/* --- FITUR REKAPAN BULANAN (Request 2) --- */}
      {showRekapan && (
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl border border-emerald-800/80 shadow-md space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Rekapan Bulanan Kinerja KPI ({monthLabel})</h3>
                <p className="text-xs text-emerald-200/80">
                  Ringkasan evaluasi pencapaian indikator kinerja utama Humas & IT Parabek
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="no-print px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto border border-white/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rekapan</span>
            </button>
          </div>

          {/* Stat Box Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <span className="text-emerald-200/80 font-medium block text-[11px]">Rata-rata Nilai KPI</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-white">{combinedAvgScore.toFixed(2)}%</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${combinedBadge.badgeClass}`}>
                  {combinedBadge.label}
                </span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <span className="text-emerald-200/80 font-medium block text-[11px]">Total Indikator Bulanan</span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">
                {allCurrentIndicators.length} <span className="text-xs font-normal text-emerald-300">indikator</span>
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <span className="text-emerald-200/80 font-medium block text-[11px]">Indikator 100%+ (Tercapai)</span>
              <span className="text-2xl font-bold font-mono text-emerald-300 mt-1 block">
                {totalAchievedCount} / {allCurrentIndicators.length}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <span className="text-emerald-200/80 font-medium block text-[11px]">Perlu Ditingkatkan</span>
              <span className="text-2xl font-bold font-mono text-amber-300 mt-1 block">
                {allCurrentIndicators.length - totalAchievedCount} <span className="text-xs font-normal text-amber-200">indikator</span>
              </span>
            </div>
          </div>

          {/* Department Breakdown Mini Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            {(selectedDepartment === 'Semua' || selectedDepartment === 'Humas') && (
              <div className="bg-white/5 rounded-xl p-4 border border-emerald-700/50 space-y-2">
                <div className="flex items-center justify-between font-bold text-white border-b border-emerald-800/40 pb-2">
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <Megaphone className="w-4 h-4" /> Bagian Humas
                  </span>
                  <span className="font-mono text-emerald-300 text-sm">{humasTotalScore.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-emerald-100/80 pt-1">
                  <span>Jumlah Indikator:</span>
                  <span className="font-mono font-bold text-white">{humasIndicators.length}</span>
                </div>
                <div className="flex justify-between text-emerald-100/80">
                  <span>Target 100%+ Achieved:</span>
                  <span className="font-mono font-bold text-emerald-300">{humasAchievedCount} Indikator</span>
                </div>
                <div className="flex justify-between text-emerald-100/80">
                  <span>Predikat Evaluasi:</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${humasBadge.badgeClass}`}>
                    {humasBadge.label}
                  </span>
                </div>
              </div>
            )}

            {(selectedDepartment === 'Semua' || selectedDepartment === 'IT') && (
              <div className="bg-white/5 rounded-xl p-4 border border-blue-700/50 space-y-2">
                <div className="flex items-center justify-between font-bold text-white border-b border-blue-800/40 pb-2">
                  <span className="flex items-center gap-1.5 text-blue-300">
                    <Monitor className="w-4 h-4" /> Bagian IT
                  </span>
                  <span className="font-mono text-blue-300 text-sm">{itTotalScore.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-blue-100/80 pt-1">
                  <span>Jumlah Indikator:</span>
                  <span className="font-mono font-bold text-white">{itIndicators.length}</span>
                </div>
                <div className="flex justify-between text-blue-100/80">
                  <span>Target 100%+ Achieved:</span>
                  <span className="font-mono font-bold text-blue-300">{itAchievedCount} Indikator</span>
                </div>
                <div className="flex justify-between text-blue-100/80">
                  <span>Predikat Evaluasi:</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${itBadge.badgeClass}`}>
                    {itBadge.label}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- HUMAS SECTION --- */}
      {(selectedDepartment === 'Semua' || selectedDepartment === 'Humas') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-900 text-white p-4 rounded-xl shadow-sm border border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">KPI Bagian Humas</h3>
                <p className="text-xs text-emerald-200">
                  Total Bobot: {humasTotalBobot}% / 100%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-emerald-200">Nilai Akhir Humas</div>
                <div className="text-2xl font-bold font-mono">{humasTotalScore.toFixed(2)}%</div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${humasBadge.badgeClass}`}>
                {humasBadge.label}
              </span>
            </div>
          </div>

          {/* Bobot Alert warning if not 100% */}
          {Math.abs(humasTotalBobot - 100) > 0.01 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Perhatian:</strong> Total bobot indikator Humas saat ini{' '}
                <strong>{humasTotalBobot}%</strong>. Total bobot disarankan bernilai persis{' '}
                <strong>100%</strong> untuk perhitungan akurat.
              </span>
            </div>
          )}

          {/* Table for Humas */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {humasIndicators.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada indikator KPI Humas untuk bulan ini.{' '}
                <button
                  onClick={() => onAddIndicator('Humas')}
                  className="text-emerald-700 underline font-semibold"
                >
                  Tambah Indikator Humas
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-emerald-50/70 text-emerald-900 uppercase font-semibold text-[11px] border-b border-emerald-100">
                    <tr>
                      <th className="py-3 px-4">No</th>
                      <th className="py-3 px-4">Indikator KPI Humas</th>
                      <th className="py-3 px-4 text-left">Target</th>
                      <th className="py-3 px-4 text-left">Realisasi</th>
                      <th className="py-3 px-4 text-left">Bobot</th>
                      <th className="py-3 px-4 text-left">Pencapaian (%)</th>
                      <th className="py-3 px-4 text-left">Nilai Akhir</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {humasIndicators.map((ind, idx) => {
                      const calc = calculateIndicatorAchievement(ind);
                      return (
                        <tr key={ind.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {ind.namaIndikator}
                          </td>
                          <td className="py-3.5 px-4 text-left font-mono font-medium text-slate-700 whitespace-nowrap">
                            {ind.target} {ind.satuan}
                          </td>
                          <td className="py-3.5 px-4 text-left font-mono whitespace-nowrap">
                            <div className="flex items-center justify-start gap-1.5">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={ind.realisasi}
                                onChange={(e) =>
                                  onQuickUpdateRealisasi(ind.id, parseFloat(e.target.value) || 0)
                                }
                                className="w-14 px-1.5 py-0.5 text-center border border-slate-300 rounded-md font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                              <span className="text-[11px] text-slate-500 font-normal">{ind.satuan}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-left font-mono font-bold text-slate-700 whitespace-nowrap">
                            {ind.bobot}%
                          </td>
                          <td className="py-3.5 px-4 text-left font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] ${
                                calc.rawPercentage >= 100
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : calc.rawPercentage >= 75
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {calc.cappedPercentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-left font-mono font-bold text-emerald-700 text-sm whitespace-nowrap">
                            {calc.weightedScore.toFixed(2)}%
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onEditIndicator(ind)}
                                className="p-1.5 text-slate-600 hover:text-emerald-700 rounded-md"
                                title="Edit Indikator"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteIndicator(ind.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                                title="Hapus Indikator"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- IT SECTION --- */}
      {(selectedDepartment === 'Semua' || selectedDepartment === 'IT') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-950 text-white p-4 rounded-xl shadow-sm border border-blue-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-800 flex items-center justify-center text-white">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">KPI Bagian IT</h3>
                <p className="text-xs text-blue-200">
                  Total Bobot: {itTotalBobot}% / 100%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-blue-200">Nilai Akhir IT</div>
                <div className="text-2xl font-bold font-mono">{itTotalScore.toFixed(2)}%</div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${itBadge.badgeClass}`}>
                {itBadge.label}
              </span>
            </div>
          </div>

          {/* Bobot Alert warning if not 100% */}
          {Math.abs(itTotalBobot - 100) > 0.01 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Perhatian:</strong> Total bobot indikator IT saat ini{' '}
                <strong>{itTotalBobot}%</strong>. Total bobot disarankan bernilai persis{' '}
                <strong>100%</strong> untuk perhitungan akurat.
              </span>
            </div>
          )}

          {/* Table for IT */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {itIndicators.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada indikator KPI IT untuk bulan ini.{' '}
                <button
                  onClick={() => onAddIndicator('IT')}
                  className="text-blue-700 underline font-semibold"
                >
                  Tambah Indikator IT
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-blue-50/70 text-blue-900 uppercase font-semibold text-[11px] border-b border-blue-100">
                    <tr>
                      <th className="py-3 px-4">No</th>
                      <th className="py-3 px-4">Indikator KPI IT</th>
                      <th className="py-3 px-4 text-left">Target</th>
                      <th className="py-3 px-4 text-left">Realisasi</th>
                      <th className="py-3 px-4 text-left">Bobot</th>
                      <th className="py-3 px-4 text-left">Pencapaian (%)</th>
                      <th className="py-3 px-4 text-left">Nilai Akhir</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itIndicators.map((ind, idx) => {
                      const calc = calculateIndicatorAchievement(ind);
                      return (
                        <tr key={ind.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {ind.namaIndikator}
                          </td>
                          <td className="py-3.5 px-4 text-left font-mono font-medium text-slate-700 whitespace-nowrap">
                            {ind.target} {ind.satuan}
                          </td>
                          <td className="py-3.5 px-4 text-left font-mono whitespace-nowrap">
                            <div className="flex items-center justify-start gap-1.5">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={ind.realisasi}
                                onChange={(e) =>
                                  onQuickUpdateRealisasi(ind.id, parseFloat(e.target.value) || 0)
                                }
                                className="w-14 px-1.5 py-0.5 text-center border border-slate-300 rounded-md font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                              <span className="text-[11px] text-slate-500 font-normal">{ind.satuan}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-left font-mono font-bold text-slate-700 whitespace-nowrap">
                            {ind.bobot}%
                          </td>
                          <td className="py-3.5 px-4 text-left font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] ${
                                calc.rawPercentage >= 100
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : calc.rawPercentage >= 75
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {calc.cappedPercentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-left font-mono font-bold text-blue-700 text-sm whitespace-nowrap">
                            {calc.weightedScore.toFixed(2)}%
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onEditIndicator(ind)}
                                className="p-1.5 text-slate-600 hover:text-blue-700 rounded-md"
                                title="Edit Indikator"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteIndicator(ind.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                                title="Hapus Indikator"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
