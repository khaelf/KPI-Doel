import React, { useState, useEffect } from 'react';
import { WorkEntry, KpiIndicator, AgendaItem, AgendaStatus, Department, TaskStatus } from './types/kpi';
import { storageService } from './services/storage';
import { firebaseDataService } from './services/firebase';
import { isWorkEntryInMonth } from './utils/kpiCalculations';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { WorkLogView } from './components/WorkLogView';
import { KpiMonthlyView } from './components/KpiMonthlyView';
import { AgendaView } from './components/AgendaView';
import { ReportView } from './components/ReportView';
import { WorkEntryModal } from './components/WorkEntryModal';
import { KpiIndicatorModal } from './components/KpiIndicatorModal';
import { AgendaModal } from './components/AgendaModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catatan' | 'kpi' | 'agenda' | 'laporan'>('dashboard');
  const [selectedDepartment, setSelectedDepartment] = useState<'Semua' | Department>('Semua');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [catatanStatusFilter, setCatatanStatusFilter] = useState<'Semua' | TaskStatus>('Semua');
  const [showDeadlineOnly, setShowDeadlineOnly] = useState<boolean>(false);

  // Data State
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [kpiIndicators, setKpiIndicators] = useState<KpiIndicator[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);

  // Modal States
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [editingWorkEntry, setEditingWorkEntry] = useState<WorkEntry | null>(null);

  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [editingKpiIndicator, setEditingKpiIndicator] = useState<KpiIndicator | null>(null);
  const [kpiModalDept, setKpiModalDept] = useState<Department>('Humas');

  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null);

  // Sync state with browser History API so mobile/browser Back button returns to previous screen/modal
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ activeTab: 'dashboard', modal: null }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        if (e.state.activeTab) {
          setActiveTab(e.state.activeTab);
        }
        setIsWorkModalOpen(e.state.modal === 'work');
        setIsKpiModalOpen(e.state.modal === 'kpi');
        setIsAgendaModalOpen(e.state.modal === 'agenda');
      } else {
        setActiveTab('dashboard');
        setIsWorkModalOpen(false);
        setIsKpiModalOpen(false);
        setIsAgendaModalOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeTab = (tab: 'dashboard' | 'catatan' | 'kpi' | 'agenda' | 'laporan') => {
    if (activeTab !== tab || isWorkModalOpen || isKpiModalOpen || isAgendaModalOpen) {
      setActiveTab(tab);
      setIsWorkModalOpen(false);
      setIsKpiModalOpen(false);
      setIsAgendaModalOpen(false);
      window.history.pushState({ activeTab: tab, modal: null }, '');
    }
  };

  const openWorkModal = (entry?: WorkEntry | null) => {
    setEditingWorkEntry(entry || null);
    setIsWorkModalOpen(true);
    window.history.pushState({ activeTab, modal: 'work' }, '');
  };

  const closeWorkModal = () => {
    setIsWorkModalOpen(false);
    setEditingWorkEntry(null);
    if (window.history.state?.modal === 'work') {
      window.history.back();
    }
  };

  const openKpiModal = (dept: Department, ind?: KpiIndicator | null) => {
    setEditingKpiIndicator(ind || null);
    setKpiModalDept(dept);
    setIsKpiModalOpen(true);
    window.history.pushState({ activeTab, modal: 'kpi' }, '');
  };

  const closeKpiModal = () => {
    setIsKpiModalOpen(false);
    setEditingKpiIndicator(null);
    if (window.history.state?.modal === 'kpi') {
      window.history.back();
    }
  };

  const openAgendaModal = (item?: AgendaItem | null) => {
    setEditingAgenda(item || null);
    setIsAgendaModalOpen(true);
    window.history.pushState({ activeTab, modal: 'agenda' }, '');
  };

  const closeAgendaModal = () => {
    setIsAgendaModalOpen(false);
    setEditingAgenda(null);
    if (window.history.state?.modal === 'agenda') {
      window.history.back();
    }
  };

  const handleNavigateToCatatanWithStatus = (filter: 'Semua' | TaskStatus) => {
    setCatatanStatusFilter(filter);
    setShowDeadlineOnly(false);
    changeTab('catatan');
  };

  const handleNavigateToDeadline = () => {
    setShowDeadlineOnly(true);
    setCatatanStatusFilter('Semua');
    changeTab('catatan');
  };

  // Load initial data & subscribe to real-time Firestore updates
  useEffect(() => {
    // Initial local cache load
    const initialEntries = storageService.getWorkEntries();
    const initialIndicators = storageService.getKpiIndicators();
    const initialAgendas = storageService.getAgendaItems();
    setWorkEntries(initialEntries);
    setKpiIndicators(initialIndicators);
    setAgendaItems(initialAgendas);

    // Realtime Firestore listeners across all devices
    let isInitialWorkSync = true;
    const unsubscribeWork = firebaseDataService.subscribeWorkEntries((fsEntries) => {
      if (fsEntries && fsEntries.length > 0) {
        setWorkEntries(fsEntries);
        storageService.saveWorkEntries(fsEntries);
      } else if (isInitialWorkSync) {
        // If Firestore is empty on first boot, seed initial entries to Firestore
        const localEntries = storageService.getWorkEntries();
        if (localEntries.length > 0) {
          localEntries.forEach((item) => firebaseDataService.saveWorkEntry(item));
        }
      } else {
        setWorkEntries([]);
        storageService.saveWorkEntries([]);
      }
      isInitialWorkSync = false;
    });

    let isInitialKpiSync = true;
    const unsubscribeKpi = firebaseDataService.subscribeKpiIndicators((fsIndicators) => {
      if (fsIndicators && fsIndicators.length > 0) {
        setKpiIndicators(fsIndicators);
        storageService.saveKpiIndicators(fsIndicators);
      } else if (isInitialKpiSync) {
        const localIndicators = storageService.getKpiIndicators();
        if (localIndicators.length > 0) {
          localIndicators.forEach((ind) => firebaseDataService.saveKpiIndicator(ind));
        }
      }
      isInitialKpiSync = false;
    });

    let isInitialAgendaSync = true;
    const unsubscribeAgenda = firebaseDataService.subscribeAgendaItems((fsAgendas) => {
      if (fsAgendas && fsAgendas.length > 0) {
        setAgendaItems(fsAgendas);
        storageService.saveAgendaItems(fsAgendas);
      } else if (isInitialAgendaSync) {
        const localAgendas = storageService.getAgendaItems();
        if (localAgendas.length > 0) {
          localAgendas.forEach((ag) => firebaseDataService.saveAgendaItem(ag));
        }
      }
      isInitialAgendaSync = false;
    });

    return () => {
      unsubscribeWork();
      unsubscribeKpi();
      unsubscribeAgenda();
    };
  }, []);

  // Whenever selectedMonth changes, ensure standard KPI indicators exist for that month (Request 1)
  useEffect(() => {
    if (selectedMonth) {
      const synced = storageService.ensureKpiIndicatorsForMonth(selectedMonth, workEntries);
      setKpiIndicators(synced);
    }
  }, [selectedMonth]);

  // Handler: Work Entry Save (Add or Edit)
  const handleSaveWorkEntry = (
    data: Omit<WorkEntry, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      storageService.updateWorkEntry(editingId, data);
    } else {
      storageService.addWorkEntry(data);
    }
    const currentEntries = storageService.getWorkEntries();
    setWorkEntries([...currentEntries]);

    // Auto-update KPI indicator realisasi for linked tasks
    const syncedIndicators = storageService.recalculateKpiRealisasi(currentEntries);
    setKpiIndicators(syncedIndicators);

    // If entry date belongs to a different month than currently selected, switch month to view it
    const entryMonth = (data.tanggalMasuk || data.tanggal || '').substring(0, 7);
    if (entryMonth && entryMonth !== selectedMonth) {
      setSelectedMonth(entryMonth);
    }

    closeWorkModal();
  };

  // Handler: Work Entry Status Change
  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    let persentase = 50;
    if (newStatus === 'Selesai') persentase = 100;
    if (newStatus === 'Belum dikerjakan') persentase = 0;

    storageService.updateWorkEntry(id, { status: newStatus, persentase });
    const currentEntries = storageService.getWorkEntries();
    setWorkEntries([...currentEntries]);

    // Auto-update KPI indicator realisasi when task status changes to Selesai
    const syncedIndicators = storageService.recalculateKpiRealisasi(currentEntries);
    setKpiIndicators(syncedIndicators);
  };

  // Handler: Work Entry Delete
  const handleDeleteWorkEntry = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan pekerjaan ini?')) {
      storageService.deleteWorkEntry(id);
      const currentEntries = storageService.getWorkEntries();
      setWorkEntries([...currentEntries]);

      // Auto-update KPI indicator realisasi upon task deletion
      const syncedIndicators = storageService.recalculateKpiRealisasi(currentEntries);
      setKpiIndicators(syncedIndicators);
    }
  };

  // Handler: KPI Indicator Save (Add or Edit)
  const handleSaveKpiIndicator = (
    data: Omit<KpiIndicator, 'id'>,
    editingId?: string
  ) => {
    if (editingId) {
      storageService.updateKpiIndicator(editingId, data);
    } else {
      storageService.addKpiIndicator(data);
    }
    setKpiIndicators([...storageService.getKpiIndicators()]);
    closeKpiModal();
  };

  // Handler: KPI Indicator Quick Update Realisasi
  const handleQuickUpdateRealisasi = (id: string, newRealisasi: number) => {
    storageService.updateKpiIndicator(id, { realisasi: newRealisasi });
    setKpiIndicators([...storageService.getKpiIndicators()]);
  };

  // Handler: KPI Indicator Delete
  const handleDeleteKpiIndicator = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus indikator KPI ini?')) {
      storageService.deleteKpiIndicator(id);
      setKpiIndicators([...storageService.getKpiIndicators()]);
    }
  };

  // Handler: Agenda Save (Add or Edit)
  const handleSaveAgenda = (
    data: Omit<AgendaItem, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      storageService.updateAgendaItem(editingId, data);
    } else {
      storageService.addAgendaItem(data);
    }
    setAgendaItems([...storageService.getAgendaItems()]);
    closeAgendaModal();
  };

  // Handler: Agenda Delete
  const handleDeleteAgenda = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus agenda kegiatan ini?')) {
      storageService.deleteAgendaItem(id);
      setAgendaItems([...storageService.getAgendaItems()]);
    }
  };

  // Handler: Agenda Quick Status Change
  const handleQuickStatusAgenda = (id: string, newStatus: AgendaStatus) => {
    storageService.updateAgendaItem(id, { status: newStatus });
    setAgendaItems([...storageService.getAgendaItems()]);
  };

  // Handler: Reset Data
  const handleResetData = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin memuat ulang sampel data awal Humas & IT Parabek? Seluruh perubahan lokal dan Firestore akan dikembalikan ke data default.'
      )
    ) {
      storageService.resetAllToDefault();
      setWorkEntries([...storageService.getWorkEntries()]);
      setKpiIndicators([...storageService.getKpiIndicators()]);
      setAgendaItems([...storageService.getAgendaItems()]);
    }
  };

  const todayStr = new Date().toISOString().substring(0, 10);
  const deadlineCount = workEntries.filter((entry) => {
    if (entry.status === 'Selesai') return false;
    const inMonth = !selectedMonth || isWorkEntryInMonth(entry, selectedMonth);
    const inDept = selectedDepartment === 'Semua' || entry.bidang === selectedDepartment;
    return inMonth && inDept && !!entry.tanggalAcara && entry.tanggalAcara <= todayStr;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={changeTab}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        deadlineCount={deadlineCount}
        onNavigateToDeadline={handleNavigateToDeadline}
        onOpenAddModal={() => openWorkModal(null)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-10 pt-3 sm:pt-6 pb-28 md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            workEntries={workEntries}
            kpiIndicators={kpiIndicators}
            agendaItems={agendaItems}
            selectedMonth={selectedMonth}
            selectedDepartment={selectedDepartment}
            onNavigateTab={(tab) => changeTab(tab)}
            onNavigateToCatatanWithStatus={handleNavigateToCatatanWithStatus}
            onOpenAddModal={() => openWorkModal(null)}
            onQuickUpdateStatus={handleStatusChange}
          />
        )}

        {activeTab === 'catatan' && (
          <WorkLogView
            workEntries={workEntries}
            selectedMonth={selectedMonth}
            selectedDepartment={selectedDepartment}
            statusFilter={catatanStatusFilter}
            setStatusFilter={setCatatanStatusFilter}
            showDeadlineOnly={showDeadlineOnly}
            setShowDeadlineOnly={setShowDeadlineOnly}
            onAddEntry={() => openWorkModal(null)}
            onEditEntry={(entry) => openWorkModal(entry)}
            onDeleteEntry={handleDeleteWorkEntry}
            onStatusChange={handleStatusChange}
          />
        )}

        {activeTab === 'kpi' && (
          <KpiMonthlyView
            kpiIndicators={kpiIndicators}
            workEntries={workEntries}
            selectedMonth={selectedMonth}
            selectedDepartment={selectedDepartment}
            onAddIndicator={(dept) => openKpiModal(dept, null)}
            onEditIndicator={(ind) => openKpiModal(ind.bidang, ind)}
            onDeleteIndicator={handleDeleteKpiIndicator}
            onQuickUpdateRealisasi={handleQuickUpdateRealisasi}
          />
        )}

        {activeTab === 'agenda' && (
          <AgendaView
            agendaItems={agendaItems}
            selectedMonth={selectedMonth}
            selectedDepartment={selectedDepartment}
            onAddAgenda={() => openAgendaModal(null)}
            onEditAgenda={(item) => openAgendaModal(item)}
            onDeleteAgenda={handleDeleteAgenda}
            onQuickStatusChange={handleQuickStatusAgenda}
          />
        )}

        {activeTab === 'laporan' && (
          <ReportView
            workEntries={workEntries}
            kpiIndicators={kpiIndicators}
            selectedMonth={selectedMonth}
            selectedDepartment={selectedDepartment}
          />
        )}
      </main>

      {/* Footer (No print) */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Pondok Pesantren Sumatera Thawalib Parabek · Bagian Humas & IT
          </span>
          <span className="text-[11px] text-emerald-700 font-medium flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Terhubung dengan Firebase Cloud Firestore
          </span>
        </div>
      </footer>

      {/* Work Entry Modal */}
      <WorkEntryModal
        isOpen={isWorkModalOpen}
        onClose={closeWorkModal}
        onSave={handleSaveWorkEntry}
        editingEntry={editingWorkEntry}
        defaultDepartment={selectedDepartment === 'Semua' ? 'Humas' : selectedDepartment}
        defaultMonth={selectedMonth}
        kpiIndicators={kpiIndicators}
      />

      {/* KPI Indicator Modal */}
      <KpiIndicatorModal
        isOpen={isKpiModalOpen}
        onClose={closeKpiModal}
        onSave={handleSaveKpiIndicator}
        editingIndicator={editingKpiIndicator}
        defaultDepartment={kpiModalDept}
        defaultMonth={selectedMonth}
      />

      {/* Agenda Modal */}
      <AgendaModal
        isOpen={isAgendaModalOpen}
        onClose={closeAgendaModal}
        onSave={handleSaveAgenda}
        editingAgenda={editingAgenda}
        defaultDepartment={selectedDepartment === 'Semua' ? 'Humas' : selectedDepartment}
        defaultDate={selectedMonth ? `${selectedMonth}-01` : undefined}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Sticky Bottom Navigation Bar on Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={changeTab}
        deadlineCount={deadlineCount}
      />
    </div>
  );
}

