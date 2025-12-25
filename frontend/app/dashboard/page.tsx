"use client";

import { useState, useEffect, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertTriangle, Video, TrendingUp, Eye, EyeOff, Maximize2, Volume2, Zap, Plus, Settings2, Grid, LayoutGrid, Box } from "lucide-react";
import { api, Stats, Camera, Alert, realtime } from "@/services/api";
import { useDemoMode } from "@/hooks/useDemoMode";

// Status badge component
const StatusBadge = ({ status, color }: { status: string; color: string }) => {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500 text-white",
    amber: "bg-amber-500 text-white",
    red: "bg-red-500 text-white animate-pulse",
    slate: "bg-slate-500 text-white",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors[color] || colors.slate}`}>
      {status}
    </span>
  );
};

// Camera card component - Memoized for performance
const CameraCard = memo(function CameraCard({ camera, currentTime, isScreenOn, onToggleScreen }: { camera: any; currentTime: string, isScreenOn: boolean, onToggleScreen: (id: string | number) => void }) {
  const [isHovered, setIsHovered] = useState(false);

  const borderColors: Record<string, string> = {
    emerald: "border-emerald-500/30 hover:border-emerald-500",
    amber: "border-amber-500/30 hover:border-amber-500",
    red: "border-red-500 shadow-lg shadow-red-500/20",
    slate: "border-slate-500/30 hover:border-slate-500",
  };

  return (
    <div
      className={`relative bg-slate-900 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${borderColors[camera.statusColor] || borderColors.slate}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Camera Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
        <div>
          <h4 className="text-white font-bold text-sm">{camera.name}</h4>
          <p className="text-white/70 text-xs">{camera.location}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleScreen(camera.id);
            }}
            className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors"
            title={isScreenOn ? "Matikan Layar" : "Hidupkan Layar"}
          >
            {isScreenOn ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <StatusBadge status={camera.status} color={camera.statusColor} />
        </div>
      </div>

      {/* Camera Feed - Live AI Stream */}
      <div className="aspect-video bg-slate-800 relative overflow-hidden">
        {camera.status !== "OFFLINE" && isScreenOn ? (
          /* Live AI Stream */
          <>
            <img
              src="http://localhost:8000/video_feed"
              alt="Live AI Feed"
              className="w-full h-full object-cover absolute inset-0 z-10"
              style={{ minHeight: '100%' }}
              onError={(e) => {
                // Fallback if stream fails
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            {/* Loading overlay - shown if stream fails or loading */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 z-0">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-orange-400 text-sm font-medium">Menghubungkan ke AI Engine...</p>
                <p className="text-slate-500 text-xs mt-1">localhost:8000</p>
              </div>
            </div>
          </>
        ) : (
          /* Placeholder for other cameras, offline, or screen OFF */
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full ${camera.status === 'OFFLINE' ? 'bg-slate-800' : 'bg-slate-700/80'} flex items-center justify-center mb-2`}>
                {camera.status === 'OFFLINE' ? (
                  <div className="text-slate-600 flex flex-col items-center">
                    <Zap size={24} className="mb-1 opacity-50" />
                    <span className="text-[10px] font-bold">NO SIGNAL</span>
                  </div>
                ) : !isScreenOn ? (
                  /* Screen manually turned off - Click to Turn On */
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleScreen(camera.id);
                    }}
                    className="flex flex-col items-center hover:scale-110 transition-transform cursor-pointer relative z-40"
                  >
                    <EyeOff size={32} className="text-slate-600 mb-1" />
                    <span className="text-[10px] text-slate-500 font-bold">CLICK TO SHOW</span>
                  </button>
                ) : (
                  <Eye size={32} className="text-slate-500" />
                )}
              </div>
              <p className="text-slate-500 text-xs font-mono">
                {camera.status === 'OFFLINE' ? 'IP CAMERA OFF' : !isScreenOn ? 'SCREEN HIDDEN' : `IP CAMERA ${camera.id}`}
              </p>
            </div>
          </div>
        )}

        {/* Recording indicator - Only if Online */}
        {camera.status !== 'OFFLINE' && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 z-20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-white/70 text-[10px] font-mono">REC</span>
          </div>
        )}

        {/* Timestamp */}
        <div className="absolute bottom-3 right-3 z-20">
          <span className="text-white/50 text-[10px] font-mono" suppressHydrationWarning>
            {currentTime || "--:--:--"}
          </span>
        </div>

        {/* Hover Controls - Only if screen is ON (to prevent blocking 'Turn On' button) */}
        {isHovered && isScreenOn && (
          <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center gap-3 animate-fade-in">
            {/* EXPAND BUTTON - Link for instant navigation */}
            <Link
              href={`/dashboard/monitor/${String(camera.id).toLowerCase()}`}
              className="p-3 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg shadow-orange-500/30 cursor-pointer active:scale-95 transition-transform"
              title="Lihat Detail Kamera"
            >
              <Maximize2 size={20} className="text-white" />
            </Link>
          </div>
        )}
      </div>

      {/* AI Detection Overlay - for BAHAYA status */}
      {camera.statusColor === "red" && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-1/3 left-1/4 w-20 h-32 border-2 border-red-500 rounded animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <div className="absolute -top-5 left-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">
              VIOLATION
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const AddCameraCard = () => (
  <Link href="/dashboard/settings?tab=camera&action=add" className="group relative bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 flex flex-col items-center justify-center aspect-video cursor-pointer">
    <div className="w-16 h-16 rounded-full bg-slate-200 group-hover:bg-orange-100 flex items-center justify-center mb-3 transition-colors">
      <Plus size={32} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
    </div>
    <span className="text-sm font-bold text-slate-500 group-hover:text-orange-600">Tambah Kamera Baru</span>
  </Link>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    compliance: 100,
    totalDetections: 0,
    violationsToday: 0,
    workersActive: 0
  });

  const [cameras, setCameras] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString('id-ID'));
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Screen Visibility & Grid State
  const [screenVisibility, setScreenVisibility] = useState<Record<string, boolean>>({});
  const [gridCols, setGridCols] = useState(3);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedVisibility = localStorage.getItem('camera_screen_visibility');
    if (savedVisibility) setScreenVisibility(JSON.parse(savedVisibility));

    const savedGrid = localStorage.getItem('dashboard_grid_cols');
    if (savedGrid) setGridCols(parseInt(savedGrid));
  }, []);

  const getScreenStatus = (id: string | number) => {
    // Default to true (ON) if not set
    return screenVisibility[String(id)] !== false;
  };

  const toggleScreen = (id: string | number) => {
    setScreenVisibility(prev => {
      const newState = {
        ...prev,
        [String(id)]: prev[String(id)] === false ? true : false
      };
      localStorage.setItem('camera_screen_visibility', JSON.stringify(newState));
      return newState;
    });
  };

  const changeGrid = (cols: number) => {
    setGridCols(cols);
    localStorage.setItem('dashboard_grid_cols', cols.toString());
  };

  // Demo Mode integration
  const { isDemo, detections, violations, stats: demoStats } = useDemoMode();

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await api.getStats();
        if (statsData) {
          setStats({
            compliance: statsData.compliance_rate ?? 100,
            totalDetections: statsData.total_detections ?? 0,
            violationsToday: statsData.total_violations ?? 0,
            workersActive: 0
          });
        }

        const camerasData = await api.getCameras();
        if (camerasData && camerasData.length > 0) {
          const transformed = camerasData.map((cam: Camera) => ({
            id: cam.ID,
            name: cam.name || `TITIK ${cam.ID}`,
            location: cam.location || 'Area Kerja',
            status: cam.is_active ? 'AMAN' : 'OFFLINE',
            statusColor: cam.is_active ? 'emerald' : 'slate',
            isOnline: cam.is_active
          }));
          setCameras(transformed);
        } else {
          // Fallback if no cameras found - mostly for initial state or error
          setCameras([]);
        }

        const alertsData = await api.getDetections(5);
        if (alertsData && alertsData.length > 0) {
          const violations = alertsData.filter((d: any) => d.is_violation);
          const transformed = violations.slice(0, 3).map((alert: any) => ({
            time: new Date(alert.detected_at).toLocaleTimeString('id-ID'),
            type: alert.violation_type.replace('_', ' ').toUpperCase(),
            location: alert.location,
            severity: 'BAHAYA'
          }));
          setRecentAlerts(transformed);
        }

      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  // Real-time WebSocket Handler
  useEffect(() => {
    if (isDemo) return;

    realtime.connect();

    realtime.on('connected', () => setWsConnected(true));
    realtime.on('disconnected', () => setWsConnected(false));

    realtime.on('detection', (data: any) => {
      setStats(prev => ({
        ...prev,
        totalDetections: prev.totalDetections + 1,
        violationsToday: data.is_violation ? prev.violationsToday + 1 : prev.violationsToday,
        compliance: ((prev.totalDetections + 1 - (data.is_violation ? prev.violationsToday + 1 : prev.violationsToday)) / (prev.totalDetections + 1)) * 100
      }));

      if (data.is_violation) {
        setCameras(prev => prev.map(cam => {
          if (String(cam.id) === String(data.camera_id) || cam.name.includes(data.camera_id)) {
            return { ...cam, status: "BAHAYA", statusColor: "red" };
          }
          return cam;
        }));

        setTimeout(() => {
          setCameras(prev => prev.map(cam => {
            if (String(cam.id) === String(data.camera_id) || cam.name.includes(data.camera_id)) {
              return { ...cam, status: cam.isOnline ? "AMAN" : "OFFLINE", statusColor: cam.isOnline ? "emerald" : "slate" };
            }
            return cam;
          }));
        }, 5000);

        const newAlert = {
          time: "Baru Saja",
          type: data.violation_type.replace('_', ' ').toUpperCase(),
          location: data.location,
          severity: "BAHAYA"
        };
        setRecentAlerts(prev => [newAlert, ...prev].slice(0, 3));
      }
    });

    return () => realtime.disconnect();
  }, [isDemo]);

  // Demo Mode Effect
  useEffect(() => {
    if (!isDemo || detections.length === 0) return;

    setStats(prev => ({
      ...prev,
      compliance: demoStats.compliance,
      violationsToday: violations.length,
      totalDetections: detections.length
    }));

    // Demo alerts logic...
    const demoAlerts = violations.slice(0, 5).map((detection) => {
      const now = new Date();
      const diffMs = now.getTime() - detection.timestamp.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const timeAgo = diffMins > 0 ? `${diffMins} menit lalu` : `Baru Saja`;

      return {
        time: timeAgo,
        type: detection.type.replace('_', ' ').toUpperCase(),
        location: `${detection.camera} - ${detection.location}`,
        severity: detection.severity === 'critical' || detection.severity === 'high' ? 'BAHAYA' : 'PERINGATAN',
      };
    });

    if (demoAlerts.length > 0) {
      setRecentAlerts(demoAlerts);
    }

    setCameras(prev => prev.map(cam => {
      const camViolations = violations.filter(v => v.cameraId === cam.id);
      if (camViolations.length > 0) {
        return { ...cam, status: 'BAHAYA', statusColor: 'red' };
      }
      return { ...cam, status: 'AMAN', statusColor: 'emerald' };
    }));

  }, [isDemo, detections.length, violations.length]);


  return (
    <div className="space-y-6">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-slate-900 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">Global Overview</h3>
              {isDemo ? (
                <span className="px-2 py-1 bg-orange-500 text-white text-[10px] font-bold rounded animate-pulse flex items-center gap-1">
                  <Zap size={10} /> DEMO
                </span>
              ) : wsConnected && (
                <span className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded flex items-center gap-1">
                  <Zap size={10} /> LIVE
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">Semua zona dalam pantauan</p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setIsLayoutMenuOpen(!isLayoutMenuOpen)}
            className={`px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm ${isLayoutMenuOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings2 size={16} />
            Atur Tata Letak
          </button>

          {/* Layout Menu Dropdown */}
          {isLayoutMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Ukuran Grid Dashboard</h4>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => changeGrid(1)}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${gridCols === 1 ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-500 ring-offset-1' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  title="1 Kolom (Besar)"
                >
                  <Box size={20} />
                  <span className="text-[10px] font-bold">1x</span>
                </button>
                <button
                  onClick={() => changeGrid(2)}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${gridCols === 2 ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-500 ring-offset-1' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  title="2 Kolom (Sedang)"
                >
                  <Grid size={20} />
                  <span className="text-[10px] font-bold">2x</span>
                </button>
                <button
                  onClick={() => changeGrid(3)}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${gridCols === 3 ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-500 ring-offset-1' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  title="3 Kolom (Standar)"
                >
                  <LayoutGrid size={20} />
                  <span className="text-[10px] font-bold">3x</span>
                </button>
                <button
                  onClick={() => changeGrid(4)}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${gridCols === 4 ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-500 ring-offset-1' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  title="4 Kolom (Kecil)"
                >
                  <LayoutGrid size={20} className="rotate-90" />
                  <span className="text-[10px] font-bold">4x</span>
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 text-center">
                  Pengaturan tersimpan otomatis
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs - Synced with Cameras */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        <button className="px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium flex items-center gap-2 whitespace-nowrap shadow-md">
          <Eye size={16} />
          ALL CAMERAS
        </button>
        {cameras.map((cam) => (
          <Link
            key={cam.id}
            href={`/dashboard/monitor/${String(cam.id).toLowerCase()}`}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap border ${cam.statusColor === 'slate' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
              }`}
          >
            <span className={`w-2 h-2 rounded-full ${cam.statusColor === "emerald" ? "bg-emerald-500" :
              cam.statusColor === "amber" ? "bg-amber-500" :
                cam.statusColor === "red" ? "bg-red-500" : "bg-slate-400"
              }`}></span>
            {cam.name}
          </Link>
        ))}
        <Link href="/dashboard/settings?tab=camera" className="px-3 py-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full text-sm font-medium flex items-center gap-1 transition-colors whitespace-nowrap">
          <Plus size={14} />
        </Link>
      </div>


      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-1">REAL-TIME COMPLIANCE</h3>
            <div className="flex items-baseline gap-2">
              {stats.totalDetections > 0 ? (
                <>
                  <span className="text-5xl font-black text-slate-900 font-mono">{stats.compliance.toFixed(1)}</span>
                  <span className="text-2xl font-bold text-emerald-600">%</span>
                </>
              ) : (
                <span className="text-4xl font-black text-slate-400 font-mono">READY</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
              <TrendingUp size={16} />
              <span className="font-medium">
                {stats.totalDetections > 0 ? "Akurasi berbasis deteksi AI" : "Menunggu data stream..."}
              </span>
            </div>
          </div>
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 border-4 border-emerald-200 flex items-center justify-center">
            <ShieldCheck size={36} className="text-emerald-600" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-red-50">
              <AlertTriangle className="text-red-600 w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">PRIORITAS</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{stats.violationsToday}</div>
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-1">Pelanggaran Hari Ini</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50">
              <Video className="text-emerald-600 w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">ONLINE</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{cameras.filter(c => c.status !== 'OFFLINE').length}/{cameras.length}</div>
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mt-1">Kamera Aktif</div>
        </div>
      </div>

      {/* Camera Grid Container */}
      <div className={`grid gap-6 ${gridCols === 1 ? 'grid-cols-1' :
        gridCols === 2 ? 'grid-cols-1 md:grid-cols-2' :
          gridCols === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
        {cameras.map((camera) => (
          <CameraCard
            key={camera.id}
            camera={camera}
            currentTime={time}
            isScreenOn={getScreenStatus(camera.id)}
            onToggleScreen={toggleScreen}
          />
        ))}
        {/* Add Camera Card appended to grid */}
        <AddCameraCard />
      </div>

      {/* Recent Alerts */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Riwayat Deteksi Terbaru</h3>
          <Link href="/dashboard/alerts" className="text-sm text-orange-600 hover:text-orange-700 font-medium">Lihat Semua →</Link>
        </div>
        <div className="space-y-3">
          {recentAlerts.length > 0 ? recentAlerts.map((alert, i) => (
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
          )) : (
            <p className="text-center text-slate-400 py-4 italic">Belum ada deteksi hari ini.</p>
          )}
        </div>
      </div>

    </div>
  );
}
