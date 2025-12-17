"use client";

import { useState } from "react";
import { FileText, Download, Calendar, Filter, FileSpreadsheet, File, Clock } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("daily");

  const reportTypes = [
    { id: "daily", label: "Harian", icon: Calendar },
    { id: "weekly", label: "Mingguan", icon: Calendar },
    { id: "monthly", label: "Bulanan", icon: Calendar },
    { id: "custom", label: "Custom", icon: Filter },
  ];

  const recentReports = [
    { id: 1, name: "Laporan Harian - 17 Des 2024", type: "daily", date: "17 Des 2024", size: "2.4 MB", status: "ready" },
    { id: 2, name: "Laporan Harian - 16 Des 2024", type: "daily", date: "16 Des 2024", size: "2.1 MB", status: "ready" },
    { id: 3, name: "Laporan Mingguan - Minggu 50", type: "weekly", date: "15 Des 2024", size: "8.7 MB", status: "ready" },
    { id: 4, name: "Laporan Bulanan - November 2024", type: "monthly", date: "01 Des 2024", size: "24.3 MB", status: "ready" },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <FileText className="text-orange-500" />
          Laporan
        </h1>
        <p className="text-slate-500">Generate dan download laporan kepatuhan APD</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Generate Report */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Generate Laporan Baru</h3>

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

          {/* Date Range */}
          {reportType === "custom" && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dari Tanggal</label>
                <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sampai Tanggal</label>
                <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>
          )}

          {/* Content Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Konten Laporan</label>
            <div className="space-y-3">
              {[
                { label: "Ringkasan Compliance", checked: true },
                { label: "Daftar Pelanggaran", checked: true },
                { label: "Statistik per Zona", checked: true },
                { label: "Grafik Trend", checked: false },
                { label: "Screenshot Deteksi", checked: false },
              ].map((option, i) => (
                <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" defaultChecked={option.checked} className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Format Export</label>
            <div className="flex gap-4">
              <button className="flex items-center gap-3 px-6 py-3 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                <File size={20} className="text-red-600" />
                <span className="font-medium text-red-700">PDF</span>
              </button>
              <button className="flex items-center gap-3 px-6 py-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors">
                <FileSpreadsheet size={20} className="text-emerald-600" />
                <span className="font-medium text-emerald-700">Excel</span>
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg transition-colors">
            <Download size={20} />
            Generate Laporan
          </button>
        </div>

        {/* Recent Reports */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Laporan Terbaru</h3>

          <div className="space-y-3">
            {recentReports.map((report) => (
              <div key={report.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-orange-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-orange-500" />
                    <span className="font-medium text-slate-900 text-sm">{report.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {report.date}
                    </span>
                    <span>{report.size}</span>
                  </div>
                  <button className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium">
                    <Download size={12} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
