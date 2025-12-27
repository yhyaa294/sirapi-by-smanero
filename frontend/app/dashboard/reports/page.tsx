"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Calendar, Filter, FileSpreadsheet, File, Clock, Loader2, RefreshCw } from "lucide-react";
import { api, DailyReport } from "@/services/api";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<DailyReport | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const reportTypes = [
    { id: "daily", label: "Harian", icon: Calendar },
    { id: "weekly", label: "Mingguan", icon: Calendar },
    { id: "monthly", label: "Bulanan", icon: Calendar },
    { id: "custom", label: "Custom", icon: Filter },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Typically we would handle different report types here
      // For now, only 'daily' is fully implemented in backend handler we saw
      if (reportType === 'daily') {
        const data = await api.getDailyReport(date);
        setReportData(data);
      } else {
        alert("Tipe laporan ini belum tersedia sepenuhnya di backend.");
      }
    } catch (e) {
      console.error(e);
      alert("Gagal mengambil laporan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <FileText className="text-orange-500" />
          Laporan Otomatis
        </h1>
        <p className="text-slate-500">Generate dan download laporan kepatuhan APD dari Data Center.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Generate Report */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Konfigurasi Laporan</h3>

          {/* Report Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Jenis Laporan</label>
            <div className="grid grid-cols-4 gap-3">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${reportType === type.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <type.icon size={24} className={reportType === type.id ? "text-orange-500" : "text-slate-400"} />
                  <span className={`text-sm font-medium ${reportType === type.id ? "text-orange-700" : "text-slate-600"}`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Laporan</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Content Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Konten Laporan</label>
            <div className="space-y-3">
              {[
                { label: "Ringkasan Compliance", checked: true },
                { label: "Daftar Pelanggaran", checked: true },
                { label: "Statistik per Zona", checked: true },
              ].map((option, i) => (
                <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" defaultChecked={option.checked} className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            {loading ? "Generating Report..." : "Generate Report Data"}
          </button>
        </div>

        {/* Report Preview / Result */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg flex flex-col h-full">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Preview Ringkasan</h3>

          {reportData ? (
            <div className="space-y-6 flex-1">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Deteksi</p>
                <p className="text-3xl font-black text-slate-900">{reportData.total_detections}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-xs text-red-500 uppercase font-bold tracking-wider mb-1">Pelanggaran</p>
                  <p className="text-2xl font-black text-red-600">{reportData.total_violations}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-500 uppercase font-bold tracking-wider mb-1">Kepatuhan</p>
                  <p className="text-2xl font-black text-emerald-600">{Number(reportData.compliance_rate).toFixed(1)}%</p>
                </div>
              </div>

              {/* Top Locations */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 text-sm">Lokasi Rawan</h4>
                <div className="space-y-2">
                  {reportData.top_locations.length > 0 ? reportData.top_locations.map((loc, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-700">{loc.location}</span>
                      <span className="font-bold text-red-500">{loc.violations} Violations</span>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 italic">Tidak ada data pelanggaran.</p>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-6 flex gap-2">
                <button
                  onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/reports/export/pdf`, '_blank')}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-600 transition"
                >
                  <FileText size={16} /> PDF
                </button>
                <button
                  onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/reports/export/excel`, '_blank')}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition"
                >
                  <FileSpreadsheet size={16} /> Excel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>Klik "Generate" untuk melihat ringkasan data dari server.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
