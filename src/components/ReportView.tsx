import React from 'react';
import { WorkEntry, KpiIndicator, Department } from '../types/kpi';
import {
  calculateDepartmentSummary,
  calculateIndicatorAchievement,
  formatMonthLabel,
  getKpiStatusBadge,
} from '../utils/kpiCalculations';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import {
  Download,
  Printer,
  FileSpreadsheet,
  Building2,
} from 'lucide-react';

interface ReportViewProps {
  workEntries: WorkEntry[];
  kpiIndicators: KpiIndicator[];
  selectedMonth: string;
  selectedDepartment: 'Semua' | Department;
}

export const ReportView: React.FC<ReportViewProps> = ({
  workEntries,
  kpiIndicators,
  selectedMonth,
  selectedDepartment,
}) => {
  const monthLabel = formatMonthLabel(selectedMonth);

  // Department Summaries
  const humasSummary = calculateDepartmentSummary('Humas', kpiIndicators, workEntries, selectedMonth);
  const itSummary = calculateDepartmentSummary('IT', kpiIndicators, workEntries, selectedMonth);

  // Month Work Entries
  const monthWorkEntries = workEntries.filter((e) => {
    const entryDate = e.tanggalMasuk || e.tanggal || '';
    const isMonthMatch = entryDate.substring(0, 7) === selectedMonth;
    const isDeptMatch = selectedDepartment === 'Semua' || e.bidang === selectedDepartment;
    return isMonthMatch && isDeptMatch;
  });

  const completedTasks = monthWorkEntries.filter((e) => e.status === 'Selesai');
  const uncompletedTasks = monthWorkEntries.filter((e) => e.status !== 'Selesai');

  // Month Indicators
  const monthIndicators = kpiIndicators.filter((i) => {
    const isMonthMatch = i.periodeBulan === selectedMonth;
    const isDeptMatch = selectedDepartment === 'Semua' || i.bidang === selectedDepartment;
    return isMonthMatch && isDeptMatch;
  });

  // Calculate Overall Score
  let overallScore = 0;
  if (selectedDepartment === 'Humas') {
    overallScore = humasSummary.nilaiKpi;
  } else if (selectedDepartment === 'IT') {
    overallScore = itSummary.nilaiKpi;
  } else {
    overallScore = (humasSummary.nilaiKpi + itSummary.nilaiKpi) / 2;
  }

  const overallBadge = getKpiStatusBadge(overallScore);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Action Header Banner */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Laporan Evaluasi KPI & Kinerja</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekapitulasi pencapaian KPI bulanan bagian Humas & IT Parabek untuk periode {monthLabel}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Print</span>
          </button>

          <button
            onClick={() => exportToExcel(workEntries, kpiIndicators, selectedMonth, selectedDepartment)}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportToPDF(workEntries, kpiIndicators, selectedMonth, selectedDepartment)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Laporan PDF</span>
          </button>
        </div>
      </div>

      {/* Official Report Document Container (Printable) */}
      <div className="bg-white p-6 md:p-10 rounded-2xl border border-slate-200/80 shadow-sm space-y-8">
        {/* Official Kop Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-3 text-emerald-800 font-bold text-lg sm:text-xl">
            <img
              src="/assets/aistudio/Logo_Humas_H-04_d71e1614.png"
              alt="Logo Humas Parabek"
              className="w-8 h-8 object-contain"
            />
            <span>PONDOK PESANTREN SUMATERA THAWALIB PARABEK</span>
          </div>
          <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-slate-700">
            BAGIAN HUBUNGAN MASYARAKAT (HUMAS) & TEKNOLOGI INFORMASI (IT)
          </h3>
          <p className="text-[11px] text-slate-500">
            Jl. Raya Bukittinggi - Payakumbuh Km. 3 Parabek, Kabupaten Agam, Sumatera Barat
          </p>
        </div>

        {/* Report Title */}
        <div className="text-center space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase underline decoration-emerald-600 underline-offset-4">
            LAPORAN CAPAIAN KPI & CATATAN PEKERJAAN BULANAN
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            Periode: <strong>{monthLabel}</strong> · Unit/Bidang:{' '}
            <strong>{selectedDepartment === 'Semua' ? 'Humas & IT' : selectedDepartment}</strong>
          </p>
        </div>

        {/* Executive Metrics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Total Pekerjaan</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {monthWorkEntries.length} Tugas
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-medium">Pekerjaan Selesai</span>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
              {completedTasks.length} Task
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-medium">Belum / Dalam Proses</span>
            <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">
              {uncompletedTasks.length} Task
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-medium">Nilai Akhir KPI</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900">
                {overallScore.toFixed(2)}%
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${overallBadge.badgeClass}`}>
                {overallBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: KPI Indicators Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-700 pl-3">
            I. REKAPITULASI PENILAIAN INDIKATOR KPI
          </h4>

          {monthIndicators.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Tidak ada indikator KPI untuk bulan ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 border-b border-r border-slate-200">No</th>
                    <th className="py-2.5 px-3 border-b border-r border-slate-200">Bidang</th>
                    <th className="py-2.5 px-3 border-b border-r border-slate-200">Indikator KPI</th>
                    <th className="py-2.5 px-3 border-b border-r border-slate-200 text-left">Target</th>
                    <th className="py-2.5 px-3 border-b border-r border-slate-200 text-left">Realisasi</th>
                    <th className="py-2.5 px-3 border-b border-r border-slate-200 text-right">Bobot</th>
                    <th className="py-2.5 px-3 border-b border-r border-slate-200 text-right">Capaian (%)</th>
                    <th className="py-2.5 px-3 border-b border-slate-200 text-right">Nilai Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthIndicators.map((ind, idx) => {
                    const calc = calculateIndicatorAchievement(ind);
                    return (
                      <tr key={ind.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 border-r border-slate-200 font-mono text-center">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700">
                          {ind.bidang}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                          {ind.namaIndikator}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-left font-mono">
                          {ind.target} {ind.satuan}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-left font-mono">
                          {ind.realisasi} {ind.satuan}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-semibold">
                          {ind.bobot}%
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-semibold">
                          {calc.cappedPercentage.toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                          {calc.weightedScore.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Completed Work Items */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            II. PEKERJAAN YANG SUDAH SELESAI ({completedTasks.length})
          </h4>

          {completedTasks.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Belum ada pekerjaan selesai bulan ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-emerald-50 text-emerald-950 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3 border-b border-r border-slate-200">Tgl Masuk</th>
                    <th className="py-2 px-3 border-b border-r border-slate-200">Tgl Mulai</th>
                    <th className="py-2 px-3 border-b border-r border-slate-200">Tgl Selesai</th>
                    <th className="py-2 px-2 border-b border-r border-slate-200 text-center">Revisi</th>
                    <th className="py-2 px-3 border-b border-r border-slate-200">Bidang</th>
                    <th className="py-2 px-3 border-b border-r border-slate-200">Nama Pekerjaan</th>
                    <th className="py-2 px-3 border-b border-slate-200 text-right">Capaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {completedTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-500 whitespace-nowrap">
                        {task.tanggalMasuk || task.tanggal}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-500 whitespace-nowrap">
                        {task.tanggalMulai || '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono text-emerald-700 font-semibold whitespace-nowrap">
                        {task.tanggalSelesai || '-'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-center font-mono font-bold text-amber-700">
                        {task.jumlahRevisi || 0}x
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700 whitespace-nowrap">
                        {task.bidang}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                        {task.namaPekerjaan}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {task.persentase}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 3: Uncompleted / In Progress Work Items */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 border-l-4 border-amber-500 pl-3">
            III. PEKERJAAN DALAM PROSES & BELUM DIKERJAKAN ({uncompletedTasks.length})
          </h4>

          {uncompletedTasks.length === 0 ? (
            <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              Alhamdulillah, seluruh pekerjaan bulan ini telah diselesaikan 100%.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-amber-50 text-amber-950 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3 border-b border-r border-slate-200">Tgl Masuk</th>
                    <th className="py-2 px-3 border-b border-r border-slate-200">Tgl Mulai</th>
                    <th className="py-2 px-2 border-b border-r border-slate-200 text-center">Revisi</th>
                    <th className="py-2 px-3 border-b border-r border-slate-200">Bidang</th>
                    <th className="py-2 px-3 border-b border-r border-slate-200">Nama Pekerjaan</th>
                    <th className="py-2 px-3 border-b border-r border-slate-200">Status</th>
                    <th className="py-2 px-3 border-b border-r border-slate-200">Kendala / Catatan</th>
                    <th className="py-2 px-3 border-b border-slate-200 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {uncompletedTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-500 whitespace-nowrap">
                        {task.tanggalMasuk || task.tanggal}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-500 whitespace-nowrap">
                        {task.tanggalMulai || '-'}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-center font-mono font-bold text-amber-700">
                        {task.jumlahRevisi || 0}x
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700 whitespace-nowrap">
                        {task.bidang}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                        {task.namaPekerjaan}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            task.status === 'Proses'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-600">
                        {task.catatan || '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                        {task.persentase}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Signature Endorsement Block */}
        <div className="pt-8 border-t border-slate-200 text-xs text-slate-700 grid grid-cols-2 gap-8 print-break-inside-avoid">
          <div>
            <p className="font-medium">Mengetahui,</p>
            <p className="font-bold text-slate-900">Kepala Bagian / Pimpinan Pesantren</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900">( _________________________ )</p>
          </div>

          <div className="text-right">
            <p className="font-medium">
              Parabek,{' '}
              {new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="font-bold text-slate-900">Penanggung Jawab Humas & IT</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900">( _________________________ )</p>
          </div>
        </div>
      </div>
    </div>
  );
};
