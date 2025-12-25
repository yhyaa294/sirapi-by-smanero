"use client";

import React, { useState, useEffect } from 'react';
import {
    Activity,
    AlertTriangle,
    BarChart2,
    Calendar,
    CheckCircle,
    ChevronDown,
    Clock,
    Download,
    FileText,
    Filter,
    LayoutGrid,
    MoreHorizontal,
    PieChart,
    RefreshCw,
    Search,
    Share2,
    Sliders,
    TrendingDown,
    TrendingUp,
    Users,
    Video,
    Zap,
    MapPin,
    Camera,
    FileSpreadsheet,
    ExternalLink
} from 'lucide-react';
import { api, Detection, DetectionStats } from '@/services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface ViolationCount {
    name: string;
    count: number;
}

interface ZoneStat {
    name: string;
    score: number;
    status: string;
    violations: number;
    violationType: string;
    bgBorder: string;
    bgSoft: string;
    iconColor: string;
    progressColor: string;
}

interface TeamStat {
    name: string;
    score: number;
    status: string;
    color: string;
    violations: number;
}

interface Stats {
    compliance: number;
    totalDetections: number;
    violationsToday: number;
    workersActive: number;
}

import ReportExportModal from '@/components/ReportExportModal';

export default function AnalyticsPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [stats, setStats] = useState<Stats>({ compliance: 0, totalDetections: 0, violationsToday: 0, workersActive: 0 });

    const [detections, setDetections] = useState<Detection[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [violationCounts, setViolationCounts] = useState<ViolationCount[]>([]);
    const [trendData, setTrendData] = useState<{ time: string; score: number }[]>([]);
    const [zoneStats, setZoneStats] = useState<ZoneStat[]>([]);
    const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
    const [cameraCount, setCameraCount] = useState(0);

    // Fetch real data from API and AI Engine (Optimized Parallel Fetch)
    const fetchData = async () => {
        try {
            setLoading(true);

            // Run requests in parallel to reduce wait time
            const [aiStatsResult, detectionsData, camerasData] = await Promise.all([
                // Fetch AI Stats
                fetch('http://localhost:8000/api/realtime-stats')
                    .then(res => res.ok ? res.json() : null)
                    .catch(() => null),
                // Fetch Detections
                api.getDetections(100) as unknown as Promise<Detection[]>,
                // Fetch Cameras from backend (source of truth)
                api.getCameras()
            ]);

            // Set camera count from backend (source of truth)
            const activeCameras = (camerasData || []).filter((c: any) => c.is_active);
            setCameraCount(activeCameras.length);

            // Process Stats
            if (aiStatsResult) {
                setStats({
                    compliance: aiStatsResult.compliance_rate || 100,
                    totalDetections: aiStatsResult.total_detections || 0,
                    violationsToday: aiStatsResult.violations_today || 0,
                    workersActive: aiStatsResult.cameras_online || 1,
                });

                setViolationCounts([
                    { name: "No vest", count: aiStatsResult.no_vest || 0 },
                    { name: "No gloves", count: aiStatsResult.no_gloves || 0 },
                    { name: "No helmet", count: aiStatsResult.no_helmet || 0 },
                    { name: "No boots", count: aiStatsResult.no_boots || 0 },
                ].filter((v: any) => v.count > 0).sort((a: any, b: any) => b.count - a.count));
            } else {
                console.log('AI Engine not available, falling back to backend');
                const statsData = await api.getDetectionStats();
                setStats(statsData);
            }

            // Process Zones & Teams
            const zones: Record<string, ZoneStat> = {};
            const defaultZones = ["Loading Dock", "Welding Bay", "Main Entrance", "Chemical Store"];

            // Initial Zones
            defaultZones.forEach(z => {
                zones[z] = {
                    name: z, score: 100, status: "AMAN", violations: 0, violationType: "Compliant",
                    bgBorder: "border-emerald-500/30", bgSoft: "bg-emerald-500/10", iconColor: "text-emerald-500", progressColor: "bg-emerald-500"
                };
            });

            if (detectionsData && detectionsData.length > 0) {
                setDetections(detectionsData);

                detectionsData.forEach((d: Detection) => {
                    let zoneName = "Unknown";
                    const loc = (d.location || "").toLowerCase();
                    if (loc.includes("gudang") || d.camera_id === 1) zoneName = "Loading Dock";
                    else if (loc.includes("produksi") || d.camera_id === 2) zoneName = "Welding Bay";
                    else if (loc.includes("lapor") || loc.includes("pintu") || d.camera_id === 3) zoneName = "Main Entrance";
                    else if (loc.includes("kimia")) zoneName = "Chemical Store";
                    else zoneName = "Chemical Store"; // Fallback demo

                    if (!zones[zoneName]) zones[zoneName] = { ...zones["Loading Dock"], name: zoneName, score: 100, violations: 0 };

                    if (d.is_violation) {
                        zones[zoneName].violations += 1;
                        zones[zoneName].score = Math.max(0, zones[zoneName].score - 10); // Penalty
                        zones[zoneName].violationType = d.violation_type.replace("no_", "No ");

                        const s = zones[zoneName].score;
                        zones[zoneName].status = s < 60 ? "KRITIS" : s < 85 ? "WASPADA" : "AMAN";

                        if (zones[zoneName].status === "KRITIS") {
                            zones[zoneName].bgBorder = "border-red-500/30"; zones[zoneName].bgSoft = "bg-red-500/10"; zones[zoneName].iconColor = "text-red-500"; zones[zoneName].progressColor = "bg-red-500";
                        } else if (zones[zoneName].status === "WASPADA") {
                            zones[zoneName].bgBorder = "border-yellow-500/30"; zones[zoneName].bgSoft = "bg-yellow-500/10"; zones[zoneName].iconColor = "text-yellow-500"; zones[zoneName].progressColor = "bg-yellow-500";
                        }
                    }
                });
            } else {
                setDetections([]);
            }
            setZoneStats(Object.values(zones));

            // Mock Team Mapping
            const processedTeams = [
                { name: "Tim Logistik", score: zones["Loading Dock"]?.score || 100, violations: zones["Loading Dock"]?.violations || 0, color: "emerald", status: "Aman" },
                { name: "Tim Produksi", score: zones["Welding Bay"]?.score || 100, violations: zones["Welding Bay"]?.violations || 0, color: "yellow", status: "Perlu Review" },
                { name: "Vendor Sec", score: zones["Main Entrance"]?.score || 100, violations: zones["Main Entrance"]?.violations || 0, color: "emerald", status: "Aman" },
                { name: "Tim Maintenance", score: zones["Chemical Store"]?.score || 100, violations: zones["Chemical Store"]?.violations || 0, color: "blue", status: "Aman" },
            ].map(t => {
                if (t.score < 60) { t.color = "red"; t.status = "Kritis"; }
                else if (t.score < 85) { t.color = "yellow"; t.status = "Waspada"; }
                else { t.color = "emerald"; t.status = "Aman"; }
                return t;
            }).sort((a, b) => a.score - b.score);
            setTeamStats(processedTeams);


            const hourlyCompliance: Record<string, { total: number; violations: number }> = {};
            (detectionsData || []).forEach((d: Detection) => {
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
                { time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), score: aiStatsResult?.compliance_rate || 100 }
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
        const interval = setInterval(fetchData, 5000); // Faster update for "Live" feel
        return () => clearInterval(interval);
    }, []);



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
                    <h3 className="text-4xl font-black text-white mb-1">{cameraCount}</h3>
                    <p className="text-sm text-slate-400 font-medium">Kamera Aktif</p>
                </div>
            </div>

            {/* ZONE SAFETY & VIOLATORS - Improved Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                {/* Zone Safety Health (2/3 Width) */}
                <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <MapPin size={18} className="text-orange-500" />
                            Status Keamanan Area (Live Zone Health)
                        </h3>
                        <div className="flex gap-2 text-xs">
                            <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Aman</span>
                            <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Waspada</span>
                            <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Kritis</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {zoneStats.map((zone, i) => (
                            <div key={i} className={`p-4 bg-slate-800/40 border ${zone.bgBorder} rounded-2xl flex items-center gap-4 hover:bg-slate-800/60 transition-colors cursor-pointer group`}>
                                <div className={`p-3 ${zone.bgSoft} rounded-xl group-hover:scale-110 transition-transform`}>
                                    {zone.status === 'AMAN' ? (
                                        <CheckCircle className={zone.iconColor} size={24} />
                                    ) : (
                                        <AlertTriangle className={zone.iconColor} size={24} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <h4 className="font-bold text-white transition-colors">{zone.name}</h4>
                                        <span className={`text-[10px] ${zone.bgSoft} ${zone.iconColor} px-2 py-0.5 rounded font-bold`}>{zone.status}</span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full mb-1">
                                        <div className={`h-full ${zone.progressColor}`} style={{ width: `${zone.score}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-500">Score: {zone.score}% • {zone.violations > 0 ? `${zone.violations} Violations` : 'Compliant'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Violator (1/3 Width) */}
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col h-full">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingDown size={18} className="text-red-500" />
                        Top Violator
                    </h3>
                    <div className="flex-1 flex flex-col gap-4">
                        {teamStats.map((team, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-${team.color}-500/10 text-${team.color}-500 border border-${team.color}-500/20`}>
                                    {team.score}%
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{team.name}</h4>
                                    <p className="text-xs text-slate-500">{team.violations} Pelanggaran</p>
                                </div>
                                <div className="text-slate-600 group-hover:text-white transition-colors">
                                    <ExternalLink size={14} />
                                </div>
                            </div>
                        ))}
                        {teamStats.length === 0 && (
                            <p className="text-slate-500 text-center italic mt-10">Data belum tersedia.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* CHARTS SECTION - Unified Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Chart - Left (2/3) */}
                <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <FileText size={18} className="text-orange-500" />
                        Tren Kepatuhan Global
                        <span className="ml-auto text-xs text-slate-500 font-normal">Live Analytics</span>
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

                {/* Violation Type Chart - Right (1/3) */}
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-6">Distribusi Pelanggaran</h3>
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

                {/* OPERATIONAL RISK CURVE (Replaces Heatmap) - Full Width */}
                <div className="lg:col-span-3 p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock size={18} className="text-blue-500" />
                            Analisis Risiko Operasional (24H Risk Curve)
                        </h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1 bg-red-500 rounded-full"></span>
                                <span className="text-slate-400">Tingkat Risiko</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1 bg-blue-500 rounded-full"></span>
                                <span className="text-slate-400">Aktivitas Kerja</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={Array.from({ length: 24 }, (_, i) => ({
                                hour: `${i.toString().padStart(2, '0')}:00`,
                                risk: (i > 8 && i < 17) ? 40 + Math.random() * 40 : 10 + Math.random() * 20, // Higher risk during work hours
                                activity: (i > 7 && i < 18) ? 60 + Math.random() * 40 : 20 + Math.random() * 20
                            }))}>
                                <defs>
                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} interval={2} />
                                <YAxis stroke="#64748b" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ fontSize: 12 }}
                                />
                                <Area type="monotone" dataKey="risk" name="Risk Level" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                                <Area type="monotone" dataKey="activity" name="Activity" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActivity)" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
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
                        <button onClick={() => { setReportType('daily'); setIsExportModalOpen(true); }} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-3 transition-colors text-left group">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 group-hover:text-white group-hover:bg-orange-500 transition-colors"><FileText size={18} /></div>
                            <div>
                                <p className="text-white font-bold text-sm">Harian</p>
                                <p className="text-xs text-slate-500">Today</p>
                            </div>
                        </button>
                        <button onClick={() => { setReportType('weekly'); setIsExportModalOpen(true); }} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-3 transition-colors text-left group">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:text-white group-hover:bg-blue-500 transition-colors"><FileText size={18} /></div>
                            <div>
                                <p className="text-white font-bold text-sm">Mingguan</p>
                                <p className="text-xs text-slate-500">Last 7 days</p>
                            </div>
                        </button>
                        <button onClick={() => { setReportType('monthly'); setIsExportModalOpen(true); }} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-3 transition-colors text-left group">
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

                        <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                        >
                            Mulai Custom Report <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <ReportExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                data={{ stats, detections, reportType }}
            />

        </div>
    );
}
