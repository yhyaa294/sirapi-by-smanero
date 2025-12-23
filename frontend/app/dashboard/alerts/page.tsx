"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { api } from "@/services/api";

// Types
interface Incident {
  id: string;
  timestamp: Date;
  type: "no_helmet" | "no_vest" | "no_gloves" | "no_boots" | "danger_zone" | "system";
  severity: "critical" | "high" | "medium" | "low" | "info";
  location: string;
  cameraId: string;
  description: string;
  status: "open" | "investigating" | "resolved";
  read: boolean;
  confidence?: number;
  imageUrl?: string;
}

// Initial empty data - will be populated by Demo Mode or Backend
export default function UnifiedAlertsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "investigating" | "resolved">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

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

  // Fetch from backend if not in demo mode
  useEffect(() => {
    if (!isDemo) {
      api.getDetections(50).then(detections => {
        if (detections.length > 0) {
          const backendIncidents: Incident[] = detections.map((det, idx) => ({
            id: det.id,
            timestamp: new Date(det.timestamp),
            type: det.type.toLowerCase().replace(" ", "_") as Incident["type"],
            severity: det.severity === "BAHAYA" ? "critical" : det.severity === "PERINGATAN" ? "high" : "medium",
            location: `Camera ${det.cameraId}`,
            cameraId: det.cameraId,
            description: `Detection: ${det.type}`,
            status: det.acknowledged ? "resolved" : "open",
            read: det.acknowledged,
            confidence: 90,
          }));
          setIncidents(backendIncidents);
        }
      }).catch(() => {
        // Backend not available, use empty
        console.log("Backend not available for alerts");
      });
    }
  }, [isDemo]);

  // Stats
  const totalToday = incidents.length;
  const openCount = incidents.filter(i => i.status === "open" || !i.read).length;
  const resolvedCount = incidents.filter(i => i.status === "resolved").length;

  // Live Alerts (unread + critical/high severity)
  const liveAlerts = incidents.filter(
    i => !i.read || (i.severity === "critical" || i.severity === "high") && i.status === "open"
  ).slice(0, 5);

  // Filtered incidents for table
  const filteredIncidents = incidents.filter(incident => {
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

  // Helper functions
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "no_helmet": return <HardHat className="w-4 h-4" />;
      case "no_vest": return <Shirt className="w-4 h-4" />;
      case "no_gloves": return <Hand className="w-4 h-4" />;
      case "no_boots": return <Footprints className="w-4 h-4" />;
      case "danger_zone": return <AlertTriangle className="w-4 h-4" />;
      case "system": return <Shield className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "no_helmet": return "No Helmet";
      case "no_vest": return "No Vest";
      case "no_gloves": return "No Gloves";
      case "no_boots": return "No Boots";
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
      case "investigating": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
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

  const updateStatus = (id: string, status: "open" | "investigating" | "resolved") => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status, read: true } : i));
  };

  const dismissAlert = (id: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 lg:p-8">
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

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white text-sm transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-white text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
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
                <option value="investigating">Investigating</option>
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
                <option value="no_helmet">No Helmet</option>
                <option value="no_vest">No Vest</option>
                <option value="no_gloves">No Gloves</option>
                <option value="no_boots">No Boots</option>
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
            filteredIncidents.map((incident) => (
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
                  {incident.type !== "system" ? (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      Lihat Foto
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
                    <option value="investigating">Investigating</option>
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
            Menampilkan {filteredIncidents.length} dari {incidents.length} insiden
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>
          Data diperbarui secara real-time •{" "}
          <span className="text-orange-500">SmartAPD</span> Unified Incident Center
        </p>
      </div>
    </div>
  );
}
