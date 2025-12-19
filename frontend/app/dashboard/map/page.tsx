"use client";

import { useState, useEffect } from "react";
import { MapPin, AlertTriangle, Eye, RefreshCw } from "lucide-react";
import { api } from "@/services/api";

interface ZoneData {
    id: string;
    name: string;
    risk: "low" | "medium" | "high";
    compliance: number;
    workers: number;
    alerts: number;
}

export default function MapPage() {
    const [zones, setZones] = useState<ZoneData[]>([
        { id: "A", name: "Gudang Utama", risk: "low", compliance: 96, workers: 45, alerts: 1 },
        { id: "B", name: "Area Assembly", risk: "medium", compliance: 78, workers: 62, alerts: 8 },
        { id: "C", name: "Welding Bay", risk: "low", compliance: 92, workers: 28, alerts: 2 },
        { id: "D", name: "Loading Dock", risk: "high", compliance: 65, workers: 35, alerts: 15 },
    ]);
    const [loading, setLoading] = useState(false);
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    // Fetch zone data from API
    useEffect(() => {
        const fetchZones = async () => {
            try {
                const stats = await api.getDetectionStats();
                if (stats) {
                    // Update zone compliance based on overall stats
                    setZones(prev => prev.map(zone => {
                        // Simulate different compliance per zone based on overall rate
                        const variance = Math.random() * 20 - 10;
                        const newCompliance = Math.min(100, Math.max(50, (stats.compliance || 82) + variance));
                        return {
                            ...zone,
                            compliance: Math.round(newCompliance),
                            risk: newCompliance >= 90 ? "low" : newCompliance >= 70 ? "medium" : "high"
                        };
                    }));
                }
            } catch (error) {
                console.error('Gagal fetch data zona:', error);
            }
        };

        fetchZones();
        const interval = setInterval(fetchZones, 30000);
        return () => clearInterval(interval);
    }, []);

    const refreshData = async () => {
        setLoading(true);
        try {
            const stats = await api.getDetectionStats();
            if (stats) {
                setZones(prev => prev.map(zone => {
                    const variance = Math.random() * 20 - 10;
                    const newCompliance = Math.min(100, Math.max(50, (stats.compliance || 82) + variance));
                    return {
                        ...zone,
                        compliance: Math.round(newCompliance),
                        risk: newCompliance >= 90 ? "low" : newCompliance >= 70 ? "medium" : "high"
                    };
                }));
            }
        } catch (error) {
            console.error('Gagal refresh:', error);
        }
        setLoading(false);
    };

    const riskColors: Record<string, string> = {
        low: "bg-emerald-500",
        medium: "bg-amber-500",
        high: "bg-red-500",
    };

    const getZoneColor = (risk: string) => {
        switch (risk) {
            case "high": return { bg: "bg-red-500/20", border: "border-red-500", text: "text-red-700" };
            case "medium": return { bg: "bg-amber-500/20", border: "border-amber-500", text: "text-amber-700" };
            default: return { bg: "bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-700" };
        }
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <MapPin className="text-orange-500" />
                        Peta Lokasi & Risk Heatmap
                    </h1>
                    <p className="text-slate-500">Visualisasi zona dan tingkat risiko area kerja</p>
                </div>
                <button 
                    onClick={refreshData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-lg">
                <span className="text-sm font-medium text-slate-700">Tingkat Risiko:</span>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-sm text-slate-600">Rendah (≥90%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-sm text-slate-600">Sedang (70-89%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-sm text-slate-600">Tinggi (&lt;70%)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Map Visual */}
                <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Layout Pabrik</h3>

                    {/* Simplified Factory Layout */}
                    <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-300">

                        {/* Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

                        {/* Zone A - Top Left */}
                        {(() => {
                            const zone = zones.find(z => z.id === "A")!;
                            const colors = getZoneColor(zone.risk);
                            return (
                                <div 
                                    onClick={() => setSelectedZone("A")}
                                    className={`absolute top-4 left-4 w-[45%] h-[45%] ${colors.bg} border-2 ${colors.border} rounded-xl p-3 hover:opacity-80 cursor-pointer transition-all group ${selectedZone === "A" ? "ring-4 ring-orange-400" : ""}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`font-bold ${colors.text}`}>ZONA A</span>
                                        <span className={`w-3 h-3 rounded-full ${riskColors[zone.risk]} animate-pulse`}></span>
                                    </div>
                                    <p className={`text-xs ${colors.text} opacity-80 mt-1`}>{zone.name}</p>
                                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className={`text-xs ${colors.text}`}>{zone.compliance}% Kepatuhan • {zone.workers} pekerja</p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Zone B - Top Right */}
                        {(() => {
                            const zone = zones.find(z => z.id === "B")!;
                            const colors = getZoneColor(zone.risk);
                            return (
                                <div 
                                    onClick={() => setSelectedZone("B")}
                                    className={`absolute top-4 right-4 w-[45%] h-[45%] ${colors.bg} border-2 ${colors.border} rounded-xl p-3 hover:opacity-80 cursor-pointer transition-all group ${selectedZone === "B" ? "ring-4 ring-orange-400" : ""}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`font-bold ${colors.text}`}>ZONA B</span>
                                        <span className={`w-3 h-3 rounded-full ${riskColors[zone.risk]} animate-pulse`}></span>
                                    </div>
                                    <p className={`text-xs ${colors.text} opacity-80 mt-1`}>{zone.name}</p>
                                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className={`text-xs ${colors.text}`}>{zone.compliance}% Kepatuhan • {zone.workers} pekerja</p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Zone C - Bottom Left */}
                        {(() => {
                            const zone = zones.find(z => z.id === "C")!;
                            const colors = getZoneColor(zone.risk);
                            return (
                                <div 
                                    onClick={() => setSelectedZone("C")}
                                    className={`absolute bottom-4 left-4 w-[45%] h-[45%] ${colors.bg} border-2 ${colors.border} rounded-xl p-3 hover:opacity-80 cursor-pointer transition-all group ${selectedZone === "C" ? "ring-4 ring-orange-400" : ""}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`font-bold ${colors.text}`}>ZONA C</span>
                                        <span className={`w-3 h-3 rounded-full ${riskColors[zone.risk]} animate-pulse`}></span>
                                    </div>
                                    <p className={`text-xs ${colors.text} opacity-80 mt-1`}>{zone.name}</p>
                                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className={`text-xs ${colors.text}`}>{zone.compliance}% Kepatuhan • {zone.workers} pekerja</p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Zone D - Bottom Right */}
                        {(() => {
                            const zone = zones.find(z => z.id === "D")!;
                            const colors = getZoneColor(zone.risk);
                            return (
                                <div 
                                    onClick={() => setSelectedZone("D")}
                                    className={`absolute bottom-4 right-4 w-[45%] h-[45%] ${colors.bg} border-2 ${colors.border} rounded-xl p-3 hover:opacity-80 cursor-pointer transition-all group ${selectedZone === "D" ? "ring-4 ring-orange-400" : ""} ${zone.risk === "high" ? "animate-pulse" : ""}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`font-bold ${colors.text}`}>ZONA D</span>
                                        {zone.risk === "high" ? (
                                            <AlertTriangle size={16} className="text-red-500" />
                                        ) : (
                                            <span className={`w-3 h-3 rounded-full ${riskColors[zone.risk]} animate-pulse`}></span>
                                        )}
                                    </div>
                                    <p className={`text-xs ${colors.text} opacity-80 mt-1`}>{zone.name}</p>
                                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className={`text-xs ${colors.text}`}>{zone.compliance}% Kepatuhan • {zone.workers} pekerja</p>
                                    </div>
                                </div>
                            );
                        })()}

                    </div>
                </div>

                {/* Zone Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Detail Zona</h3>

                    {zones.map((zone) => (
                        <div
                            key={zone.id}
                            onClick={() => setSelectedZone(zone.id)}
                            className={`bg-white/90 backdrop-blur-xl border rounded-2xl p-4 shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                                selectedZone === zone.id ? "ring-2 ring-orange-500" : ""
                            } ${
                                zone.risk === "high" ? "border-red-300" :
                                zone.risk === "medium" ? "border-amber-300" : "border-slate-200"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${riskColors[zone.risk]}`}>
                                        {zone.id}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">ZONA {zone.id}</p>
                                        <p className="text-xs text-slate-500">{zone.name}</p>
                                    </div>
                                </div>
                                <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                                    <Eye size={16} className="text-slate-600" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <p className={`text-lg font-bold ${
                                        zone.compliance >= 90 ? "text-emerald-600" :
                                        zone.compliance >= 70 ? "text-amber-600" : "text-red-600"
                                    }`}>{zone.compliance}%</p>
                                    <p className="text-[10px] text-slate-500">Kepatuhan</p>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <p className="text-lg font-bold text-slate-900">{zone.workers}</p>
                                    <p className="text-[10px] text-slate-500">Pekerja</p>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <p className={`text-lg font-bold ${zone.alerts > 5 ? "text-red-600" : "text-slate-900"}`}>{zone.alerts}</p>
                                    <p className="text-[10px] text-slate-500">Peringatan</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
