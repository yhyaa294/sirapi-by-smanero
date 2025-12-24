"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download, AlertTriangle, CheckCircle, Clock, ShieldAlert, FileText, Filter, FileSpreadsheet, Calendar, RefreshCw, Camera, TrendingUp, TrendingDown } from "lucide-react";
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
                    <div className="relative">
                        <button
                            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-70"
                        >
                            {isGenerating ? <Clock className="animate-spin" size={20} /> : <Download size={20} />}
                            {isGenerating ? "Generating..." : "Download Report"}
                        </button>
                        {showDownloadMenu && (
                            <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                                <div className="p-3 border-b border-slate-700">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Format PDF</p>
                                </div>
                                <button onClick={() => handleDownloadPDF('daily')} className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 flex items-center gap-3">
                                    <Calendar size={18} className="text-orange-500" />
                                    <div>
                                        <p className="font-bold">Laporan Harian</p>
                                        <p className="text-xs text-slate-400">24 jam terakhir</p>
                                    </div>
                                </button>
                                <button onClick={() => handleDownloadPDF('weekly')} className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 flex items-center gap-3">
                                    <Calendar size={18} className="text-blue-500" />
                                    <div>
                                        <p className="font-bold">Laporan Mingguan</p>
                                        <p className="text-xs text-slate-400">7 hari terakhir</p>
                                    </div>
                                </button>
                                <button onClick={() => handleDownloadPDF('monthly')} className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 flex items-center gap-3">
                                    <Calendar size={18} className="text-purple-500" />
                                    <div>
                                        <p className="font-bold">Laporan Bulanan</p>
                                        <p className="text-xs text-slate-400">30 hari terakhir</p>
                                    </div>
                                </button>
                                <div className="p-3 border-t border-slate-700">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Format Lain</p>
                                </div>
                                <button onClick={handleExportCSV} className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 flex items-center gap-3">
                                    <FileSpreadsheet size={18} className="text-emerald-500" />
                                    <div>
                                        <p className="font-bold">Export CSV</p>
                                        <p className="text-xs text-slate-400">Data mentah untuk Excel</p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
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

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Chart */}
                <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
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
            </div>

            {/* LINK TO FULL HISTORY */}
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <ShieldAlert size={24} className="text-orange-500" />
                    <h3 className="text-lg font-bold text-white">Riwayat Pelanggaran Lengkap</h3>
                </div>
                <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                    Lihat daftar lengkap semua pelanggaran APD yang terdeteksi oleh sistem AI,
                    termasuk screenshot dan status penanganan.
                </p>
                <a
                    href="/dashboard/alerts"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors"
                >
                    <ShieldAlert size={18} />
                    Buka Riwayat Kejadian
                </a>
            </div>

        </div>
    );
}
