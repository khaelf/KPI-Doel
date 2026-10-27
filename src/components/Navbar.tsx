import React from 'react';
import { Department } from '../types/kpi';
import {
  LayoutDashboard,
  ClipboardList,
  Target,
  FileBarChart,
  RefreshCw,
  PlusCircle,
  Building2,
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
      {/* Top Banner & Brand */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-emerald-800/60">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/40 border border-emerald-400/30 flex items-center justify-center text-white shrink-0">
              <Building2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  Parabek KPI System
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-900/80 border border-emerald-600/50 rounded-md text-emerald-200">
                  Humas & IT
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 font-medium">
                Pondok Pesantren Sumatera Thawalib Parabek
              </p>
            </div>
          </div>

          {/* Quick Selectors & Controls (Removed "+ Tambah Pekerjaan" button per user request) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Department Filter Toggle */}
            <div className="bg-emerald-900/80 p-1 rounded-lg border border-emerald-700/50 flex items-center gap-1 text-xs">
              {(['Semua', 'Humas', 'IT'] as const).map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    selectedDepartment === dept
                      ? 'bg-emerald-500 text-white shadow-sm font-semibold'
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
                className="bg-emerald-900/80 border border-emerald-700/60 text-emerald-100 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800/60 rounded-lg transition-colors"
              title="Muat Ulang Data Sampel Parabek"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Main Navigation Tabs (Desktop & Tablet) */}
        <nav className="flex items-center gap-2 overflow-x-auto py-2 text-xs font-medium scrollbar-none">
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

      {/* Mobile Bottom Bar for smartphone view */}
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
