import React, { useState, useEffect } from 'react';
import { WorkEntry, KpiIndicator, Department, TaskStatus } from './types/kpi';
import { storageService } from './services/storage';
import { firebaseDataService } from './services/firebase';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { WorkLogView } from './components/WorkLogView';
import { KpiMonthlyView } from './components/KpiMonthlyView';
import { ReportView } from './components/ReportView';
import { WorkEntryModal } from './components/WorkEntryModal';
import { KpiIndicatorModal } from './components/KpiIndicatorModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catatan' | 'kpi' | 'laporan'>('dashboard');
  const [selectedDepartment, setSelectedDepartment] = useState<'Semua' | Department>('Semua');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [catatanStatusFilter, setCatatanStatusFilter] = useState<'Semua' | TaskStatus>('Semua');

  const handleNavigateToCatatanWithStatus = (filter: 'Semua' | TaskStatus) => {
    setCatatanStatusFilter(filter);
    setActiveTab('catatan');
  };

  // Data State
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [kpiIndicators, setKpiIndicators] = useState<KpiIndicator[]>([]);

  // Modal States
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [editingWorkEntry, setEditingWorkEntry] = useState<WorkEntry | null>(null);

  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [editingKpiIndicator, setEditingKpiIndicator] = useState<KpiIndicator | null>(null);
  const [kpiModalDept, setKpiModalDept] = useState<Department>('Humas');

  // Load initial data & subscribe to real-time Firestore updates
  useEffect(() => {
    // Initial local cache load
    const initialEntries = storageService.getWorkEntries();
    const initialIndicators = storageService.getKpiIndicators();
    setWorkEntries(initialEntries);
    setKpiIndicators(initialIndicators);

    // Realtime Firestore listeners
    const unsubscribeWork = firebaseDataService.subscribeWorkEntries((fsEntries) => {
      if (fsEntries && fsEntries.length > 0) {
        setWorkEntries(fsEntries);
        storageService.saveWorkEntries(fsEntries);
      }
    });

    const unsubscribeKpi = firebaseDataService.subscribeKpiIndicators((fsIndicators) => {
      if (fsIndicators && fsIndicators.length > 0) {
        setKpiIndicators(fsIndicators);
        storageService.saveKpiIndicators(fsIndicators);
      }
    });

    return () => {
      unsubscribeWork();
      unsubscribeKpi();
    };
  }, []);

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
    // Optimistic immediate update to local state
    setWorkEntries([...storageService.getWorkEntries()]);

    // If entry date belongs to a different month than currently selected, switch month to view it
    const entryMonth = (data.tanggalMasuk || data.tanggal || '').substring(0, 7);
    if (entryMonth && entryMonth !== selectedMonth) {
      setSelectedMonth(entryMonth);
    }

    setEditingWorkEntry(null);
  };

  // Handler: Work Entry Status Change
  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    let persentase = 50;
    if (newStatus === 'Selesai') persentase = 100;
    if (newStatus === 'Belum dikerjakan') persentase = 0;

    storageService.updateWorkEntry(id, { status: newStatus, persentase });
    setWorkEntries([...storageService.getWorkEntries()]);
  };

  // Handler: Work Entry Delete
  const handleDeleteWorkEntry = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan pekerjaan ini?')) {
      storageService.deleteWorkEntry(id);
      setWorkEntries([...storageService.getWorkEntries()]);
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
    setEditingKpiIndicator(null);
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
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onOpenAddModal={() => {
          setEditingWorkEntry(null);
          setIsWorkModalOpen(true);
        }}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            workEntries={workEntries}
            kpiIndicators={kpiIndicators}
            selectedMonth={selectedMonth}
            selectedDepartment={selectedDepartment}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onNavigateToCatatanWithStatus={handleNavigateToCatatanWithStatus}
            onOpenAddModal={() => {
              setEditingWorkEntry(null);
              setIsWorkModalOpen(true);
            }}
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
            onAddEntry={() => {
              setEditingWorkEntry(null);
              setIsWorkModalOpen(true);
            }}
            onEditEntry={(entry) => {
              setEditingWorkEntry(entry);
              setIsWorkModalOpen(true);
            }}
            onDeleteEntry={handleDeleteWorkEntry}
            onStatusChange={handleStatusChange}
          />
        )}

        {activeTab === 'kpi' && (
          <KpiMonthlyView
            kpiIndicators={kpiIndicators}
            selectedMonth={selectedMonth}
            selectedDepartment={selectedDepartment}
            onAddIndicator={(dept) => {
              setEditingKpiIndicator(null);
              setKpiModalDept(dept);
              setIsKpiModalOpen(true);
            }}
            onEditIndicator={(ind) => {
              setEditingKpiIndicator(ind);
              setIsKpiModalOpen(true);
            }}
            onDeleteIndicator={handleDeleteKpiIndicator}
            onQuickUpdateRealisasi={handleQuickUpdateRealisasi}
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
        onClose={() => setIsWorkModalOpen(false)}
        onSave={handleSaveWorkEntry}
        editingEntry={editingWorkEntry}
        defaultDepartment={selectedDepartment === 'Semua' ? 'Humas' : selectedDepartment}
        defaultMonth={selectedMonth}
        kpiIndicators={kpiIndicators}
      />

      {/* KPI Indicator Modal */}
      <KpiIndicatorModal
        isOpen={isKpiModalOpen}
        onClose={() => setIsKpiModalOpen(false)}
        onSave={handleSaveKpiIndicator}
        editingIndicator={editingKpiIndicator}
        defaultDepartment={kpiModalDept}
        defaultMonth={selectedMonth}
      />
      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
