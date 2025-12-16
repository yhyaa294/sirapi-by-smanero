"use client";

import { useState, useEffect } from "react";

interface RecentPage {
  path: string;
  label: string;
  timestamp: number;
}

const RECENT_PAGES_KEY = "smartapd_recent_pages";
const MAX_RECENT_PAGES = 5;

const pageLabels: Record<string, string> = {
  "/mobile": "Mobile Dashboard",
  "/dashboard": "Desktop Dashboard",
  "/monitoring": "CCTV Monitoring",
  "/alerts": "Alerts & Violations",
  "/reports": "Reports",
  "/admin": "Admin Panel",
  "/admin/cameras": "Camera Management",
  "/admin/workers": "Worker Management",
  "/admin/violations": "Violation Types",
  "/settings": "Settings",
};

export function useRecentPages() {
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_PAGES_KEY);
    if (stored) {
      setRecentPages(JSON.parse(stored));
    }
  }, []);

  const addRecentPage = (path: string) => {
    const label = pageLabels[path] || path.split("/").pop() || path;
    
    setRecentPages(prev => {
      const filtered = prev.filter(page => page.path !== path);
      const updated = [{ path, label, timestamp: Date.now() }, ...filtered];
      const limited = updated.slice(0, MAX_RECENT_PAGES);
      
      localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(limited));
      return limited;
    });
  };

  const clearRecentPages = () => {
    localStorage.removeItem(RECENT_PAGES_KEY);
    setRecentPages([]);
  };

  return {
    recentPages,
    addRecentPage,
    clearRecentPages,
  };
}
