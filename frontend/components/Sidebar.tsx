"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, AlertTriangle, FileText, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

const menuItems = [
  { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pantauan CCTV", href: "/dashboard/monitoring", icon: Camera },
  { name: "Riwayat Bahaya", href: "/dashboard/alerts", icon: AlertTriangle },
  { name: "Laporan K3", href: "/dashboard/reports", icon: FileText },
  { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function Sidebar({ isOpen = false, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/50 h-screen fixed left-0 top-0 
        text-slate-600 dark:text-slate-300 flex flex-col z-40 transition-all duration-300 ease-in-out shadow-xl
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "w-20" : "w-64"}
      `}>
        <div className={`p-6 flex items-center ${isCollapsed ? "justify-center" : "justify-between lg:justify-start gap-3"} transition-all bg-slate-50/50 dark:bg-slate-950/30`}>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg shadow-orange-500/20">S</div>
             {!isCollapsed && (
               <span className="text-xl font-bold text-slate-900 dark:text-white tracking-wider whitespace-nowrap overflow-hidden transition-opacity duration-300">
                 SMART<span className="text-orange-600 dark:text-orange-500">APD</span>
               </span>
             )}
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                title={isCollapsed ? item.name : ""}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 group relative font-medium ${
                  isActive 
                    ? "bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-500/20 dark:to-orange-500/5 text-orange-600 dark:text-orange-400 border-l-4 border-orange-500 shadow-sm dark:shadow-inner" 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
              >
                <item.icon size={22} className={`flex-shrink-0 transition-colors ${isActive ? "text-orange-600 dark:text-orange-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-slate-200 dark:border-slate-700 tracking-wide">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle Button (Desktop Only) */}
        <button 
          onClick={toggleCollapse}
          className="hidden lg:flex items-center justify-center p-4 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors border-t border-slate-200 dark:border-slate-800/50"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div className="p-2 border-t border-slate-200 dark:border-slate-800/50 lg:hidden">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium">
            <LogOut size={20} />
            <span>Keluar</span>
          </Link>
        </div>
        {/* Desktop Logout (Collapsed/Expanded handled) */}
         <div className="hidden lg:block p-2 border-t border-slate-200 dark:border-slate-800/50">
          <Link href="/" className={`flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-colors font-medium ${isCollapsed ? "justify-center" : ""}`}>
            <LogOut size={20} />
            {!isCollapsed && <span>Keluar</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
