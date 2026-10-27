import React from 'react';
import { WorkEntry, KpiIndicator, Department } from '../types/kpi';
import {
  calculateDepartmentSummary,
  formatMonthLabel,
  getKpiStatusBadge,
} from '../utils/kpiCalculations';
import {
  CheckCircle2,
  Clock,
  Briefcase,
  TrendingUp,
  Plus,
  ArrowRight,
  ExternalLink,
  Megaphone,
  Monitor,
} from 'lucide-react';

interface DashboardViewProps {
  workEntries: WorkEntry[];
  kpiIndicators: KpiIndicator[];
  selectedMonth: string;
  selectedDepartment: 'Semua' | Department;
  onNavigateTab: (tab: 'catatan' | 'kpi' | 'laporan') => void;
  onOpenAddModal: () => void;
  onQuickUpdateStatus: (id: string, newStatus: 'Belum dikerjakan' | 'Proses' | 'Selesai') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workEntries,
  kpiIndicators,
  selectedMonth,
  selectedDepartment,
  onNavigateTab,
  onOpenAddModal,
  onQuickUpdateStatus,
}) => {
  const monthLabel = formatMonthLabel(selectedMonth);

  // Filter entries for current selected month based on tanggalMasuk
  const monthWorkEntries = workEntries.filter((e) => {
    const entryDate = e.tanggalMasuk || e.tanggal || '';
    const entryMonth = entryDate.substring(0, 7);
    const isDeptMatch = selectedDepartment === 'Semua' || e.bidang === selectedDepartment;
    return entryMonth === selectedMonth && isDeptMatch;
  });

  const totalPekerjaan = monthWorkEntries.length;
  const pekerjaanSelesai = monthWorkEntries.filter((e) => e.status === 'Selesai').length;
  const pekerjaanProses = monthWorkEntries.filter((e) => e.status === 'Proses').length;
  const pekerjaanBelum = monthWorkEntries.filter((e) => e.status === 'Belum dikerjakan').length;

  // Summaries per department
  const humasSummary = calculateDepartmentSummary('Humas', kpiIndicators, workEntries, selectedMonth);
  const itSummary = calculateDepartmentSummary('IT', kpiIndicators, workEntries, selectedMonth);

  // Overall KPI Score calculation
  let overallKpiScore = 0;
  if (selectedDepartment === 'Humas') {
    overallKpiScore = humasSummary.nilaiKpi;
  } else if (selectedDepartment === 'IT') {
    overallKpiScore = itSummary.nilaiKpi;
  } else {
    overallKpiScore = (humasSummary.nilaiKpi + itSummary.nilaiKpi) / 2;
  }

  const kpiBadge = getKpiStatusBadge(overallKpiScore);

  // Recent work entries (sorted by tanggalMasuk descending)
  const recentEntries = [...monthWorkEntries]
    .sort((a, b) => {
      const dateA = new Date(a.tanggalMasuk || a.tanggal || '').getTime();
      const dateB = new Date(b.tanggalMasuk || b.tanggal || '').getTime();
      return dateB - dateA;
    })
    .slice(0, 6);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Welcome Kicker Banner */}
      <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-emerald-800 text-white rounded-2xl p-6 shadow-sm border border-emerald-700/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
              Ringkasan Kinerja Bulan Ini
            </span>
            <span className="text-xs font-medium text-emerald-200/80">· {monthLabel}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Pondok Pesantren Sumatera Thawalib Parabek
          </h2>
          <p className="text-sm text-emerald-100/90 mt-1 max-w-2xl">
            Sistem Pemantauan KPI & Catatan Pekerjaan Bagian Humas dan IT secara berkala dan terukur.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>Catat Pekerjaan Baru</span>
          </button>
        </div>
      </div>

      {/* 4 Main Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pekerjaan */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Pekerjaan
            </span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {totalPekerjaan}
            </span>
            <span className="text-xs text-slate-500 ml-2">tugas di {monthLabel}</span>
          </div>
        </div>

        {/* Pekerjaan Selesai */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              Pekerjaan Selesai
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tabular-nums">
              {pekerjaanSelesai}
            </span>
            <span className="text-xs text-emerald-600 font-medium ml-2">
              ({totalPekerjaan > 0 ? Math.round((pekerjaanSelesai / totalPekerjaan) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Pekerjaan Masih Berjalan */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Masih Berjalan
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-amber-700 font-mono tabular-nums">
              {pekerjaanProses + pekerjaanBelum}
            </span>
            <span className="text-xs text-slate-500 ml-2">
              ({pekerjaanProses} proses, {pekerjaanBelum} belum)
            </span>
          </div>
        </div>

        {/* Nilai KPI Bulan Ini */}
        <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              Nilai KPI Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {overallKpiScore.toFixed(1)}%
              </span>
            </div>
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${kpiBadge.badgeClass}`}>
              {kpiBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Department Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Humas KPI Breakdown Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bagian Humas</h3>
                  <p className="text-xs text-slate-500">Hubungan Masyarakat & Media</p>
                </div>
              </div>
              <span className="text-xl font-bold font-mono text-emerald-700">
                {humasSummary.nilaiKpi.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Pekerjaan Ditugaskan</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {humasSummary.totalPekerjaan} Pekerjaan
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status Pekerjaan Selesai</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {humasSummary.pekerjaanSelesai} Selesai
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, humasSummary.nilaiKpi)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('kpi')}
            className="mt-5 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors border border-slate-200 flex items-center justify-center gap-1.5"
          >
            <span>Rincian Indikator Humas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* IT KPI Breakdown Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bagian IT</h3>
                  <p className="text-xs text-slate-500">Teknologi Informasi & Infrastruktur</p>
                </div>
              </div>
              <span className="text-xl font-bold font-mono text-emerald-700">
                {itSummary.nilaiKpi.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Pekerjaan Ditugaskan</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {itSummary.totalPekerjaan} Pekerjaan
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status Pekerjaan Selesai</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {itSummary.pekerjaanSelesai} Selesai
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, itSummary.nilaiKpi)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('kpi')}
            className="mt-5 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors border border-slate-200 flex items-center justify-center gap-1.5"
          >
            <span>Rincian Indikator IT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Work Entries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Daftar Pekerjaan Terbaru</h3>
            <p className="text-xs text-slate-500">Pekerjaan terkini di bulan {monthLabel}</p>
          </div>
          <button
            onClick={() => onNavigateTab('catatan')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Lihat Semua Catatan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Belum ada catatan pekerjaan untuk bulan {monthLabel}. Klik &quot;Catat Pekerjaan Baru&quot; untuk menambahkan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Tgl Masuk</th>
                  <th className="py-3 px-3">Tgl Mulai</th>
                  <th className="py-3 px-3">Tgl Selesai</th>
                  <th className="py-3 px-2 text-center">Revisi</th>
                  <th className="py-3 px-3">Bidang</th>
                  <th className="py-3 px-4">Nama Pekerjaan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Capaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {entry.tanggalMasuk || entry.tanggal}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {entry.tanggalMulai || '-'}
                    </td>
                    <td className="py-3 px-3 font-mono whitespace-nowrap">
                      {entry.tanggalSelesai ? (
                        <span className="text-emerald-700 font-semibold">{entry.tanggalSelesai}</span>
                      ) : (
                        <span className="text-slate-400 italic">Proses</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap font-mono font-bold text-amber-700">
                      {entry.jumlahRevisi || 0}x
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                          entry.bidang === 'Humas'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {entry.bidang}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 min-w-[200px]">
                      <div>{entry.namaPekerjaan}</div>
                      {entry.catatan && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {entry.catatan.startsWith('http') ? (
                            <a
                              href={entry.catatan}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:underline flex items-center gap-1"
                            >
                              <span>Tautan Dokumentasi</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            entry.catatan
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <select
                        value={entry.status}
                        onChange={(e) =>
                          onQuickUpdateStatus(
                            entry.id,
                            e.target.value as 'Belum dikerjakan' | 'Proses' | 'Selesai'
                          )
                        }
                        className={`text-[11px] font-semibold rounded-md px-2 py-1 border transition-colors cursor-pointer ${
                          entry.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : entry.status === 'Proses'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        <option value="Belum dikerjakan">Belum dikerjakan</option>
                        <option value="Proses">Proses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {entry.persentase}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
