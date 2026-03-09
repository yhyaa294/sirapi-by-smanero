"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MonitorPlay,
  Inbox, 
  ShieldAlert, 
  MessageSquare, 
  BrainCircuit, 
  Server, 
  Users, 
  School, 
  FileBarChart, 
  CreditCard, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronDown,
  ShieldCheck
} from "lucide-react";

const menuGroups = [
  {
    groupLabel: "Main Dashboard",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Live Command Center", href: "/dashboard/cctv", icon: MonitorPlay },
    ]
  },
  {
    groupLabel: "Operasional Tata Tertib",
    items: [
      { name: "Inbox Pelanggaran", href: "#inbox", icon: Inbox },
      { name: "Rule Engine", href: "#rule-engine", icon: ShieldAlert },
      { name: "Pusat Komunikasi", href: "#komunikasi", icon: MessageSquare },
    ]
  },
  {
    groupLabel: "AI Core & Infra",
    items: [
      { name: "AI Training Studio", href: "#ai-studio", icon: BrainCircuit },
      { name: "Hardware & IoT", href: "#hardware", icon: Server },
    ]
  },
  {
    groupLabel: "Data Master",
    items: [
      { name: "Direktori Entitas", href: "/dashboard/students", icon: Users },
      { name: "Manajemen Kelas", href: "/dashboard/classes", icon: School },
    ]
  },
  {
    groupLabel: "Administrasi",
    items: [
      { name: "Laporan & Analitik", href: "/dashboard/reports", icon: FileBarChart },
      { name: "Lisensi & Langganan", href: "#billing", icon: CreditCard },
      { name: "Pengaturan Sistem", href: "/dashboard/settings", icon: Settings },
    ]
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function Sidebar({ isOpen = false, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  // State accordion
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({
    0: true, 1: true, 2: true, 3: true, 4: true
  });

  const toggleGroup = (index: number) => {
    setOpenGroups(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        bg-white dark:bg-[#0f1117] border-r border-slate-200 dark:border-slate-800/60 
        h-screen fixed left-0 top-0 text-slate-600 dark:text-slate-400 
        flex flex-col z-40 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "w-[88px]" : "w-72"}
      `}>
        {/* Header Branding */}
        <div className={`
          h-20 px-6 flex items-center border-b border-slate-100 dark:border-slate-800/40
          ${isCollapsed ? "justify-center" : "justify-between"} transition-all
        `}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20 flex-shrink-0">
              <ShieldCheck size={24} className="text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden transition-opacity duration-300">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  Si<span className="text-indigo-600">Rapi</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Enterprise</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Navigation Wrapper */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-6 ${isCollapsed ? "px-3" : "px-4"}`}>
          <div className="space-y-6">
            {menuGroups.map((group, groupIdx) => {
              const isGroupOpen = openGroups[groupIdx];
              
              return (
                <div key={groupIdx} className="flex flex-col">
                  {/* Group Label / Accordion Header */}
                  {!isCollapsed ? (
                    <button 
                      onClick={() => toggleGroup(groupIdx)}
                      className="flex items-center justify-between w-full px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      <span>{group.groupLabel}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isGroupOpen ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <div className="w-full h-px bg-slate-200 dark:bg-slate-800/60 my-3 opacity-50" />
                  )}

                  {/* Sub Menu Links */}
                  <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${!isCollapsed && !isGroupOpen ? "max-h-0 opacity-0 hidden" : "max-h-[500px] opacity-100"}`}>
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => onClose?.()}
                          className={`
                            group relative flex items-center gap-3 rounded-xl transition-all duration-200 font-medium
                            ${isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-3 py-2.5"}
                            ${isActive
                              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                            }
                          `}
                        >
                          {isActive && !isCollapsed && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
                          )}
                          
                          <item.icon 
                            strokeWidth={isActive ? 2.5 : 2} 
                            size={isCollapsed ? 22 : 20} 
                            className={`flex-shrink-0 transition-colors ${
                              isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-indigo-500"
                            }`} 
                          />
                          
                          {!isCollapsed && (
                            <span className="text-[14px] leading-none whitespace-nowrap">{item.name}</span>
                          )}

                          {/* Tooltip on Collapsed State */}
                          {isCollapsed && (
                            <div className="absolute left-14 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl translate-x-1 group-hover:translate-x-0 transition-all duration-200">
                              {item.name}
                              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45" />
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Profile / Actions Bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-2 bg-slate-50/50 dark:bg-[#0f1117]/50">
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">AD</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">Admin SiRapi</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">admin@sekolah.sch.id</span>
              </div>
            </div>
          )}

          <Link 
            href="/" 
            className={`
              flex items-center gap-3 rounded-xl transition-colors font-medium text-slate-500 dark:text-slate-400 
              hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10 dark:hover:text-red-400
              ${isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-3 py-2.5"}
            `}
          >
            <LogOut size={isCollapsed ? 22 : 20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-[14px] leading-none">Keluar Sistem</span>}
          </Link>

          {/* Toggle Sidebar Collapse */}
          <button
            onClick={toggleCollapse}
            className={`
               hidden lg:flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all
               ${isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-3 py-2.5 justify-between"}
            `}
          >
            {!isCollapsed && <span className="text-[14px] font-medium">Sembunyikan Menu</span>}
            <ChevronLeft size={isCollapsed ? 22 : 20} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
      </aside>
    </>
  );
}
