"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, FileSpreadsheet, File, FileText, Clock } from "lucide-react";

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState<"charts" | "reports">("charts");
    const [dateRange, setDateRange] = useState("7d");
    const [reportType, setReportType] = useState("daily");
    const [isGenerating, setIsGenerating] = useState(false);

    // Chart data
    const weeklyData = [
        { day: "Sen", value: 65, color: "bg-orange-400" },
        { day: "Sel", value: 78, color: "bg-orange-400" },
        { day: "Rab", value: 82, color: "bg-orange-500" },
        { day: "Kam", value: 88, color: "bg-orange-500" },
        { day: "Jum", value: 75, color: "bg-orange-400" },
        { day: "Sab", value: 92, color: "bg-emerald-500" },
        { day: "Min", value: 94, color: "bg-emerald-500" },
    ];

    // Download handler
    const handleDownload = async (format: "csv" | "excel" | "pdf") => {
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (format === "csv") {
            const csvContent = `Tanggal,Compliance,Pelanggaran,Pekerja
17-12-2024,94.2%,12,248
16-12-2024,92.8%,15,245
15-12-2024,88.5%,22,252`;
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `smartapd-report-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            alert(`📄 ${format.toUpperCase()} - Memerlukan backend untuk generate file ini.`);
        }
        setIsGenerating(false);
    };

    return (
        <div className="space-y-4 md:space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="text-orange-500 w-5 h-5 md:w-6 md:h-6" />
                        Analisis & Laporan
                    </h1>
                    <p className="text-sm text-slate-500">Statistik dan ekspor laporan</p>
                </div>

                {/* Tab Toggle */}
                <div className="flex bg-slate-100 rounded-xl p-1 w-fit">
                    <button
                        onClick={() => setActiveTab("charts")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "charts" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                            }`}
                    >
                        📊 Grafik
                    </button>
                    <button
                        onClick={() => setActiveTab("reports")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "reports" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                            }`}
                    >
                        📄 Ekspor
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Compliance", value: "82.5%", trend: "+5.2%", up: true },
                    { label: "Total Deteksi", value: "1,247", trend: "+127", up: true },
                    { label: "Pelanggaran", value: "89", trend: "-23", up: false },
                    { label: "Kamera Aktif", value: "4/4", trend: "100%", up: true },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 shadow-sm">
                        <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
                        <div className="flex items-end justify-between mt-1">
                            <span className="text-lg md:text-2xl font-bold text-slate-900">{stat.value}</span>
                            <span className={`text-[10px] md:text-xs font-medium flex items-center gap-0.5 ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                                {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {activeTab === "charts" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                    {/* Bar Chart - IMPROVED */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Tren Compliance Mingguan</h3>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="text-xs md:text-sm px-2 py-1 bg-slate-100 rounded-lg border-0"
                            >
                                <option value="7d">7 Hari</option>
                                <option value="30d">30 Hari</option>
                            </select>
                        </div>

                        {/* Clean Bar Chart */}
                        <div className="space-y-3">
                            {weeklyData.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 w-8">{item.day}</span>
                                    <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 w-10 text-right">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Violation Types - IMPROVED */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Jenis Pelanggaran</h3>

                        <div className="space-y-4">
                            {[
                                { label: "No Helmet", count: 45, percent: 51, color: "bg-red-500" },
                                { label: "No Vest", count: 28, percent: 32, color: "bg-amber-500" },
                                { label: "No Gloves", count: 12, percent: 14, color: "bg-orange-400" },
                                { label: "No Boots", count: 4, percent: 4, color: "bg-blue-400" },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-700">{item.label}</span>
                                        <span className="font-medium text-slate-900">{item.count} <span className="text-slate-400">({item.percent}%)</span></span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Total Pelanggaran</span>
                                <span className="font-bold text-slate-900">89</span>
                            </div>
                        </div>
                    </div>

                    {/* Zone Performance - Full Width */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Performa per Zona</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { zone: "A", name: "Gudang", value: 96, status: "good" },
                                { zone: "B", name: "Assembly", value: 78, status: "warning" },
                                { zone: "C", name: "Welding", value: 92, status: "good" },
                                { zone: "D", name: "Loading", value: 65, status: "danger" },
                            ].map((z, i) => (
                                <div key={i} className={`p-3 md:p-4 rounded-xl border-2 ${z.status === "good" ? "border-emerald-200 bg-emerald-50" :
                                        z.status === "warning" ? "border-amber-200 bg-amber-50" :
                                            "border-red-200 bg-red-50"
                                    }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-slate-800">TITIK {z.zone}</span>
                                        <span className={`text-lg font-bold ${z.status === "good" ? "text-emerald-600" :
                                                z.status === "warning" ? "text-amber-600" : "text-red-600"
                                            }`}>{z.value}%</span>
                                    </div>
                                    <p className="text-xs text-slate-500">{z.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* EXPORT VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Ekspor Laporan</h3>

                        {/* Report Type */}
                        <div className="mb-4">
                            <label className="text-sm text-slate-600 mb-2 block">Periode</label>
                            <div className="grid grid-cols-3 gap-2">
                                {["daily", "weekly", "monthly"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setReportType(type)}
                                        className={`py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${reportType === type
                                                ? "border-orange-500 bg-orange-50 text-orange-700"
                                                : "border-slate-200 text-slate-600"
                                            }`}
                                    >
                                        {type === "daily" ? "Harian" : type === "weekly" ? "Mingguan" : "Bulanan"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Download Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => handleDownload("csv")}
                                disabled={isGenerating}
                                className="flex flex-col items-center gap-1 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50"
                            >
                                <FileSpreadsheet size={24} />
                                <span className="text-sm font-medium">CSV</span>
                            </button>
                            <button
                                onClick={() => handleDownload("excel")}
                                disabled={isGenerating}
                                className="flex flex-col items-center gap-1 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50"
                            >
                                <FileSpreadsheet size={24} />
                                <span className="text-sm font-medium">Excel</span>
                            </button>
                            <button
                                onClick={() => handleDownload("pdf")}
                                disabled={isGenerating}
                                className="flex flex-col items-center gap-1 p-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors disabled:opacity-50"
                            >
                                <File size={24} />
                                <span className="text-sm font-medium">PDF</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Riwayat</h3>
                        <div className="space-y-2">
                            {[
                                { name: "Harian - 17 Des", size: "2.4 MB" },
                                { name: "Harian - 16 Des", size: "2.1 MB" },
                                { name: "Mingguan - Minggu 50", size: "8.7 MB" },
                            ].map((r, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-orange-500" />
                                        <span className="text-sm text-slate-700">{r.name}</span>
                                    </div>
                                    <button className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1">
                                        <Download size={12} /> {r.size}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
