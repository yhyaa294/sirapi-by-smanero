"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Bell, Camera, AlertTriangle, CheckCircle, Users, Activity, ChevronRight, Menu } from "lucide-react";
import { api, type Violation as ApiViolation } from "@/services/api";
import MobileSidebar from "@/components/MobileSidebar";
import AlertCenter, { type AlertItem } from "@/components/AlertCenter";
import { useWebSocket } from "@/hooks/useWebSocket";

type QuickStat = {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  trend?: string;
};

const deriveSeverityFromText = (text?: string): AlertItem["severity"] => {
  if (!text) return "low";
  const normalized = text.toLowerCase();
  if (normalized.includes("helm") || normalized.includes("helmet")) {
    return "high";
  }
  if (normalized.includes("rompi") || normalized.includes("vest") || normalized.includes("goggle")) {
    return "medium";
  }
  return "low";
};

const violationToAlert = (violation: ApiViolation, overrides: Partial<AlertItem> = {}): AlertItem => {
  const base: AlertItem = {
    id: `history-${violation.id}`,
    worker: violation.worker,
    violation: violation.violation,
    location: violation.location,
    time: violation.time,
    severity: deriveSeverityFromText(violation.violation),
    timestamp: new Date().toISOString(),
    seen: true,
    source: "history",
  };

  return {
    ...base,
    ...overrides,
    severity: overrides.severity ?? base.severity,
    timestamp: overrides.timestamp ?? base.timestamp,
    seen: overrides.seen ?? base.seen,
    source: overrides.source ?? base.source,
    time: overrides.time ?? base.time,
  };
};

const mergeAlerts = (existing: AlertItem[], incoming: AlertItem[]): AlertItem[] => {
  const map = new Map<string, AlertItem>();

  for (const alert of [...incoming, ...existing]) {
    const current = map.get(alert.id);
    if (current) {
      map.set(alert.id, {
        ...current,
        ...alert,
        seen: current.seen && alert.seen,
      });
    } else {
      map.set(alert.id, alert);
    }
  }

  return Array.from(map.values())
    .sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 50);
};

const resolveWebSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${window.location.host}/ws`;
  }
  return "ws://localhost:8000/ws";
};

export default function MobileDashboard() {
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertCenterOpen, setAlertCenterOpen] = useState(false);

  const wsUrl = useMemo(() => resolveWebSocketUrl(), []);
  const { lastMessage, connectionState } = useWebSocket(wsUrl);

  const unseenCount = useMemo(() => alerts.filter((alert) => !alert.seen).length, [alerts]);

  const markAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, seen: true })));
  }, []);

  const handleOpenAlertCenter = useCallback(() => {
    setAlertCenterOpen(true);
  }, []);

  const handleCloseAlertCenter = useCallback(() => {
    setAlertCenterOpen(false);
  }, []);

  useEffect(() => {
    if (alertCenterOpen) {
      markAllAsRead();
    }
  }, [alertCenterOpen, markAllAsRead]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh setiap 10 detik (hemat battery)
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, violationsData] = await Promise.all([
        api.getStats(),
        api.getViolations()
      ]);

      setStats([
        {
          label: "Deteksi Hari Ini",
          value: statsData.totalDetections || 0,
          icon: Activity,
          color: "bg-blue-500",
          trend: "+5%"
        },
        {
          label: "Pelanggaran",
          value: statsData.violations || 0,
          icon: AlertTriangle,
          color: "bg-red-500",
          trend: "-2%"
        },
        {
          label: "Kepatuhan",
          value: `${statsData.complianceRate || 0}%`,
          icon: CheckCircle,
          color: "bg-green-500",
          trend: "+3%"
        },
        {
          label: "Pekerja Aktif",
          value: statsData.compliantWorkers || 0,
          icon: Users,
          color: "bg-orange-500"
        }
      ]);

      // Map violations to alerts with severity
      const mappedAlerts = (violationsData as ApiViolation[]).slice(0, 10).map((violation) => violationToAlert(violation));
      setAlerts((prev) => mergeAlerts(prev, mappedAlerts));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === "violation_alert") {
      const data = lastMessage.data ?? {};
      const worker = (data.worker as string) || (data.worker_name as string) || "Worker Tak Dikenal";
      const violationText = (data.violation as string) || "Pelanggaran APD";
      const location = (data.location as string) || "Lokasi tidak diketahui";
      const timeString = (data.time as string) || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      const alert: AlertItem = {
        id: lastMessage.alert_id ?? `live-${Date.now()}`,
        worker,
        violation: violationText,
        location,
        time: timeString,
        severity: lastMessage.severity ?? deriveSeverityFromText(violationText),
        timestamp: lastMessage.timestamp ?? new Date().toISOString(),
        seen: alertCenterOpen,
        source: "live",
      };

      setAlerts((prev) => mergeAlerts(prev, [alert]));
    }
  }, [lastMessage, alertCenterOpen]);

  const connectionBadge = useMemo(() => {
    switch (connectionState) {
      case "connected":
        return { label: "Realtime aktif", className: "bg-green-500" };
      case "connecting":
        return { label: "Menghubungkan...", className: "bg-yellow-500" };
      default:
        return { label: "Terputus", className: "bg-red-500" };
    }
  }, [connectionState]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-orange-100 text-orange-800 border-orange-200";
      case "low": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">SmartAPD™</h1>
                <p className="text-xs opacity-90">Monitoring Mandor</p>
              </div>
            </div>
            <button
              onClick={handleOpenAlertCenter}
              className="relative p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition"
              aria-label="Buka pusat notifikasi"
            >
              <Bell className="w-6 h-6" />
              {unseenCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unseenCount > 99 ? "99+" : unseenCount}
                </span>
              )}
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-white/90 flex items-center gap-2">
          <span className={`inline-flex h-2 w-2 rounded-full ${connectionBadge.className}`}></span>
          {connectionBadge.label}
        </p>
      </div>
      {/* Quick Stats - Swipeable Cards */}
      <div className="px-4 py-4 overflow-x-auto">
        <div className="flex gap-3 pb-2">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-40 bg-white rounded-xl shadow-md p-4 border-l-4"
              style={{ borderColor: stat.color.replace('bg-', '') }}
            >
              <div className={`inline-flex p-2 rounded-lg ${stat.color} bg-opacity-10 mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
              {stat.trend && (
                <div className="text-xs text-green-600 font-semibold mt-1">{stat.trend}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <div className="px-4 py-2">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.location.href = '/monitoring'}
            className="bg-white rounded-xl p-4 shadow-md active:scale-95 transition-transform"
          >
            <Camera className="w-6 h-6 text-blue-500 mb-2" />
            <div className="text-sm font-semibold text-gray-900">CCTV Live</div>
            <div className="text-xs text-gray-500">Pantau Real-time</div>
          </button>
          
          <button
            onClick={() => window.location.href = '/alerts'}
            className="bg-white rounded-xl p-4 shadow-md active:scale-95 transition-transform"
          >
            <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
            <div className="text-sm font-semibold text-gray-900">Pelanggaran</div>
            <div className="text-xs text-gray-500">Lihat Semua</div>
          </button>
        </div>
      </div>

      {/* Recent Alerts - Compact List */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Pelanggaran Terbaru</h2>
          <button className="text-xs text-orange-600 font-semibold">Lihat Semua →</button>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-sm">Memuat data...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-semibold">Tidak ada pelanggaran</p>
              <p className="text-xs">Semua pekerja patuh APD!</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-xl p-3 shadow-sm border-l-4 ${
                  alert.severity === 'high' ? 'border-red-500' :
                  alert.severity === 'medium' ? 'border-orange-500' : 'border-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                    <div className="font-semibold text-sm text-gray-900 mb-1">{alert.worker}</div>
                    <div className="text-xs text-red-600 font-medium">{alert.violation}</div>
                    <div className="text-xs text-gray-500 mt-1">📍 {alert.location}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <button className="flex flex-col items-center py-2 text-orange-600">
            <Activity className="w-5 h-5 mb-1" />
            <span className="text-xs font-semibold">Overview</span>
          </button>
          <button
            onClick={() => window.location.href = '/monitoring'}
            className="flex flex-col items-center py-2 text-gray-500"
          >
            <Camera className="w-5 h-5 mb-1" />
            <span className="text-xs">CCTV</span>
          </button>
          <button
            onClick={() => window.location.href = '/alerts'}
            className="flex flex-col items-center py-2 text-gray-500"
          >
            <Bell className="w-5 h-5 mb-1" />
            <span className="text-xs">Alerts</span>
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex flex-col items-center py-2 text-gray-500"
          >
            <Users className="w-5 h-5 mb-1" />
            <span className="text-xs">Desktop</span>
          </button>
        </div>
      </div>

      <AlertCenter
        isOpen={alertCenterOpen}
        alerts={alerts}
        onClose={handleCloseAlertCenter}
        onMarkAllAsRead={markAllAsRead}
        connectionState={connectionState}
      />

      {/* Spacing for fixed bottom nav */}
      <div className="h-20"></div>
    </div>
  );
}
