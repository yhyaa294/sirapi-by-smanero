"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Search, User, Zap, Activity } from "lucide-react";

import ThemeToggle from "../ThemeToggle";

export default function Topbar() {
  const pathname = usePathname();
  
  // Generate breadcrumb based on path
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");
    
    // Translation Dictionary for Breadcrumbs
    const translations: { [key: string]: string } = {
      "Dashboard": "Ringkasan",
      "Overview": "Ringkasan",
      "Monitoring": "Pantauan CCTV",
      "Alerts": "Riwayat Bahaya",
      "Reports": "Laporan",
      "Settings": "Pengaturan"
    };

    if (translations[label]) {
        label = translations[label];
    }

    return {
      label: label,
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 px-6 backdrop-blur-sm shadow-sm dark:shadow-md transition-colors duration-300">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm pl-12 lg:pl-0">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className={`font-medium ${
                crumb.isLast ? "text-slate-900 dark:text-slate-200" : "text-slate-500 dark:text-slate-500"
              }`}
            >
              {crumb.label}
            </span>
            {!crumb.isLast && <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600" />}
          </div>
        ))}
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Search Bar - Hidden on small mobile */}
        <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Cari Kamera atau Zona..." 
              className="h-9 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
            />
        </div>

        {/* System Health Widget */}
        <div className="hidden items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-500 xl:flex border border-emerald-500/20 cursor-help" title="Latensi Server">
          <Activity className="h-3 w-3" />
          <span>Sistem: 12ms</span>
          <span className="relative flex h-2 w-2 ml-1">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Quick Action: Emergency Report */}
            <button className="flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] dark:shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                <Zap className="h-3 w-3" />
                <span className="hidden sm:inline">DARURAT</span>
            </button>

          {/* Notifications */}
          <button className="relative rounded-full bg-slate-100 dark:bg-slate-800/50 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700/50">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700/50 pl-4">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Admin Petugas</p>
              <p className="text-xs text-slate-500">Divisi K3</p>
            </div>
            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-800 hover:ring-slate-200 dark:hover:ring-slate-600 transition-all">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
