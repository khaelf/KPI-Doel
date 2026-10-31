import React from 'react';
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
  Megaphone,
  Monitor,
  Briefcase,
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
}) => {
  const monthLabel = formatMonthLabel(selectedMonth);

  // Filter indicators by month
  const humasIndicators = kpiIndicators.filter(
    (i) => i.bidang === 'Humas' && i.periodeBulan === selectedMonth
  );

  const itIndicators = kpiIndicators.filter(
    (i) => i.bidang === 'IT' && i.periodeBulan === selectedMonth
  );

  const umumIndicators = kpiIndicators.filter(
    (i) => i.bidang === 'Umum' && i.periodeBulan === selectedMonth
  );

  // Average score for Humas
  const humasAvgScore =
    humasIndicators.length > 0
      ? humasIndicators.reduce(
          (acc, ind) => acc + calculateIndicatorAchievement(ind).cappedPercentage,
          0
        ) / humasIndicators.length
      : 0;

  // Average score for IT
  const itAvgScore =
    itIndicators.length > 0
      ? itIndicators.reduce(
          (acc, ind) => acc + calculateIndicatorAchievement(ind).cappedPercentage,
          0
        ) / itIndicators.length
      : 0;

  // Average score for Umum
  const umumAvgScore =
    umumIndicators.length > 0
      ? umumIndicators.reduce(
          (acc, ind) => acc + calculateIndicatorAchievement(ind).cappedPercentage,
          0
        ) / umumIndicators.length
      : 0;

  const humasBadge = getKpiStatusBadge(humasAvgScore);
  const itBadge = getKpiStatusBadge(itAvgScore);
  const umumBadge = getKpiStatusBadge(umumAvgScore);

  // Combined average score
  const allIndicators = [...humasIndicators, ...itIndicators, ...umumIndicators];
  const combinedAvgScore =
    allIndicators.length > 0
      ? allIndicators.reduce(
          (acc, ind) => acc + calculateIndicatorAchievement(ind).cappedPercentage,
          0
        ) / allIndicators.length
      : 0;

  const combinedBadge = getKpiStatusBadge(combinedAvgScore);

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Indikator KPI Bulanan</h2>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Combined Average Metric Badge (Minimalist on Mobile) */}
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 flex items-center justify-between sm:justify-start gap-2 sm:gap-3 shadow-2xs">
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Rata-rata Capaian Keseluruhan
              </div>
              <div className="text-base sm:text-lg font-extrabold font-mono text-emerald-900 leading-tight">
                {combinedAvgScore.toFixed(2)}%
              </div>
            </div>
            <span className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded shrink-0 ${combinedBadge.badgeClass}`}>
              {combinedBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(selectedDepartment === 'Semua' || selectedDepartment === 'Humas') && (
              <button
                onClick={() => onAddIndicator('Humas')}
                className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Indikator HUMAS</span>
              </button>
            )}

            {(selectedDepartment === 'Semua' || selectedDepartment === 'IT') && (
              <button
                onClick={() => onAddIndicator('IT')}
                className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Indikator IT</span>
              </button>
            )}

            {(selectedDepartment === 'Semua' || selectedDepartment === 'Umum') && (
              <button
                onClick={() => onAddIndicator('Umum')}
                className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Indikator UMUM</span>
              </button>
            )}
          </div>
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
                  {humasIndicators.length} Indikator Kinerja Terdaftar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-emerald-200">Rata-rata Capaian Humas</div>
                <div className="text-2xl font-bold font-mono">{humasAvgScore.toFixed(2)}%</div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${humasBadge.badgeClass}`}>
                {humasBadge.label}
              </span>
            </div>
          </div>

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
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Indikator KPI Humas</th>
                      <th className="py-3 px-3 text-left">Target</th>
                      <th className="py-3 px-3 text-center w-24">Realisasi</th>
                      <th className="py-3 px-4 text-center w-28">Pencapaian (%)</th>
                      <th className="py-3 px-4 text-right w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {humasIndicators.map((ind, idx) => {
                      const calc = calculateIndicatorAchievement(ind);
                      return (
                        <tr key={ind.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-400 text-center">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {ind.namaIndikator}
                          </td>
                          <td className="py-3.5 px-3 text-left font-mono text-slate-800 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onEditIndicator(ind)}
                              className="group/tgt flex items-center gap-2 px-2 py-1 -mx-2 rounded-lg hover:bg-emerald-50 transition-colors text-left"
                              title={`Klik untuk mengedit target bulan ${monthLabel}`}
                            >
                              <span className="font-bold text-slate-900 min-w-[2.5rem] shrink-0 text-left group-hover/tgt:text-emerald-700">{ind.target}</span>
                              <span className="text-slate-600 font-normal">{ind.satuan}</span>
                              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/tgt:opacity-100 transition-opacity ml-1" />
                            </button>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-extrabold text-slate-900 whitespace-nowrap bg-slate-50/60">
                            {ind.realisasi}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-bold ${
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
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onEditIndicator(ind)}
                                className="p-1.5 text-slate-600 hover:text-emerald-700 rounded-md hover:bg-emerald-50 transition-colors"
                                title="Edit Target Bulan Ini & Indikator"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteIndicator(ind.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
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
                  {itIndicators.length} Indikator Kinerja Terdaftar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-blue-200">Rata-rata Capaian IT</div>
                <div className="text-2xl font-bold font-mono">{itAvgScore.toFixed(2)}%</div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${itBadge.badgeClass}`}>
                {itBadge.label}
              </span>
            </div>
          </div>

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
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Indikator KPI IT</th>
                      <th className="py-3 px-3 text-left">Target</th>
                      <th className="py-3 px-3 text-center w-24">Realisasi</th>
                      <th className="py-3 px-4 text-center w-28">Pencapaian (%)</th>
                      <th className="py-3 px-4 text-right w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itIndicators.map((ind, idx) => {
                      const calc = calculateIndicatorAchievement(ind);
                      return (
                        <tr key={ind.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-400 text-center">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {ind.namaIndikator}
                          </td>
                          <td className="py-3.5 px-3 text-left font-mono text-slate-800 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onEditIndicator(ind)}
                              className="group/tgt flex items-center gap-2 px-2 py-1 -mx-2 rounded-lg hover:bg-blue-50 transition-colors text-left"
                              title={`Klik untuk mengedit target bulan ${monthLabel}`}
                            >
                              <span className="font-bold text-slate-900 min-w-[2.5rem] shrink-0 text-left group-hover/tgt:text-blue-700">{ind.target}</span>
                              <span className="text-slate-600 font-normal">{ind.satuan}</span>
                              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/tgt:opacity-100 transition-opacity ml-1" />
                            </button>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-extrabold text-slate-900 whitespace-nowrap bg-slate-50/60">
                            {ind.realisasi}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-bold ${
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
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onEditIndicator(ind)}
                                className="p-1.5 text-slate-600 hover:text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                                title="Edit Target Bulan Ini & Indikator"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteIndicator(ind.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
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

      {/* --- UMUM SECTION --- */}
      {(selectedDepartment === 'Semua' || selectedDepartment === 'Umum') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-950 text-white p-4 rounded-xl shadow-sm border border-purple-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-800 flex items-center justify-center text-white">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">KPI Bagian Umum</h3>
                <p className="text-xs text-purple-200">
                  {umumIndicators.length} Indikator Kinerja Terdaftar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-purple-200">Rata-rata Capaian Umum</div>
                <div className="text-2xl font-bold font-mono">{umumAvgScore.toFixed(2)}%</div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${umumBadge.badgeClass}`}>
                {umumBadge.label}
              </span>
            </div>
          </div>

          {/* Table for Umum */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {umumIndicators.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada indikator KPI Umum untuk bulan ini.{' '}
                <button
                  onClick={() => onAddIndicator('Umum')}
                  className="text-purple-700 underline font-semibold cursor-pointer"
                >
                  Tambah Indikator Umum
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-purple-50/70 text-purple-900 uppercase font-semibold text-[11px] border-b border-purple-100">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Indikator KPI Umum</th>
                      <th className="py-3 px-3 text-left">Target</th>
                      <th className="py-3 px-3 text-center w-24">Realisasi</th>
                      <th className="py-3 px-4 text-center w-28">Pencapaian (%)</th>
                      <th className="py-3 px-4 text-right w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {umumIndicators.map((ind, idx) => {
                      const calc = calculateIndicatorAchievement(ind);
                      return (
                        <tr key={ind.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-400 text-center">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {ind.namaIndikator}
                          </td>
                          <td className="py-3.5 px-3 text-left font-mono text-slate-800 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onEditIndicator(ind)}
                              className="group/tgt flex items-center gap-2 px-2 py-1 -mx-2 rounded-lg hover:bg-purple-50 transition-colors text-left cursor-pointer"
                              title={`Klik untuk mengedit target bulan ${monthLabel}`}
                            >
                              <span className="font-bold text-slate-900 min-w-[2.5rem] shrink-0 text-left group-hover/tgt:text-purple-700">{ind.target}</span>
                              <span className="text-slate-600 font-normal">{ind.satuan}</span>
                              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/tgt:opacity-100 transition-opacity ml-1" />
                            </button>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-extrabold text-slate-900 whitespace-nowrap bg-slate-50/60">
                            {ind.realisasi}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-bold ${
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
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onEditIndicator(ind)}
                                className="p-1.5 text-slate-600 hover:text-purple-700 rounded-md hover:bg-purple-50 transition-colors cursor-pointer"
                                title="Edit Target Bulan Ini & Indikator"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteIndicator(ind.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
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
