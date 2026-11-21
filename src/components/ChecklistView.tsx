import React, { useMemo, useState } from 'react';
import { ChecklistItem, Department } from '../types/kpi';
import { autoCapitalizeText } from '../utils/textUtils';
import { formatDateIndo } from '../utils/kpiCalculations';
import {
  CheckSquare,
  ClipboardList,
  Trash2,
  CheckCircle2,
  Circle,
  ListPlus,
  Search,
  X,
  FolderOpen,
  Building2,
  Edit2,
  Check,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
} from 'lucide-react';

interface ChecklistViewProps {
  checklistItems: ChecklistItem[];
  onAdd: (item: Omit<ChecklistItem, 'id' | 'createdAt'>) => void;
  onAddMany?: (items: Omit<ChecklistItem, 'id' | 'createdAt'>[]) => void;
  onUpdate?: (id: string, updated: Partial<ChecklistItem>) => void;
  onUpdateGroup?: (ids: string[], updated: Partial<ChecklistItem>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteGroup?: (activityName: string, ids: string[]) => void;
}

interface ActivityGroup {
  key: string;
  namaKegiatan: string;
  bidang: Department | 'Semua';
  tanggal?: string;
  lokasi?: string;
  items: ChecklistItem[];
  realItems: ChecklistItem[];
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  checklistItems,
  onAdd,
  onUpdate,
  onUpdateGroup,
  onToggle,
  onDelete,
  onDeleteGroup,
}) => {
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [bidang, setBidang] = useState<Department | 'Semua'>('Semua');
  const [tanggal, setTanggal] = useState('');
  const [lokasi, setLokasi] = useState('');

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [editingGroupBidang, setEditingGroupBidang] = useState<Department | 'Semua'>('Semua');
  const [editingGroupTanggal, setEditingGroupTanggal] = useState('');
  const [editingGroupLokasi, setEditingGroupLokasi] = useState('');

  const [quickAddByGroup, setQuickAddByGroup] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Belum' | 'Selesai'>('Semua');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const isActivityReady = namaKegiatan.trim().length > 0;

  // Save new activity card (or update metadata if activity already exists)
  const handleSubmitActivityChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    const activityName = autoCapitalizeText(namaKegiatan.trim());
    if (!activityName) return;

    const cleanLokasi = autoCapitalizeText(lokasi.trim());
    const cleanTanggal = tanggal.trim();

    const existingIds = checklistItems
      .filter(
        (item) =>
          ((item.namaKegiatan || '').trim() || 'Checklist Umum').toLowerCase() ===
          activityName.toLowerCase()
      )
      .map((item) => item.id);

    if (existingIds.length > 0 && onUpdateGroup) {
      onUpdateGroup(existingIds, {
        namaKegiatan: activityName,
        bidang,
        tanggal: cleanTanggal,
        lokasi: cleanLokasi,
      });
    } else {
      onAdd({
        namaKegiatan: activityName,
        tanggal: cleanTanggal,
        lokasi: cleanLokasi,
        judul: '',
        selesai: false,
        bidang,
      });
    }

    setNamaKegiatan('');
    setTanggal('');
    setLokasi('');
  };

  // Inline quick add inside an existing Activity Card
  const handleQuickAddToGroup = (
    e: React.FormEvent,
    group: ActivityGroup
  ) => {
    e.preventDefault();
    const raw = (quickAddByGroup[group.key] || '').trim();
    if (!raw) return;

    onAdd({
      namaKegiatan: group.namaKegiatan === 'Checklist Umum' ? '' : group.namaKegiatan,
      tanggal: group.tanggal || '',
      lokasi: group.lokasi || '',
      judul: autoCapitalizeText(raw),
      selesai: false,
      bidang: group.bidang,
    });

    setQuickAddByGroup((prev) => ({ ...prev, [group.key]: '' }));
  };

  // Start & save editing individual item
  const handleStartEditItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingItemText(autoCapitalizeText(item.judul || ''));
  };

  const handleSaveEditItem = (id: string) => {
    const clean = autoCapitalizeText(editingItemText.trim());
    if (!clean) return;
    if (onUpdate) {
      onUpdate(id, { judul: clean });
    }
    setEditingItemId(null);
    setEditingItemText('');
  };

  // Start & save editing activity header
  const handleStartEditGroup = (group: ActivityGroup) => {
    setEditingGroupKey(group.key);
    setEditingGroupName(group.namaKegiatan === 'Checklist Umum' ? '' : group.namaKegiatan);
    setEditingGroupBidang(group.bidang || 'Semua');
    setEditingGroupTanggal(group.tanggal || '');
    setEditingGroupLokasi(group.lokasi || '');
  };

  const handleSaveEditGroup = (ids: string[]) => {
    const cleanName = autoCapitalizeText(editingGroupName.trim());
    if (!cleanName) return;
    const cleanLokasi = autoCapitalizeText(editingGroupLokasi.trim());
    const cleanTanggal = editingGroupTanggal.trim();
    const updatedPayload: Partial<ChecklistItem> = {
      namaKegiatan: cleanName,
      bidang: editingGroupBidang,
      tanggal: cleanTanggal,
      lokasi: cleanLokasi,
    };
    if (onUpdateGroup) {
      onUpdateGroup(ids, updatedPayload);
    } else if (onUpdate) {
      ids.forEach((id) => onUpdate(id, updatedPayload));
    }
    setEditingGroupKey(null);
    setEditingGroupName('');
    setEditingGroupTanggal('');
    setEditingGroupLokasi('');
  };

  // Group items by Nama Kegiatan and apply search/status filters
  const groupedActivities = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const groupMap = new Map<string, ActivityGroup>();

    checklistItems.forEach((item) => {
      const activityName = (item.namaKegiatan || '').trim() || 'Checklist Umum';
      const key = activityName.toLowerCase();

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          namaKegiatan: activityName,
          bidang: item.bidang || 'Semua',
          tanggal: item.tanggal || '',
          lokasi: item.lokasi || '',
          items: [],
          realItems: [],
        });
      } else {
        const grp = groupMap.get(key)!;
        if (!grp.tanggal && item.tanggal) grp.tanggal = item.tanggal;
        if (!grp.lokasi && item.lokasi) grp.lokasi = item.lokasi;
      }
      groupMap.get(key)!.items.push(item);
      if ((item.judul || '').trim() !== '') {
        groupMap.get(key)!.realItems.push(item);
      }
    });

    const groups = Array.from(groupMap.values()).map((group) => {
      const sortedItems = [...group.items].sort((a, b) =>
        (a.createdAt || '').localeCompare(b.createdAt || '')
      );
      const sortedRealItems = [...group.realItems].sort((a, b) =>
        (a.createdAt || '').localeCompare(b.createdAt || '')
      );
      return { ...group, items: sortedItems, realItems: sortedRealItems };
    });

    // Sort groups newest activity first (by latest createdAt), keeping Checklist Umum last if mixed
    groups.sort((a, b) => {
      if (a.key === 'checklist umum' && b.key !== 'checklist umum') return 1;
      if (b.key === 'checklist umum' && a.key !== 'checklist umum') return -1;
      const latestA = a.items[a.items.length - 1]?.createdAt || '';
      const latestB = b.items[b.items.length - 1]?.createdAt || '';
      return latestB.localeCompare(latestA);
    });

    return groups
      .map((group) => {
        const groupNameMatches =
          !query ||
          group.namaKegiatan.toLowerCase().includes(query) ||
          (group.lokasi && group.lokasi.toLowerCase().includes(query));
        const filteredItems = group.realItems.filter((item) => {
          const matchesQuery =
            groupNameMatches || item.judul.toLowerCase().includes(query);
          const matchesStatus =
            statusFilter === 'Semua' ||
            (statusFilter === 'Selesai' && item.selesai) ||
            (statusFilter === 'Belum' && !item.selesai);
          return matchesQuery && matchesStatus;
        });

        return { ...group, filteredItems, groupNameMatches };
      })
      .filter(
        (group) =>
          group.filteredItems.length > 0 ||
          (group.realItems.length === 0 && group.groupNameMatches && statusFilter === 'Semua')
      );
  }, [checklistItems, searchQuery, statusFilter]);

  const totalActivitiesCount = useMemo(() => {
    const keys = new Set(
      checklistItems.map((i) => ((i.namaKegiatan || '').trim() || 'Checklist Umum').toLowerCase())
    );
    return keys.size;
  }, [checklistItems]);

  const realChecklistItems = useMemo(
    () => checklistItems.filter((i) => (i.judul || '').trim() !== ''),
    [checklistItems]
  );
  const completedCount = realChecklistItems.filter((i) => i.selesai).length;
  const totalItemsCount = realChecklistItems.length;

  const toggleGroupExpand = (key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExpandAllGroups = () => {
    const next: Record<string, boolean> = {};
    groupedActivities.forEach((g) => {
      next[g.key] = true;
    });
    setExpandedGroups(next);
  };

  const handleCollapseAllGroups = () => {
    setExpandedGroups({});
  };

  const areAllGroupsExpanded =
    groupedActivities.length > 0 && groupedActivities.every((g) => !!expandedGroups[g.key]);
  const areAnyGroupsExpanded = groupedActivities.some((g) => !!expandedGroups[g.key]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-md">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Lembar Checklist Kegiatan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Masukkan nama kegiatan terlebih dahulu, lalu buat daftar kebutuhan atau perlengkapan untuk kegiatan tersebut.
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2.5 text-xs shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-center">
            <p className="text-[11px] font-medium text-slate-500">Kegiatan</p>
            <p className="text-base font-bold font-mono text-slate-900">{totalActivitiesCount}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2 text-center">
            <p className="text-[11px] font-medium text-blue-700">Total List</p>
            <p className="text-base font-bold font-mono text-blue-900">{totalItemsCount}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-center">
            <p className="text-[11px] font-medium text-emerald-700">Selesai</p>
            <p className="text-base font-bold font-mono text-emerald-900">
              {completedCount}/{totalItemsCount}
            </p>
          </div>
        </div>
      </div>

      {/* Form Builder: Buat Daftar Checklist Baru */}
      <form
        onSubmit={handleSubmitActivityChecklist}
        className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
      >
        <div className="bg-[#1b4332] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-emerald-300" />
            <h3 className="text-sm sm:text-base font-bold">Buat Daftar Checklist Baru</h3>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-9">
              <label className="block font-bold text-slate-900 mb-1.5">
                Nama Kegiatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                autoCapitalize="words"
                maxLength={500}
                value={namaKegiatan}
                onChange={(e) => setNamaKegiatan(autoCapitalizeText(e.target.value))}
                placeholder="Contoh: Futsal Championship, Penerimaan Santri Baru, Kajian Akbar..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Bidang</span>
              </label>
              <select
                value={bidang}
                onChange={(e) => setBidang(e.target.value as Department | 'Semua')}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="Semua">Semua (Humas & IT)</option>
                <option value="Humas">HUMAS</option>
                <option value="IT">IT</option>
                <option value="Umum">UMUM</option>
              </select>
            </div>
          </div>

          {/* Tanggal & Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>Tanggal Kegiatan</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>

            <div className="sm:col-span-7">
              <label className="block font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Lokasi Kegiatan</span>
              </label>
              <input
                type="text"
                autoCapitalize="words"
                maxLength={500}
                value={lokasi}
                onChange={(e) => setLokasi(autoCapitalizeText(e.target.value))}
                placeholder="Contoh: Aula Pondok, Lapangan Utama, Masjid..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!isActivityReady}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Simpan Daftar Checklist</span>
            </button>
          </div>
        </div>
      </form>

      {/* Search & Filter Bar */}
      {checklistItems.length > 0 && (
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama kegiatan, lokasi, atau item kebutuhan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-1.5">
              {(['Semua', 'Belum', 'Selesai'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'Belum' ? 'Belum Selesai' : st}
                </button>
              ))}
            </div>

            {groupedActivities.length > 0 && (
              <div className="flex items-center gap-1.5 sm:border-l sm:border-slate-200 sm:pl-2">
                <button
                  type="button"
                  onClick={handleExpandAllGroups}
                  disabled={areAllGroupsExpanded}
                  className="px-2.5 py-1.5 rounded-xl font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                  title="Tampilkan semua daftar checklist"
                >
                  <ChevronsDown className="w-3.5 h-3.5" />
                  <span>Tampilkan Semua</span>
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAllGroups}
                  disabled={!areAnyGroupsExpanded}
                  className="px-2.5 py-1.5 rounded-xl font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                  title="Sembunyikan semua daftar checklist"
                >
                  <ChevronsUp className="w-3.5 h-3.5" />
                  <span>Sembunyikan Semua</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Grouped Checklist Cards */}
      {checklistItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center text-slate-500">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-sm">Belum Ada Daftar Checklist</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Mulai dengan mengisi <strong>Nama Kegiatan</strong> pada formulir di atas, lalu tambahkan list perlengkapan atau kebutuhan kegiatan tersebut.
          </p>
        </div>
      ) : groupedActivities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 text-xs">
          Tidak ada kegiatan atau poin checklist yang cocok dengan pencarian/filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {groupedActivities.map((group) => {
            const totalInGroup = group.realItems.length;
            const doneInGroup = group.realItems.filter((i) => i.selesai).length;
            const progressPct = totalInGroup > 0 ? Math.round((doneInGroup / totalInGroup) * 100) : 0;
            const isAllDone = totalInGroup > 0 && doneInGroup === totalInGroup;
            const isCollapsed = !expandedGroups[group.key];

            return (
              <div
                key={group.key}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  isAllDone ? 'border-emerald-300' : 'border-slate-200/80'
                }`}
              >
                {/* Activity Card Header */}
                <div
                  className={`p-4 bg-slate-50/80 space-y-2.5 ${
                    !isCollapsed ? 'border-b border-slate-200/80' : ''
                  }`}
                >
                  {editingGroupKey === group.key ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <input
                          type="text"
                          autoFocus
                          autoCapitalize="words"
                          maxLength={500}
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(autoCapitalizeText(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEditGroup(group.items.map((i) => i.id));
                            } else if (e.key === 'Escape') {
                              setEditingGroupKey(null);
                            }
                          }}
                          placeholder="Nama kegiatan..."
                          className="sm:col-span-8 px-3 py-1.5 text-xs sm:text-sm border border-emerald-400 rounded-lg bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <select
                          value={editingGroupBidang}
                          onChange={(e) =>
                            setEditingGroupBidang(e.target.value as Department | 'Semua')
                          }
                          className="sm:col-span-4 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="Semua">Semua (Humas & IT)</option>
                          <option value="Humas">HUMAS</option>
                          <option value="IT">IT</option>
                          <option value="Umum">UMUM</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <input
                          type="date"
                          value={editingGroupTanggal}
                          onChange={(e) => setEditingGroupTanggal(e.target.value)}
                          className="sm:col-span-5 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          autoCapitalize="words"
                          maxLength={500}
                          value={editingGroupLokasi}
                          onChange={(e) => setEditingGroupLokasi(autoCapitalizeText(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEditGroup(group.items.map((i) => i.id));
                            } else if (e.key === 'Escape') {
                              setEditingGroupKey(null);
                            }
                          }}
                          placeholder="Lokasi kegiatan..."
                          className="sm:col-span-7 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingGroupKey(null)}
                          className="px-3 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditGroup(group.items.map((i) => i.id))}
                          disabled={!editingGroupName.trim()}
                          className="px-3 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Simpan</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleGroupExpand(group.key)}
                        className="flex items-start gap-2.5 min-w-0 flex-1 text-left cursor-pointer group/header"
                        title={
                          isCollapsed
                            ? `Tampilkan daftar ${group.namaKegiatan}`
                            : `Sembunyikan daftar ${group.namaKegiatan}`
                        }
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isAllDone
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-emerald-800 text-white'
                          }`}
                        >
                          <FolderOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover/header:text-emerald-800 leading-snug break-words transition-colors">
                            {group.namaKegiatan}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                              {group.bidang === 'Semua' ? 'Humas & IT' : group.bidang}
                            </span>
                            {group.tanggal && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                                <Calendar className="w-3 h-3 text-emerald-700" />
                                {formatDateIndo(group.tanggal)}
                              </span>
                            )}
                            {group.lokasi && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                                <MapPin className="w-3 h-3 text-rose-600" />
                                {group.lokasi}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isAllDone
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {doneInGroup}/{totalInGroup} Selesai ({progressPct}%)
                            </span>
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditGroup(group)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title={`Edit nama kegiatan ${group.namaKegiatan}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const ids = group.items.map((i) => i.id);
                            if (onDeleteGroup) {
                              onDeleteGroup(group.namaKegiatan, ids);
                            } else {
                              ids.forEach((id) => onDelete(id));
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={`Hapus semua checklist kegiatan ${group.namaKegiatan}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleGroupExpand(group.key)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isCollapsed
                              ? 'bg-white border-slate-200 text-slate-600 hover:text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50'
                              : 'bg-emerald-100 border-emerald-200 text-emerald-800 hover:bg-emerald-200/70'
                          }`}
                          title={isCollapsed ? 'Tampilkan list' : 'Sembunyikan list'}
                          aria-expanded={!isCollapsed}
                        >
                          {isCollapsed ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Slim Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Checklist Items List & Quick Add (Collapsible Dropdown) */}
                {!isCollapsed && (
                  <>
                    {group.filteredItems.length === 0 ? (
                      <div className="px-4 py-4 text-xs text-slate-400 text-center">
                        Belum ada item kebutuhan. Tambahkan di bawah ini.
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {group.filteredItems.map((item) => {
                        const isEditingThisItem = editingItemId === item.id;
                        return (
                          <li
                            key={item.id}
                            className="flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50/70 transition-colors group"
                          >
                            <button
                              type="button"
                              onClick={() => onToggle(item.id)}
                              className="text-slate-400 hover:text-emerald-700 transition-colors shrink-0 cursor-pointer"
                              title={item.selesai ? 'Tandai belum selesai' : 'Tandai selesai'}
                            >
                              {item.selesai ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-600" />
                              )}
                            </button>

                            {isEditingThisItem ? (
                              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                <input
                                  type="text"
                                  autoFocus
                                  autoCapitalize="words"
                                  value={editingItemText}
                                  onChange={(e) =>
                                    setEditingItemText(autoCapitalizeText(e.target.value))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveEditItem(item.id);
                                    } else if (e.key === 'Escape') {
                                      setEditingItemId(null);
                                    }
                                  }}
                                  className="flex-1 min-w-0 px-2.5 py-1 text-xs sm:text-sm border border-emerald-400 rounded-lg bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditItem(item.id)}
                                  disabled={!editingItemText.trim()}
                                  className="p-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-lg transition-colors shrink-0 cursor-pointer"
                                  title="Simpan perubahan"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(null)}
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition-colors shrink-0 cursor-pointer"
                                  title="Batal edit"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span
                                  onClick={() => onToggle(item.id)}
                                  className={`flex-1 text-xs sm:text-sm font-semibold leading-snug break-words cursor-pointer select-none ${
                                    item.selesai ? 'line-through text-slate-400' : 'text-slate-800'
                                  }`}
                                >
                                  {item.judul}
                                </span>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditItem(item)}
                                    className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                                    title="Edit poin ini"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDelete(item.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                    title="Hapus poin ini"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </li>
                        );
                      })}
                      </ul>
                    )}

                    {/* Quick Inline Add Need to This Activity */}
                    <form
                      onSubmit={(e) => handleQuickAddToGroup(e, group)}
                      className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        autoCapitalize="words"
                        value={quickAddByGroup[group.key] || ''}
                        onChange={(e) =>
                          setQuickAddByGroup((prev) => ({
                            ...prev,
                            [group.key]: autoCapitalizeText(e.target.value),
                          }))
                        }
                        placeholder={`+ Tambah kebutuhan untuk ${group.namaKegiatan}...`}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!(quickAddByGroup[group.key] || '').trim()}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
                      >
                        Tambah
                      </button>
                    </form>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
