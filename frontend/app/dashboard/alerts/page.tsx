"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Eye, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Filter,
  Calendar,
  Siren,
  UserX,
  Skull,
  Timer
} from "lucide-react";

// --- 1. Struktur Data Dummy Baru ---
type AlertSeverity = "critical" | "warning" | "info" | "security_breach" | "overtime_violation";
type AlertStatus = "new" | "reviewed" | "resolved";
type AlertCategory = "safety" | "security" | "compliance";

interface AlertItem {
  id: string;
  timestamp: string;
  violationType: string;
  location: string;
  cameraID: string;
  severity: AlertSeverity;
  status: AlertStatus;
  imageUrl: string;
  category: AlertCategory;
  description?: string;
}

const DETAILED_ALERTS: AlertItem[] = [
  // ============ SECURITY BREACH ALERTS ============
  {
    id: "SEC-2024-001",
    timestamp: "2 min ago",
    violationType: "SECURITY BREACH - INTRUDER DETECTED",
    location: "Gudang Utama - Pintu Belakang",
    cameraID: "CAM-07",
    severity: "security_breach",
    status: "new",
    imageUrl: "https://placehold.co/200x200/4c1d95/e9d5ff?text=INTRUDER",
    category: "security",
    description: "Terdeteksi pergerakan manusia tidak terotorisasi di area gudang diluar jam kerja.",
  },
  {
    id: "SEC-2024-002",
    timestamp: "15 min ago",
    violationType: "SECURITY BREACH - UNKNOWN PERSON",
    location: "Area Parkir - Sisi Timur",
    cameraID: "CAM-11",
    severity: "security_breach",
    status: "new",
    imageUrl: "https://placehold.co/200x200/7f1d1d/fecaca?text=UNKNOWN",
    category: "security",
    description: "Orang tidak dikenal terdeteksi memasuki perimeter tanpa badge ID.",
  },
  // ============ UNAUTHORIZED OVERTIME ============
  {
    id: "OVT-2024-001",
    timestamp: "30 min ago",
    violationType: "UNAUTHORIZED OVERTIME",
    location: "Ruang Produksi B",
    cameraID: "CAM-03",
    severity: "overtime_violation",
    status: "new",
    imageUrl: "https://placehold.co/200x200/78350f/fef3c7?text=OVERTIME",
    category: "compliance",
    description: "Pekerja terdeteksi di area kerja setelah jam operasional berakhir (18:00).",
  },
  // ============ REGULAR SAFETY ALERTS ============
  {
    id: "ALT-2024-001",
    timestamp: "45 min ago",
    violationType: "Missing Safety Helmet",
    location: "Zone A - Assembly Line",
    cameraID: "CAM-04",
    severity: "critical",
    status: "new",
    imageUrl: "https://placehold.co/200x200/7f1d1d/fecaca?text=No+Helmet",
    category: "safety",
  },
  {
    id: "ALT-2024-002",
    timestamp: "1 hour ago",
    violationType: "Unauthorized Zone Entry",
    location: "Zone B - Warehouse Gate",
    cameraID: "CAM-12",
    severity: "warning",
    status: "new",
    imageUrl: "https://placehold.co/200x200/7c2d12/fed7aa?text=Restricted+Area",
    category: "safety",
  },
  {
    id: "ALT-2024-003",
    timestamp: "2 hours ago",
    violationType: "Missing Safety Vest",
    location: "Loading Dock West",
    cameraID: "CAM-01",
    severity: "warning",
    status: "reviewed",
    imageUrl: "https://placehold.co/200x200/713f12/fef08a?text=No+Vest",
    category: "safety",
  },
  {
    id: "OVT-2024-002",
    timestamp: "2.5 hours ago",
    violationType: "UNAUTHORIZED OVERTIME",
    location: "Kantor Administrasi",
    cameraID: "CAM-09",
    severity: "overtime_violation",
    status: "reviewed",
    imageUrl: "https://placehold.co/200x200/78350f/fef3c7?text=LATE+WORKER",
    category: "compliance",
    description: "Staff administrasi berada di kantor hingga pukul 22:30 tanpa izin lembur.",
  },
  {
    id: "ALT-2024-004",
    timestamp: "3 hours ago",
    violationType: "Blocked Emergency Exit",
    location: "Corridor L2",
    cameraID: "CAM-08",
    severity: "critical",
    status: "resolved",
    imageUrl: "https://placehold.co/200x200/7f1d1d/fecaca?text=Blocked+Exit",
    category: "safety",
  },
];

export default function AlertsPage() {
  const [filter, setFilter] = useState<"all" | "critical" | "security" | "overtime" | "unreviewed">("all");

  // --- Filter Logic ---
  const filteredAlerts = DETAILED_ALERTS.filter((alert) => {
    if (filter === "critical") return alert.severity === "critical";
    if (filter === "security") return alert.severity === "security_breach";
    if (filter === "overtime") return alert.severity === "overtime_violation";
    if (filter === "unreviewed") return alert.status === "new";
    return true;
  });

  // Count alerts by type
  const securityBreachCount = DETAILED_ALERTS.filter(a => a.severity === "security_breach").length;
  const overtimeCount = DETAILED_ALERTS.filter(a => a.severity === "overtime_violation").length;

  return (
    <div className="space-y-6 min-h-screen text-slate-200">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-orange-500" />
            Alert Log History
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time violation detections and safety incidents.
          </p>
        </div>

        {/* --- 3. Filter Bar --- */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              filter === "all"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("security")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              filter === "security"
                ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 animate-pulse"
                : "text-slate-400 hover:text-fuchsia-400 hover:bg-slate-800"
            }`}
          >
            <Siren className="w-4 h-4" />
            Security ({securityBreachCount})
          </button>
          <button
            onClick={() => setFilter("overtime")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              filter === "overtime"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-amber-400 hover:bg-slate-800"
            }`}
          >
            <Timer className="w-4 h-4" />
            Overtime ({overtimeCount})
          </button>
          <button
            onClick={() => setFilter("critical")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              filter === "critical"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "text-slate-400 hover:text-red-400 hover:bg-slate-800"
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilter("unreviewed")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              filter === "unreviewed"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:text-blue-400 hover:bg-slate-800"
            }`}
          >
            Belum Direview
          </button>
        </div>
      </div>

      {/* --- 2. Desain Alert Card (List Item) --- */}
      <div className="flex flex-col gap-4">
        {filteredAlerts.map((alert) => {
          // Determine card styling based on severity
          const isSecurityBreach = alert.severity === "security_breach";
          const isOvertime = alert.severity === "overtime_violation";
          
          const cardClasses = isSecurityBreach
            ? "border-fuchsia-500 bg-fuchsia-950/30 shadow-[0_0_20px_rgba(217,70,239,0.3)]"
            : isOvertime
            ? "border-amber-500/50 bg-amber-950/20"
            : "border-slate-800 bg-slate-900 hover:border-slate-600";

          return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative flex flex-col sm:flex-row items-start sm:items-center rounded-xl p-4 transition-all shadow-sm hover:shadow-md gap-6 border ${cardClasses}`}
          >
            {/* Police Light Animation for Security Breach */}
            {isSecurityBreach && (
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                animate={{ 
                  backgroundColor: ["#dc2626", "#2563eb", "#dc2626"],
                }}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
            )}
            {/* Kolom 1: Foto Bukti (Thumbnail) */}
            <div className="relative flex-shrink-0 w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
              <Image
                src={alert.imageUrl}
                alt="Evidence"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Overlay Icon for Hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Eye className="text-white w-6 h-6" />
              </div>
            </div>

            {/* Kolom 2: Detail Utama */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100 truncate">
                  {alert.violationType}
                </h3>
                {alert.status === "new" && (
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    NEW
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-500" />
                    <span>{alert.location}</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700"></div>
                <div className="font-mono text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    ID: {alert.cameraID}
                </div>
              </div>
            </div>

            {/* Kolom 3: Metadata & Status */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto justify-between sm:justify-center mt-2 sm:mt-0">
              {/* Severity Badge */}
              <div>
                {/* SECURITY BREACH - Neon Purple/Fuchsia with animation */}
                {alert.severity === "security_breach" && (
                  <motion.span 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.4)]"
                  >
                    <Siren size={14} className="animate-pulse" /> INTRUDER DETECTED
                  </motion.span>
                )}
                {/* UNAUTHORIZED OVERTIME - Dark Amber */}
                {alert.severity === "overtime_violation" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-600/20 text-amber-400 border border-amber-500/40">
                    <UserX size={14} /> PEKERJA DILUAR JAM
                  </span>
                )}
                {/* Regular severity badges */}
                {alert.severity === "critical" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                    <AlertTriangle size={12} /> CRITICAL
                  </span>
                )}
                {alert.severity === "warning" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20">
                    <AlertTriangle size={12} /> WARNING
                  </span>
                )}
                {alert.severity === "info" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <CheckCircle2 size={12} /> INFO
                  </span>
                )}
              </div>
              
              {/* Timestamp */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Clock size={12} />
                {alert.timestamp}
              </div>
            </div>

            {/* Kolom 4: Aksi (Tombol) */}
            <div className="mt-2 sm:mt-0 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6 flex sm:block justify-end">
              {isSecurityBreach ? (
                <button className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  <Siren size={16} />
                  <span>PANGGIL SECURITY</span>
                </button>
              ) : (
                <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-slate-600">
                  <Eye size={16} />
                  <span className="hidden sm:inline">Detail</span>
                </button>
              )}
            </div>

            {/* Description for special alerts */}
            {alert.description && (
              <div className="w-full mt-2 pt-3 border-t border-slate-800/50">
                <p className={`text-xs ${isSecurityBreach ? 'text-fuchsia-300' : isOvertime ? 'text-amber-300' : 'text-slate-400'}`}>
                  {alert.description}
                </p>
              </div>
            )}

          </motion.div>
        )})}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-20 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Tidak ada alert yang sesuai filter ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
