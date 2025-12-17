"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, Search, Calendar, Download, Eye, CheckCircle, XCircle, X, Camera } from "lucide-react";

// Alert data with photos
const alertsData = [
  {
    id: 1,
    time: "16:15:23",
    date: "17 Des 2024",
    type: "NO HELMET",
    zone: "TITIK D",
    location: "Loading Dock",
    severity: "BAHAYA",
    status: "open",
    image: "/api/placeholder/400/300" // Placeholder - will show detection screenshot
  },
  {
    id: 2,
    time: "16:02:45",
    date: "17 Des 2024",
    type: "NO VEST",
    zone: "TITIK B",
    location: "Assembly",
    severity: "PERINGATAN",
    status: "open",
    image: "/api/placeholder/400/300"
  },
  {
    id: 3,
    time: "15:48:12",
    date: "17 Des 2024",
    type: "NO GLOVES",
    zone: "TITIK C",
    location: "Welding Bay",
    severity: "PERINGATAN",
    status: "resolved",
    image: "/api/placeholder/400/300"
  },
  {
    id: 4,
    time: "15:22:08",
    date: "17 Des 2024",
    type: "NO HELMET",
    zone: "TITIK A",
    location: "Gudang Utama",
    severity: "BAHAYA",
    status: "resolved",
    image: "/api/placeholder/400/300"
  },
];

export default function AlertsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<typeof alertsData[0] | null>(null);

  const filteredAlerts = alertsData.filter(alert => {
    if (filter === "open" && alert.status !== "open") return false;
    if (filter === "resolved" && alert.status !== "resolved") return false;
    if (searchQuery && !alert.type.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !alert.zone.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-orange-500 w-5 h-5 md:w-6 md:h-6" />
            Riwayat Kejadian
          </h1>
          <p className="text-sm text-slate-500">Log deteksi pelanggaran APD dengan bukti foto</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kejadian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex bg-slate-100 rounded-xl p-1">
          {[
            { id: "all", label: "Semua" },
            { id: "open", label: "Aktif" },
            { id: "resolved", label: "Selesai" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards - Grid Layout with Photos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${alert.severity === "BAHAYA" ? "border-red-200" : "border-amber-200"
              }`}
            onClick={() => setSelectedAlert(alert)}
          >
            {/* Photo Preview */}
            <div className="relative h-40 bg-slate-800">
              {/* Placeholder for detection image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera size={32} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-500">Screenshot Deteksi</p>
                </div>
              </div>

              {/* Detection Overlay - Bounding Box */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-32 border-2 border-red-500 rounded animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[70px] bg-red-500 text-white text-[10px] px-2 py-0.5 rounded">
                {alert.type}
              </div>

              {/* Severity Badge */}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold ${alert.severity === "BAHAYA" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                }`}>
                {alert.severity}
              </div>

              {/* Time Overlay */}
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded font-mono">
                {alert.time}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900">{alert.zone}</h4>
                  <p className="text-xs text-slate-500">{alert.location}</p>
                </div>
                <div className="flex items-center gap-1">
                  {alert.status === "open" ? (
                    <>
                      <XCircle size={14} className="text-red-500" />
                      <span className="text-xs text-red-600 font-medium">Aktif</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-medium">Selesai</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{alert.date}</span>
                <button className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1">
                  <Eye size={12} /> Lihat Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAlert(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg text-slate-900">Detail Kejadian #{selectedAlert.id}</h3>
              <button onClick={() => setSelectedAlert(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Photo - Full Size */}
            <div className="relative aspect-video bg-slate-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera size={48} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-slate-500">Screenshot dari kamera {selectedAlert.zone}</p>
                  <p className="text-xs text-slate-600 mt-1">Dengan bounding box AI detection</p>
                </div>
              </div>

              {/* Bounding Box */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-48 border-4 border-red-500 rounded">
                <div className="absolute -top-7 left-0 bg-red-500 text-white text-sm px-3 py-1 rounded font-bold">
                  {selectedAlert.type} - {(Math.random() * 10 + 90).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Waktu Kejadian</p>
                <p className="font-bold text-slate-900">{selectedAlert.time}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tanggal</p>
                <p className="font-bold text-slate-900">{selectedAlert.date}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Lokasi</p>
                <p className="font-bold text-slate-900">{selectedAlert.zone} - {selectedAlert.location}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Jenis Pelanggaran</p>
                <p className="font-bold text-slate-900">{selectedAlert.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Severity</p>
                <span className={`px-2 py-1 rounded text-xs font-bold ${selectedAlert.severity === "BAHAYA" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>{selectedAlert.severity}</span>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <span className={`px-2 py-1 rounded text-xs font-bold ${selectedAlert.status === "open" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                  }`}>{selectedAlert.status === "open" ? "Aktif" : "Selesai"}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t flex gap-2">
              <button className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors">
                ✓ Tandai Selesai
              </button>
              <button className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                Download Bukti
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
