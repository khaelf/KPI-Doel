import { WorkEntry, KpiIndicator, AgendaItem, CalendarNote, Department, ChecklistItem } from '../types/kpi';
import { INITIAL_WORK_ENTRIES, INITIAL_KPI_INDICATORS, INITIAL_AGENDA_ITEMS, INITIAL_CALENDAR_NOTES } from '../data/initialData';
import { firebaseDataService, testFirestoreConnection } from './firebase';
import { isWorkEntryInMonth } from '../utils/kpiCalculations';

const WORK_ENTRIES_KEY = 'parabek_kpi_work_entries_v1';
const KPI_INDICATORS_KEY = 'parabek_kpi_indicators_v5';
const AGENDA_ITEMS_KEY = 'parabek_kpi_agenda_items_v1';
const CALENDAR_NOTES_KEY = 'parabek_kpi_calendar_notes_v1';
const DELETED_KPI_KEY = 'parabek_kpi_deleted_indicators_v1';

// Verify firestore connection on load
testFirestoreConnection();

export const storageService = {
  getDeletedKpiKeys(): string[] {
    try {
      const data = localStorage.getItem(DELETED_KPI_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addDeletedKpiKey(key: string): void {
    const list = this.getDeletedKpiKeys();
    if (!list.includes(key)) {
      list.push(key);
      localStorage.setItem(DELETED_KPI_KEY, JSON.stringify(list));
    }
  },

  removeDeletedKpiKey(key: string): void {
    const list = this.getDeletedKpiKeys().filter((k) => k !== key);
    localStorage.setItem(DELETED_KPI_KEY, JSON.stringify(list));
  },

  filterActiveKpiIndicators(indicators: KpiIndicator[]): KpiIndicator[] {
    const standardHumasKeys = [
      'humas:dokumentasi kegiatan',
      'humas:desain grafis',
      'humas:pembuatan konten medsos',
      'humas:publikasi berita',
    ];
    standardHumasKeys.forEach((k) => this.removeDeletedKpiKey(k));

    const deletedKeys = this.getDeletedKpiKeys();
    if (!deletedKeys || deletedKeys.length === 0) return indicators;

    const active: KpiIndicator[] = [];
    indicators.forEach((ind) => {
      const key = `${ind.bidang.toLowerCase()}:${ind.namaIndikator.trim().toLowerCase()}`;
      if (deletedKeys.includes(key) && !standardHumasKeys.includes(key)) {
        // Automatically purge any remaining or newly received document for deleted key from Firestore
        firebaseDataService.deleteKpiIndicator(ind.id);
      } else {
        active.push(ind);
      }
    });
    return active;
  },

  getWorkEntries(): WorkEntry[] {
    try {
      const data = localStorage.getItem(WORK_ENTRIES_KEY);
      if (!data) {
        this.saveWorkEntries(INITIAL_WORK_ENTRIES);
        // Seed initial entries to Firestore
        INITIAL_WORK_ENTRIES.forEach((item) => firebaseDataService.saveWorkEntry(item));
        return INITIAL_WORK_ENTRIES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading work entries from localStorage:', e);
      return INITIAL_WORK_ENTRIES;
    }
  },

  saveWorkEntries(entries: WorkEntry[]): void {
    try {
      localStorage.setItem(WORK_ENTRIES_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Error saving work entries to localStorage:', e);
    }
  },

  addWorkEntry(entry: Omit<WorkEntry, 'id' | 'createdAt'>): WorkEntry {
    const entries = this.getWorkEntries();
    const newEntry: WorkEntry = {
      ...entry,
      id: 'w-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
    };
    entries.unshift(newEntry);
    this.saveWorkEntries(entries);

    // Sync to Firestore
    firebaseDataService.saveWorkEntry(newEntry);
    return newEntry;
  },

  updateWorkEntry(id: string, updated: Partial<WorkEntry>): WorkEntry | null {
    const entries = this.getWorkEntries();
    const index = entries.findIndex((item) => item.id === id);
    if (index === -1) return null;
    entries[index] = { ...entries[index], ...updated };
    this.saveWorkEntries(entries);

    // Sync update to Firestore
    firebaseDataService.updateWorkEntry(id, updated);
    return entries[index];
  },

  deleteWorkEntry(id: string): boolean {
    const entries = this.getWorkEntries();
    const filtered = entries.filter((item) => item.id !== id);
    if (filtered.length === entries.length) return false;
    this.saveWorkEntries(filtered);

    // Sync delete to Firestore
    firebaseDataService.deleteWorkEntry(id);
    return true;
  },

  getKpiIndicators(): KpiIndicator[] {
    try {
      const data = localStorage.getItem(KPI_INDICATORS_KEY);
      let list: KpiIndicator[];
      if (!data) {
        list = INITIAL_KPI_INDICATORS;
        this.saveKpiIndicators(list);
        INITIAL_KPI_INDICATORS.forEach((ind) => firebaseDataService.saveKpiIndicator(ind));
        return list;
      } else {
        list = JSON.parse(data);
      }

      const deletedKeys = this.getDeletedKpiKeys();
      let modified = false;

      const sanitized: KpiIndicator[] = [];
      const seenMap = new Map<string, KpiIndicator>();

      list.forEach((ind) => {
        if (!ind || !ind.bidang || !ind.namaIndikator || !ind.periodeBulan) return;

        const nameClean = ind.namaIndikator.trim();
        const keyDeleted = `${ind.bidang.toLowerCase()}:${nameClean.toLowerCase()}`;
        if (deletedKeys.includes(keyDeleted)) {
          modified = true;
          firebaseDataService.deleteKpiIndicator(ind.id);
          return;
        }

        let currentName = nameClean;
        let currentSatuan = ind.satuan;
        if (ind.bidang === 'Humas' && currentName.toLowerCase() === 'pembuatan konten media sosial') {
          currentName = 'Pembuatan Konten Medsos';
          modified = true;
        }
        if (
          ind.bidang === 'Umum' &&
          (currentName.toLowerCase() === 'pelayanan & administrasi umum' ||
            currentName.toLowerCase() === 'pelayanan dan administrasi umum')
        ) {
          currentName = 'Insidentil';
          modified = true;
        }

        const uniqueKey = `${ind.bidang.toLowerCase()}:${currentName.toLowerCase()}:${ind.periodeBulan}`;

        if (seenMap.has(uniqueKey)) {
          modified = true;
          const existing = seenMap.get(uniqueKey)!;
          if (ind.target > existing.target) {
            existing.target = ind.target;
          }
          if (ind.realisasi > existing.realisasi) {
            existing.realisasi = ind.realisasi;
          }
          firebaseDataService.deleteKpiIndicator(ind.id);
        } else {
          const cleanedInd: KpiIndicator = {
            ...ind,
            namaIndikator: currentName,
            satuan: currentSatuan,
          };
          seenMap.set(uniqueKey, cleanedInd);
          sanitized.push(cleanedInd);
        }
      });

      if (modified) {
        this.saveKpiIndicators(sanitized);
      }

      return sanitized;
    } catch (e) {
      console.error('Error loading KPI indicators from localStorage:', e);
      return INITIAL_KPI_INDICATORS;
    }
  },

  saveKpiIndicators(indicators: KpiIndicator[]): void {
    try {
      localStorage.setItem(KPI_INDICATORS_KEY, JSON.stringify(indicators));
    } catch (e) {
      console.error('Error saving KPI indicators to localStorage:', e);
    }
  },

  addKpiIndicator(indicator: Omit<KpiIndicator, 'id'>): KpiIndicator {
    const nameClean = indicator.namaIndikator.trim();
    const key = `${indicator.bidang.toLowerCase()}:${nameClean.toLowerCase()}`;
    this.removeDeletedKpiKey(key);

    const indicators = this.getKpiIndicators();
    const existingInMonth = indicators.find(
      (i) => i.bidang === indicator.bidang && i.namaIndikator.trim().toLowerCase() === nameClean.toLowerCase() && i.periodeBulan === indicator.periodeBulan
    );

    if (existingInMonth) {
      existingInMonth.target = indicator.target;
      existingInMonth.satuan = indicator.satuan;
      this.saveKpiIndicators(indicators);
      firebaseDataService.updateKpiIndicator(existingInMonth.id, existingInMonth);
      return existingInMonth;
    }

    const newInd: KpiIndicator = {
      ...indicator,
      namaIndikator: nameClean,
      id: `ind-${indicator.bidang.toLowerCase()}-${indicator.periodeBulan}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    indicators.push(newInd);
    this.saveKpiIndicators(indicators);
    firebaseDataService.saveKpiIndicator(newInd);
    return newInd;
  },

  updateKpiIndicator(id: string, updated: Partial<KpiIndicator>): KpiIndicator | null {
    const indicators = this.getKpiIndicators();
    const index = indicators.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const targetInd = indicators[index];
    const oldName = targetInd.namaIndikator.trim().toLowerCase();
    const bidang = targetInd.bidang;

    if (updated.namaIndikator !== undefined || updated.satuan !== undefined) {
      const newNameClean = updated.namaIndikator !== undefined ? updated.namaIndikator.trim() : undefined;
      indicators.forEach((ind) => {
        if (ind.bidang === bidang && ind.namaIndikator.trim().toLowerCase() === oldName) {
          if (newNameClean !== undefined) ind.namaIndikator = newNameClean;
          if (updated.satuan !== undefined) ind.satuan = updated.satuan;
          firebaseDataService.updateKpiIndicator(ind.id, {
            namaIndikator: ind.namaIndikator,
            satuan: ind.satuan,
          });
        }
      });
    }

    indicators[index] = { ...indicators[index], ...updated };
    if (updated.namaIndikator !== undefined) {
      indicators[index].namaIndikator = updated.namaIndikator.trim();
    }
    this.saveKpiIndicators(indicators);

    firebaseDataService.updateKpiIndicator(id, indicators[index]);
    return indicators[index];
  },

  deleteKpiIndicator(id: string): boolean {
    const indicators = this.getKpiIndicators();
    const targetInd = indicators.find((item) => item.id === id);
    if (!targetInd) return false;

    const nameToDelete = targetInd.namaIndikator.trim().toLowerCase();
    const bidangToDelete = targetInd.bidang;
    const keyToDelete = `${bidangToDelete.toLowerCase()}:${nameToDelete}`;

    this.addDeletedKpiKey(keyToDelete);

    const toDelete = indicators.filter(
      (ind) => ind.bidang === bidangToDelete && ind.namaIndikator.trim().toLowerCase() === nameToDelete
    );
    const filtered = indicators.filter(
      (ind) => !(ind.bidang === bidangToDelete && ind.namaIndikator.trim().toLowerCase() === nameToDelete)
    );

    this.saveKpiIndicators(filtered);
    toDelete.forEach((ind) => firebaseDataService.deleteKpiIndicator(ind.id));
    return true;
  },

  ensureKpiIndicatorsForMonth(month: string, allWorkEntries?: WorkEntry[]): KpiIndicator[] {
    if (!month) return this.getKpiIndicators();

    const standardHumasKeys = [
      'humas:dokumentasi kegiatan',
      'humas:desain grafis',
      'humas:pembuatan konten medsos',
      'humas:publikasi berita',
    ];
    standardHumasKeys.forEach((k) => this.removeDeletedKpiKey(k));

    const indicators = this.getKpiIndicators();
    const entries = allWorkEntries || this.getWorkEntries();
    const deletedKeys = this.getDeletedKpiKeys();

    const masterMap = new Map<string, { bidang: Department; namaIndikator: string; satuan: string; defaultTarget: number }>();

    // Always seed the 4 standard Humas indicators
    const defaultHumas: Array<{ namaIndikator: string; satuan: string; defaultTarget: number }> = [
      { namaIndikator: 'Dokumentasi Kegiatan', satuan: 'Kegiatan', defaultTarget: 10 },
      { namaIndikator: 'Desain Grafis', satuan: 'Desain', defaultTarget: 15 },
      { namaIndikator: 'Pembuatan Konten Medsos', satuan: 'Konten', defaultTarget: 15 },
      { namaIndikator: 'Publikasi Berita', satuan: 'Berita', defaultTarget: 10 },
    ];
    defaultHumas.forEach((dh) => {
      const key = `humas:${dh.namaIndikator.toLowerCase()}`;
      masterMap.set(key, {
        bidang: 'Humas',
        namaIndikator: dh.namaIndikator,
        satuan: dh.satuan,
        defaultTarget: dh.defaultTarget,
      });
    });

    INITIAL_KPI_INDICATORS.forEach((ind) => {
      const nameClean = ind.namaIndikator.trim();
      const key = `${ind.bidang.toLowerCase()}:${nameClean.toLowerCase()}`;
      if (!deletedKeys.includes(key)) {
        masterMap.set(key, {
          bidang: ind.bidang,
          namaIndikator: nameClean,
          satuan: ind.satuan,
          defaultTarget: ind.target,
        });
      }
    });

    indicators.forEach((ind) => {
      const nameClean = ind.namaIndikator.trim();
      const key = `${ind.bidang.toLowerCase()}:${nameClean.toLowerCase()}`;
      if (!deletedKeys.includes(key) && !masterMap.has(key)) {
        masterMap.set(key, {
          bidang: ind.bidang,
          namaIndikator: nameClean,
          satuan: ind.satuan,
          defaultTarget: ind.target || 10,
        });
      }
    });

    let changed = false;
    const currentMonthIndicators = indicators.filter((i) => i.periodeBulan === month);

    masterMap.forEach((master) => {
      const existing = currentMonthIndicators.find(
        (i) => i.bidang === master.bidang && i.namaIndikator.trim().toLowerCase() === master.namaIndikator.trim().toLowerCase()
      );

      const completedCount = entries.filter((e) => {
        const isDeptMatch = e.bidang === master.bidang;
        const indName = master.namaIndikator.trim().toLowerCase();
        const isKpiMatch =
          (e.indikatorKpi && e.indikatorKpi.trim().toLowerCase() === indName) ||
          (e.namaPekerjaan && e.namaPekerjaan.toLowerCase().includes(indName));
        const isDone = e.status === 'Selesai';
        return isDeptMatch && isKpiMatch && isDone && isWorkEntryInMonth(e, month);
      }).length;

      if (!existing) {
        const anyOtherMonthInd = indicators.find(
          (i) => i.bidang === master.bidang && i.namaIndikator.trim().toLowerCase() === master.namaIndikator.trim().toLowerCase()
        );
        const targetToUse = anyOtherMonthInd ? anyOtherMonthInd.target : master.defaultTarget;

        const newInd: KpiIndicator = {
          id: `ind-${master.bidang.toLowerCase()}-${month}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          bidang: master.bidang,
          namaIndikator: master.namaIndikator,
          satuan: master.satuan,
          target: targetToUse,
          realisasi: completedCount,
          periodeBulan: month,
        };
        indicators.push(newInd);
        changed = true;
        firebaseDataService.saveKpiIndicator(newInd);
      } else {
        let indChanged = false;
        if (existing.satuan !== master.satuan) {
          existing.satuan = master.satuan;
          indChanged = true;
        }
        if (existing.realisasi !== completedCount) {
          existing.realisasi = completedCount;
          indChanged = true;
        }
        if (indChanged) {
          changed = true;
          firebaseDataService.updateKpiIndicator(existing.id, {
            satuan: existing.satuan,
            realisasi: existing.realisasi,
          });
        }
      }
    });

    if (changed) {
      this.saveKpiIndicators(indicators);
    }
    return this.getKpiIndicators();
  },

  recalculateKpiRealisasi(allWorkEntries?: WorkEntry[]): KpiIndicator[] {
    const entries = allWorkEntries || this.getWorkEntries();
    const indicators = this.getKpiIndicators();
    let changed = false;

    const updatedIndicators = indicators.map((ind) => {
      const indName = ind.namaIndikator.trim().toLowerCase();
      // Find all completed work entries linked to this indicator for department and month
      const completedCount = entries.filter((e) => {
        const isDeptMatch = e.bidang === ind.bidang;
        const isKpiMatch =
          (e.indikatorKpi && e.indikatorKpi.trim().toLowerCase() === indName) ||
          (e.namaPekerjaan && e.namaPekerjaan.toLowerCase().includes(indName));
        const isDone = e.status === 'Selesai';
        return isDeptMatch && isKpiMatch && isDone && isWorkEntryInMonth(e, ind.periodeBulan);
      }).length;

      if (ind.realisasi !== completedCount) {
        changed = true;
        firebaseDataService.updateKpiIndicator(ind.id, { realisasi: completedCount });
        return { ...ind, realisasi: completedCount };
      }
      return ind;
    });

    if (changed) {
      this.saveKpiIndicators(updatedIndicators);
    }
    return updatedIndicators;
  },

  // --- Agenda Items Storage API ---
  getAgendaItems(): AgendaItem[] {
    try {
      const data = localStorage.getItem(AGENDA_ITEMS_KEY);
      if (!data) {
        this.saveAgendaItems(INITIAL_AGENDA_ITEMS);
        // Seed initial agenda items to Firestore
        INITIAL_AGENDA_ITEMS.forEach((ag) => firebaseDataService.saveAgendaItem(ag));
        return INITIAL_AGENDA_ITEMS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading agenda items from localStorage:', e);
      return INITIAL_AGENDA_ITEMS;
    }
  },

  saveAgendaItems(items: AgendaItem[]): void {
    try {
      localStorage.setItem(AGENDA_ITEMS_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving agenda items to localStorage:', e);
    }
  },

  addAgendaItem(item: Omit<AgendaItem, 'id' | 'createdAt'>): AgendaItem {
    const items = this.getAgendaItems();
    const newItem: AgendaItem = {
      ...item,
      id: 'ag-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    this.saveAgendaItems(items);

    // Sync to Firestore
    firebaseDataService.saveAgendaItem(newItem);
    return newItem;
  },

  updateAgendaItem(id: string, updated: Partial<AgendaItem>): AgendaItem | null {
    const items = this.getAgendaItems();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updated };
    this.saveAgendaItems(items);

    // Sync update to Firestore
    firebaseDataService.updateAgendaItem(id, updated);
    return items[index];
  },

  deleteAgendaItem(id: string): boolean {
    const items = this.getAgendaItems();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    this.saveAgendaItems(filtered);

    // Sync delete to Firestore
    firebaseDataService.deleteAgendaItem(id);
    return true;
  },

  // --- Calendar Notes Storage API ---
  getCalendarNotes(): CalendarNote[] {
    try {
      const data = localStorage.getItem(CALENDAR_NOTES_KEY);
      if (!data) {
        this.saveCalendarNotes(INITIAL_CALENDAR_NOTES);
        // Seed initial calendar notes to Firestore
        INITIAL_CALENDAR_NOTES.forEach((note) => firebaseDataService.saveCalendarNote(note));
        return INITIAL_CALENDAR_NOTES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading calendar notes from localStorage:', e);
      return INITIAL_CALENDAR_NOTES;
    }
  },

  saveCalendarNotes(notes: CalendarNote[]): void {
    try {
      localStorage.setItem(CALENDAR_NOTES_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving calendar notes to localStorage:', e);
    }
  },

  addCalendarNote(note: Omit<CalendarNote, 'id' | 'createdAt'>): CalendarNote {
    const notes = this.getCalendarNotes();
    const newNote: CalendarNote = {
      ...note,
      id: 'note-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    this.saveCalendarNotes(notes);

    // Sync to Firestore
    firebaseDataService.saveCalendarNote(newNote);
    return newNote;
  },

  updateCalendarNote(id: string, updated: Partial<CalendarNote>): CalendarNote | null {
    const notes = this.getCalendarNotes();
    const index = notes.findIndex((item) => item.id === id);
    if (index === -1) return null;
    notes[index] = { ...notes[index], ...updated };
    this.saveCalendarNotes(notes);

    // Sync update to Firestore
    firebaseDataService.updateCalendarNote(id, updated);
    return notes[index];
  },

  deleteCalendarNote(id: string): boolean {
    const notes = this.getCalendarNotes();
    const filtered = notes.filter((item) => item.id !== id);
    if (filtered.length === notes.length) return false;
    this.saveCalendarNotes(filtered);

    // Sync delete to Firestore
    firebaseDataService.deleteCalendarNote(id);
    return true;
  },

  toggleNoteCompletion(id: string): CalendarNote | null {
    const notes = this.getCalendarNotes();
    const target = notes.find((item) => item.id === id);
    if (!target) return null;
    target.isCompleted = !target.isCompleted;
    this.saveCalendarNotes(notes);
    firebaseDataService.updateCalendarNote(id, { isCompleted: target.isCompleted });
    return target;
  },

  toggleNotePin(id: string): CalendarNote | null {
    const notes = this.getCalendarNotes();
    const target = notes.find((item) => item.id === id);
    if (!target) return null;
    target.isPinned = !target.isPinned;
    this.saveCalendarNotes(notes);
    firebaseDataService.updateCalendarNote(id, { isPinned: target.isPinned });
    return target;
  },

  resetAllToDefault(): void {
    localStorage.removeItem(WORK_ENTRIES_KEY);
    localStorage.removeItem(KPI_INDICATORS_KEY);
    localStorage.removeItem(AGENDA_ITEMS_KEY);
    localStorage.removeItem(CALENDAR_NOTES_KEY);
    localStorage.removeItem(DELETED_KPI_KEY);
    this.saveWorkEntries(INITIAL_WORK_ENTRIES);
    this.saveKpiIndicators(INITIAL_KPI_INDICATORS);
    this.saveAgendaItems(INITIAL_AGENDA_ITEMS);
    this.saveCalendarNotes(INITIAL_CALENDAR_NOTES);

    // Seed Firestore
    INITIAL_WORK_ENTRIES.forEach((item) => firebaseDataService.saveWorkEntry(item));
    INITIAL_KPI_INDICATORS.forEach((ind) => firebaseDataService.saveKpiIndicator(ind));
    INITIAL_AGENDA_ITEMS.forEach((ag) => firebaseDataService.saveAgendaItem(ag));
    INITIAL_CALENDAR_NOTES.forEach((note) => firebaseDataService.saveCalendarNote(note));
  },

  // --- Checklist Items Storage API ---
  getChecklistItems(): ChecklistItem[] {
    try {
      const data = localStorage.getItem('parabek_kpi_checklist_items_v1');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading checklist items from localStorage:', e);
      return [];
    }
  },

  saveChecklistItems(items: ChecklistItem[]): void {
    try {
      localStorage.setItem('parabek_kpi_checklist_items_v1', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving checklist items to localStorage:', e);
    }
  },

  addChecklistItem(item: Omit<ChecklistItem, 'id' | 'createdAt'>): ChecklistItem {
    const items = this.getChecklistItems();
    const newItem: ChecklistItem = {
      ...item,
      id: `cl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    this.saveChecklistItems(items);
    firebaseDataService.saveChecklistItem(newItem);
    return newItem;
  },

  addChecklistItems(itemsToAdd: Omit<ChecklistItem, 'id' | 'createdAt'>[]): ChecklistItem[] {
    if (itemsToAdd.length === 0) return [];
    const items = this.getChecklistItems();
    const baseTime = Date.now();
    const created: ChecklistItem[] = itemsToAdd.map((item, idx) => ({
      ...item,
      id: `cl-${baseTime}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date(baseTime + idx).toISOString(),
    }));
    items.push(...created);
    this.saveChecklistItems(items);
    created.forEach((newItem) => firebaseDataService.saveChecklistItem(newItem));
    return created;
  },

  updateChecklistItem(id: string, updated: Partial<ChecklistItem>): ChecklistItem | null {
    const items = this.getChecklistItems();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updated };
    this.saveChecklistItems(items);
    firebaseDataService.updateChecklistItem(id, updated);
    return items[index];
  },

  deleteChecklistItem(id: string): boolean {
    const items = this.getChecklistItems();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    this.saveChecklistItems(filtered);
    firebaseDataService.deleteChecklistItem(id);
    return true;
  },

  deleteChecklistGroup(ids: string[]): boolean {
    if (ids.length === 0) return false;
    const idSet = new Set(ids);
    const items = this.getChecklistItems();
    const filtered = items.filter((item) => !idSet.has(item.id));
    if (filtered.length === items.length) return false;
    this.saveChecklistItems(filtered);
    ids.forEach((id) => firebaseDataService.deleteChecklistItem(id));
    return true;
  },

  toggleChecklistItem(id: string): ChecklistItem | null {
    const items = this.getChecklistItems();
    const target = items.find((item) => item.id === id);
    if (!target) return null;
    target.selesai = !target.selesai;
    this.saveChecklistItems(items);
    firebaseDataService.updateChecklistItem(id, { selesai: target.selesai });
    return target;
  },
};

