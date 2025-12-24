"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, AlertTriangle, Eye, RefreshCw, Camera, Video, Shield, Maximize2, Settings2 } from "lucide-react";
import { api } from "@/services/api";

// Dynamic import DashboardMap to prevent SSR issues with Leaflet
const DashboardMap = dynamic(() => import("@/components/DashboardMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full flex items-center justify-center bg-slate-900 rounded-xl">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Memuat peta interaktif...</p>
            </div>
        </div>
    ),
});

interface CCTVStats {
    id: string;
    name: string;
    status: "online" | "offline" | "alert";
    zone: string;
    detections: number;
}

export default function MapPage() {
    const [loading, setLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [cctvStats] = useState<CCTVStats[]>([
        { id: "CAM-01", name: "Kamera Gudang Utama", status: "online", zone: "Zona A - Gudang", detections: 45 },
        { id: "CAM-02", name: "Kamera Area Assembly", status: "alert", zone: "Zona B - Assembly", detections: 128 },
        { id: "CAM-03", name: "Kamera Welding Bay", status: "online", zone: "Zona C - Welding", detections: 67 },
        { id: "CAM-04", name: "Kamera Loading Dock", status: "online", zone: "Zona D - Loading Dock", detections: 89 },
    ]);

    const refreshData = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "alert": return "bg-red-500";
            case "offline": return "bg-slate-400";
            default: return "bg-emerald-500";
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "alert": return "bg-red-100 text-red-700";
            case "offline": return "bg-slate-100 text-slate-500";
            default: return "bg-emerald-100 text-emerald-700";
        }
    };

    return (
        <div className="space-y-6 h-full">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <MapPin className="text-orange-500" />
                        Peta Interaktif & CCTV Monitoring
                    </h1>
                    <p className="text-slate-500">Visualisasi posisi kamera dan jangkauan Field of View (FOV)</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    >
                        <Maximize2 size={16} />
                        {isFullscreen ? "Keluar" : "Fullscreen"}
                    </button>
                    <button
                        onClick={refreshData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-lg">
                <span className="text-sm font-medium text-slate-700">Status Kamera:</span>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-sm text-slate-600">Online</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-sm text-slate-600">Alert/Deteksi</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                    <span className="text-sm text-slate-600">Offline</span>
                </div>
                <div className="h-4 w-px bg-slate-300"></div>
                <div className="flex items-center gap-2">
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-emerald-500/40"></div>
                    <span className="text-sm text-slate-600">Field of View (V-Shape)</span>
                </div>
                <div className="h-4 w-px bg-slate-300"></div>
                <div className="text-xs text-slate-500 italic">
                    Klik marker atau area FOV untuk detail
                </div>
            </div>

            <div className={`grid ${isFullscreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4"} gap-6`}>

                {/* Map Container */}
                <div className={`${isFullscreen ? "col-span-1" : "lg:col-span-3"} bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700`}>
                    <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                <MapPin size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Peta Fasilitas Real-Time</h3>
                                <p className="text-slate-400 text-xs">CartoDB Dark Matter • Leaflet</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs text-emerald-400 font-medium">LIVE</span>
                            </span>
                        </div>
                    </div>

                    {/* Leaflet Map */}
                    <div className={`${isFullscreen ? "h-[70vh]" : "h-[500px]"}`}>
                        <DashboardMap />
                    </div>

                    {/* Map Footer */}
                    <div className="p-3 border-t border-slate-700 bg-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>Zoom: Scroll / Pinch</span>
                            <span>Pan: Drag</span>
                            <span>Detail: Klik Marker</span>
                        </div>
                        <div className="text-xs text-slate-500">
                            Koordinat: Jombang, Jawa Timur
                        </div>
                    </div>
                </div>

                {/* CCTV Sidebar - Hidden in Fullscreen */}
                {!isFullscreen && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Video size={20} className="text-orange-500" />
                                Daftar CCTV
                            </h3>
                            <span className="text-xs text-slate-500">{cctvStats.length} unit</span>
                        </div>

                        {cctvStats.map((cctv) => (
                            <div
                                key={cctv.id}
                                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:border-orange-300"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(cctv.status)}`}>
                                            <Camera size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{cctv.id}</p>
                                            <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{cctv.name}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(cctv.status)}`}>
                                        {cctv.status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        <p className="text-xs font-medium text-slate-900 truncate">{cctv.zone.replace("Zona ", "").substring(0, 10)}</p>
                                        <p className="text-[9px] text-slate-500">Zona</p>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        <p className={`text-sm font-bold ${cctv.detections > 100 ? "text-red-600" : "text-orange-600"}`}>
                                            {cctv.detections}
                                        </p>
                                        <p className="text-[9px] text-slate-500">Deteksi</p>
                                    </div>
                                </div>

                                {cctv.status === "alert" && (
                                    <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                                        <AlertTriangle size={12} className="text-red-500 shrink-0" />
                                        <span className="text-[10px] text-red-700 font-medium">Pelanggaran aktif!</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Quick Stats */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <Shield size={18} className="text-orange-400" />
                                <span className="font-bold text-sm">Ringkasan</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-white/10 rounded-xl text-center">
                                    <p className="text-xl font-black text-orange-400">
                                        {cctvStats.reduce((sum, c) => sum + c.detections, 0)}
                                    </p>
                                    <p className="text-[9px] text-slate-300">Total Deteksi</p>
                                </div>
                                <div className="p-3 bg-white/10 rounded-xl text-center">
                                    <p className="text-xl font-black text-emerald-400">
                                        {cctvStats.filter(c => c.status === "online").length}
                                    </p>
                                    <p className="text-[9px] text-slate-300">Online</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
