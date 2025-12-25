"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download, AlertTriangle, CheckCircle, Clock, ShieldAlert, FileText, Filter, FileSpreadsheet, Calendar, RefreshCw, Camera, TrendingUp, TrendingDown, ExternalLink, MapPin } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "@/services/api";

// Types
interface Detection {
    id: number;
    camera_id: number;
    violation_type: string;
    confidence: number;
    image_path: string;
    location: string;
    is_violation: boolean;
    detected_at: string;
    created_at: string;
}

interface Stats {
    compliance: number;
    totalDetections: number;
    violationsToday: number;
    workersActive: number;
}

interface ViolationCount {
    name: string;
    count: number;
}

export default function AnalyticsPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [stats, setStats] = useState<Stats>({ compliance: 0, totalDetections: 0, violationsToday: 0, workersActive: 0 });
    const [detections, setDetections] = useState<Detection[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [violationCounts, setViolationCounts] = useState<ViolationCount[]>([]);
    const [trendData, setTrendData] = useState<{ time: string; score: number }[]>([]);

    // Fetch real data from API and AI Engine
    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch real-time stats from AI Engine
            try {
                const aiStatsResponse = await fetch('http://localhost:8000/api/realtime-stats');
                if (aiStatsResponse.ok) {
                    const aiStats = await aiStatsResponse.json();
                    setStats({
                        compliance: aiStats.compliance_rate || 100,
                        totalDetections: aiStats.total_detections || 0,
                        violationsToday: aiStats.violations_today || 0,
                        workersActive: aiStats.cameras_online || 1,
                    });

                    // Set violation counts from AI
                    setViolationCounts([
                        { name: "No vest", count: aiStats.no_vest || 0 },
                        { name: "No gloves", count: aiStats.no_gloves || 0 },
                        { name: "No helmet", count: aiStats.no_helmet || 0 },
                        { name: "No boots", count: aiStats.no_boots || 0 },
                    ].filter(v => v.count > 0).sort((a, b) => b.count - a.count));
                }
            } catch (aiError) {
                console.log('AI Engine not available, falling back to backend');
                // Fallback to backend if AI Engine is not running
                const statsData = await api.getDetectionStats();
                setStats(statsData);
            }

            // Fetch detections from backend
            const detectionsData = await api.getDetections(50) as unknown as Detection[];
            setDetections(detectionsData);

            // Generate trend data from detections
            const hourlyCompliance: Record<string, { total: number; violations: number }> = {};
            detectionsData.forEach((d: Detection) => {
                const hour = new Date(d.detected_at || d.created_at).getHours();
                const timeKey = `${hour.toString().padStart(2, '0')}:00`;
                if (!hourlyCompliance[timeKey]) {
                    hourlyCompliance[timeKey] = { total: 0, violations: 0 };
                }
                hourlyCompliance[timeKey].total++;
                if (d.is_violation) {
                    hourlyCompliance[timeKey].violations++;
                }
            });

            const trend = Object.entries(hourlyCompliance).map(([time, data]) => ({
                time,
                score: data.total > 0 ? Math.round((1 - data.violations / data.total) * 100) : 100
            }));
            trend.sort((a, b) => a.time.localeCompare(b.time));
            setTrendData(trend.length > 0 ? trend : [
                { time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), score: stats.compliance }
            ]);

            setLastUpdate(new Date());
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Generate PDF Report
    const handleDownloadPDF = async (type: 'daily' | 'weekly' | 'monthly' = 'daily') => {
        setIsGenerating(true);
        setShowDownloadMenu(false);

        const doc = new jsPDF();
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        // ========== HEADER ==========
        // Orange header bar
        doc.setFillColor(249, 115, 22);
        doc.rect(0, 0, 210, 32, 'F');

        // Logo circle placeholder (orange on white)
        doc.setFillColor(255, 255, 255);
        doc.circle(22, 16, 8, 'F');
        doc.setFillColor(249, 115, 22);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(249, 115, 22);
        doc.text("S", 19.5, 19);

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text("SmartAPD", 35, 14);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("HSE Command Center | Laporan Kepatuhan APD", 35, 22);

        // Report type badge
        const typeLabels = { daily: 'LAPORAN HARIAN', weekly: 'LAPORAN MINGGUAN', monthly: 'LAPORAN BULANAN' };
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(typeLabels[type], 196, 12, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(dateStr, 196, 18, { align: 'right' });
        doc.text(`Dibuat: ${timeStr} WIB`, 196, 24, { align: 'right' });

        // Reset colors
        doc.setTextColor(0, 0, 0);

        // Executive Summary Box
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, 42, 182, 45, 3, 3, 'F');

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("RINGKASAN EKSEKUTIF", 20, 52);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summary = `Tingkat kepatuhan APD: ${stats.compliance.toFixed(1)}% | Total deteksi: ${stats.totalDetections} | Pelanggaran hari ini: ${stats.violationsToday}

Berdasarkan analisis AI SmartAPD dalam periode ${type === 'daily' ? '24 jam' : type === 'weekly' ? '7 hari' : '30 hari'} terakhir, sistem telah memproses ${stats.totalDetections} deteksi dengan ${detections.filter(d => d.is_violation).length} pelanggaran APD teridentifikasi. ${stats.compliance >= 90 ? 'Tingkat kepatuhan dalam kondisi BAIK.' : stats.compliance >= 70 ? 'Tingkat kepatuhan perlu PERHATIAN.' : 'Tingkat kepatuhan dalam kondisi KRITIS, perlu tindakan segera.'}`;

        const lines = doc.splitTextToSize(summary, 172);
        doc.text(lines, 20, 60);

        // KPI Cards
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("STATISTIK KEPATUHAN", 14, 98);

        const kpiY = 105;
        const kpiWidth = 42;
        const kpiGap = 4;

        // Safety Score
        doc.setFillColor(16, 185, 129);
        doc.roundedRect(14, kpiY, kpiWidth, 25, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text(`${stats.compliance.toFixed(0)}%`, 35, kpiY + 12, { align: 'center' });
        doc.setFontSize(8);
        doc.text("Safety Score", 35, kpiY + 20, { align: 'center' });

        // Total Violations
        doc.setFillColor(239, 68, 68);
        doc.roundedRect(14 + kpiWidth + kpiGap, kpiY, kpiWidth, 25, 2, 2, 'F');
        doc.setFontSize(18);
        doc.text(`${stats.violationsToday}`, 35 + kpiWidth + kpiGap, kpiY + 12, { align: 'center' });
        doc.setFontSize(8);
        doc.text("Pelanggaran", 35 + kpiWidth + kpiGap, kpiY + 20, { align: 'center' });

        // Total Detections
        doc.setFillColor(59, 130, 246);
        doc.roundedRect(14 + (kpiWidth + kpiGap) * 2, kpiY, kpiWidth, 25, 2, 2, 'F');
        doc.setFontSize(18);
        doc.text(`${stats.totalDetections}`, 35 + (kpiWidth + kpiGap) * 2, kpiY + 12, { align: 'center' });
        doc.setFontSize(8);
        doc.text("Total Deteksi", 35 + (kpiWidth + kpiGap) * 2, kpiY + 20, { align: 'center' });

        // Active Cameras
        doc.setFillColor(249, 115, 22);
        doc.roundedRect(14 + (kpiWidth + kpiGap) * 3, kpiY, kpiWidth, 25, 2, 2, 'F');
        doc.setFontSize(18);
        doc.text("4", 35 + (kpiWidth + kpiGap) * 3, kpiY + 12, { align: 'center' });
        doc.setFontSize(8);
        doc.text("Kamera Aktif", 35 + (kpiWidth + kpiGap) * 3, kpiY + 20, { align: 'center' });

        doc.setTextColor(0, 0, 0);

        // Violation Table
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("RIWAYAT PELANGGARAN", 14, 145);

        const tableData = detections.slice(0, 15).map((d, i) => [
            `DET-${String(d.id || i + 1).padStart(3, '0')}`,
            new Date(d.detected_at || d.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            `TITIK ${String.fromCharCode(64 + (d.camera_id || 1))} - ${d.location || 'Unknown'}`,
            d.violation_type?.replace('no_', 'No ').replace('_', ' ') || 'Unknown',
            `${(d.confidence * 100).toFixed(0)}%`,
            d.is_violation ? 'Violation' : 'OK'
        ]);

        autoTable(doc, {
            startY: 150,
            head: [['ID', 'Waktu', 'Lokasi', 'Jenis', 'Confidence', 'Status']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [249, 115, 22], fontSize: 9 },
            styles: { fontSize: 8, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 22 },
                1: { cellWidth: 18 },
                2: { cellWidth: 50 },
                3: { cellWidth: 30 },
                4: { cellWidth: 25 },
                5: { cellWidth: 22 }
            }
        });

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
            doc.text(`SmartAPD AI Safety System | Generated: ${now.toLocaleString('id-ID')}`, 14, 285);
        }

        // Save
        doc.save(`SmartAPD_Report_${type}_${now.toISOString().split('T')[0]}.pdf`);
        setIsGenerating(false);
    };

    // Export CSV
    const handleExportCSV = () => {
        const headers = ['ID', 'Timestamp', 'Camera', 'Location', 'Violation Type', 'Confidence', 'Is Violation'];
        const rows = detections.map(d => [
            d.id,
            d.detected_at || d.created_at,
            `TITIK ${String.fromCharCode(64 + (d.camera_id || 1))}`,
            d.location,
            d.violation_type,
            d.confidence,
            d.is_violation
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SmartAPD_Data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        setShowDownloadMenu(false);
    };

    const complianceChange = stats.compliance >= 90 ? '+' : '';

    return (
        <div className="space-y-8 p-4 md:p-8 pb-20 min-h-screen bg-slate-950">

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">ANALYTICS & REPORT</h1>
                    <p className="text-slate-400 flex items-center gap-2">
                        Analisis K3 berbasis AI dan Laporan Otomatis.
                        <span className="text-xs text-slate-500" suppressHydrationWarning>
                            Update: {lastUpdate.toLocaleTimeString('id-ID')}
                        </span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                </div>
            </div>

            {/* KPI CARDS - Real-time Data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><CheckCircle /></div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${stats.compliance >= 90
                            ? 'text-emerald-500 bg-emerald-500/10'
                            : 'text-red-500 bg-red-500/10'
                            }`}>
                            {stats.compliance >= 90 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {complianceChange}{stats.compliance >= 90 ? '2.4%' : '-3.1%'}
                        </span>
                    </div>
                    <h3 className="text-4xl font-black text-white mb-1">{stats.compliance.toFixed(1)}%</h3>
                    <p className="text-sm text-slate-400 font-medium">Safety Score</p>
                </div>
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><AlertTriangle /></div>
                        <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                            {stats.violationsToday > 0 ? `+${stats.violationsToday} New` : 'Clear'}
                        </span>
                    </div>
                    <h3 className="text-4xl font-black text-white mb-1">{stats.violationsToday}</h3>
                    <p className="text-sm text-slate-400 font-medium">Total Pelanggaran</p>
                </div>
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Clock /></div>
                    </div>
                    <h3 className="text-4xl font-black text-white mb-1">{stats.totalDetections}</h3>
                    <p className="text-sm text-slate-400 font-medium">Total Deteksi AI</p>
                </div>
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500"><Camera /></div>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    </div>
                    <h3 className="text-4xl font-black text-white mb-1">4</h3>
                    <p className="text-sm text-slate-400 font-medium">Kamera Aktif</p>
                </div>
            </div>

            {/* ZONE SAFETY HEALTH & TOP VIOLATORS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Visual Zone Safety - Simplified */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <MapPin size={18} className="text-orange-500" />
                            Status Keamanan Area (Live Zone Health)
                        </h3>
                        <div className="flex gap-2 text-xs">
                            <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-slate-400">
                                Total Zones: <span className="text-white font-bold">3</span>
                            </div>
                            <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-slate-400">
                                Monitored: <span className="text-emerald-400 font-bold">100%</span>
                            </div>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Zone 1: Loading Dock (High Risk) */}
                        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 border border-red-500/30 rounded-2xl relative overflow-hidden group hover:border-red-500/50 transition-all cursor-pointer">
                            <div className="absolute top-0 right-0 p-16 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/20 transition-all"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-slate-950/50 rounded-lg group-hover:scale-110 transition-transform">
                                        <AlertTriangle size={20} className="text-red-500" />
                                    </div>
                                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded uppercase tracking-wider">KRITIS</span>
                                </div>
                                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Loading Dock</h4>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-3xl font-bold text-white">45%</span>
                                    <span className="text-xs text-red-400 mb-1 font-bold">Safety Score</span>
                                </div>
                                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full bg-red-500 w-[45%] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                    3 Active Violations
                                </p>
                            </div>
                        </div>

                        {/* Zone 2: Welding Bay (Med Risk) */}
                        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 border border-yellow-500/30 rounded-2xl relative overflow-hidden group hover:border-yellow-500/50 transition-all cursor-pointer">
                            <div className="absolute top-0 right-0 p-16 bg-yellow-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-500/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-slate-950/50 rounded-lg group-hover:scale-110 transition-transform">
                                        <AlertTriangle size={20} className="text-yellow-500" />
                                    </div>
                                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded uppercase tracking-wider">WASPADA</span>
                                </div>
                                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Welding Bay</h4>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-3xl font-bold text-white">78%</span>
                                    <span className="text-xs text-yellow-400 mb-1 font-bold">Safety Score</span>
                                </div>
                                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full bg-yellow-500 w-[78%] shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                    No Helmet Detected
                                </p>
                            </div>
                        </div>

                        {/* Zone 3: Main Entrance (Safe) */}
                        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 border border-emerald-500/30 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-all cursor-pointer">
                            <div className="absolute top-0 right-0 p-16 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-slate-950/50 rounded-lg group-hover:scale-110 transition-transform">
                                        <CheckCircle size={20} className="text-emerald-500" />
                                    </div>
                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider">AMAN</span>
                                </div>
                                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Main Entrance</h4>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-3xl font-bold text-white">98%</span>
                                    <span className="text-xs text-emerald-400 mb-1 font-bold">Safety Score</span>
                                </div>
                                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[98%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                    Fully Compliant
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Violator Card */}
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col h-full">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingDown size={18} className="text-red-500" />
                        Top Violator / Divisi
                    </h3>
                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                        {[
                            { name: "Tim Logistik", score: 92, status: "Aman", color: "emerald", violations: 2 },
                            { name: "Tim Produksi A", score: 85, status: "Waspada", color: "yellow", violations: 5 },
                            { name: "Tim Produksi B", score: 45, status: "Kritis", color: "red", violations: 12 },
                            { name: "Vendor Eksternal", score: 60, status: "Perlu Training", color: "orange", violations: 8 },
                        ].map((team, i) => (
                            <div key={i} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 relative overflow-hidden group hover:bg-slate-800/70 transition-colors cursor-pointer">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${team.color}-500 transition-all group-hover:w-1.5`}></div>
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-white text-sm">{team.name}</h4>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-${team.color}-500/20 text-${team.color}-400`}>
                                        {team.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                        <div className={`h-full bg-${team.color}-500`} style={{ width: `${team.score}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{team.score}%</span>
                                </div>
                                <p className="text-xs text-slate-500 flex justify-between">
                                    <span>Compliance Rate</span>
                                    <span className="text-slate-400">{team.violations} Issues</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Chart */}
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <FileText size={18} className="text-orange-500" />
                    Tren Kepatuhan (Live)
                    <span className="ml-auto text-xs text-slate-500 font-normal">Data real-time dari AI Engine</span>
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                            <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Violation Type Chart */}
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                <h3 className="text-lg font-bold text-white mb-6">Jenis Pelanggaran</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={violationCounts.length > 0 ? violationCounts : [
                            { name: "No Helmet", count: 0 },
                            { name: "No Vest", count: 0 },
                            { name: "No Gloves", count: 0 },
                        ]} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                            <XAxis type="number" stroke="#64748b" hide />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} cursor={{ fill: '#1e293b' }} />
                            <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* SHIFT ANALYSIS HEATMAP */}
            <div className="lg:col-span-3 p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock size={18} className="text-blue-500" />
                        Analisis Waktu Operasional (Shift Heatmap)
                    </h3>
                    <div className="flex gap-2 text-xs">
                        <span className="flex items-center gap-1 text-slate-400"><div className="w-3 h-3 bg-slate-800 rounded-sm"></div> Aman</span>
                        <span className="flex items-center gap-1 text-slate-400"><div className="w-3 h-3 bg-red-900 rounded-sm"></div> Rendah</span>
                        <span className="flex items-center gap-1 text-slate-400"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Tinggi</span>
                    </div>
                </div>

                <div className="scrollbar-thin scrollbar-thumb-slate-700 pb-4 overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Hours Header */}
                        <div className="flex mb-2">
                            <div className="w-20 shrink-0"></div> {/* Label Spacer */}
                            {Array.from({ length: 14 }).map((_, i) => (
                                <div key={i} className="flex-1 text-center text-xs text-slate-500 font-mono">
                                    {(i + 6).toString().padStart(2, '0')}:00
                                </div>
                            ))}
                        </div>

                        {/* Days Rows */}
                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day, dayIndex) => (
                            <div key={day} className="flex items-center mb-2">
                                <div className="w-20 shrink-0 text-xs font-bold text-slate-400">{day}</div>
                                <div className="flex-1 flex gap-1">
                                    {Array.from({ length: 14 }).map((_, hourIndex) => {
                                        // Mock data logic: Random intensity based on "Work Hours"
                                        // More violations around 10:00 (hourIndex 4) and 14:00 (hourIndex 8)
                                        const hour = hourIndex + 6;
                                        let intensity = 0;

                                        // Random seed based on day/hour
                                        const seed = (dayIndex * 14 + hourIndex) % 7;

                                        if (hour >= 8 && hour <= 16) {
                                            if (hour === 10 || hour === 11 || hour === 14) intensity = 2 + (seed % 3); // High
                                            else intensity = 1 + (seed % 2); // Medium
                                        }

                                        // Special case: Friday before break
                                        if (day === 'Jumat' && hour === 11) intensity = 4;

                                        // Colors
                                        let bgClass = "bg-slate-800"; // 0
                                        if (intensity === 1) bgClass = "bg-emerald-900/30";
                                        if (intensity === 2) bgClass = "bg-yellow-900/40";
                                        if (intensity === 3) bgClass = "bg-orange-600/60";
                                        if (intensity >= 4) bgClass = "bg-red-600";

                                        return (
                                            <div
                                                key={hour}
                                                className={`flex-1 h-8 rounded-sm ${bgClass} transition-all hover:opacity-80 cursor-pointer group relative`}
                                            >
                                                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-white rounded whitespace-nowrap z-10">
                                                    {day} {hour}:00 - {intensity > 0 ? `${intensity * 3} Pelanggaran` : 'Aman'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* REPORT GENERATOR SECTION - MERGED */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Quick Export */}
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Download size={18} className="text-orange-500" />
                        Quick Export
                    </h3>
                    <p className="text-slate-400 mb-6 text-sm">Download laporan standar dalam format PDF atau CSV.</p>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleDownloadPDF('daily')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-3 transition-colors text-left group">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 group-hover:text-white group-hover:bg-orange-500 transition-colors"><FileText size={18} /></div>
                            <div>
                                <p className="text-white font-bold text-sm">Harian</p>
                                <p className="text-xs text-slate-500">Just now</p>
                            </div>
                        </button>
                        <button onClick={() => handleDownloadPDF('weekly')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-3 transition-colors text-left group">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:text-white group-hover:bg-blue-500 transition-colors"><FileText size={18} /></div>
                            <div>
                                <p className="text-white font-bold text-sm">Mingguan</p>
                                <p className="text-xs text-slate-500">Last 7 days</p>
                            </div>
                        </button>
                        <button onClick={() => handleDownloadPDF('monthly')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-3 transition-colors text-left group">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 group-hover:text-white group-hover:bg-purple-500 transition-colors"><FileText size={18} /></div>
                            <div>
                                <p className="text-white font-bold text-sm">Bulanan</p>
                                <p className="text-xs text-slate-500">Last 30 days</p>
                            </div>
                        </button>
                        <button onClick={handleExportCSV} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-3 transition-colors text-left group">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:text-white group-hover:bg-emerald-500 transition-colors"><FileSpreadsheet size={18} /></div>
                            <div>
                                <p className="text-white font-bold text-sm">CSV Data</p>
                                <p className="text-xs text-slate-500">Raw Data</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Custom Report Builder Link */}
                <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-auto">
                            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-lg">
                                <Filter className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Custom Report Generator</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Buat laporan spesifik berdasarkan parameter custom: rentang tanggal, filter jenis pelanggaran, zona kamera, dan shift kerja tertentu.
                            </p>
                            <ul className="space-y-2 mb-6">
                                <li className="flex items-center gap-2 text-xs text-slate-300"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Filter by Date Range</li>
                                <li className="flex items-center gap-2 text-xs text-slate-300"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Specific Camera Zones</li>
                                <li className="flex items-center gap-2 text-xs text-slate-300"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Include Evidence Photos</li>
                            </ul>
                        </div>

                        <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                            Mulai Custom Report <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
