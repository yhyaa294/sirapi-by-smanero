"use client";

import { MapPin, AlertTriangle, Shield, Eye } from "lucide-react";

export default function MapPage() {
    const zones = [
        { id: "A", name: "Gudang Utama", risk: "low", compliance: 96, workers: 45, alerts: 1 },
        { id: "B", name: "Area Assembly", risk: "medium", compliance: 78, workers: 62, alerts: 8 },
        { id: "C", name: "Welding Bay", risk: "low", compliance: 92, workers: 28, alerts: 2 },
        { id: "D", name: "Loading Dock", risk: "high", compliance: 65, workers: 35, alerts: 15 },
    ];

    const riskColors = {
        low: "bg-emerald-500",
        medium: "bg-amber-500",
        high: "bg-red-500",
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <MapPin className="text-orange-500" />
                    Peta Lokasi & Risk Heatmap
                </h1>
                <p className="text-slate-500">Visualisasi zona dan tingkat risiko area kerja</p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-lg">
                <span className="text-sm font-medium text-slate-700">Risk Level:</span>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-sm text-slate-600">Rendah</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-sm text-slate-600">Sedang</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-sm text-slate-600">Tinggi</span>
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
                        <div className="absolute top-4 left-4 w-[45%] h-[45%] bg-emerald-500/20 border-2 border-emerald-500 rounded-xl p-3 hover:bg-emerald-500/30 cursor-pointer transition-colors group">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-emerald-700">ZONA A</span>
                                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                            </div>
                            <p className="text-xs text-emerald-600 mt-1">Gudang Utama</p>
                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-emerald-700">96% Compliance • 45 pekerja</p>
                            </div>
                        </div>

                        {/* Zone B - Top Right */}
                        <div className="absolute top-4 right-4 w-[45%] h-[45%] bg-amber-500/20 border-2 border-amber-500 rounded-xl p-3 hover:bg-amber-500/30 cursor-pointer transition-colors group">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-700">ZONA B</span>
                                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                            </div>
                            <p className="text-xs text-amber-600 mt-1">Area Assembly</p>
                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-amber-700">78% Compliance • 62 pekerja</p>
                            </div>
                        </div>

                        {/* Zone C - Bottom Left */}
                        <div className="absolute bottom-4 left-4 w-[45%] h-[45%] bg-emerald-500/20 border-2 border-emerald-500 rounded-xl p-3 hover:bg-emerald-500/30 cursor-pointer transition-colors group">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-emerald-700">ZONA C</span>
                                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                            </div>
                            <p className="text-xs text-emerald-600 mt-1">Welding Bay</p>
                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-emerald-700">92% Compliance • 28 pekerja</p>
                            </div>
                        </div>

                        {/* Zone D - Bottom Right */}
                        <div className="absolute bottom-4 right-4 w-[45%] h-[45%] bg-red-500/20 border-2 border-red-500 rounded-xl p-3 hover:bg-red-500/30 cursor-pointer transition-colors group animate-pulse">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-red-700">ZONA D</span>
                                <AlertTriangle size={16} className="text-red-500" />
                            </div>
                            <p className="text-xs text-red-600 mt-1">Loading Dock</p>
                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-red-700">65% Compliance • 35 pekerja</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Zone Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Detail Zona</h3>

                    {zones.map((zone) => (
                        <div
                            key={zone.id}
                            className={`bg-white/90 backdrop-blur-xl border rounded-2xl p-4 shadow-lg cursor-pointer transition-all hover:shadow-xl ${zone.risk === "high" ? "border-red-300" :
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
                                    <p className={`text-lg font-bold ${zone.compliance >= 90 ? "text-emerald-600" :
                                            zone.compliance >= 70 ? "text-amber-600" : "text-red-600"
                                        }`}>{zone.compliance}%</p>
                                    <p className="text-[10px] text-slate-500">Compliance</p>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <p className="text-lg font-bold text-slate-900">{zone.workers}</p>
                                    <p className="text-[10px] text-slate-500">Pekerja</p>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <p className={`text-lg font-bold ${zone.alerts > 5 ? "text-red-600" : "text-slate-900"}`}>{zone.alerts}</p>
                                    <p className="text-[10px] text-slate-500">Alert</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
