"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  BarChart2,
  FileText,
  Layers,
  LogOut,
  Search,
  Bell,
  ChevronDown
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Navigation Items (Adapted from Edutera reference)
  const topNavItems = [
    { label: "Overview", href: "/dashboard" },
    { label: "Graph Performance", href: "/dashboard/analytics" },
    { label: "Revenue", href: "/dashboard/revenue" },     // Just as placeholder to match reference looks
    { label: "Schedule", href: "/dashboard/schedule" },   // Placeholder
  ];

  const sideMenu = [
    { icon: Home, href: "/dashboard", active: true },
    { icon: MessageCircle, href: "/dashboard/messages" },
    { icon: BarChart2, href: "/dashboard/analytics" },
    { icon: FileText, href: "/dashboard/reports" },
    { icon: Layers, href: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-[#F2F5F9] font-sans overflow-hidden">
      
      {/* 1. Left Dark Sidebar (Icon Sidebar) */}
      <aside className="w-[100px] bg-[#111625] h-[96%] my-auto ml-[20px] rounded-[32px] flex flex-col items-center py-8 shadow-xl relative z-20">
        
        {/* Top Logo */}
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-12 shadow-sm text-blue-600 font-black text-xl">
          ⚡
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 flex flex-col gap-6">
          {sideMenu.map((item, idx) => {
            const isActive = pathname === item.href || (idx===0 && pathname==='/dashboard');
            return (
              <Link 
                key={idx} 
                href={item.href}
                className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${
                  isActive ? 'bg-[#5F4BFF] text-white shadow-lg' : 'bg-transparent text-slate-500 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              </Link>
            )
          })}
        </nav>

        {/* Bottom Logout/Exit */}
        <Link 
          href="/"
          className="w-14 h-14 flex items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
        >
          <LogOut size={20} className="ml-1" />
        </Link>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 -ml-6">
        
        {/* Top Header Navigation */}
        <header className="h-[100px] mt-4 mr-4 px-12 flex items-center justify-between">
          
          {/* Title & Top Nav */}
          <div className="flex items-center gap-12">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight ml-4">SiRapi Dashboard</h1>
            
            <nav className="hidden lg:flex items-center gap-2">
              {topNavItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    idx === 0 
                      ? 'bg-transparent border border-slate-800 text-slate-800' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Actions: Search, Notify, Profile */}
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm hover:shadow-md transition">
              <Search size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm hover:shadow-md transition relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shadow-sm cursor-pointer ml-2">
              <img src="/school-logo.jpg" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Main Dashboard Pages injected here */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
