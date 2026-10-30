import React, { useState } from 'react';
import { WorkEntry, Department, TaskStatus } from '../types/kpi';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Clock,
  MapPin,
} from 'lucide-react';

interface WorkLogViewProps {
  workEntries: WorkEntry[];
  selectedMonth: string;
  selectedDepartment: 'Semua' | Department;
  statusFilter?: 'Semua' | TaskStatus;
  setStatusFilter?: (status: 'Semua' | TaskStatus) => void;
  onAddEntry: () => void;
  onEditEntry: (entry: WorkEntry) => void;
  onDeleteEntry: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
}

export interface ColumnVisibility {
  tanggalMasuk: boolean;
  tanggalMulai: boolean;
  tanggalSelesai: boolean;
  jumlahRevisi: boolean;
  bidang: boolean;
  namaPekerjaan: boolean;
  status: boolean;
  persentase: boolean;
  catatan: boolean;
  aksi: boolean;
}

export const WorkLogView: React.FC<WorkLogViewProps> = ({
  workEntries,
  selectedMonth,
  selectedDepartment,
  statusFilter,
  setStatusFilter,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onStatusChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localStatusFilter, setLocalStatusFilter] = useState<'Semua' | TaskStatus>('Semua');

  const activeStatusFilter = statusFilter !== undefined ? statusFilter : localStatusFilter;

  const handleStatusFilterChange = (st: 'Semua' | TaskStatus) => {
    if (setStatusFilter) {
      setStatusFilter(st);
    }
    setLocalStatusFilter(st);
  };
  const [sortOrder, setSortOrder] = useState<'terbaru' | 'terlama'>('terbaru');
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Default Column Visibility: Only Tanggal Masuk shown for date
  const [visibleColumns, setVisibleColumns] = useState<ColumnVisibility>({
    tanggalMasuk: true,
    tanggalMulai: false,
    tanggalSelesai: false,
    jumlahRevisi: false,
    bidang: true,
    namaPekerjaan: true,
    status: true,
    persentase: true,
    catatan: true,
    aksi: true,
  });

  const toggleColumn = (colKey: keyof ColumnVisibility) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [colKey]: !prev[colKey],
    }));
  };

  // Filtered list
  const filteredList = workEntries.filter((entry) => {
    const entryMonth = (entry.tanggalMasuk || entry.tanggal || '').substring(0, 7);
    const isMonthMatch = !selectedMonth || entryMonth === selectedMonth;
    const isDeptMatch = selectedDepartment === 'Semua' || entry.bidang === selectedDepartment;
    const isStatusMatch = activeStatusFilter === 'Semua' || entry.status === activeStatusFilter;
    const isSearchMatch =
      !searchTerm ||
      entry.namaPekerjaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.catatan && entry.catatan.toLowerCase().includes(searchTerm.toLowerCase()));

    return isMonthMatch && isDeptMatch && isStatusMatch && isSearchMatch;
  });

  // Sorted list by Tanggal Masuk (terbaru vs terlama per request #2)
  const sortedList = [...filteredList].sort((a, b) => {
    const dateA = new Date(a.tanggalMasuk || a.tanggal || '').getTime();
    const dateB = new Date(b.tanggalMasuk || b.tanggal || '').getTime();
    return sortOrder === 'terbaru' ? dateB - dateA : dateA - dateB;
  });

  // Summary counts for current month & department selection
  const monthEntries = workEntries.filter((entry) => {
    const entryMonth = (entry.tanggalMasuk || entry.tanggal || '').substring(0, 7);
    const isMonthMatch = !selectedMonth || entryMonth === selectedMonth;
    const isDeptMatch = selectedDepartment === 'Semua' || entry.bidang === selectedDepartment;
    return isMonthMatch && isDeptMatch;
  });

  const totalJobs = monthEntries.length;
  const countSelesai = monthEntries.filter((e) => e.status === 'Selesai').length;
  const countProses = monthEntries.filter((e) => e.status === 'Proses').length;
  const countBelumMulai = monthEntries.filter((e) => e.status === 'Belum dikerjakan').length;

  return (
    <div className="space-y-5 sm:space-y-6 pb-6 md:pb-8">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Catatan Pekerjaan Harian</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola dan evaluasi catatan pekerjaan Bagian Humas dan IT Pesantren Parabek.
          </p>
        </div>

        <button
          onClick={onAddEntry}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pekerjaan Baru</span>
        </button>
      </div>

      {/* Summary Stat Cards (Request 4 & 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <button
          onClick={() => handleStatusFilterChange('Semua')}
          className={`text-left bg-white p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
            activeStatusFilter === 'Semua'
              ? 'border-slate-800 ring-2 ring-slate-800/10 shadow-sm'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-slate-500 font-medium text-[11px]">Total Pekerjaan</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{totalJobs}</p>
          </div>
        </button>

        <button
          onClick={() => handleStatusFilterChange('Selesai')}
          className={`text-left bg-white p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
            activeStatusFilter === 'Selesai'
              ? 'border-emerald-600 ring-2 ring-emerald-500/10 shadow-sm'
              : 'border-emerald-200/80 hover:border-emerald-300'
          }`}
        >
          <div>
            <span className="text-emerald-700 font-semibold text-[11px]">Pekerjaan Selesai</span>
            <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{countSelesai}</p>
          </div>
        </button>

        <button
          onClick={() => handleStatusFilterChange('Proses')}
          className={`text-left bg-white p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
            activeStatusFilter === 'Proses'
              ? 'border-amber-600 ring-2 ring-amber-500/10 shadow-sm'
              : 'border-amber-200/80 hover:border-amber-300'
          }`}
        >
          <div>
            <span className="text-amber-700 font-semibold text-[11px]">Dalam Proses</span>
            <p className="text-xl font-bold font-mono text-amber-700 mt-0.5">{countProses}</p>
          </div>
        </button>

        <button
          onClick={() => handleStatusFilterChange('Belum dikerjakan')}
          className={`text-left bg-white p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
            activeStatusFilter === 'Belum dikerjakan'
              ? 'border-slate-700 ring-2 ring-slate-700/10 shadow-sm'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-slate-600 font-semibold text-[11px]">Belum Mulai</span>
            <p className="text-xl font-bold font-mono text-slate-700 mt-0.5">{countBelumMulai}</p>
          </div>
        </button>
      </div>

      {/* Filters, Sort & Column Checkbox Toggle Bar */}
      <div className="relative bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 text-xs">
        {/* Search Bar + Mobile Kolom Button */}
        <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 md:max-w-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama pekerjaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Kolom Selector Button on Mobile */}
          <div className="relative shrink-0 md:hidden">
            <button
              type="button"
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              className={`h-[35px] px-3 font-semibold rounded-xl flex items-center gap-1.5 transition-all border text-xs ${
                showColumnDropdown
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Pilih kolom tabel yang ingin ditampilkan"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              <span>Kolom</span>
            </button>
          </div>
        </div>

        {/* Desktop Kolom & Active Filter Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {activeStatusFilter !== 'Semua' && (
            <div className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl">
              <span className="font-semibold">Filter: {activeStatusFilter === 'Belum dikerjakan' ? 'Belum Mulai' : activeStatusFilter}</span>
              <button
                type="button"
                onClick={() => handleStatusFilterChange('Semua')}
                className="hover:text-rose-600 font-extrabold ml-1"
                title="Tampilkan semua"
              >
                ✕
              </button>
            </div>
          )}

          {/* Kolom Selector Button on Desktop */}
          <div className="relative shrink-0 hidden md:block">
            <button
              type="button"
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              className={`h-[35px] px-3 font-semibold rounded-xl flex items-center gap-1.5 transition-all border text-xs ${
                showColumnDropdown
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Pilih kolom tabel yang ingin ditampilkan"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              <span>Kolom</span>
            </button>
          </div>
        </div>


        {/* Checkbox Column Visibility Popover Dropdown */}
        {showColumnDropdown && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowColumnDropdown(false)}
            />
            <div className="absolute right-3 sm:right-4 top-16 md:top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-40 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                <span>Pilih Kolom Tabel</span>
                <button
                  type="button"
                  onClick={() => setShowColumnDropdown(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                {[
                  { key: 'tanggalMasuk', label: 'Tanggal Masuk' },
                  { key: 'tanggalMulai', label: 'Tanggal Mulai' },
                  { key: 'tanggalSelesai', label: 'Tanggal Selesai' },
                  { key: 'jumlahRevisi', label: 'Jumlah Revisi' },
                  { key: 'bidang', label: 'Bidang' },
                  { key: 'namaPekerjaan', label: 'Nama Pekerjaan' },
                  { key: 'status', label: 'Status' },
                  { key: 'persentase', label: 'Pencapaian (%)' },
                  { key: 'catatan', label: 'Catatan / Dok' },
                  { key: 'aksi', label: 'Aksi' },
                ].map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors text-slate-700 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key as keyof ColumnVisibility]}
                      onChange={() => toggleColumn(col.key as keyof ColumnVisibility)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer w-4 h-4"
                    />
                    <span className="font-medium">{col.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleColumns({
                      tanggalMasuk: true,
                      tanggalMulai: false,
                      tanggalSelesai: false,
                      jumlahRevisi: false,
                      bidang: true,
                      namaPekerjaan: true,
                      status: true,
                      persentase: true,
                      catatan: true,
                      aksi: true,
                    })
                  }
                  className="text-emerald-700 hover:underline font-semibold"
                >
                  Reset default
                </button>
                <button
                  type="button"
                  onClick={() => setShowColumnDropdown(false)}
                  className="text-slate-500 hover:text-slate-800 font-medium"
                >
                  Tutup
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Table / List View */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {sortedList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Tidak ada pekerjaan ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Coba ganti filter pencarian atau buat catatan pekerjaan baru.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    {visibleColumns.tanggalMasuk && (
                      <th
                        onClick={() => setSortOrder((prev) => (prev === 'terbaru' ? 'terlama' : 'terbaru'))}
                        className="py-3 px-3 cursor-pointer hover:bg-slate-100/80 transition-colors select-none group"
                        title="Klik untuk mengubah urutan tanggal"
                      >
                        <div className="flex items-center gap-1">
                          <span>Tanggal Masuk</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-700" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.tanggalMulai && <th className="py-3 px-3">Tanggal Mulai</th>}
                    {visibleColumns.tanggalSelesai && <th className="py-3 px-3">Tanggal Selesai</th>}
                    {visibleColumns.jumlahRevisi && <th className="py-3 px-2 text-center">Revisi</th>}
                    {visibleColumns.bidang && <th className="py-3 px-3">Bidang</th>}
                    {visibleColumns.namaPekerjaan && <th className="py-3 px-4">Nama Pekerjaan</th>}
                    {visibleColumns.status && <th className="py-3 px-3">Status</th>}
                    {visibleColumns.persentase && <th className="py-3 px-3 text-center">Capaian</th>}
                    {visibleColumns.catatan && <th className="py-3 px-3">Catatan / Dok</th>}
                    {visibleColumns.aksi && <th className="py-3 px-3 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedList.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      {visibleColumns.tanggalMasuk && (
                        <td className="py-3.5 px-3 font-mono text-slate-600 whitespace-nowrap font-medium">
                          {entry.tanggalMasuk || entry.tanggal}
                        </td>
                      )}
                      {visibleColumns.tanggalMulai && (
                        <td className="py-3.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {entry.tanggalMulai || '-'}
                        </td>
                      )}
                      {visibleColumns.tanggalSelesai && (
                        <td className="py-3.5 px-3 font-mono whitespace-nowrap">
                          {entry.tanggalSelesai ? (
                            <span className="text-emerald-700 font-semibold">{entry.tanggalSelesai}</span>
                          ) : (
                            <span className="text-slate-400 italic">Proses</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.jumlahRevisi && (
                        <td className="py-3.5 px-2 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 font-mono text-[11px] font-bold rounded-full ${
                              (entry.jumlahRevisi || 0) > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {entry.jumlahRevisi || 0}x
                          </span>
                        </td>
                      )}
                      {visibleColumns.bidang && (
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded ${
                              entry.bidang === 'Humas'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {entry.bidang}
                          </span>
                        </td>
                      )}
                      {visibleColumns.namaPekerjaan && (
                        <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-sm">
                          <div>{entry.namaPekerjaan}</div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {entry.indikatorKpi && (
                              <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                KPI: {entry.indikatorKpi}
                              </span>
                            )}
                            {(entry.jamMulai || entry.jamSelesai) && (
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border border-slate-200/60">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{entry.jamMulai || ''}{entry.jamSelesai ? ` - ${entry.jamSelesai}` : ''}</span>
                              </span>
                            )}
                            {entry.lokasi && (
                              <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200/80 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                <MapPin className="w-3 h-3 text-rose-600" />
                                <span>{entry.lokasi}</span>
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <select
                            value={entry.status}
                            onChange={(e) =>
                              onStatusChange(entry.id, e.target.value as TaskStatus)
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
                      )}
                      {visibleColumns.persentase && (
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                            {entry.persentase}%
                          </span>
                        </td>
                      )}
                      {visibleColumns.catatan && (
                        <td className="py-3.5 px-3 max-w-xs truncate">
                          {entry.catatan ? (
                            entry.catatan.startsWith('http') ? (
                              <a
                                href={entry.catatan}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 font-medium hover:underline inline-flex items-center gap-1"
                              >
                                <span>Tautan</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-500">{entry.catatan}</span>
                            )
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.aksi && (
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditEntry(entry)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                              title="Edit Pekerjaan"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteEntry(entry.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Hapus Pekerjaan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {sortedList.map((entry) => (
                <div key={entry.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    {visibleColumns.bidang && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          entry.bidang === 'Humas'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {entry.bidang}
                      </span>
                    )}
                    {visibleColumns.tanggalMasuk && (
                      <span className="font-mono text-[11px] text-slate-500">
                        Tgl Masuk: {entry.tanggalMasuk || entry.tanggal}
                      </span>
                    )}
                  </div>

                  {visibleColumns.namaPekerjaan && (
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{entry.namaPekerjaan}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {entry.indikatorKpi && (
                          <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-medium">
                            KPI: {entry.indikatorKpi}
                          </span>
                        )}
                        {(entry.jamMulai || entry.jamSelesai) && (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border border-slate-200/60">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{entry.jamMulai || ''}{entry.jamSelesai ? ` - ${entry.jamSelesai}` : ''}</span>
                          </span>
                        )}
                        {entry.lokasi && (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200/80 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            <MapPin className="w-3 h-3 text-rose-600" />
                            <span>{entry.lokasi}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Optional Date details if enabled */}
                  {(visibleColumns.tanggalMulai || visibleColumns.tanggalSelesai || visibleColumns.jumlahRevisi) && (
                    <div className="flex items-center gap-3 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {visibleColumns.tanggalMulai && (
                        <div>
                          <span className="text-slate-400">Mulai: </span>
                          <span className="font-mono font-medium">{entry.tanggalMulai || '-'}</span>
                        </div>
                      )}
                      {visibleColumns.tanggalSelesai && (
                        <div>
                          <span className="text-slate-400">Selesai: </span>
                          <span className="font-mono font-medium text-emerald-700">{entry.tanggalSelesai || '-'}</span>
                        </div>
                      )}
                      {visibleColumns.jumlahRevisi && (
                        <div>
                          <span className="text-slate-400">Revisi: </span>
                          <span className="font-mono font-bold text-amber-700">{entry.jumlahRevisi || 0}x</span>
                        </div>
                      )}
                    </div>
                  )}

                  {visibleColumns.catatan && entry.catatan && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {entry.catatan.startsWith('http') ? (
                        <a
                          href={entry.catatan}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 font-medium hover:underline flex items-center gap-1"
                        >
                          <span>Tautan Dok: {entry.catatan}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span>Catatan: {entry.catatan}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    {visibleColumns.status && (
                      <select
                        value={entry.status}
                        onChange={(e) =>
                          onStatusChange(entry.id, e.target.value as TaskStatus)
                        }
                        className={`text-xs font-semibold rounded-md px-2 py-1 border transition-colors ${
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
                    )}

                    <div className="flex items-center gap-3 ml-auto">
                      {visibleColumns.persentase && (
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {entry.persentase}%
                        </span>
                      )}
                      {visibleColumns.aksi && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEditEntry(entry)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 rounded-md"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteEntry(entry.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
