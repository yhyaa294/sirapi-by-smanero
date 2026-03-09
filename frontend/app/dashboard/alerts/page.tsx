"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api, realtime } from "@/services/api";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Filter,
  HardHat,
  Hand,
  Search,
  Shirt,
  Shield,
  Footprints,
  Camera,
  FileText,
  X,
  ChevronDown,
  MailOpen,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useDemoMode, DemoDetection } from "@/hooks/useDemoMode";


// Types
interface Incident {
  id: string;
  timestamp: Date;
  type: "no_topi" | "no_dasi" | "no_sabuk" | "no_sepatu" | "danger_zone" | "system";
  severity: "critical" | "high" | "medium" | "low" | "info";
  location: string;
  cameraId: string;
  description: string;
  status: "open" | "indasiigating" | "resolved";
  read: boolean;
  confidence?: number;
  imageUrl?: string;
}

// Initial empty data - will be populated by Demo Mode or Backend
interface Screenshot {
  filename: string;
  url: string;
  timestamp: string;
}

export default function UnifiedAlertsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "indasiigating" | "resolved">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Demo Mode integration
  const { isDemo, violations } = useDemoMode();

  // Convert demo detections to incidents
  useEffect(() => {
    if (isDemo && violations.length > 0) {
      const demoIncidents: Incident[] = violations.map((det, idx) => ({
        id: `DEM-${det.id}`,
        timestamp: det.timestamp,
        type: det.type as Incident["type"],
        severity: det.severity as Incident["severity"],
        location: `${det.camera} - ${det.location}`,
        cameraId: det.cameraId,
        description: `AI Detection: ${det.type.replace("_", " ")} di ${det.location}. Confidence: ${det.confidence.toFixed(1)}%`,
        status: idx < 3 ? "open" : "resolved",
        read: idx >= 3,
        confidence: det.confidence,
      }));
      setIncidents(demoIncidents);
    }
  }, [isDemo, violations]);

  // Fetch screenshots from AI Engine
  useEffect(() => {
    const fetchScreenshots = async () => {
      try {
        const res = await fetch('http://localhost:8000/list_screenshots');
        if (res.ok) {
          const data = await res.json();
          setScreenshots(data.screenshots || []);

          // Create incidents from screenshots if not in demo mode
          if (!isDemo && data.screenshots?.length > 0) {
            const screenshotIncidents: Incident[] = data.screenshots.slice(0, 20).map((ss: Screenshot, idx: number) => {
              const parts = ss.filename.replace('.jpg', '').split('_');
              const violationType = parts[0] || 'no_topi';
              return {
                id: `AI-${idx + 1}`,
                timestamp: new Date(ss.timestamp),
                type: violationType as Incident["type"],
                severity: violationType === 'no_topi' ? 'critical' : 'high',
                location: `TITIK ${String.fromCharCode(65 + (idx % 4))} - ${parts[0]?.includes('topi') ? 'Gudang Utama' : 'Loading Dock'}`,
                cameraId: String.fromCharCode(65 + (idx % 4)),
                description: `AI Detection: ${violationType.replace('_', ' ')} di area kerja.`,
                status: idx < 3 ? 'open' : 'resolved',
                read: idx >= 3,
                confidence: 85 + Math.random() * 10,
                imageUrl: ss.url,
              };
            });
            setIncidents(prev => prev.length === 0 ? screenshotIncidents : prev);
          }
        }
      } catch (err) {
        // console.log('AI Engine screenshots not available');
      }
    };

    fetchScreenshots();
    const interval = setInterval(fetchScreenshots, 30000); // Refresh every 30 seconds for better performance
    return () => clearInterval(interval);
  }, [isDemo]);

  // Fetch from backend if not in demo mode
  useEffect(() => {
    if (!isDemo) {
      // 1. Initial Load
      api.getDetections(200).then(detections => {
        if (detections && detections.length > 0) {
          const backendIncidents: Incident[] = detections
            .filter((det: any) => det.is_violation)
            .map((det: any) => mapDetectionToIncident(det));
          setIncidents(backendIncidents);
        }
      }).catch((err) => {
        // console.log("Backend not available for alerts:", err);
      });

      // 2. Real-time Listener
      realtime.connect();

      const handleRealtimeDetection = (det: any) => {
        if (!det.is_violation) return;

        const newIncident = mapDetectionToIncident(det);

        setIncidents(prev => {
          // Prevent duplicates
          if (prev.find(i => i.id === newIncident.id)) return prev;
          return [newIncident, ...prev];
        });

        // Optional: Play alert sound here if needed
      };

      realtime.on('detection', handleRealtimeDetection);

      return () => {
        realtime.off('detection', handleRealtimeDetection);
        // Don't disconnect here if other components use it, but for now it's safe or we leave it open
      };
    }
  }, [isDemo]);

  // Helper to map API detection to Incident
  const mapDetectionToIncident = (det: any): Incident => ({
    id: String(det.id),
    timestamp: new Date(det.detected_at || det.created_at || new Date()), // Fallback to now
    type: (det.violation_type || 'no_topi').toLowerCase().replace(' ', '_') as Incident["type"],
    severity: det.priority === 1 ? 'critical' : det.priority === 2 ? 'high' : 'medium', // Default to medium if unknown
    location: det.location || `Kamera ${det.camera_id}`,
    cameraId: String(det.camera_id),
    description: `AI Detection: ${(det.violation_type || 'Unknown').replace(/_/g, ' ')}. Confidence: ${((det.confidence || 0) * 100).toFixed(1)}%`,
    status: det.review_status === 'accepted' ? 'resolved' : det.review_status === 'rejected' ? 'resolved' : 'open',
    read: det.review_status !== 'pending',
    confidence: (det.confidence || 0) * 100,
    imageUrl: det.image_path ? (det.image_path.startsWith('http') ? det.image_path : `http://localhost:8000/${det.image_path.replace(/\\/g, '/')}`) : undefined,
  });

  // Stats
  const totalToday = incidents.length;
  const openCount = incidents.filter(i => i.status === "open" || !i.read).length;
  const resolvedCount = incidents.filter(i => i.status === "resolved").length;

  // Live Alerts (unread + critical/high severity)
  const liveAlerts = incidents.filter(
    i => !i.read || (i.severity === "critical" || i.severity === "high") && i.status === "open"
  ).slice(0, 5);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered incidents for table - Memoized
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      if (statusFilter !== "all" && incident.status !== statusFilter) return false;
      if (typeFilter !== "all" && incident.type !== typeFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          incident.description.toLowerCase().includes(query) ||
          incident.location.toLowerCase().includes(query) ||
          incident.id.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [incidents, statusFilter, typeFilter, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredIncidents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredIncidents, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, searchQuery]);

  // Helper functions
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "no_topi": return <HardHat className="w-4 h-4" />;
      case "no_dasi": return <Shirt className="w-4 h-4" />;
      case "no_sabuk": return <Hand className="w-4 h-4" />;
      case "no_sepatu": return <Footprints className="w-4 h-4" />;
      case "danger_zone": return <AlertTriangle className="w-4 h-4" />;
      case "system": return <Shield className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "no_topi": return "Tidak Bertopi";
      case "no_dasi": return "Tidak Berdasi";
      case "no_sabuk": return "No Sabuk";
      case "no_sepatu": return "No Sepatu";
      case "danger_zone": return "Danger Zone";
      case "system": return "System";
      default: return type;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-amber-500 text-white";
      case "low": return "bg-blue-500 text-white";
      case "info": return "bg-slate-500 text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-500/10 text-red-400 border-red-500/30";
      case "indasiigating": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "resolved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} jam lalu`;
    return `${Math.floor(diffMins / 1440)} hari lalu`;
  };

  const markAsRead = (id: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
  };

  const updateStatus = (id: string, status: "open" | "indasiigating" | "resolved") => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status, read: true } : i));
  };

  const dismissAlert = (id: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
  };

  const openScreenshot = (incident: Incident) => {
    const ss = screenshots.find(s => s.url === incident.imageUrl) ||
      (incident.imageUrl ? { filename: '', url: incident.imageUrl, timestamp: '' } : null);
    if (ss) {
      setSelectedScreenshot(ss);
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 lg:p-8">
      {/* Incident Detail Modal */}
      {showModal && selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="relative w-full max-w-6xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col md:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>

            {/* Left: Main Content (Player) */}
            <div className="flex-1 flex flex-col min-h-0 bg-black relative group">
              {/* Header Overlay */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Camera className="w-5 h-5 text-red-500" />
                    {selectedScreenshot.timestamp ? new Date(selectedScreenshot.timestamp).toLocaleString('id-ID') : 'Kejadian CCTV-01'}
                  </h3>
                  <p className="text-slate-300 text-xs">Rekaman Insiden #INC-{String(selectedScreenshot.timestamp).slice(-4)}</p>
                </div>
                <div className="bg-orange-600/20 backdrop-blur-md px-3 py-1 rounded-full border border-orange-500/50 flex items-center gap-2">
                  <Camera className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-bold text-orange-100 uppercase">Snapshot Viewer</span>
                </div>
              </div>

              {/* Main Visual */}
              <div className="flex-1 flex items-center justify-center bg-slate-950 relative overflow-hidden">
                <img
                  src={selectedScreenshot.url}
                  alt="Main visual"
                  className="max-h-full max-w-full object-contain"
                />

                {/* Fake Navigation Arrows */}
                <button className="absolute left-4 p-2 bg-black/50 rounded-full text-white/50 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100">
                  <ChevronDown className="rotate-90" size={24} />
                </button>
                <button className="absolute right-4 p-2 bg-black/50 rounded-full text-white/50 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100">
                  <ChevronDown className="-rotate-90" size={24} />
                </button>
              </div>

              <div className="p-4 bg-slate-900/90 border-t border-slate-800 backdrop-blur flex justify-between items-center">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Captured at: {selectedScreenshot.timestamp ? new Date(selectedScreenshot.timestamp).toLocaleTimeString() : '--:--'}</span>
                </div>
                <a
                  href={selectedScreenshot.url}
                  download={`evidence_${selectedScreenshot.filename || 'incident'}.jpg`}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors"
                >
                  <Download size={16} /> Download Bukti
                </a>
              </div>
            </div>

            {/* Right: Sidebar Info */}
            <div className="w-full md:w-80 bg-slate-800/50 p-6 flex flex-col gap-6 border-l border-slate-800 overflow-y-auto">
              <div className="flex justify-between items-start">
                <h4 className="text-white font-bold">Detail Insiden</h4>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><X size={20} /></button>
              </div>

              {/* AI Analysis */}
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs text-red-400 font-bold uppercase mb-1">Terdeteksi AI</p>
                  <p className="text-white font-medium">Pekerja Tidak Menggunakan Helm (Tidak Bertopi)</p>
                  <p className="text-xs text-slate-400 mt-2">Confidence: <span className="text-emerald-400">92.4%</span></p>
                </div>
              </div>

              {/* Multi-View Selector */}
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-3 flex items-center gap-2">
                  <Camera size={12} /> Sudut Pandang Lain
                </p>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-slate-700/50 border border-orange-500/50 cursor-pointer flex gap-3 items-center">
                    <div className="w-16 h-10 bg-black rounded overflow-hidden relative">
                      <img src={selectedScreenshot.url} className="w-full h-full object-cover opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center"><Eye size={12} className="text-orange-500" /></div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">CAM-01 (Utama)</p>
                      <p className="text-[10px] text-orange-400">Playing Now</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 cursor-pointer flex gap-3 items-center opacity-60 hover:opacity-100 transition">
                    <div className="w-16 h-10 bg-black rounded overflow-hidden"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-300">CAM-02 (Samping)</p>
                      <p className="text-[10px] text-slate-500">Syncing...</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 cursor-pointer flex gap-3 items-center opacity-60 hover:opacity-100 transition">
                    <div className="w-16 h-10 bg-black rounded overflow-hidden"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-300">CAM-03 (Atas)</p>
                      <p className="text-[10px] text-slate-500">Available</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <button className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20">
                  Indasiigasi Lebih Lanjut
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            Insiden & Notifikasi
          </h1>
          <p className="text-slate-400 mt-1">Unified Incident Center • Real-time Monitoring</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs text-slate-500 uppercase tracking-wider">Hari Ini</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalToday}</p>
          <p className="text-sm text-slate-400">Total Kejadian</p>
        </div>

        <div className="bg-slate-900/50 border border-red-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-xs text-red-400 uppercase tracking-wider font-bold animate-pulse">Urgent</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{openCount}</p>
            <p className="text-sm text-slate-400">Perlu Tindakan</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-400 uppercase tracking-wider">Selesai</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{resolvedCount}</p>
          <p className="text-sm text-slate-400">Terselesaikan</p>
        </div>
      </div>

      {/* Section 1: Live Alerts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Live Alerts
          </h2>
          <span className="text-xs text-slate-500">{liveAlerts.filter(a => !a.read).length} belum dibaca</span>
        </div>

        {liveAlerts.length === 0 ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-emerald-400">Semua Aman Terkendali</h3>
            <p className="text-sm text-emerald-400/70">Tidak ada insiden mendesak saat ini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {liveAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-slate-900/80 border rounded-2xl p-4 transition-all ${alert.severity === "critical"
                  ? "border-red-500 shadow-lg shadow-red-500/10"
                  : alert.severity === "high"
                    ? "border-orange-500/50"
                    : "border-slate-800"
                  } ${!alert.read ? "ring-1 ring-orange-500/30" : ""}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl flex-shrink-0 ${alert.severity === "critical" ? "bg-red-500/20 text-red-400" :
                    alert.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                      "bg-slate-700 text-slate-400"
                    }`}>
                    {getTypeIcon(alert.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-white font-bold">{getTypeLabel(alert.type)}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 text-sm">{alert.location}</span>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{alert.description}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {!alert.read && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
                        >
                          <MailOpen className="w-3 h-3" />
                          Tandai Dibaca
                        </button>
                      )}
                      {alert.cameraId !== "-" && (
                        <Link
                          href={`/dashboard/monitor/${alert.cameraId.toLowerCase()}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-xs text-orange-400 transition-colors"
                        >
                          <Camera className="w-3 h-3" />
                          Lihat Kamera
                        </Link>
                      )}
                      <button
                        onClick={() => updateStatus(alert.id, "resolved")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-xs text-emerald-400 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Selesaikan
                      </button>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="flex items-center gap-1 px-3 py-1.5 hover:bg-slate-800 rounded-lg text-xs text-slate-500 transition-colors ml-auto"
                      >
                        <X className="w-3 h-3" />
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {/* Unread Indicator */}
                  {!alert.read && (
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 animate-pulse"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Incident History */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Cari insiden..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="appearance-none px-4 py-2.5 pr-10 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="open">Open</option>
                <option value="indasiigating">Indasiigating</option>
                <option value="resolved">Resolved</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="all">Semua Jenis</option>
                <option value="no_topi">Tidak Bertopi</option>
                <option value="no_dasi">Tidak Berdasi</option>
                <option value="no_sabuk">No Sabuk</option>
                <option value="no_sepatu">No Sepatu</option>
                <option value="danger_zone">Danger Zone</option>
                <option value="system">System</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-slate-800/50 text-xs text-slate-400 uppercase tracking-wider font-bold">
          <div className="col-span-2">Waktu</div>
          <div className="col-span-2">Lokasi</div>
          <div className="col-span-3">Pelanggaran</div>
          <div className="col-span-2">Bukti</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Aksi</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-800">
          {filteredIncidents.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Tidak ada data yang cocok</p>
            </div>
          ) : (
            paginatedIncidents.map((incident) => (
              <div key={incident.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4 hover:bg-slate-800/30 transition-colors">
                {/* Time */}
                <div className="md:col-span-2">
                  <p className="text-white text-sm font-medium">
                    {incident.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {incident.timestamp.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </p>
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <p className="text-slate-300 text-sm">{incident.location}</p>
                  <p className="text-xs text-slate-500 font-mono">CAM-{incident.cameraId}</p>
                </div>

                {/* Violation */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${incident.severity === "critical" ? "bg-red-500/20 text-red-400" :
                      incident.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                        incident.severity === "medium" ? "bg-amber-500/20 text-amber-400" :
                          "bg-slate-700 text-slate-400"
                      }`}>
                      {getTypeIcon(incident.type)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{getTypeLabel(incident.type)}</p>
                      {incident.confidence && (
                        <p className="text-xs text-slate-500">{incident.confidence}% confidence</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence */}
                <div className="md:col-span-2">
                  {incident.imageUrl ? (
                    <button
                      onClick={() => openScreenshot(incident)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-xs text-orange-400 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat Foto
                    </button>
                  ) : incident.type !== "system" ? (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors opacity-50 cursor-not-allowed">
                      <Eye className="w-3.5 h-3.5" />
                      Tidak Ada Foto
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">-</span>
                  )}
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <select
                    value={incident.status}
                    onChange={(e) => updateStatus(incident.id, e.target.value as typeof incident.status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${getStatusColor(incident.status)}`}
                  >
                    <option value="open">Open</option>
                    <option value="indasiigating">Indasiigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="md:col-span-1">
                  {incident.cameraId !== "-" && (
                    <Link
                      href={`/dashboard/monitor/${incident.cameraId.toLowerCase()}`}
                      className="p-2 hover:bg-slate-800 rounded-lg inline-flex text-slate-400 hover:text-orange-400 transition-colors"
                      title="Lihat Kamera"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredIncidents.length)} dari {filteredIncidents.length} insiden
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs text-slate-300 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">Page {currentPage} of {Math.max(1, totalPages)}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs text-slate-300 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>
          Data diperbarui secara real-time •{" "}
          <span className="text-orange-500">SiRapi</span> Unified Incident Center
        </p>
      </div>
    </div>
  );
}
