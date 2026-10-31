import React from 'react';
import { WorkEntry, KpiIndicator, AgendaItem, Department } from '../types/kpi';
import {
  calculateDepartmentSummary,
  formatMonthLabel,
  getKpiStatusBadge,
  isWorkEntryInMonth,
} from '../utils/kpiCalculations';
import {
  CheckCircle2,
  Clock,
  Briefcase,
  ArrowRight,
  ExternalLink,
  Megaphone,
  Monitor,
  Building2,
  Calendar,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardViewProps {
  workEntries: WorkEntry[];
  kpiIndicators: KpiIndicator[];
  agendaItems?: AgendaItem[];
  selectedMonth: string;
  selectedDepartment: 'Semua' | Department;
  onNavigateTab: (tab: 'catatan' | 'kpi' | 'laporan' | 'agenda') => void;
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

  // Filter entries for current selected month (including ongoing tasks carried over)
  const monthWorkEntries = workEntries.filter((e) => {
    const isDeptMatch = selectedDepartment === 'Semua' || e.bidang === selectedDepartment;
    return isDeptMatch && isWorkEntryInMonth(e, selectedMonth);
  });

  const totalPekerjaan = monthWorkEntries.length;
  const pekerjaanSelesai = monthWorkEntries.filter((e) => e.status === 'Selesai').length;
  const pekerjaanProses = monthWorkEntries.filter((e) => e.status === 'Proses').length;
  const pekerjaanBelum = monthWorkEntries.filter((e) => e.status === 'Belum dikerjakan').length;

  // Summaries per department
  const humasSummary = calculateDepartmentSummary('Humas', kpiIndicators, workEntries, selectedMonth);
  const itSummary = calculateDepartmentSummary('IT', kpiIndicators, workEntries, selectedMonth);
  const umumSummary = calculateDepartmentSummary('Umum', kpiIndicators, workEntries, selectedMonth);

  // Overall KPI Score calculation: total pekerjaan selesai / total pekerjaan ditugaskan
  let overallKpiScore = 0;
  if (selectedDepartment === 'Humas') {
    overallKpiScore = humasSummary.nilaiKpi;
  } else if (selectedDepartment === 'IT') {
    overallKpiScore = itSummary.nilaiKpi;
  } else if (selectedDepartment === 'Umum') {
    overallKpiScore = umumSummary.nilaiKpi;
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

  // Generate last 6 months list ending at selectedMonth
  const getLast6Months = (targetMonth: string) => {
    const months: string[] = [];
    const [yStr, mStr] = (targetMonth || '2026-10').split('-');
    const year = parseInt(yStr, 10) || 2026;
    const month = parseInt(mStr, 10) || 10;

    for (let i = 5; i >= 0; i--) {
      let m = month - i;
      let y = year;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      const mFormatted = m < 10 ? `0${m}` : `${m}`;
      months.push(`${y}-${mFormatted}`);
    }
    return months;
  };

  const trendMonths = getLast6Months(selectedMonth);

  const shortMonthLabels: Record<string, string> = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'Mei',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Agu',
    '09': 'Sep',
    '10': 'Okt',
    '11': 'Nov',
    '12': 'Des',
  };

  const trendChartData = trendMonths.map((mStr) => {
    const [y, m] = mStr.split('-');
    const label = `${shortMonthLabels[m] || m} '${y.substring(2)}`;

    const hSum = calculateDepartmentSummary('Humas', kpiIndicators, workEntries, mStr);
    const iSum = calculateDepartmentSummary('IT', kpiIndicators, workEntries, mStr);
    const uSum = calculateDepartmentSummary('Umum', kpiIndicators, workEntries, mStr);

    return {
      monthStr: mStr,
      label,
      Humas: hSum.nilaiKpi,
      IT: iSum.nilaiKpi,
      Umum: uSum.nilaiKpi,
    };
  });

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Humas KPI Breakdown Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Bagian Humas</h3>
                  <p className="text-[11px] text-slate-500">Hubungan Masyarakat & Media</p>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-emerald-700">
                {humasSummary.nilaiKpi.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Tugas Ditugaskan</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {humasSummary.totalPekerjaan} Pekerjaan
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pekerjaan Selesai</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {humasSummary.pekerjaanSelesai} Selesai
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, humasSummary.nilaiKpi)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('kpi')}
            className="mt-4 w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors border border-slate-200 flex items-center justify-center gap-1.5"
          >
            <span>Rincian Indikator Humas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* IT KPI Breakdown Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Bagian IT</h3>
                  <p className="text-[11px] text-slate-500">Teknologi & Komputer</p>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-emerald-700">
                {itSummary.nilaiKpi.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Tugas Ditugaskan</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {itSummary.totalPekerjaan} Pekerjaan
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pekerjaan Selesai</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {itSummary.pekerjaanSelesai} Selesai
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, itSummary.nilaiKpi)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('kpi')}
            className="mt-4 w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors border border-slate-200 flex items-center justify-center gap-1.5"
          >
            <span>Rincian Indikator IT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bagian Umum KPI Breakdown Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Bagian Umum</h3>
                  <p className="text-[11px] text-slate-500">Administrasi & Urusan Umum</p>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-emerald-700">
                {umumSummary.nilaiKpi.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Tugas Ditugaskan</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {umumSummary.totalPekerjaan} Pekerjaan
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pekerjaan Selesai</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {umumSummary.pekerjaanSelesai} Selesai
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, umumSummary.nilaiKpi)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('kpi')}
            className="mt-4 w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors border border-slate-200 flex items-center justify-center gap-1.5"
          >
            <span>Rincian Indikator Umum</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6-Month Performance Trend Chart Section using Recharts */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Grafik Tren Pekerjaan Selesai (6 Bulan)</h3>
              <p className="text-xs text-slate-500">
                Persentase capaian per bagian dari {trendChartData[0]?.label} hingga {trendChartData[5]?.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
            {(selectedDepartment === 'Semua' || selectedDepartment === 'Humas') && (
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Humas
              </span>
            )}
            {(selectedDepartment === 'Semua' || selectedDepartment === 'IT') && (
              <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                IT
              </span>
            )}
            {(selectedDepartment === 'Semua' || selectedDepartment === 'Umum') && (
              <span className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                Umum
              </span>
            )}
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" axisLine={{ stroke: '#cbd5e1' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs space-y-1.5">
                        <p className="font-bold border-b border-slate-700 pb-1 text-slate-300">{label}</p>
                        {payload.map((entry: any) => (
                          <div key={entry.name} className="flex items-center justify-between gap-4">
                            <span style={{ color: entry.color }} className="font-medium">
                              Bagian {entry.name}:
                            </span>
                            <span className="font-mono font-bold">{Number(entry.value).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {(selectedDepartment === 'Semua' || selectedDepartment === 'Humas') && (
                <Line
                  type="monotone"
                  dataKey="Humas"
                  name="Humas"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              )}
              {(selectedDepartment === 'Semua' || selectedDepartment === 'IT') && (
                <Line
                  type="monotone"
                  dataKey="IT"
                  name="IT"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              )}
              {(selectedDepartment === 'Semua' || selectedDepartment === 'Umum') && (
                <Line
                  type="monotone"
                  dataKey="Umum"
                  name="Umum"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
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

      {/* Agenda Kegiatan Terdekat Widget */}
      {(() => {
        const upcomingAgendas = agendaItems
          .filter((item) => {
            const matchesDept =
              selectedDepartment === 'Semua' ||
              item.bidang === 'Semua' ||
              item.bidang === selectedDepartment;
            return matchesDept && item.status !== 'Dibatalkan';
          })
          .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
          .slice(0, 3);

        return (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Agenda Kegiatan Terdekat</h3>
                  <p className="text-xs text-slate-500">Jadwal kegiatan penting Humas & IT</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('agenda')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu Agenda</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {upcomingAgendas.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">Belum ada agenda kegiatan mendatang.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {upcomingAgendas.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigateTab('agenda')}
                    className="p-3.5 rounded-xl border border-slate-200/90 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all cursor-pointer text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        {item.tanggal}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Berlangsung'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 line-clamp-1">{item.judul}</div>
                    {item.lokasi && (
                      <div className="text-slate-500 flex items-center gap-1 text-[11px] truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.lokasi}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
