"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  description: string;
  keywords: string[];
}

const menuItems: MenuItem[] = [
  { label: "Mobile Dashboard", href: "/mobile", description: "Dashboard mandor", keywords: ["mobile", "mandor", "dashboard", "overview"] },
  { label: "Desktop Dashboard", href: "/dashboard", description: "Full desktop dashboard", keywords: ["desktop", "dashboard", "full"] },
  { label: "CCTV Monitoring", href: "/monitoring", description: "Live camera feed", keywords: ["cctv", "camera", "monitoring", "live"] },
  { label: "Alerts & Violations", href: "/alerts", description: "Pelanggaran keselamatan", keywords: ["alerts", "violations", "pelanggaran", "safety"] },
  { label: "Reports", href: "/reports", description: "Laporan dan analytics", keywords: ["reports", "laporan", "analytics", "data"] },
  { label: "Admin Panel", href: "/admin", description: "Kelola data sistem", keywords: ["admin", "management", "data", "crud"] },
  { label: "Settings", href: "/settings", description: "Pengaturan sistem", keywords: ["settings", "pengaturan", "config", "preferences"] },
];

interface SidebarSearchProps {
  onClose: () => void;
}

export default function SidebarSearch({ onClose }: SidebarSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return menuItems;
    
    const term = searchTerm.toLowerCase();
    return menuItems.filter(
      item =>
        item.label.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari menu... (contoh: camera, alerts, admin)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          autoFocus
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {searchTerm && (
        <div className="mt-2 max-h-48 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Tidak ada menu yang cocok dengan &quot;{searchTerm}&quot;
            </p>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block p-2 rounded-lg text-sm hover:bg-orange-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-600">{item.description}</div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
