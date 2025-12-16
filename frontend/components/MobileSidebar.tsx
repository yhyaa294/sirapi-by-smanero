"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Menu, X, Activity, Camera, Bell, Users, Settings, 
  LogOut, ChevronRight, Home, BarChart3, Search, Star, Calendar,
  ClipboardList, BookOpen, LifeBuoy
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RecentPagesSection from "./RecentPagesSection";
import SidebarSearch from "./SidebarSearch";
import ThemeToggle from "./ThemeToggle";
import { useFavorites } from "@/hooks/useFavorites";

type MobileSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export default function MobileSidebar({ isOpen, onToggle, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  // Swipe gesture handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);
    
    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && !isOpen) {
        // Swipe right to open
        onToggle();
      } else if (deltaX < 0 && isOpen) {
        // Swipe left to close
        onClose();
      }
    }
  };

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    sidebar.addEventListener('touchstart', handleTouchStart, { passive: true });
    sidebar.addEventListener('touchmove', handleTouchMove, { passive: true });
    sidebar.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      sidebar.removeEventListener('touchstart', handleTouchStart);
      sidebar.removeEventListener('touchmove', handleTouchMove);
      sidebar.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, onToggle, onClose]);

  const menuItems = [
    { 
      icon: Activity, 
      label: "Overview Mobile", 
      href: "/mobile", 
      description: "Dashboard Mandor" 
    },
    { 
      icon: Home, 
      label: "Dashboard Desktop", 
      href: "/dashboard", 
      description: "Full Dashboard" 
    },
    { 
      icon: Camera, 
      label: "CCTV Monitoring", 
      href: "/monitoring", 
      description: "Live Camera Feed" 
    },
    { 
      icon: Bell, 
      label: "Alerts & Violations", 
      href: "/alerts", 
      description: "Pelanggaran Terbaru" 
    },
    { 
      icon: BarChart3, 
      label: "Reports", 
      href: "/reports", 
      description: "Laporan & Analytics" 
    },
    { 
      icon: Users, 
      label: "Admin Panel", 
      href: "/admin", 
      description: "Kelola Data" 
    },
    { 
      icon: Settings, 
      label: "Settings", 
      href: "/settings", 
      description: "Pengaturan Sistem" 
    },
    {
      icon: Calendar,
      label: "Tim & Shift",
      href: "/teams",
      description: "Penjadwalan Mandor"
    },
    {
      icon: ClipboardList,
      label: "Checklist Lapangan",
      href: "/checklists",
      description: "Checklist APD Harian"
    },
    {
      icon: BookOpen,
      label: "Panduan & SOP",
      href: "/guides",
      description: "Dokumentasi & SOP"
    },
    {
      icon: LifeBuoy,
      label: "Support Center",
      href: "/support",
      description: "Bantuan & Kontak"
    }
  ];

  const { favorites } = useFavorites();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    window.location.href = "/";
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} touch-pan-y
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-green-500 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">SmartAPD™</h2>
                <p className="text-xs opacity-90">Mobile Navigation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* User Info */}
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">ADMIN2024</p>
                <p className="text-xs opacity-80">Administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <SidebarSearch onClose={onClose} />

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              ⭐ Favorites
            </h3>
            <div className="space-y-1">
              {favorites.map((fav) => (
                <Link
                  key={fav.path}
                  href={fav.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
                    pathname === fav.path 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{fav.icon}</span>
                  <span className="flex-1 truncate">{fav.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Pages */}
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Recent Pages
          </h3>
          <RecentPagesSection />
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group
                  ${isActive(item.href) 
                    ? 'bg-orange-50 border-l-4 border-orange-500 text-orange-700' 
                    : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-lg transition-colors
                  ${isActive(item.href) 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }
                `}>
                  <item.icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className={`font-semibold text-sm ${isActive(item.href) ? 'text-orange-700' : ''}`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
                
                <ChevronRight className={`
                  w-4 h-4 transition-transform
                  ${isActive(item.href) ? 'text-orange-500' : 'text-gray-400'}
                `} />
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <div className="p-2 bg-red-100 rounded-lg">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm">Logout</div>
              <div className="text-xs text-red-500">Keluar dari sistem</div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
