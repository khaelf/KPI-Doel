import React, { useState } from 'react';
import { AgendaItem, AgendaStatus, Department } from '../types/kpi';
import { formatMonthLabel, formatDateIndo } from '../utils/kpiCalculations';
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

  const formatAgendaDateDisplay = (item: AgendaItem) => {
    if (!item.tanggal) return '';
    if (item.tanggalSelesaiAgenda && item.tanggalSelesaiAgenda !== item.tanggal) {
      const [y1, m1, d1] = item.tanggal.split('-');
      const [y2, m2, d2] = item.tanggalSelesaiAgenda.split('-');
      if (y1 === y2 && m1 === m2) {
        return `${parseInt(d1, 10)} - ${formatDateIndo(item.tanggalSelesaiAgenda)}`;
      }
      return `${formatDateIndo(item.tanggal)} - ${formatDateIndo(item.tanggalSelesaiAgenda)}`;
    }
    return formatDateIndo(item.tanggal);
  };

  const getAgendaDateBadgeText = (item: AgendaItem) => {
    if (!item.tanggal) return { dayText: '01', monthText: 'Bulan' };
    const dayStart = parseInt(item.tanggal.split('-')[2], 10);
    const monthStart = formatDateIndo(item.tanggal).split(' ')[1] || '';

    if (item.tanggalSelesaiAgenda && item.tanggalSelesaiAgenda !== item.tanggal) {
      const dayEnd = parseInt(item.tanggalSelesaiAgenda.split('-')[2], 10);
      return {
        dayText: `${dayStart}-${dayEnd}`,
        monthText: monthStart,
      };
    }
    return {
      dayText: `${dayStart}`,
      monthText: monthStart,
    };
  };

  // Filter items based on month, department, status, search
  const filteredItems = agendaItems.filter((item) => {
    // Month match check (start date or end date matches selected month)
    const startMonth = (item.tanggal || '').substring(0, 7);
    const endMonth = (item.tanggalSelesaiAgenda || '').substring(0, 7);
    const matchesMonth =
      !selectedMonth ||
      startMonth === selectedMonth ||
      (!!endMonth && endMonth === selectedMonth);

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
  const countDibatalkan = totalInMonth.filter((i) => i.status === 'Dibatalkan').length;

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
            <h2 className="text-xl font-bold text-slate-900">Agenda Kegiatan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jadwal rapat, liputan, maintenance, dan kegiatan operasional periode {monthLabel}.
            </p>
          </div>
        </div>

        <button
          onClick={onAddAgenda}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Agenda Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards (Clickable Filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Agenda */}
        <button
          onClick={() => setStatusFilter('Semua')}
          className={`text-left bg-white p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
            statusFilter === 'Semua'
              ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
              : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Agenda</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900">{totalInMonth.length}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </button>

        {/* Mendatang */}
        <button
          onClick={() => setStatusFilter('Mendatang')}
          className={`text-left bg-white p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
            statusFilter === 'Mendatang'
              ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
              : 'border-blue-200/80 hover:border-blue-300 shadow-xs'
          }`}
        >
          <div>
            <p className="text-[11px] font-semibold text-blue-600">Mendatang</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-blue-700">{countMendatang}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </button>

        {/* Berlangsung */}
        <button
          onClick={() => setStatusFilter('Berlangsung')}
          className={`text-left bg-white p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
            statusFilter === 'Berlangsung'
              ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-md'
              : 'border-amber-200/80 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div>
            <p className="text-[11px] font-semibold text-amber-600">Berlangsung</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-amber-700">{countBerlangsung}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </button>

        {/* Selesai */}
        <button
          onClick={() => setStatusFilter('Selesai')}
          className={`text-left bg-white p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
            statusFilter === 'Selesai'
              ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
              : 'border-emerald-200/80 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <div>
            <p className="text-[11px] font-semibold text-emerald-600">Selesai</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">{countSelesai}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </button>

        {/* Dibatalkan */}
        <button
          onClick={() => setStatusFilter('Dibatalkan')}
          className={`text-left bg-white p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
            statusFilter === 'Dibatalkan'
              ? 'border-rose-600 ring-2 ring-rose-500/20 shadow-md'
              : 'border-rose-200/80 hover:border-rose-300 shadow-xs'
          }`}
        >
          <div>
            <p className="text-[11px] font-semibold text-rose-600">Dibatalkan</p>
            <p className="text-xl sm:text-2xl font-bold font-mono text-rose-700">{countDibatalkan}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </button>
      </div>

      {/* Search Bar Container */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul, lokasi, atau PIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Active Filter Indicator Badge if filtered */}
        {statusFilter !== 'Semua' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Filter Status:</span>
            <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span>{statusFilter}</span>
              <button
                onClick={() => setStatusFilter('Semua')}
                className="hover:text-rose-600 ml-1 font-extrabold text-slate-400"
                title="Tampilkan Semua Status"
              >
                ✕
              </button>
            </span>
          </div>
        )}
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
            const dateBadgeInfo = getAgendaDateBadgeText(item);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Side: Date Box & Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Date Badge */}
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-2.5 text-center min-w-[72px] shrink-0">
                    <span className="block text-lg sm:text-xl font-extrabold font-mono leading-none">
                      {dateBadgeInfo.dayText}
                    </span>
                    <span className="block text-[10px] uppercase font-bold text-emerald-700 mt-1">
                      {dateBadgeInfo.monthText}
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
                          {formatAgendaDateDisplay(item)}
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
