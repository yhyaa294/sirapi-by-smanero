"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Video,
    Camera,
    Maximize2,
    Settings,
    Grid3X3,
    LayoutGrid,
    Square,
    Columns,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    X,
    Expand,
    Shrink,
    Search,
    MapPin,
    Clock,
    Wifi,
    WifiOff,
} from "lucide-react";
import { api, Camera as CameraType } from "@/services/api";

// Location groups for sidebar
const LOCATION_GROUPS = [
    { name: "Gerbang Utama", cameras: ["CAM-01", "CAM-02", "CAM-03"] },
    { name: "Koridor Lantai 1", cameras: ["CAM-04", "CAM-05", "CAM-06", "CAM-07"] },
    { name: "Koridor Lantai 2", cameras: ["CAM-08", "CAM-09", "CAM-10"] },
    { name: "Area Parkir", cameras: ["CAM-11", "CAM-12"] },
    { name: "Lapangan", cameras: ["CAM-13", "CAM-14"] },
    { name: "Kantin", cameras: ["CAM-15", "CAM-16"] },
];

// View Modes
const VIEW_MODES = [
    { id: 4, label: "2×2", cols: "grid-cols-2", icon: Columns },
    { id: 9, label: "3×3", cols: "grid-cols-3", icon: Grid3X3 },
    { id: 16, label: "4×4", cols: "grid-cols-4", icon: LayoutGrid },
];

// Fallback cameras (when API is unavailable)
function generateFallbackCameras(): Array<{ id: number; name: string; status: string; location: string }> {
    return Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        name: `Belum Dikonfigurasi`,
        status: "unconfigured",
        location: `CAM-${String(i + 1).padStart(2, "0")}`,
    }));
}

export default function CCTVPage() {
    const [viewMode, setViewMode] = useState(4);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

    // API data
    const [cameras, setCameras] = useState(generateFallbackCameras());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        setCurrentTime(new Date());

        // Load cameras from API
        const loadCameras = async () => {
            try {
                const apiCameras = await api.getCameras();
                if (apiCameras && apiCameras.length > 0) {
                    setCameras(apiCameras.map((c: CameraType) => ({
                        id: c.ID,
                        name: c.name,
                        status: c.status,
                        location: c.location || `CAM-${String(c.ID).padStart(2, "0")}`,
                    })));
                }
            } catch {
                // Use fallback cameras
            } finally {
                setIsLoading(false);
            }
        };
        loadCameras();
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [mounted]);

    // Fullscreen header auto-hide
    useEffect(() => {
        if (!isFullScreen) { setHeaderVisible(true); return; }
        let timeout: NodeJS.Timeout;
        const handleMouseMove = () => {
            setHeaderVisible(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setHeaderVisible(false), 3000);
        };
        window.addEventListener('mousemove', handleMouseMove);
        timeout = setTimeout(() => setHeaderVisible(false), 3000);
        return () => { window.removeEventListener('mousemove', handleMouseMove); clearTimeout(timeout); };
    }, [isFullScreen]);

    // ESC to exit fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullScreen]);

    const currentGridCols = VIEW_MODES.find(v => v.id === viewMode)?.cols || "grid-cols-2";
    const visibleCameras = cameras.slice(0, viewMode);

    const formatTime = (date: Date | null) => {
        if (!date) return "--:--:--";
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "";
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const onlineCount = cameras.filter(c => c.status === 'online').length;

    const containerClass = isFullScreen
        ? "fixed inset-0 z-50 w-screen h-screen bg-[#0c0f1a] flex flex-col"
        : "min-h-[calc(100vh-80px)] flex flex-col bg-[#0c0f1a] -m-6 lg:-m-8 text-white rounded-2xl overflow-hidden";

    return (
        <div className={containerClass}>
            {/* Top Bar */}
            <AnimatePresence>
                {(headerVisible || !isFullScreen) && (
                    <motion.header
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between px-5 py-3 bg-[#111528] border-b border-white/5 z-20"
                    >
                        <div className="flex items-center gap-4">
                            {/* Sidebar Toggle */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                            </button>

                            {/* Search */}
                            <div className="relative hidden md:block">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Cari Kamera..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 w-56"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            {/* Date & Time */}
                            <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
                                <Clock size={14} />
                                <span className="font-mono" suppressHydrationWarning>
                                    {formatDate(currentTime)} • {formatTime(currentTime)}
                                </span>
                            </div>

                            {/* View modes */}
                            <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5">
                                {VIEW_MODES.map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setViewMode(mode.id)}
                                        className={`p-2 rounded-md transition-all ${viewMode === mode.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        title={mode.label}
                                    >
                                        <mode.icon size={16} />
                                    </button>
                                ))}
                            </div>

                            {/* Fullscreen */}
                            <button
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                {isFullScreen ? <Shrink size={18} /> : <Expand size={18} />}
                            </button>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex min-h-0">
                {/* Left Sidebar - Camera List */}
                <AnimatePresence>
                    {sidebarOpen && !isFullScreen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 240, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[#111528] border-r border-white/5 flex flex-col overflow-hidden"
                        >
                            {/* Sidebar Header */}
                            <div className="p-4 border-b border-white/5">
                                <h3 className="text-sm font-bold text-white tracking-wide mb-1">Live Monitoring</h3>
                                <p className="text-xs text-slate-500">{onlineCount} dari {cameras.length} kamera aktif</p>
                            </div>

                            {/* Camera Groups */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
                                {LOCATION_GROUPS.map((group) => (
                                    <div key={group.name}>
                                        <button
                                            onClick={() => setSelectedGroup(selectedGroup === group.name ? null : group.name)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-bold uppercase tracking-wider transition-colors ${selectedGroup === group.name
                                                ? 'text-blue-400 bg-blue-500/10'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <MapPin size={12} />
                                            {group.name}
                                            {selectedGroup === group.name && (
                                                <span className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                            )}
                                        </button>

                                        <div className="mt-1 ml-2 space-y-0.5">
                                            {group.cameras.map((camId) => {
                                                const cam = cameras.find(c => c.location === camId);
                                                const isOnline = cam?.status === 'online';
                                                return (
                                                    <div
                                                        key={camId}
                                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                                    >
                                                        {isOnline ? (
                                                            <Wifi size={13} className="text-emerald-500" />
                                                        ) : (
                                                            <WifiOff size={13} className="text-slate-600" />
                                                        )}
                                                        <span>{camId}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Sidebar Footer */}
                            <div className="p-3 border-t border-white/5">
                                <Link
                                    href="/dashboard/settings"
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <Settings size={14} />
                                    Pengaturan Kamera
                                </Link>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Camera Grid */}
                <div className="flex-1 p-4 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-sm text-slate-400">Memuat kamera...</p>
                            </div>
                        </div>
                    ) : visibleCameras.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center p-10 bg-[#111528] rounded-2xl border border-white/5 max-w-sm">
                                <Camera size={40} className="text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">Tidak Ada Kamera</h3>
                                <p className="text-sm text-slate-400 mb-6">Konfigurasi kamera melalui menu pengaturan.</p>
                                <Link href="/dashboard/settings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                                    <Settings size={15} />
                                    Pengaturan
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className={`grid ${currentGridCols} gap-3 auto-rows-fr h-full`}>
                            <AnimatePresence mode="popLayout">
                                {visibleCameras.map((cam) => (
                                    <motion.div
                                        key={cam.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        className="relative bg-[#111528] rounded-xl overflow-hidden group border border-white/5 hover:border-white/15 transition-colors"
                                    >
                                        {/* Camera Feed Area */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#111528] to-[#0c0f1a] flex items-center justify-center">
                                            {cam.location === 'Gerbang Utama' ? (
                                                <img
                                                    src="http://localhost:5000/video_feed/cam01"
                                                    alt="Live Feed Gerbang Utama"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : cam.status === 'unconfigured' ? (
                                                <div className="text-center">
                                                    <Video className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">Tidak Ada Sinyal</p>
                                                </div>
                                            ) : cam.status === 'online' ? (
                                                <Camera className="w-10 h-10 text-white/5" />
                                            ) : (
                                                <div className="text-center">
                                                    <AlertTriangle className="w-8 h-8 text-red-500/50 mx-auto mb-2" />
                                                    <p className="text-[10px] text-red-400/70 uppercase tracking-widest">Offline</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Top Overlay - Camera Label */}
                                        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${cam.status === 'online' ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                                                <span className="text-xs font-medium text-white/90">{cam.location}</span>
                                            </div>
                                            {cam.status === 'online' && (
                                                <Link
                                                    href={`/dashboard/monitor/${cam.id}`}
                                                    className="p-1.5 bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                                                >
                                                    <Maximize2 size={12} className="text-white" />
                                                </Link>
                                            )}
                                        </div>

                                        {/* Bottom Overlay */}
                                        {cam.status === 'online' && (
                                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] font-mono text-white/60" suppressHydrationWarning>
                                                    {formatTime(currentTime)}
                                                </span>
                                                <Settings size={12} className="text-white/40" />
                                            </div>
                                        )}

                                        {/* Click to view detail */}
                                        {cam.status === 'online' && (
                                            <Link
                                                href={`/dashboard/monitor/${cam.id}`}
                                                className="absolute inset-0 z-10"
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            {!isFullScreen && (
                <footer className="px-5 py-2.5 bg-[#111528] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            NET: ONLINE
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            CAM: {onlineCount}/{cameras.length}
                        </span>
                    </div>
                    <span className="text-slate-600">SiRapi v2.0</span>
                </footer>
            )}
        </div>
    );
}
