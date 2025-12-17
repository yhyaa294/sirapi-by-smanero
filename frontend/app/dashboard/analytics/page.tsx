"use client";

import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Filter } from "lucide-react";

export default function AnalyticsPage() {
    // Dummy data for charts
    const dailyData = [65, 78, 82, 88, 75, 92, 94];
    const maxValue = Math.max(...dailyData);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <BarChart3 className="text-orange-500" />
                        Analisis & Statistik
                    </h1>
                    <p className="text-slate-500">Tren kepatuhan APD dan performa deteksi</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
                        <Calendar size={18} />
                        7 Hari Terakhir
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Rata-rata Compliance", value: "82.5%", trend: "+5.2%", up: true, color: "emerald" },
                    { label: "Total Deteksi", value: "1,247", trend: "+127", up: true, color: "blue" },
                    { label: "Pelanggaran Minggu Ini", value: "89", trend: "-23", up: false, color: "red" },
                    { label: "Kamera Aktif", value: "4/4", trend: "100%", up: true, color: "purple" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-5 shadow-lg">
                        <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                            <div className={`flex items-center gap-1 text-sm font-medium ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>
                                {stat.up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {stat.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Compliance Trend Chart */}
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Tren Compliance Mingguan</h3>
                        <Filter size={18} className="text-slate-400" />
                    </div>

                    {/* Bar Chart */}
                    <div className="h-64 flex items-end justify-between gap-4">
                        {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all hover:from-orange-600 hover:to-orange-500"
                                    style={{ height: `${(dailyData[i] / maxValue) * 100}%` }}
                                >
                                    <div className="text-center text-white text-xs font-bold pt-2">{dailyData[i]}%</div>
                                </div>
                                <span className="text-xs text-slate-500 font-medium">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Violation by Type */}
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Jenis Pelanggaran</h3>
                        <span className="text-sm text-slate-500">Minggu ini</span>
                    </div>

                    {/* Horizontal Bar Chart */}
                    <div className="space-y-4">
                        {[
                            { label: "No Helmet", count: 45, percent: 51, color: "bg-red-500" },
                            { label: "No Vest", count: 28, percent: 32, color: "bg-amber-500" },
                            { label: "No Gloves", count: 12, percent: 14, color: "bg-orange-500" },
                            { label: "No Boots", count: 4, percent: 4, color: "bg-blue-500" },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-900">{item.label}</span>
                                    <span className="text-slate-500">{item.count} ({item.percent}%)</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} rounded-full`}
                                        style={{ width: `${item.percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Zone Performance */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Performa per Zona</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { zone: "TITIK A", location: "Gudang", compliance: 96, status: "excellent" },
                        { zone: "TITIK B", location: "Assembly", compliance: 78, status: "warning" },
                        { zone: "TITIK C", location: "Welding", compliance: 92, status: "good" },
                        { zone: "TITIK D", location: "Loading", compliance: 65, status: "critical" },
                    ].map((zone, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-slate-900">{zone.zone}</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${zone.status === "excellent" ? "bg-emerald-100 text-emerald-700" :
                                        zone.status === "good" ? "bg-blue-100 text-blue-700" :
                                            zone.status === "warning" ? "bg-amber-100 text-amber-700" :
                                                "bg-red-100 text-red-700"
                                    }`}>
                                    {zone.compliance}%
                                </span>
                            </div>
                            <p className="text-sm text-slate-500">{zone.location}</p>
                            <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${zone.status === "excellent" ? "bg-emerald-500" :
                                            zone.status === "good" ? "bg-blue-500" :
                                                zone.status === "warning" ? "bg-amber-500" :
                                                    "bg-red-500"
                                        }`}
                                    style={{ width: `${zone.compliance}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
