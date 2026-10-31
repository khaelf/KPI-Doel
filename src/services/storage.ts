import { WorkEntry, KpiIndicator, AgendaItem } from '../types/kpi';
import { INITIAL_WORK_ENTRIES, INITIAL_KPI_INDICATORS, INITIAL_AGENDA_ITEMS } from '../data/initialData';
import { firebaseDataService, testFirestoreConnection } from './firebase';

const WORK_ENTRIES_KEY = 'parabek_kpi_work_entries_v1';
const KPI_INDICATORS_KEY = 'parabek_kpi_indicators_v1';
const AGENDA_ITEMS_KEY = 'parabek_kpi_agenda_items_v1';

// Verify firestore connection on load
testFirestoreConnection();

export const storageService = {
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
      if (!data) {
        this.saveKpiIndicators(INITIAL_KPI_INDICATORS);
        // Seed initial indicators to Firestore
        INITIAL_KPI_INDICATORS.forEach((ind) => firebaseDataService.saveKpiIndicator(ind));
        return INITIAL_KPI_INDICATORS;
      }
      return JSON.parse(data);
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
    const indicators = this.getKpiIndicators();
    const newInd: KpiIndicator = {
      ...indicator,
      id: 'ind-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    };
    indicators.push(newInd);
    this.saveKpiIndicators(indicators);

    // Sync to Firestore
    firebaseDataService.saveKpiIndicator(newInd);
    return newInd;
  },

  updateKpiIndicator(id: string, updated: Partial<KpiIndicator>): KpiIndicator | null {
    const indicators = this.getKpiIndicators();
    const index = indicators.findIndex((item) => item.id === id);
    if (index === -1) return null;
    indicators[index] = { ...indicators[index], ...updated };
    this.saveKpiIndicators(indicators);

    // Sync update to Firestore
    firebaseDataService.updateKpiIndicator(id, updated);
    return indicators[index];
  },

  deleteKpiIndicator(id: string): boolean {
    const indicators = this.getKpiIndicators();
    const filtered = indicators.filter((item) => item.id !== id);
    if (filtered.length === indicators.length) return false;
    this.saveKpiIndicators(filtered);

    // Sync delete to Firestore
    firebaseDataService.deleteKpiIndicator(id);
    return true;
  },

  recalculateKpiRealisasi(allWorkEntries?: WorkEntry[]): KpiIndicator[] {
    const entries = allWorkEntries || this.getWorkEntries();
    const indicators = this.getKpiIndicators();
    let changed = false;

    const updatedIndicators = indicators.map((ind) => {
      // Find all completed work entries linked to this indicator for department and month
      const completedCount = entries.filter((e) => {
        const entryMonth = (e.tanggalMasuk || e.tanggal || '').substring(0, 7);
        const isDeptMatch = e.bidang === ind.bidang;
        const isMonthMatch = entryMonth === ind.periodeBulan;
        const isKpiMatch = e.indikatorKpi && e.indikatorKpi.trim().toLowerCase() === ind.namaIndikator.trim().toLowerCase();
        const isDone = e.status === 'Selesai';
        return isDeptMatch && isMonthMatch && isKpiMatch && isDone;
      }).length;

      const hasLinkedEntries = entries.some(
        (e) =>
          e.bidang === ind.bidang &&
          (e.tanggalMasuk || e.tanggal || '').substring(0, 7) === ind.periodeBulan &&
          e.indikatorKpi &&
          e.indikatorKpi.trim().toLowerCase() === ind.namaIndikator.trim().toLowerCase()
      );

      if (hasLinkedEntries && ind.realisasi !== completedCount) {
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

  resetAllToDefault(): void {
    localStorage.removeItem(WORK_ENTRIES_KEY);
    localStorage.removeItem(KPI_INDICATORS_KEY);
    localStorage.removeItem(AGENDA_ITEMS_KEY);
    this.saveWorkEntries(INITIAL_WORK_ENTRIES);
    this.saveKpiIndicators(INITIAL_KPI_INDICATORS);
    this.saveAgendaItems(INITIAL_AGENDA_ITEMS);

    // Seed Firestore
    INITIAL_WORK_ENTRIES.forEach((item) => firebaseDataService.saveWorkEntry(item));
    INITIAL_KPI_INDICATORS.forEach((ind) => firebaseDataService.saveKpiIndicator(ind));
    INITIAL_AGENDA_ITEMS.forEach((ag) => firebaseDataService.saveAgendaItem(ag));
  },
};
