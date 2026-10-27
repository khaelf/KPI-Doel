import React, { useState } from 'react';
import { WorkEntry, Department, TaskStatus } from '../types/kpi';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface WorkLogViewProps {
  workEntries: WorkEntry[];
  selectedMonth: string;
  selectedDepartment: 'Semua' | Department;
  onAddEntry: () => void;
  onEditEntry: (entry: WorkEntry) => void;
  onDeleteEntry: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
}

export const WorkLogView: React.FC<WorkLogViewProps> = ({
  workEntries,
  selectedMonth,
  selectedDepartment,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onStatusChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | TaskStatus>('Semua');

  // Filtered list
  const filteredList = workEntries.filter((entry) => {
    const entryMonth = entry.tanggal.substring(0, 7);
    const isMonthMatch = !selectedMonth || entryMonth === selectedMonth;
    const isDeptMatch = selectedDepartment === 'Semua' || entry.bidang === selectedDepartment;
    const isStatusMatch = statusFilter === 'Semua' || entry.status === statusFilter;
    const isSearchMatch =
      !searchTerm ||
      entry.namaPekerjaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.targetHasil.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.catatan && entry.catatan.toLowerCase().includes(searchTerm.toLowerCase()));

    return isMonthMatch && isDeptMatch && isStatusMatch && isSearchMatch;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Catatan Pekerjaan Harian</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola dan evaluasi tugas harian bagian Humas dan IT Parabek.
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

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama pekerjaan atau target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-slate-500 font-medium flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {(['Semua', 'Belum dikerjakan', 'Proses', 'Selesai'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List View */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
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
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Bidang</th>
                    <th className="py-3 px-4">Nama Pekerjaan</th>
                    <th className="py-3 px-4">Target / Hasil Diharapkan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Pencapaian</th>
                    <th className="py-3 px-4">Catatan / Dok</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {entry.tanggal}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                        {entry.namaPekerjaan}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">{entry.targetHasil}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          {entry.persentase}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate">
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
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredList.map((entry) => (
                <div key={entry.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        entry.bidang === 'Humas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {entry.bidang}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{entry.tanggal}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{entry.namaPekerjaan}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong className="text-slate-700">Target:</strong> {entry.targetHasil}
                    </p>
                  </div>

                  {entry.catatan && (
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

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {entry.persentase}%
                      </span>
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
