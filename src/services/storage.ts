import { WorkEntry, KpiIndicator } from '../types/kpi';
import { INITIAL_WORK_ENTRIES, INITIAL_KPI_INDICATORS } from '../data/initialData';

const WORK_ENTRIES_KEY = 'parabek_kpi_work_entries_v1';
const KPI_INDICATORS_KEY = 'parabek_kpi_indicators_v1';

export const storageService = {
  getWorkEntries(): WorkEntry[] {
    try {
      const data = localStorage.getItem(WORK_ENTRIES_KEY);
      if (!data) {
        this.saveWorkEntries(INITIAL_WORK_ENTRIES);
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
    return newEntry;
  },

  updateWorkEntry(id: string, updated: Partial<WorkEntry>): WorkEntry | null {
    const entries = this.getWorkEntries();
    const index = entries.findIndex((item) => item.id === id);
    if (index === -1) return null;
    entries[index] = { ...entries[index], ...updated };
    this.saveWorkEntries(entries);
    return entries[index];
  },

  deleteWorkEntry(id: string): boolean {
    const entries = this.getWorkEntries();
    const filtered = entries.filter((item) => item.id !== id);
    if (filtered.length === entries.length) return false;
    this.saveWorkEntries(filtered);
    return true;
  },

  getKpiIndicators(): KpiIndicator[] {
    try {
      const data = localStorage.getItem(KPI_INDICATORS_KEY);
      if (!data) {
        this.saveKpiIndicators(INITIAL_KPI_INDICATORS);
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
    return newInd;
  },

  updateKpiIndicator(id: string, updated: Partial<KpiIndicator>): KpiIndicator | null {
    const indicators = this.getKpiIndicators();
    const index = indicators.findIndex((item) => item.id === id);
    if (index === -1) return null;
    indicators[index] = { ...indicators[index], ...updated };
    this.saveKpiIndicators(indicators);
    return indicators[index];
  },

  deleteKpiIndicator(id: string): boolean {
    const indicators = this.getKpiIndicators();
    const filtered = indicators.filter((item) => item.id !== id);
    if (filtered.length === indicators.length) return false;
    this.saveKpiIndicators(filtered);
    return true;
  },

  resetAllToDefault(): void {
    localStorage.removeItem(WORK_ENTRIES_KEY);
    localStorage.removeItem(KPI_INDICATORS_KEY);
    this.saveWorkEntries(INITIAL_WORK_ENTRIES);
    this.saveKpiIndicators(INITIAL_KPI_INDICATORS);
  },
};
