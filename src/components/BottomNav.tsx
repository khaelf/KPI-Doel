import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Target,
  FileBarChart,
  Calendar,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'dashboard' | 'catatan' | 'kpi' | 'agenda' | 'laporan';
  setActiveTab: (tab: 'dashboard' | 'catatan' | 'kpi' | 'agenda' | 'laporan') => void;
  deadlineCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  deadlineCount = 0,
}) => {
  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'catatan' as const,
      label: 'Catatan',
      icon: ClipboardList,
      badge: deadlineCount > 0 ? deadlineCount : undefined,
    },
    {
      id: 'kpi' as const,
      label: 'KPI',
      icon: Target,
    },
    {
      id: 'agenda' as const,
      label: 'Agenda',
      icon: Calendar,
    },
    {
      id: 'laporan' as const,
      label: 'Laporan',
      icon: FileBarChart,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Ponsel"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1b4332]/95 backdrop-blur-md border-t border-emerald-800/80 shadow-[0_-4px_25px_rgba(0,0,0,0.3)] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-1 px-2 no-print select-none"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-150 min-w-[56px] ${
                isActive
                  ? 'text-white font-bold scale-105'
                  : 'text-emerald-200/70 hover:text-emerald-100 hover:bg-emerald-800/30'
              }`}
            >
              {/* Active pill background behind icon */}
              <div
                className={`p-1 rounded-lg transition-colors relative ${
                  isActive ? 'bg-emerald-600/90 text-white shadow-xs' : 'text-current'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold font-mono min-w-[14px] h-[14px] rounded-full flex items-center justify-center border border-[#1b4332] shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-emerald-200' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
