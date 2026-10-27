import React from 'react';
import { Department } from '../types/kpi';
import { PWAInstallButton } from './PWAInstallButton';
import {
  LayoutDashboard,
  ClipboardList,
  Target,
  FileBarChart,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'catatan' | 'kpi' | 'laporan';
  setActiveTab: (tab: 'dashboard' | 'catatan' | 'kpi' | 'laporan') => void;
  selectedDepartment: 'Semua' | Department;
  setSelectedDepartment: (dept: 'Semua' | Department) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onOpenAddModal: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedDepartment,
  setSelectedDepartment,
  selectedMonth,
  setSelectedMonth,
  onOpenAddModal,
  onResetData,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 bg-[#1b4332] text-white shadow-md">
      {/* Top Banner & Brand Container */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2 md:py-0 md:h-16 border-b border-emerald-800/60 gap-2">
          {/* Row 1: Brand & Mobile Quick Actions */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs border border-emerald-300/40">
                <img
                  src="/assets/aistudio/Logo_Humas_H-04_d71e1614.png"
                  alt="Logo Humas Parabek"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                KPI Staff Humas dan IT
              </h1>
            </div>

            {/* Mobile Quick Controls (PWA + Reset) */}
            <div className="flex md:hidden items-center gap-1.5">
              <PWAInstallButton />
              <button
                onClick={onResetData}
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800/60 rounded-lg transition-colors"
                title="Muat Ulang Data Sampel Parabek"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 2 on Mobile / Right side on Desktop: Filters & Controls */}
          <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
            {/* Department Filter Toggle */}
            <div className="bg-emerald-900/90 p-1 rounded-lg border border-emerald-700/60 flex items-center gap-1 text-[11px] sm:text-xs">
              {(['Semua', 'Humas', 'IT'] as const).map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    selectedDepartment === dept
                      ? 'bg-emerald-500 text-white shadow-xs font-bold'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Month Picker */}
            <div className="relative">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-emerald-900/90 border border-emerald-700/60 text-emerald-100 text-[11px] sm:text-xs rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Desktop-only PWA & Reset */}
            <div className="hidden md:flex items-center gap-2">
              <PWAInstallButton />
              <button
                onClick={onResetData}
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800/60 rounded-lg transition-colors"
                title="Muat Ulang Data Sampel Parabek"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Main Navigation Tabs (Desktop ONLY: hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-2 overflow-x-auto py-2 text-xs font-medium scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-white/10 text-white font-semibold border border-white/20'
                : 'text-emerald-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('catatan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'catatan'
                ? 'bg-white/10 text-white font-semibold border border-white/20'
                : 'text-emerald-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Catatan Kerja</span>
          </button>

          <button
            onClick={() => setActiveTab('kpi')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'kpi'
                ? 'bg-white/10 text-white font-semibold border border-white/20'
                : 'text-emerald-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>KPI Bulanan</span>
          </button>

          <button
            onClick={() => setActiveTab('laporan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'laporan'
                ? 'bg-white/10 text-white font-semibold border border-white/20'
                : 'text-emerald-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileBarChart className="w-4 h-4" />
            <span>Laporan</span>
          </button>
        </nav>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1b4332] border-t border-emerald-800 flex items-center justify-around py-2 px-2 shadow-lg no-print">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] ${
            activeTab === 'dashboard' ? 'text-emerald-300 font-bold' : 'text-emerald-200/70'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('catatan')}
          className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] ${
            activeTab === 'catatan' ? 'text-emerald-300 font-bold' : 'text-emerald-200/70'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span>Catatan</span>
        </button>

        <button
          onClick={() => setActiveTab('kpi')}
          className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] ${
            activeTab === 'kpi' ? 'text-emerald-300 font-bold' : 'text-emerald-200/70'
          }`}
        >
          <Target className="w-5 h-5" />
          <span>KPI</span>
        </button>

        <button
          onClick={() => setActiveTab('laporan')}
          className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] ${
            activeTab === 'laporan' ? 'text-emerald-300 font-bold' : 'text-emerald-200/70'
          }`}
        >
          <FileBarChart className="w-5 h-5" />
          <span>Laporan</span>
        </button>
      </div>
    </header>
  );
};
