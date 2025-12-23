"use client";

import { useState, useEffect, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertTriangle, UserCheck, TrendingUp, Eye, Maximize2, Volume2 } from "lucide-react";
import { api, Stats, Camera, Alert } from "@/services/api";

// Default camera data (used as fallback)
const defaultCameras = [
  { id: "A", name: "TITIK A", location: "Gudang Utama", status: "AMAN", statusColor: "emerald" },
  { id: "B", name: "TITIK B", location: "Area Assembly", status: "PERINGATAN", statusColor: "amber" },
  { id: "C", name: "TITIK C", location: "Welding Bay", status: "AMAN", statusColor: "emerald" },
  { id: "D", name: "TITIK D", location: "Loading Dock", status: "BAHAYA", statusColor: "red" },
];

type CameraDisplay = typeof defaultCameras[0];

// Status badge component
const StatusBadge = ({ status, color }: { status: string; color: string }) => {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500 text-white",
    amber: "bg-amber-500 text-white",
    red: "bg-red-500 text-white animate-pulse",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors[color]}`}>
      {status}
    </span>
  );
};

// Camera card component - Memoized for performance
const CameraCard = memo(function CameraCard({ camera, isFirst }: { camera: CameraDisplay; isFirst?: boolean }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('id-ID'));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const borderColors: Record<string, string> = {
    emerald: "border-emerald-500/30 hover:border-emerald-500",
    amber: "border-amber-500/30 hover:border-amber-500",
    red: "border-red-500 shadow-lg shadow-red-500/20",
  };

  return (
    <div
      className={`relative bg-slate-900 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${borderColors[camera.statusColor]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Camera Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
        <div>
          <h4 className="text-white font-bold text-sm">{camera.name}</h4>
          <p className="text-white/70 text-xs">{camera.location}</p>
        </div>
        <StatusBadge status={camera.status} color={camera.statusColor} />
      </div>

      {/* Camera Feed - Optimized with Next.js Image */}
      <div className="aspect-video bg-slate-800 relative overflow-hidden">
        {/* Placeholder with optimized rendering */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-700/80 flex items-center justify-center mb-2">
              <Eye size={32} className="text-slate-500" />
            </div>
            <p className="text-slate-500 text-xs font-mono">IP CAMERA {camera.id}</p>
            <p className="text-slate-600 text-[10px] font-mono">192.168.1.10{camera.id.charCodeAt(0) - 64}</p>
          </div>
        </div>

        {/* Recording indicator */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-white/70 text-[10px] font-mono">REC</span>
        </div>

        {/* Timestamp */}
        <div className="absolute bottom-3 right-3">
          <span className="text-white/50 text-[10px] font-mono" suppressHydrationWarning>
            {currentTime || "--:--:--"}
          </span>
        </div>

        {/* Hover Controls - Only Expand button navigates */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 transition-opacity">
            {/* EXPAND BUTTON - Navigates to detail page */}
            <button
              onClick={() => router.push(`/dashboard/monitor/${camera.id.toLowerCase()}`)}
              className="p-3 bg-orange-500/80 hover:bg-orange-500 rounded-full transition-all hover:scale-110 shadow-lg shadow-orange-500/30 cursor-pointer"
              title="Lihat Detail Kamera"
            >
              <Maximize2 size={20} className="text-white" />
            </button>
            {/* Volume button - no navigation */}
            <button className="p-3 bg-white/25 hover:bg-white/35 rounded-full transition-colors">
              <Volume2 size={20} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {/* AI Detection Overlay - for BAHAYA status */}
      {camera.statusColor === "red" && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-20 h-32 border-2 border-red-500 rounded animate-pulse">
            <div className="absolute -top-5 left-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">
              NO HELMET
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    compliance: 94.2,
    totalDetections: 1247,
    violationsToday: 12,
    workersActive: 248
  });
  const [cameras, setCameras] = useState<CameraDisplay[]>(defaultCameras);
  const [recentAlerts, setRecentAlerts] = useState<{ time: string; type: string; location: string; severity: string }[]>([
    { time: "2 menit lalu", type: "NO HELMET", location: "TITIK D - Loading Dock", severity: "BAHAYA" },
    { time: "15 menit lalu", type: "NO VEST", location: "TITIK B - Assembly", severity: "PERINGATAN" },
    { time: "32 menit lalu", type: "NO GLOVES", location: "TITIK C - Welding", severity: "PERINGATAN" },
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch stats, cameras, and alerts from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsData = await api.getDetectionStats();
        setStats({
          compliance: statsData?.compliance ?? 94.2,
          totalDetections: statsData?.totalDetections ?? 0,
          violationsToday: statsData?.violationsToday ?? 0,
          workersActive: statsData?.workersActive ?? 248
        });

        // Fetch cameras
        const camerasData = await api.getCameras();
        if (camerasData && camerasData.length > 0) {
          const transformed: CameraDisplay[] = camerasData.map((cam: Camera, i: number) => ({
            id: cam.id || String.fromCharCode(65 + i),
            name: `TITIK ${cam.id || String.fromCharCode(65 + i)}`,
            location: cam.location || cam.name || 'Area Kerja',
            status: cam.status === 'online' ? 'AMAN' : 'OFFLINE',
            statusColor: cam.status === 'online' ? 'emerald' : 'red'
          }));
          setCameras(transformed);
        }

        // Fetch recent alerts
        const alertsData = await api.getAlerts();
        if (alertsData && alertsData.length > 0) {
          const transformed = alertsData.slice(0, 3).map((alert: Alert) => {
            const date = new Date(alert.timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const timeAgo = diffMins < 60 ? `${diffMins} menit lalu` : `${Math.floor(diffMins / 60)} jam lalu`;

            return {
              time: timeAgo,
              type: alert.type || 'PELANGGARAN',
              location: `${alert.zone} - ${alert.zone}`,
              severity: alert.severity === 'high' || alert.severity === 'critical' ? 'BAHAYA' : 'PERINGATAN'
            };
          });
          setRecentAlerts(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="space-y-6">

      {/* Location Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-slate-900 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Global Overview</h3>
            <p className="text-sm text-slate-500">Semua zona dalam pantauan</p>
          </div>
        </div>

        {/* Camera Filter Tabs - Optimized: removed heavy backdrop-blur */}
        <div className="flex items-center gap-2 bg-white/95 rounded-xl p-1 border border-slate-200 shadow-sm">
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium flex items-center gap-2">
            <Eye size={16} />
            ALL
          </button>
          {cameras.map((cam) => (
            <Link
              key={cam.id}
              href={`/dashboard/monitor/${cam.id.toLowerCase()}`}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${cam.statusColor === "emerald" ? "bg-emerald-500" :
                cam.statusColor === "amber" ? "bg-amber-500" : "bg-red-500"
                }`}></span>
              TITIK {cam.id}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Compliance Score - Optimized: solid bg instead of heavy blur */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-md hover:shadow-lg transition-shadow">
          <div>
            <h3 className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-1">REAL-TIME COMPLIANCE</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 font-mono">{stats.compliance.toFixed(1)}</span>
              <span className="text-2xl font-bold text-emerald-600">%</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
              <TrendingUp size={16} />
              <span className="font-medium">+2.4% dari minggu lalu</span>
            </div>
          </div>
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 border-4 border-emerald-200 flex items-center justify-center">
            <ShieldCheck size={36} className="text-emerald-600" />
          </div>
        </div>

        {/* Violations - Optimized */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-red-50">
              <AlertTriangle className="text-red-600 w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">PRIORITAS</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{stats.violationsToday}</div>
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-1">Pelanggaran Hari Ini</div>
        </div>

        {/* Workers - Optimized */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50">
              <UserCheck className="text-emerald-600 w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">AKTIF</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{stats.workersActive}</div>
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-1">Pekerja di Lokasi</div>
        </div>
      </div>

      {/* Camera Grid - Optimized with priority loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map((camera, index) => (
          <CameraCard key={camera.id} camera={camera} isFirst={index === 0} />
        ))}
      </div>

      {/* Recent Alerts - Optimized */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Riwayat Deteksi Terbaru</h3>
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">Lihat Semua →</button>
        </div>
        <div className="space-y-3">
          {recentAlerts.map((alert, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer group">
              <div className={`p-2 rounded-lg ${alert.severity === "BAHAYA" ? "bg-red-100" : "bg-amber-100"
                }`}>
                <AlertTriangle size={18} className={
                  alert.severity === "BAHAYA" ? "text-red-600" : "text-amber-600"
                } />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{alert.type}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${alert.severity === "BAHAYA"
                    ? "bg-red-500 text-white"
                    : "bg-amber-500 text-white"
                    }`}>{alert.severity}</span>
                </div>
                <p className="text-sm text-slate-500">{alert.location}</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{alert.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
