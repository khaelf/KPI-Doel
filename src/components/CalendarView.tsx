import React, { useState } from 'react';
import {
  CalendarNote,
  AgendaItem,
  WorkEntry,
  Department,
  NoteCategory,
  NoteColor,
} from '../types/kpi';
import {
  formatMonthLabel,
  formatDateIndo,
  getCurrentMonthString,
} from '../utils/kpiCalculations';
import {
  getHijriDateParts,
  getHijriDateFull,
  getHijriMonthRange,
} from '../utils/hijriDate';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pin,
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  Search,
  Filter,
  Trash2,
  Edit2,
  CalendarDays,
  AlertCircle,
  MapPin,
  User,
  List,
  Grid,
  Sparkles,
  Building2,
} from 'lucide-react';

interface CalendarViewProps {
  calendarNotes: CalendarNote[];
  agendaItems: AgendaItem[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedDepartment: 'Semua' | Department;
  onAddNote: (date?: string) => void;
  onEditNote: (note: CalendarNote) => void;
  onDeleteNote: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onAddAgenda?: () => void;
  onNavigateToCatatan?: () => void;
}

const CATEGORY_TAGS: ('Semua' | NoteCategory)[] = [
  'Semua',
  'Penting',
  'Pengingat',
  'Koordinasi',
  'Tugas',
  'Umum',
];

const COLOR_STYLES: Record<
  NoteColor,
  {
    bg: string;
    border: string;
    text: string;
    dot: string;
    badge: string;
  }
> = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    dot: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
  },
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  calendarNotes,
  agendaItems,
  selectedMonth,
  setSelectedMonth,
  selectedDepartment,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onToggleComplete,
  onTogglePin,
  onAddAgenda,
  onNavigateToCatatan,
}) => {
  const todayStr = new Date().toISOString().substring(0, 10);
  const currentMonthStr = getCurrentMonthString();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (selectedMonth && todayStr.startsWith(selectedMonth)) {
      return todayStr;
    }
    return selectedMonth ? `${selectedMonth}-01` : todayStr;
  });

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | NoteCategory>('Semua');
  const [hijriOffset, setHijriOffset] = useState<number>(() => {
    const saved = localStorage.getItem('parabek_hijri_offset');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const handleHijriOffsetChange = (offset: number) => {
    setHijriOffset(offset);
    localStorage.setItem('parabek_hijri_offset', String(offset));
  };

  // Parse Year and Month from selectedMonth (YYYY-MM)
  const [yearStr, monthStr] = (selectedMonth || currentMonthStr).split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || (new Date().getMonth() + 1);

  // Month navigation helpers
  const handlePrevMonth = () => {
    let newM = month - 1;
    let newY = year;
    if (newM <= 0) {
      newM = 12;
      newY -= 1;
    }
    const formatted = `${newY}-${String(newM).padStart(2, '0')}`;
    setSelectedMonth(formatted);
    setSelectedDate(`${formatted}-01`);
  };

  const handleNextMonth = () => {
    let newM = month + 1;
    let newY = year;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    const formatted = `${newY}-${String(newM).padStart(2, '0')}`;
    setSelectedMonth(formatted);
    setSelectedDate(`${formatted}-01`);
  };

  const handleGoToToday = () => {
    setSelectedMonth(currentMonthStr);
    setSelectedDate(todayStr);
  };

  // Days calculations for Calendar Grid
  // Number of days in current month:
  const daysInMonth = new Date(year, month, 0).getDate();
  // Day of week of the 1st day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  // Offset for Monday as the 1st column: (0->6, 1->0, 2->1, 3->2, 4->3, 5->4, 6->5)
  const startOffset = (firstDayOfWeek + 6) % 7;

  // Filter notes by department, category, and search query
  const filteredNotes = calendarNotes.filter((note) => {
    const isDeptMatch =
      selectedDepartment === 'Semua' ||
      !note.bidang ||
      note.bidang === 'Semua' ||
      note.bidang === selectedDepartment;

    const isCatMatch =
      categoryFilter === 'Semua' || note.kategori === categoryFilter;

    const query = searchQuery.toLowerCase().trim();
    const isSearchMatch =
      !query ||
      note.judul.toLowerCase().includes(query) ||
      (note.isi && note.isi.toLowerCase().includes(query)) ||
      note.kategori.toLowerCase().includes(query);

    return isDeptMatch && isCatMatch && isSearchMatch;
  });

  // Filter notes for the selected month
  const monthNotes = filteredNotes.filter(
    (n) => n.tanggal && n.tanggal.startsWith(selectedMonth)
  );

  // Map notes by date (YYYY-MM-DD -> CalendarNote[])
  const notesByDate = new Map<string, CalendarNote[]>();
  filteredNotes.forEach((n) => {
    const list = notesByDate.get(n.tanggal) || [];
    list.push(n);
    notesByDate.set(n.tanggal, list);
  });

  // Map agendas by date
  const agendasByDate = new Map<string, AgendaItem[]>();
  agendaItems.forEach((ag) => {
    if (!ag.tanggal) return;
    const isDeptMatch =
      selectedDepartment === 'Semua' ||
      ag.bidang === 'Semua' ||
      ag.bidang === selectedDepartment;
    if (!isDeptMatch) return;

    const list = agendasByDate.get(ag.tanggal) || [];
    list.push(ag);
    agendasByDate.set(ag.tanggal, list);
  });



  // Selected Date items
  const selectedDateNotes = (notesByDate.get(selectedDate) || []).sort(
    (a, b) => {
      // Pinned first, then incomplete first
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return (a.waktu || '').localeCompare(b.waktu || '');
    }
  );
  const selectedDateAgendas = agendasByDate.get(selectedDate) || [];


  // Summary counts
  const totalNotesInMonth = monthNotes.length;
  const pinnedNotesCount = monthNotes.filter((n) => n.isPinned).length;
  const completedNotesCount = monthNotes.filter((n) => n.isCompleted).length;
  const pendingNotesCount = totalNotesInMonth - completedNotesCount;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-md">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Kalender & Catatan (Notes)</h2>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                Parabek
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Jadwal bulanan terpadu dengan catatan harian, pengingat, agenda rapat, dan tenggat deadline.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hilal Adjustment Selector */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/90 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="font-semibold text-emerald-800 flex items-center gap-1">
              <span>☪</span>
              <span>Hilal:</span>
            </span>
            <select
              value={hijriOffset}
              onChange={(e) => handleHijriOffsetChange(parseInt(e.target.value, 10))}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer text-xs"
              title="Penyesuaian Kalender Hijriah (Hisab/Ru'yah Hilal)"
            >
              <option value="-1">-1 Hari</option>
              <option value="0">Standar (0)</option>
              <option value="1">+1 Hari</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Kalender Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Semua Note ({filteredNotes.length})</span>
            </button>
          </div>

          {/* Add Note Button */}
          <button
            onClick={() => onAddNote(selectedDate || todayStr)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Note Baru</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Note Bulan Ini</p>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{totalNotesInMonth}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-amber-600">Disematkan / Penting</p>
            <p className="text-xl font-bold font-mono text-amber-700 mt-0.5">{pinnedNotesCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Pin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-blue-600">Belum Selesai</p>
            <p className="text-xl font-bold font-mono text-blue-700 mt-0.5">{pendingNotesCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-emerald-600">Catatan Selesai</p>
            <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{completedNotesCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari catatan, pengingat, atau memo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-slate-400 text-[11px] shrink-0 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Kategori:</span>
          </span>
          {CATEGORY_TAGS.map((cat) => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN VIEW: Calendar Grid Mode or List View Mode */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Calendar Grid (8 cols on large screens) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Calendar Month Header Bar */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {formatMonthLabel(selectedMonth)}
                  </h3>
                  {selectedMonth !== currentMonthStr && (
                    <button
                      onClick={handleGoToToday}
                      className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors"
                    >
                      Bulan Sekarang
                    </button>
                  )}
                </div>
                {/* Hijri Month Range Subtitle */}
                <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold">☪</span>
                  <span>{getHijriMonthRange(selectedMonth, hijriOffset)}</span>
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
                  title="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
                  title="Bulan Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Names Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/60 text-center text-[11px] font-bold text-slate-600 py-2.5">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span className="text-emerald-700">Sab</span>
              <span className="text-rose-600">Min</span>
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-slate-50/20">
              {/* Empty placeholder cells for offset before 1st of month */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div
                  key={`offset-${i}`}
                  className="min-h-[75px] sm:min-h-[96px] p-1.5 bg-slate-50/40 opacity-40 select-none"
                />
              ))}

              {/* Day cells for 1 to daysInMonth */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `${yearStr}-${monthStr}-${String(dayNum).padStart(2, '0')}`;
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const hijriParts = getHijriDateParts(dateStr, hijriOffset);

                const dayNotes = notesByDate.get(dateStr) || [];
                const dayAgendas = agendasByDate.get(dateStr) || [];

                const totalItemsCount =
                  dayNotes.length + dayAgendas.length;

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[78px] sm:min-h-[102px] p-1.5 sm:p-2 cursor-pointer transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-emerald-50/70 ring-2 ring-emerald-600 z-10'
                        : 'bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Top Row: Date Number, Hijri Number, and Status Dots */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1 min-w-0">
                        <span
                          className={`inline-flex items-center justify-center font-mono text-xs font-bold rounded-full w-6 h-6 shrink-0 transition-transform ${
                            isToday
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : isSelected
                              ? 'bg-emerald-800 text-white'
                              : 'text-slate-800 group-hover:text-emerald-800'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {/* Hijri Day Number / Month Marker */}
                        <span
                          className={`text-[10px] font-mono leading-none select-none transition-colors ${
                            hijriParts.isFirstDayOfMonth
                              ? 'text-emerald-900 font-extrabold bg-emerald-100/90 border border-emerald-300 px-1 py-0.5 rounded text-[9px]'
                              : isSelected
                              ? 'text-emerald-900 font-bold'
                              : 'text-emerald-700/80 font-medium group-hover:text-emerald-900'
                          }`}
                          title={`Hijriah: ${hijriParts.full}`}
                        >
                          {hijriParts.isFirstDayOfMonth ? `1 ${hijriParts.monthShort}` : hijriParts.day}
                        </span>
                      </div>

                      {/* Small Dots summary for mobile / compact preview */}
                      <div className="flex items-center gap-0.5">

                        {dayAgendas.length > 0 && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-blue-500"
                            title={`${dayAgendas.length} Agenda kegiatan hari ini`}
                          />
                        )}
                        {dayNotes.length > 0 && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                            title={`${dayNotes.length} Catatan hari ini`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Middle Area: Note / Agenda Badges (Hidden on very small screens, visible on tablet/desktop) */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {/* Notes Preview Badges */}
                      {dayNotes.slice(0, 2).map((note) => {
                        const style = COLOR_STYLES[note.warna || 'emerald'];
                        return (
                          <div
                            key={note.id}
                            className={`text-[9px] sm:text-[10px] truncate px-1.5 py-0.5 rounded border font-medium flex items-center gap-1 ${
                              note.isCompleted ? 'line-through opacity-60 ' : ''
                            } ${style.badge}`}
                            title={note.judul}
                          >
                            {note.isPinned && (
                              <Pin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                            )}
                            <span className="truncate">{note.judul}</span>
                          </div>
                        );
                      })}

                      {/* Agenda event snippet */}
                      {dayAgendas.slice(0, 1).map((ag) => (
                        <div
                          key={ag.id}
                          className="text-[9px] sm:text-[10px] truncate px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium hidden sm:block"
                          title={`Agenda: ${ag.judul}`}
                        >
                          📅 {ag.judul}
                        </div>
                      ))}



                      {/* Counter if more items */}
                      {totalItemsCount > 3 && (
                        <span className="text-[9px] text-slate-400 font-medium pl-1 hidden sm:inline">
                          +{totalItemsCount - 3} lainnya
                        </span>
                      )}
                    </div>

                    {/* Bottom Indicator row on mobile */}
                    <div className="sm:hidden text-[9px] text-slate-400 font-mono mt-1 text-right">
                      {totalItemsCount > 0 && `• ${totalItemsCount}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Date Details & Actions (4 cols on large screens) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5">
            {/* Date Details Header */}
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                    Detail Tanggal
                  </span>
                  {selectedDate === todayStr && (
                    <span className="px-2 py-0.2 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                      Hari Ini
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug mt-0.5">
                  {formatDateIndo(selectedDate)}
                </h3>
                {/* Full Hijri Date Display */}
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold shadow-2xs">
                  <span className="text-emerald-700 font-bold">☪</span>
                  <span>{getHijriDateFull(selectedDate, hijriOffset)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAddNote(selectedDate)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Tambah Note pada tanggal ini"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Catatan</span>
              </button>
            </div>

            {/* Section: Notes on this Day */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Catatan / Notes ({selectedDateNotes.length})</span>
                </span>
              </div>

              {selectedDateNotes.length === 0 ? (
                <div className="p-5 text-center bg-slate-50 rounded-xl border border-slate-200/70 text-slate-500">
                  <p className="text-xs font-medium text-slate-600">
                    Belum ada catatan pada tanggal ini.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Klik tombol <strong>+ Catatan</strong> untuk menambahkan pengingat atau memo.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {selectedDateNotes.map((note) => {
                    const style = COLOR_STYLES[note.warna || 'emerald'];
                    return (
                      <div
                        key={note.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          note.isPinned
                            ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                            : `${style.bg} ${style.border}`
                        }`}
                      >
                        {/* Note Top Bar: Checkbox, Title, Category Badge, Actions */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => onToggleComplete(note.id)}
                              className="mt-0.5 text-slate-400 hover:text-emerald-700 transition-colors shrink-0"
                              title={note.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                            >
                              {note.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-400" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${style.badge}`}
                                >
                                  {note.kategori}
                                </span>
                                {note.waktu && (
                                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-0.5">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{note.waktu} WIB</span>
                                  </span>
                                )}
                                {note.bidang && note.bidang !== 'Semua' && (
                                  <span className="text-[9px] font-bold text-slate-500 bg-white/80 border border-slate-200 px-1 rounded">
                                    {note.bidang}
                                  </span>
                                )}
                              </div>

                              <h4
                                className={`text-xs font-bold leading-snug break-words ${
                                  note.isCompleted
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-900'
                                }`}
                              >
                                {note.judul}
                              </h4>
                            </div>
                          </div>

                          {/* Action Buttons: Pin, Edit, Delete */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onTogglePin(note.id)}
                              className={`p-1 rounded-md transition-colors ${
                                note.isPinned
                                  ? 'text-amber-600 bg-amber-100 hover:bg-amber-200'
                                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                              }`}
                              title={note.isPinned ? 'Lepaskan sematan' : 'Sematkan note ini'}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditNote(note)}
                              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-200/50 rounded-md transition-colors"
                              title="Edit Note"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteNote(note.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Hapus Note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Note Body Text */}
                        {note.isi && (
                          <p className="text-[11px] text-slate-600 mt-2 pl-6 pt-1 border-t border-slate-200/60 leading-relaxed whitespace-pre-wrap">
                            {note.isi}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section: Agenda on this Day (if any) */}
            {selectedDateAgendas.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-700" />
                  <span>Agenda Kegiatan ({selectedDateAgendas.length})</span>
                </span>
                <div className="space-y-2">
                  {selectedDateAgendas.map((ag) => (
                    <div
                      key={ag.id}
                      className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-blue-900 leading-snug">
                          {ag.judul}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-200 text-blue-900 shrink-0">
                          {ag.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-blue-700 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        {ag.waktuMulai && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{ag.waktuMulai} - {ag.waktuSelesai || 'Selesai'}</span>
                          </span>
                        )}
                        {ag.lokasi && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>{ag.lokasi}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>
      ) : (
        /* LIST VIEW MODE (Semua Catatan) */
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700 text-sm">Tidak Ada Catatan Ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {searchQuery || categoryFilter !== 'Semua'
                  ? 'Tidak ada catatan yang cocok dengan filter atau kata kunci pencarian.'
                  : 'Belum ada catatan atau memo yang tersimpan di kalender.'}
              </p>
              <button
                onClick={() => onAddNote(todayStr)}
                className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Catatan Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes
                .sort((a, b) => {
                  if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
                  return b.tanggal.localeCompare(a.tanggal);
                })
                .map((note) => {
                  const style = COLOR_STYLES[note.warna || 'emerald'];
                  return (
                    <div
                      key={note.id}
                      className={`p-4 rounded-2xl border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                        note.isPinned
                          ? 'bg-amber-50/30 border-amber-300'
                          : `${style.bg} ${style.border}`
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Top Meta: Date, Hijri Date, Category, Pin */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-mono font-bold text-slate-700 flex items-center gap-1">
                              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDateIndo(note.tanggal)}</span>
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-850 bg-emerald-50 border border-emerald-200/90 text-emerald-800 px-1.5 py-0.2 rounded-md">
                              ☪ {getHijriDateFull(note.tanggal, hijriOffset)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}
                            >
                              {note.kategori}
                            </span>
                            {note.isPinned && (
                              <Pin className="w-3.5 h-3.5 text-amber-500" />
                            )}
                          </div>
                        </div>

                        {/* Title & Checkbox */}
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleComplete(note.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-700 shrink-0"
                          >
                            {note.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <h4
                            className={`text-sm font-bold leading-snug break-words ${
                              note.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {note.judul}
                          </h4>
                        </div>

                        {/* Content text */}
                        {note.isi && (
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap pl-6">
                            {note.isi}
                          </p>
                        )}
                      </div>

                      {/* Bottom Footer Actions */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60 text-xs">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {note.waktu ? `⏰ ${note.waktu} WIB` : `Bidang: ${note.bidang || 'Semua'}`}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onTogglePin(note.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              note.isPinned ? 'text-amber-600 bg-amber-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                            title="Sematkan"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditNote(note)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteNote(note.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
