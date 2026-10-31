import { WorkEntry, KpiIndicator, AgendaItem, Department } from '../types/kpi';
import { INITIAL_WORK_ENTRIES, INITIAL_KPI_INDICATORS, INITIAL_AGENDA_ITEMS } from '../data/initialData';
import { firebaseDataService, testFirestoreConnection } from './firebase';

const WORK_ENTRIES_KEY = 'parabek_kpi_work_entries_v1';
const KPI_INDICATORS_KEY = 'parabek_kpi_indicators_v5';
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
      let list: KpiIndicator[];
      if (!data) {
        list = INITIAL_KPI_INDICATORS;
        this.saveKpiIndicators(list);
        INITIAL_KPI_INDICATORS.forEach((ind) => firebaseDataService.saveKpiIndicator(ind));
        return list;
      } else {
        list = JSON.parse(data);
      }

      // Sanitize indicators per user requests:
      // Humas: strictly 4 indicators (Dokumentasi Kegiatan, Desain Grafis, Pembuatan Konten Medsos, Publikasi Berita)
      const allowedHumas = [
        'dokumentasi kegiatan',
        'desain grafis',
        'pembuatan konten medsos',
        'publikasi berita',
      ];

      let modified = false;
      const sanitized = list.filter((ind) => {
        const nameLower = ind.namaIndikator.trim().toLowerCase();
        if (ind.bidang === 'Humas') {
          if (nameLower === 'pembuatan konten media sosial') {
            ind.namaIndikator = 'Pembuatan Konten Medsos';
            modified = true;
            return true;
          }
          if (!allowedHumas.includes(nameLower)) {
            // Remove items 5-7 (Pengelolaan media komunikasi, duplicate Desain grafis, Pelatihan)
            modified = true;
            return false;
          }
        }
        if (ind.bidang === 'Umum') {
          if (
            nameLower === 'pelayanan & administrasi umum' ||
            nameLower === 'pelayanan dan administrasi umum'
          ) {
            ind.namaIndikator = 'Insidentil';
            modified = true;
          }
        }
        return true;
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
    const indicators = this.getKpiIndicators();
    // Unique months present in indicators
    const months = Array.from(new Set(indicators.map((i) => i.periodeBulan)));
    if (!months.includes(indicator.periodeBulan)) {
      months.push(indicator.periodeBulan);
    }

    let returnedInd: KpiIndicator | null = null;
    months.forEach((m) => {
      const newInd: KpiIndicator = {
        ...indicator,
        periodeBulan: m,
        realisasi: m === indicator.periodeBulan ? indicator.realisasi : 0,
        id: 'ind-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      };
      indicators.push(newInd);
      firebaseDataService.saveKpiIndicator(newInd);
      if (m === indicator.periodeBulan) {
        returnedInd = newInd;
      }
    });

    this.saveKpiIndicators(indicators);
    return returnedInd || indicators[indicators.length - 1];
  },

  updateKpiIndicator(id: string, updated: Partial<KpiIndicator>): KpiIndicator | null {
    const indicators = this.getKpiIndicators();
    const index = indicators.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const targetInd = indicators[index];
    const oldName = targetInd.namaIndikator.trim().toLowerCase();
    const bidang = targetInd.bidang;

    // Synchronize indicator name and unit (satuan) across months to maintain uniform catalog
    // NOTE: Target is specific to each month and must NOT be synced across months (user can customize target per month)
    if (updated.namaIndikator !== undefined || updated.satuan !== undefined) {
      indicators.forEach((ind) => {
        if (ind.bidang === bidang && ind.namaIndikator.trim().toLowerCase() === oldName) {
          if (updated.namaIndikator !== undefined) ind.namaIndikator = updated.namaIndikator;
          if (updated.satuan !== undefined) ind.satuan = updated.satuan;
          firebaseDataService.updateKpiIndicator(ind.id, {
            namaIndikator: ind.namaIndikator,
            satuan: ind.satuan,
          });
        }
      });
    }

    // Apply updates (including target, realisasi, etc.) specifically to this monthly indicator
    indicators[index] = { ...indicators[index], ...updated };
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

  /**
   * Ensures that KPI indicators are present and standardized for any given month (Request 1: indikator KPI disamakan setiap bulan)
   */
  ensureKpiIndicatorsForMonth(month: string, allWorkEntries?: WorkEntry[]): KpiIndicator[] {
    if (!month) return this.getKpiIndicators();
    const indicators = this.getKpiIndicators();
    const entries = allWorkEntries || this.getWorkEntries();

    // Collect all master indicators (from initial data + existing indicators across all months)
    const masterMap = new Map<string, { bidang: Department; namaIndikator: string; satuan: string; target: number }>();

    // Seed from INITIAL_KPI_INDICATORS templates
    INITIAL_KPI_INDICATORS.forEach((ind) => {
      masterMap.set(`${ind.bidang}:${ind.namaIndikator.trim().toLowerCase()}`, {
        bidang: ind.bidang,
        namaIndikator: ind.namaIndikator,
        satuan: ind.satuan,
        target: ind.target,
      });
    });

    // Also pick up any user added indicators
    indicators.forEach((ind) => {
      masterMap.set(`${ind.bidang}:${ind.namaIndikator.trim().toLowerCase()}`, {
        bidang: ind.bidang,
        namaIndikator: ind.namaIndikator,
        satuan: ind.satuan,
        target: ind.target,
      });
    });

    let changed = false;
    const currentMonthIndicators = indicators.filter((i) => i.periodeBulan === month);

    masterMap.forEach((master) => {
      const existing = currentMonthIndicators.find(
        (i) => i.bidang === master.bidang && i.namaIndikator.trim().toLowerCase() === master.namaIndikator.trim().toLowerCase()
      );

      // Calculate completed entries for this indicator in this month
      const completedCount = entries.filter((e) => {
        const isDeptMatch = e.bidang === master.bidang;
        const isKpiMatch = e.indikatorKpi && e.indikatorKpi.trim().toLowerCase() === master.namaIndikator.trim().toLowerCase();
        const isDone = e.status === 'Selesai';
        const doneMonth = (e.tanggalSelesai || e.tanggalMulai || e.tanggalMasuk || e.tanggal || '').substring(0, 7);
        return isDeptMatch && isKpiMatch && isDone && doneMonth === month;
      }).length;

      if (!existing) {
        // Create indicator for this month
        const newInd: KpiIndicator = {
          id: `ind-${master.bidang.toLowerCase()}-${month}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          bidang: master.bidang,
          namaIndikator: master.namaIndikator,
          satuan: master.satuan,
          target: master.target,
          realisasi: completedCount,
          periodeBulan: month,
        };
        indicators.push(newInd);
        changed = true;
        firebaseDataService.saveKpiIndicator(newInd);
      } else {
        // DO NOT overwrite existing.target - targets can be customized per month according to monthly needs!
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
    return indicators;
  },

  recalculateKpiRealisasi(allWorkEntries?: WorkEntry[]): KpiIndicator[] {
    const entries = allWorkEntries || this.getWorkEntries();
    const indicators = this.getKpiIndicators();
    let changed = false;

    const updatedIndicators = indicators.map((ind) => {
      // Find all completed work entries linked to this indicator for department and month
      const completedCount = entries.filter((e) => {
        const isDeptMatch = e.bidang === ind.bidang;
        const isKpiMatch = e.indikatorKpi && e.indikatorKpi.trim().toLowerCase() === ind.namaIndikator.trim().toLowerCase();
        const isDone = e.status === 'Selesai';
        const doneMonth = (e.tanggalSelesai || e.tanggalMulai || e.tanggalMasuk || e.tanggal || '').substring(0, 7);
        return isDeptMatch && isKpiMatch && isDone && doneMonth === ind.periodeBulan;
      }).length;

      const hasLinkedEntries = entries.some(
        (e) =>
          e.bidang === ind.bidang &&
          (e.tanggalSelesai || e.tanggalMulai || e.tanggalMasuk || '').substring(0, 7) === ind.periodeBulan &&
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
