"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  Search,
  Shield,
  FileText,
  LogOut,
  Video,
  Send
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Users, label: "Students", href: "/dashboard/students" },
    { icon: GraduationCap, label: "Classes", href: "/dashboard/classes" },
    { icon: Video, label: "Live CCTV", href: "/dashboard/cctv" },
    { icon: FileText, label: "Reports", href: "/dashboard/reports" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] font-sans overflow-hidden">

      {/* SIDEBAR - GLASSMORPHISM STYLE */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: collapsed ? 90 : 260 }}
        className="relative z-30 m-4 flex flex-col transition-all duration-300 ease-in-out glass-card"
      >
        {/* 1. Logo Section */}
        <div className={`p-6 flex items-center ${collapsed ? "justify-center" : "justify-start"} min-h-[88px]`}>
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="w-10 h-10 flex items-center justify-center bg-primary rounded-xl shadow-glow text-white font-bold text-xl">
              .S
            </div>
            {/* Logo Text */}
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-800 leading-tight">SiRapi</span>
                <span className="text-xs text-slate-400 font-medium">Admin Panel</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto hide-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : ""}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative font-medium ${isActive
                  ? "bg-primary text-white shadow-glow"
                  : "hover:bg-primary/5 text-slate-500 hover:text-primary"
                  } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <div className="relative z-10 flex items-center justify-center">
                  <item.icon size={20} className={`flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-primary"}`} strokeWidth={isActive ? 2 : 1.5} />
                </div>

                {!collapsed && (
                  <span className="whitespace-nowrap overflow-hidden z-10">{item.label}</span>
                )}

                {/* Active Indicator Line for Collapsed State */}
                {collapsed && isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-md"></div>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl tracking-wide transition-all border border-slate-700">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 3. Collapse Toggle (Desktop) */}
        <div className="p-4 flex justify-center">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* 4. Navigation Toggle Placeholder */}
        <div className="flex-shrink-0 h-4"></div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden">

        {/* Top Header - Glass Layout */}
        <header className="h-20 px-8 flex items-center justify-between z-20 mx-4 mt-4 glass-card">

          {/* LEFT: Context Area */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-xl"
            >
              <Menu size={20} />
            </button>

            {/* Page Title */}
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-800">Dashboard</span>
              <span className="text-xs text-slate-500 font-medium">Welcome back, Admin</span>
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3 lg:gap-5">
            {/* Search (Desktop) */}
            <div className="relative hidden xl:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-11 pr-4 py-2.5 rounded-full bg-slate-100/50 border border-slate-200/60 text-sm text-slate-700 font-medium placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all w-64 shadow-inner"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-3 rounded-full bg-slate-100/50 border border-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-primary transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full border-2 border-white shadow-glow-critical"></span>
            </button>

            {/* Profile */}
            <div className="relative pl-2 border-l border-slate-200">
              <button className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-colors pr-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white shadow-soft overflow-hidden flex-shrink-0 p-0.5">
                  <img src="/school-logo.jpg" alt="User" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">Admin</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 hide-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
