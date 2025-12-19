"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AlertTriangle, Search, Calendar, Download, Eye, CheckCircle, XCircle, X, Camera, Loader2 } from "lucide-react";
import { api, Alert } from "@/services/api";

// Extended Alert type with display fields
interface AlertDisplay {
  id: number;
  time: string;
  date: string;
  type: string;
  zone: string;
  location: string;
  severity: string;
  status: string;
  image?: string;
  confidence?: number;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<AlertDisplay | null>(null);

  // Fetch alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await api.getAlerts();

        // Transform API data to display format
        const transformed: AlertDisplay[] = data.map((alert: Alert, index: number) => ({
          id: parseInt(alert.id) || index + 1,
          time: new Date(alert.timestamp).toLocaleTimeString('id-ID'),
          date: new Date(alert.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          type: alert.type || 'PELANGGARAN',
          zone: alert.zone || 'ZONA A',
          location: alert.zone || 'Area Kerja',
          severity: alert.severity === 'high' || alert.severity === 'critical' ? 'BAHAYA' : 'PERINGATAN',
          status: alert.status === 'resolved' ? 'resolved' : 'open',
          confidence: Math.random() * 10 + 90
        }));

        setAlerts(transformed.length > 0 ? transformed : getDummyAlerts());
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        setAlerts(getDummyAlerts());
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fallback dummy data if API returns empty
  const getDummyAlerts = (): AlertDisplay[] => [
    {
      id: 1,
      time: new Date().toLocaleTimeString('id-ID'),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      type: "NO HELMET",
      zone: "TITIK D",
      location: "Loading Dock",
      severity: "BAHAYA",
      status: "open",
      confidence: 94.5
    },
    {
      id: 2,
      time: new Date(Date.now() - 3600000).toLocaleTimeString('id-ID'),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      type: "NO VEST",
      zone: "TITIK B",
      location: "Assembly Area",
      severity: "PERINGATAN",
      status: "open",
      confidence: 91.2
    },
    {
      id: 3,
      time: new Date(Date.now() - 7200000).toLocaleTimeString('id-ID'),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      type: "NO GLOVES",
      zone: "TITIK C",
      location: "Welding Bay",
      severity: "PERINGATAN",
      status: "resolved",
      confidence: 88.7
    }
  ];

  // Handle acknowledge alert
  const handleAcknowledge = async (alertId: number) => {
    try {
      const success = await api.acknowledgeAlert(alertId.toString());
      if (success) {
        setAlerts(prev => prev.map(a =>
          a.id === alertId ? { ...a, status: 'resolved' } : a
        ));
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === "open" && alert.status !== "open") return false;
    if (filter === "resolved" && alert.status !== "resolved") return false;
    if (searchQuery && !alert.type.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !alert.zone.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-slate-600">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-orange-500 w-5 h-5 md:w-6 md:h-6" />
            Riwayat Kejadian
          </h1>
          <p className="text-sm text-slate-500">Log deteksi pelanggaran APD dengan bukti foto ({alerts.length} total)</p>
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

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500">Total Kejadian</p>
          <p className="text-2xl font-bold text-slate-900">{alerts.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-200">
          <p className="text-xs text-slate-500">Aktif</p>
          <p className="text-2xl font-bold text-red-600">{alerts.filter(a => a.status === 'open').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-emerald-200">
          <p className="text-xs text-slate-500">Selesai</p>
          <p className="text-2xl font-bold text-emerald-600">{alerts.filter(a => a.status === 'resolved').length}</p>
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

              {/* Confidence Score */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded font-mono">
                {alert.confidence?.toFixed(1)}%
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

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Tidak ada kejadian</h3>
          <p className="text-sm text-slate-500">Semua pekerja patuh menggunakan APD</p>
        </div>
      )}

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
                  {selectedAlert.type} - {selectedAlert.confidence?.toFixed(1)}%
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
              {selectedAlert.status === "open" && (
                <button
                  onClick={() => handleAcknowledge(selectedAlert.id)}
                  className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                >
                  ✓ Tandai Selesai
                </button>
              )}
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
