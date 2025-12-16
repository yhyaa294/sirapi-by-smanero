"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  ShieldAlert,
  Video,
  FileText,
  Settings,
  Menu,
  Bell,
  User,
  ChevronLeft
} from "lucide-react";
import StatsTicker from "@/components/dashboard/enterprise/StatsTicker";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "THE PULSE", href: "/dashboard" },
    { icon: Map, label: "RISK MAP", href: "/dashboard/map" }, // Placeholder
    { icon: Video, label: "CAMERAS", href: "/cameras" },
    { icon: ShieldAlert, label: "INCIDENTS", href: "/alerts" },
    { icon: FileText, label: "REPORTS", href: "/reports" },
    { icon: Settings, label: "SYSTEM", href: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside
        className={`bg-surface border-r border-border transition-all duration-300 flex flex-col z-20 ${collapsed ? "w-16" : "w-64"
          }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border bg-surface-highlight">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-sm bg-primary/20 border border-primary flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white leading-none">SmartAPD</h1>
                <div className="text-[9px] text-primary tracking-widest font-mono">COMMAND CENTER</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-white/5 rounded text-foreground-muted"
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all group ${isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-foreground-muted hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                  }`}
              >
                <item.icon size={20} className={isActive ? "text-primary" : "text-foreground-dim group-hover:text-white"} />
                {!collapsed && (
                  <span className="text-xs font-bold tracking-wide">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border bg-surface-highlight/50">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center">
                <User size={16} className="text-foreground-dim" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">Supervisor HQ</p>
                <p className="text-[10px] text-safe font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-safe"></span> ONLINE
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-safe animate-pulse"></div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">

        {/* TOP HEADER */}
        <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 z-10 shrink-0">
          {/* Breadcrumbs / Page Title */}
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-primary">///</span> DASHBOARD OVERVIEW
            </h2>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {/* Time Widget */}
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white">15 MAR 2024</div>
                <div className="text-[10px] font-mono text-primary tracking-widest">14:32:45 UTC+7</div>
              </div>

              <div className="h-8 w-px bg-border"></div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-white/5 rounded-full text-foreground-muted hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full border border-surface"></span>
              </button>
            </div>
          </div>
        </header>

        {/* TICKER BAR */}
        <StatsTicker />

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 scrollbar-hide">
          {children}
        </div>
      </main>
    </div>
  );
}
