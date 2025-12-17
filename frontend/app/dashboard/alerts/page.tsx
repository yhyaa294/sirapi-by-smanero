"use client";

import { useState } from "react";
import { AlertTriangle, Search, Filter, Calendar, Download, Eye, CheckCircle, XCircle } from "lucide-react";

// Dummy alerts data
const alertsData = [
  { id: 1, time: "16:15:23", date: "17 Des 2024", type: "NO HELMET", zone: "TITIK D", location: "Loading Dock", severity: "BAHAYA", status: "open", image: null },
  { id: 2, time: "16:02:45", date: "17 Des 2024", type: "NO VEST", zone: "TITIK B", location: "Assembly", severity: "PERINGATAN", status: "open", image: null },
  { id: 3, time: "15:48:12", date: "17 Des 2024", type: "NO GLOVES", zone: "TITIK C", location: "Welding Bay", severity: "PERINGATAN", status: "resolved", image: null },
  { id: 4, time: "15:22:08", date: "17 Des 2024", type: "NO HELMET", zone: "TITIK A", location: "Gudang Utama", severity: "BAHAYA", status: "resolved", image: null },
  { id: 5, time: "14:55:33", date: "17 Des 2024", type: "NO BOOTS", zone: "TITIK D", location: "Loading Dock", severity: "PERINGATAN", status: "resolved", image: null },
  { id: 6, time: "14:30:19", date: "17 Des 2024", type: "NO HELMET", zone: "TITIK B", location: "Assembly", severity: "BAHAYA", status: "resolved", image: null },
];

export default function AlertsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAlerts = alertsData.filter(alert => {
    if (filter === "open" && alert.status !== "open") return false;
    if (filter === "resolved" && alert.status !== "resolved") return false;
    if (searchQuery && !alert.type.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !alert.zone.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <AlertTriangle className="text-orange-500" />
            Riwayat Kejadian
          </h1>
          <p className="text-slate-500">Log semua deteksi pelanggaran APD</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">

          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kejadian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
            {[
              { id: "all", label: "Semua" },
              { id: "open", label: "Aktif" },
              { id: "resolved", label: "Selesai" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.id
                    ? "bg-white text-slate-900 shadow"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors">
            <Calendar size={18} />
            Hari Ini
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-mono font-bold text-slate-900">{alert.time}</p>
                      <p className="text-xs text-slate-500">{alert.date}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className={alert.severity === "BAHAYA" ? "text-red-500" : "text-amber-500"} />
                      <span className="font-medium text-slate-900">{alert.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{alert.zone}</p>
                    <p className="text-xs text-slate-500">{alert.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${alert.severity === "BAHAYA"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                      }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {alert.status === "open" ? (
                        <>
                          <XCircle size={16} className="text-red-500" />
                          <span className="text-red-600 font-medium">Aktif</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="text-emerald-500" />
                          <span className="text-emerald-600 font-medium">Selesai</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors">
                      <Eye size={14} />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">Menampilkan {filteredAlerts.length} dari {alertsData.length} kejadian</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600 hover:bg-slate-200">Prev</button>
            <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600 hover:bg-slate-200">2</button>
            <button className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600 hover:bg-slate-200">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}
