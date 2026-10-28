import React, { useState } from 'react';
import { AgendaItem, AgendaStatus, Department } from '../types/kpi';
import { formatMonthLabel } from '../utils/kpiCalculations';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CalendarDays,
  Tag,
} from 'lucide-react';

interface AgendaViewProps {
  agendaItems: AgendaItem[];
  selectedMonth: string;
  selectedDepartment: 'Semua' | Department;
  onAddAgenda: () => void;
  onEditAgenda: (agenda: AgendaItem) => void;
  onDeleteAgenda: (id: string) => void;
  onQuickStatusChange: (id: string, newStatus: AgendaStatus) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  agendaItems,
  selectedMonth,
  selectedDepartment,
  onAddAgenda,
  onEditAgenda,
  onDeleteAgenda,
  onQuickStatusChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | AgendaStatus>('Semua');

  const monthLabel = formatMonthLabel(selectedMonth);

  // Filter items based on month, department, status, search
  const filteredItems = agendaItems.filter((item) => {
    // Month match check
    const itemMonth = (item.tanggal || '').substring(0, 7);
    const matchesMonth = !selectedMonth || itemMonth === selectedMonth;

    // Department match check
    const matchesDept =
      selectedDepartment === 'Semua' ||
      item.bidang === 'Semua' ||
      item.bidang === selectedDepartment;

    // Status filter match check
    const matchesStatus = statusFilter === 'Semua' || item.status === statusFilter;

    // Search query match check
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      item.judul.toLowerCase().includes(query) ||
      (item.lokasi && item.lokasi.toLowerCase().includes(query)) ||
      (item.penanggungJawab && item.penanggungJawab.toLowerCase().includes(query)) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(query));

    return matchesMonth && matchesDept && matchesStatus && matchesSearch;
  });

  // Sort by date ascending (or time)
  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = a.tanggal + (a.waktuMulai || '');
    const dateB = b.tanggal + (b.waktuMulai || '');
    return dateA.localeCompare(dateB);
  });

  // Counts for summary cards
  const totalInMonth = agendaItems.filter(
    (i) =>
      (!selectedMonth || i.tanggal.substring(0, 7) === selectedMonth) &&
      (selectedDepartment === 'Semua' || i.bidang === 'Semua' || i.bidang === selectedDepartment)
  );
  const countMendatang = totalInMonth.filter((i) => i.status === 'Mendatang').length;
  const countBerlangsung = totalInMonth.filter((i) => i.status === 'Berlangsung').length;
  const countSelesai = totalInMonth.filter((i) => i.status === 'Selesai').length;

  const getStatusBadge = (status: AgendaStatus) => {
    switch (status) {
      case 'Mendatang':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Mendatang',
        };
      case 'Berlangsung':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Berlangsung',
        };
      case 'Selesai':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Selesai',
        };
      case 'Dibatalkan':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
          label: 'Dibatalkan',
        };
    }
  };

  const getDepartmentBadge = (bidang: Department | 'Semua') => {
    if (bidang === 'Humas') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    } else if (bidang === 'IT') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const months = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ];
      return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-md">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Agenda Kegiatan Humas & IT</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jadwal rapat, liputan, maintenance, dan kegiatan operasional periode {monthLabel}.
            </p>
          </div>
        </div>

        <button
          onClick={onAddAgenda}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Agenda Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Agenda</p>
            <p className="text-2xl font-bold font-mono text-slate-900">{totalInMonth.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-blue-600">Mendatang</p>
            <p className="text-2xl font-bold font-mono text-blue-700">{countMendatang}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-amber-600">Berlangsung</p>
            <p className="text-2xl font-bold font-mono text-amber-700">{countBerlangsung}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-emerald-600">Selesai</p>
            <p className="text-2xl font-bold font-mono text-emerald-700">{countSelesai}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul, lokasi, atau PIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
          {(['Semua', 'Mendatang', 'Berlangsung', 'Selesai', 'Dibatalkan'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Agenda Items List */}
      <div className="space-y-3">
        {sortedItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">Tidak Ada Agenda Kegiatan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'Semua'
                ? 'Tidak ada agenda yang cocok dengan kata kunci atau filter status yang dipilih.'
                : `Belum ada agenda kegiatan yang terjadwal pada bulan ${monthLabel}.`}
            </p>
            <button
              onClick={onAddAgenda}
              className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Agenda Pertama</span>
            </button>
          </div>
        ) : (
          sortedItems.map((item) => {
            const statusBadge = getStatusBadge(item.status);
            const deptBadge = getDepartmentBadge(item.bidang);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Side: Date Box & Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Date Badge */}
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-center min-w-[70px] shrink-0">
                    <span className="block text-xl font-extrabold font-mono leading-none">
                      {item.tanggal ? item.tanggal.split('-')[2] : '01'}
                    </span>
                    <span className="block text-[10px] uppercase font-bold text-emerald-700 mt-1">
                      {formatDateIndo(item.tanggal).split(' ')[1] || 'Bulan'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded border ${deptBadge}`}
                      >
                        {item.bidang === 'Semua' ? 'Humas & IT' : item.bidang}
                      </span>

                      <div
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border flex items-center gap-1 ${statusBadge.bg}`}
                      >
                        {statusBadge.icon}
                        <span>{statusBadge.label}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {item.judul}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                      {/* Tanggal & Waktu */}
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {formatDateIndo(item.tanggal)}
                          {item.waktuMulai && ` · ${item.waktuMulai}`}
                          {item.waktuSelesai && ` - ${item.waktuSelesai} WIB`}
                        </span>
                      </span>

                      {/* Lokasi */}
                      {item.lokasi && (
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{item.lokasi}</span>
                        </span>
                      )}

                      {/* PIC */}
                      {item.penanggungJawab && (
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PIC: {item.penanggungJawab}</span>
                        </span>
                      )}
                    </div>

                    {/* Keterangan */}
                    {item.keterangan && (
                      <p className="text-xs text-slate-500 pt-1 border-t border-slate-100 italic">
                        "{item.keterangan}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Quick Status Changer & Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      onQuickStatusChange(item.id, e.target.value as AgendaStatus)
                    }
                    className="text-xs font-semibold px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Mendatang">Mendatang</option>
                    <option value="Berlangsung">Berlangsung</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>

                  <button
                    onClick={() => onEditAgenda(item)}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Agenda"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteAgenda(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Agenda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
