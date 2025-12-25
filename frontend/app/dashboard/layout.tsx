"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Video,
  VideoOff,
  Settings,
  Menu,
  Bell,
  ChevronLeft,
  BarChart3,
  History,
  MapPin,
  User,
  FileText,
} from "lucide-react";
import { AlertToastContainer } from "@/components/AlertToast";
import NotificationPanel from "@/components/NotificationPanel";

// Separated Clock Component to prevent full Layout re-renders
function ClockWidget() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="text-right">
      <div className="text-2xl font-mono font-bold text-slate-900 tracking-tight">
        {currentTime ? formatTime(currentTime) : "--:--:--"}
      </div>
      <div className="text-[10px] text-slate-500">
        {currentTime ? formatDate(currentTime) : "Loading..."}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Sync camera state with AI Engine
    const checkCameraStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/status');
        const data = await res.json();
        if (data && typeof data.camera_active === 'boolean') {
          setCameraEnabled(data.camera_active);
          localStorage.setItem('smartapd-camera-enabled', String(data.camera_active));
        }
      } catch (err) {
        console.error('Failed to sync camera status:', err);
        // Fallback to localStorage if API fails
        const savedCameraState = localStorage.getItem('smartapd-camera-enabled');
        if (savedCameraState === 'false') {
          setCameraEnabled(false);
        }
      }
    };

    checkCameraStatus();
  }, []);

  // Toggle camera on/off
  const toggleCamera = async () => {
    // 1. Optimistic UI Update (Immediate)
    const previousValue = cameraEnabled;
    const newValue = !cameraEnabled;

    setCameraEnabled(newValue);
    localStorage.setItem('smartapd-camera-enabled', String(newValue));
    window.dispatchEvent(new CustomEvent('camera-toggle', { detail: newValue }));

    // 2. Call AI Engine API (Background)
    try {
      const endpoint = newValue ? 'start' : 'stop';
      const res = await fetch(`http://localhost:8000/camera/${endpoint}`, { method: 'POST' });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
    } catch (error) {
      console.error('Failed to toggle AI camera, reverting UI:', error);
      // Revert on failure
      setCameraEnabled(previousValue);
      localStorage.setItem('smartapd-camera-enabled', String(previousValue));
      window.dispatchEvent(new CustomEvent('camera-toggle', { detail: previousValue }));
    }
  };

  // Menu items - ALL navigation here (no duplicate tabs)
  const menuItems = [
    { icon: Video, label: "Monitor Utama", href: "/dashboard" },
    { icon: BarChart3, label: "Analisis & Laporan", href: "/dashboard/analytics" },
    { icon: History, label: "Riwayat Kejadian", href: "/dashboard/alerts" },
    { icon: MapPin, label: "Peta Lokasi", href: "/dashboard/map" },
    { icon: Settings, label: "Pengaturan", href: "/dashboard/settings" },
    { icon: User, label: "Profil", href: "/dashboard/profile" },
  ];

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/40 text-slate-900 overflow-hidden font-sans">

        {/* SIDEBAR - Gradient Orange to Green */}
        <aside
          className={`relative transition-all duration-300 flex flex-col z-20 ${collapsed ? "w-16" : "w-64"}`}
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-orange-600/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-600/20 to-transparent"></div>
            <div className="absolute top-1/3 left-0 right-0 h-1/3 bg-gradient-to-b from-orange-500/10 via-transparent to-emerald-500/10"></div>
          </div>

          {/* Sidebar Content */}
          <div className="relative z-10 flex flex-col h-full">

            {/* Sidebar Header - Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
              {!collapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-orange-500/50 shadow-lg">
                    <Image
                      src="/images/logo.jpg"
                      alt="SmartAPD Logo"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-base font-bold tracking-tight text-white leading-none">
                      Smart<span className="text-orange-500">APD</span>
                    </h1>
                    <div className="text-[9px] text-orange-400 tracking-widest font-mono uppercase">Command Center</div>
                  </div>
                </div>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>

            {/* Menu Utama Section */}
            {!collapsed && (
              <div className="px-4 pt-6 pb-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Menu Utama</p>
              </div>
            )}

            <nav className="px-2 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive
                      ? "bg-orange-500/20 text-orange-400 border-l-4 border-orange-500"
                      : "text-slate-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
                      }`}
                  >
                    <item.icon size={20} className={isActive ? "text-orange-400" : "text-slate-500 group-hover:text-white"} />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer - System Status */}
            <div className="p-4 border-t border-white/10 mt-auto">
              <div className="flex items-center justify-between">
                {!collapsed && (
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">System Status</span>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></span>
                  {!collapsed && <span className="text-xs text-emerald-400 font-mono">ONLINE</span>}
                </div>
              </div>
              {!collapsed && (
                <div className="mt-2 text-[10px] text-slate-600 font-mono">
                  © 2024 SmartAPD • ENT V2.0
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col relative overflow-hidden">

          {/* TOP HEADER - Clean, optimized for performance */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0 shadow-sm">

            {/* Left - Page Title */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                COMMAND CENTER
              </h2>
            </div>

            {/* Right - Camera Toggle & Time & User */}
            <div className="flex items-center gap-6">

              {/* Camera Toggle */}
              <button
                onClick={toggleCamera}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${cameraEnabled
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
              >
                {cameraEnabled ? (
                  <>
                    <Video className="w-4 h-4" />
                    <span>AI CAMERA</span>
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">ON</span>
                  </>
                ) : (
                  <>
                    <VideoOff className="w-4 h-4" />
                    <span>Camera</span>
                    <span className="ml-1 px-1.5 py-0.5 bg-red-500/20 text-red-600 rounded text-[10px]">OFF</span>
                  </>
                )}
              </button>

              <div className="h-8 w-px bg-slate-200"></div>

              {/* Time Widget */}
              <ClockWidget />

              <div className="h-10 w-px bg-slate-200"></div>

              {/* Notifications - Linked to Alerts (Unified Incident Center) */}
              <NotificationPanel />

              {/* User Profile - Linked */}
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 pl-2 border-l border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer p-2 -m-2"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">Administrator</p>
                  <p className="text-[10px] text-slate-500">HSE Supervisor</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg">
                  AD
                </div>
              </Link>
            </div>
          </header>

          {/* SCROLLABLE CONTENT AREA */}
          <div className="flex-1 overflow-auto p-6 scrollbar-hide">
            {children}
          </div>
        </main>
      </div>

      {/* Alert Toast Container for violation pop-ups */}
      <AlertToastContainer maxAlerts={3} />
    </>
  );
}
