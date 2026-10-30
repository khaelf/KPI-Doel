import React from 'react';
import { WorkEntry, KpiIndicator, AgendaItem, Department } from '../types/kpi';
import {
  calculateDepartmentSummary,
  formatMonthLabel,
  getKpiStatusBadge,
} from '../utils/kpiCalculations';
import {
  CheckCircle2,
  Clock,
  Briefcase,
  ArrowRight,
  ExternalLink,
  Megaphone,
  Monitor,
  Calendar,
  MapPin,
} from 'lucide-react';

interface DashboardViewProps {
  workEntries: WorkEntry[];
  kpiIndicators: KpiIndicator[];
  agendaItems?: AgendaItem[];
  selectedMonth: string;
  selectedDepartment: 'Semua' | Department;
  onNavigateTab: (tab: 'catatan' | 'kpi' | 'laporan') => void;
  onNavigateToCatatanWithStatus?: (status: 'Semua' | 'Belum dikerjakan' | 'Proses' | 'Selesai') => void;
  onOpenAddModal?: () => void;
  onQuickUpdateStatus: (id: string, newStatus: 'Belum dikerjakan' | 'Proses' | 'Selesai') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workEntries,
  kpiIndicators,
  agendaItems = [],
  selectedMonth,
  selectedDepartment,
  onNavigateTab,
  onNavigateToCatatanWithStatus,
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

  // Overall KPI Score calculation: total pekerjaan selesai / total pekerjaan ditugaskan
  let overallKpiScore = 0;
  if (selectedDepartment === 'Humas') {
    overallKpiScore = humasSummary.nilaiKpi;
  } else if (selectedDepartment === 'IT') {
    overallKpiScore = itSummary.nilaiKpi;
  } else {
    overallKpiScore = totalPekerjaan > 0 ? (pekerjaanSelesai / totalPekerjaan) * 100 : 0;
  }

  const kpiBadge = getKpiStatusBadge(overallKpiScore);

  // Recent work entries (sorted by tanggalMasuk descending, max 5 rows)
  const recentEntries = [...monthWorkEntries]
    .sort((a, b) => {
      const dateA = new Date(a.tanggalMasuk || a.tanggal || '').getTime();
      const dateB = new Date(b.tanggalMasuk || b.tanggal || '').getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-5 sm:space-y-6 pb-6 md:pb-8">
      {/* Welcome Kicker Banner */}
      <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-emerald-800 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-700/40">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-emerald-300">
            Ringkasan Kinerja Bulan Ini
          </span>
          <span className="text-[10px] sm:text-xs font-medium text-emerald-200/80">· {monthLabel}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Irsyadul Fuadi
        </h2>
      </div>

      {/* 4 Main Summary Stat Cards (Clickable to Filter Catatan) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Pekerjaan */}
        <button
          onClick={() => onNavigateToCatatanWithStatus?.('Semua')}
          className="bg-white text-left rounded-xl p-3.5 sm:p-4 border border-slate-200/60 hover:border-emerald-500 hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between cursor-pointer group"
          title="Klik untuk melihat semua pekerjaan"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 group-hover:text-emerald-700 transition-colors">
              Total Pekerjaan
            </span>
            <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalPekerjaan}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">tugas</span>
          </div>
        </button>

        {/* Pekerjaan Selesai */}
        <button
          onClick={() => onNavigateToCatatanWithStatus?.('Selesai')}
          className="bg-white text-left rounded-xl p-3.5 sm:p-4 border border-slate-200/60 hover:border-emerald-500 hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between cursor-pointer group"
          title="Klik untuk melihat pekerjaan selesai"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 group-hover:text-emerald-700 transition-colors">
              Selesai
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              {pekerjaanSelesai}
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-600 font-medium">
              ({totalPekerjaan > 0 ? Math.round((pekerjaanSelesai / totalPekerjaan) * 100) : 0}%)
            </span>
          </div>
        </button>

        {/* Dalam Proses */}
        <button
          onClick={() => onNavigateToCatatanWithStatus?.('Proses')}
          className="bg-white text-left rounded-xl p-3.5 sm:p-4 border border-slate-200/60 hover:border-amber-500 hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between cursor-pointer group"
          title="Klik untuk melihat pekerjaan dalam proses"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 group-hover:text-amber-700 transition-colors">
              Dalam Proses
            </span>
            <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-amber-700 font-mono tabular-nums">
              {pekerjaanProses}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">tugas</span>
          </div>
        </button>

        {/* Belum Mulai */}
        <button
          onClick={() => onNavigateToCatatanWithStatus?.('Belum dikerjakan')}
          className="bg-white text-left rounded-xl p-3.5 sm:p-4 border border-slate-200/60 hover:border-slate-400 hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between cursor-pointer group"
          title="Klik untuk melihat pekerjaan belum mulai"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
              Belum Mulai
            </span>
            <Clock className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-slate-700 font-mono tabular-nums">
              {pekerjaanBelum}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">tugas</span>
          </div>
        </button>
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



      {/* Active Work Entries Table (Sedang Berjalan & Belum Mulai) per Request 3 */}
      {(() => {
        const activeEntries = monthWorkEntries
          .filter((e) => e.status === 'Proses' || e.status === 'Belum dikerjakan')
          .sort((a, b) => {
            const dateA = new Date(a.tanggalMasuk || a.tanggal || '').getTime();
            const dateB = new Date(b.tanggalMasuk || b.tanggal || '').getTime();
            return dateB - dateA;
          })
          .slice(0, 5);

        return (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Daftar Pekerjaan Aktif</h3>
                <p className="text-xs text-slate-500">Pekerjaan yang sedang dalam proses & belum mulai di bulan {monthLabel}</p>
              </div>
              <button
                onClick={() => onNavigateTab('catatan')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Lihat Semua Catatan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {activeEntries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Tidak ada pekerjaan aktif (proses/belum mulai) untuk bulan {monthLabel}. Semua pekerjaan telah selesai atau belum ada pekerjaan baru.
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Tanggal Masuk</th>
                      <th className="py-3 px-3">Bidang</th>
                      <th className="py-3 px-4">Nama Pekerjaan</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Capaian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                          {entry.tanggalMasuk || entry.tanggal}
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
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {(entry.jamMulai || entry.jamSelesai) && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 font-mono px-1.5 py-0.5 rounded">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{entry.jamMulai || ''}{entry.jamSelesai ? ` - ${entry.jamSelesai}` : ''}</span>
                              </span>
                            )}
                            {entry.lokasi && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 border border-rose-200/80 px-1.5 py-0.5 rounded">
                                <MapPin className="w-3 h-3 text-rose-600" />
                                <span>{entry.lokasi}</span>
                              </span>
                            )}
                            {entry.catatan && (
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">
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
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block text-[11px] font-semibold rounded-md px-2.5 py-1 border ${
                              entry.status === 'Selesai'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : entry.status === 'Proses'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            {entry.status === 'Belum dikerjakan' ? 'Belum Mulai' : entry.status}
                          </span>
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
        );
      })()}
    </div>
  );
};
