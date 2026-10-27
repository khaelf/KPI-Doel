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
  humasIndicators.forEach((ind) => {
    humasTotalBobot += ind.bobot;
    const calc = calculateIndicatorAchievement(ind);
    humasTotalScore += calc.weightedScore;
  });

  // Calculations for IT
  let itTotalBobot = 0;
  let itTotalScore = 0;
  itIndicators.forEach((ind) => {
    itTotalBobot += ind.bobot;
    const calc = calculateIndicatorAchievement(ind);
    itTotalScore += calc.weightedScore;
  });

  const humasBadge = getKpiStatusBadge(humasTotalScore);
  const itBadge = getKpiStatusBadge(itTotalScore);

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

        <div className="flex items-center gap-2">
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
                      <th className="py-3 px-4 text-right">Target</th>
                      <th className="py-3 px-4 text-right">Realisasi</th>
                      <th className="py-3 px-4 text-right">Bobot</th>
                      <th className="py-3 px-4 text-right">Pencapaian (%)</th>
                      <th className="py-3 px-4 text-right">Nilai Akhir</th>
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
                          <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700 whitespace-nowrap">
                            {ind.target} {ind.satuan}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={ind.realisasi}
                              onChange={(e) =>
                                onQuickUpdateRealisasi(ind.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-20 px-2 py-1 text-right border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-400 ml-1">{ind.satuan}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 whitespace-nowrap">
                            {ind.bobot}%
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
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
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 text-sm whitespace-nowrap">
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
                      <th className="py-3 px-4 text-right">Target</th>
                      <th className="py-3 px-4 text-right">Realisasi</th>
                      <th className="py-3 px-4 text-right">Bobot</th>
                      <th className="py-3 px-4 text-right">Pencapaian (%)</th>
                      <th className="py-3 px-4 text-right">Nilai Akhir</th>
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
                          <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700 whitespace-nowrap">
                            {ind.target} {ind.satuan}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={ind.realisasi}
                              onChange={(e) =>
                                onQuickUpdateRealisasi(ind.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-20 px-2 py-1 text-right border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-400 ml-1">{ind.satuan}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 whitespace-nowrap">
                            {ind.bobot}%
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
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
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-700 text-sm whitespace-nowrap">
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
