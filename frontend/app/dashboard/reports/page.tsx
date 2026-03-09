"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Bell,
  ToggleLeft,
  ToggleRight,
  FileX,
  RefreshCw
} from "lucide-react";

// Empty array - no dummy data
const REPORT_ARCHIVE: Array<{
  id: number;
  date: string;
  violations: number;
  status: string;
  statusLabel: string;
}> = [];

export default function ReportsPage() {
  const [telegramKepsek, setTelegramKepsek] = useState(true);
  const [telegramWalas, setTelegramWalas] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      alert("Fitur ini akan tersedia setelah backend terhubung.");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Laporan Tata Tertib
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Download dan kelola rekap pelanggaran harian
          </p>
        </div>
        <div className="px-4 py-2 bg-primary/10 rounded-xl text-xs font-bold text-primary border border-primary/20 flex items-center gap-2 shadow-sm">
          <Clock size={16} />
          Laporan otomatis setiap 16:00 WIB
        </div>
      </header>

      {/* Auto-Report Generator Card */}
      <div className="glass-card p-6 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-5">
            <div className="p-4 bg-primary/10 rounded-2xl shadow-inner border border-primary/10">
              <FileText size={32} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-wide">Download Laporan Harian</h2>
              <p className="text-sm font-medium text-slate-500 mt-1.5 max-w-md leading-relaxed">
                Sistem secara otomatis merekap data pelanggaran setiap pukul 16:00. Anda juga dapat mengunduh laporan manual kapan saja diperlukan.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-slate-50 transition-all text-sm border border-slate-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <FileText size={18} />}
              {isGenerating ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-safe text-white font-bold rounded-xl hover:bg-emerald-600 transition-all text-sm shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 disabled:opacity-50"
            >
              <FileSpreadsheet size={18} />
              Download Excel
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Report Archive Table (2/3) */}
        <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200/50 flex items-center justify-between bg-white/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Calendar size={18} className="text-slate-500" />
              </div>
              <h3 className="font-bold text-slate-800 tracking-wide">Arsip Laporan</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">7 hari terakhir</span>
          </div>

          {/* Empty State */}
          {REPORT_ARCHIVE.length === 0 ? (
            <div className="p-16 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Decorative Background for empty state */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_100%)] pointer-events-none"></div>

              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100 relative z-10">
                <FileX size={40} className="text-slate-300" />
              </div>
              <h4 className="text-lg font-bold text-slate-700 mb-2 relative z-10">Belum Ada Data Laporan</h4>
              <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto mb-8 relative z-10">
                Arsip laporan akan tersedia di sini setelah sistem rutin memantau dan menghasilkan rekap harian secara otomatis.
              </p>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 disabled:opacity-50 relative z-10"
              >
                {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                {isGenerating ? "Generating..." : "Generate Manual"}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Tanggal</th>
                    <th className="px-6 py-4 text-left font-bold">Total Pelanggaran</th>
                    <th className="px-6 py-4 text-left font-bold">Status</th>
                    <th className="px-6 py-4 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {REPORT_ARCHIVE.map((report) => (
                    <tr key={report.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          {report.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${report.violations > 10 ? 'bg-critical/10 text-critical' : 'bg-warning/10 text-warning'
                          }`}>
                          {report.violations} pelanggaran
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-safe text-xs font-bold">
                          <CheckCircle2 size={16} />
                          {report.statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm border border-transparent hover:border-slate-200 opacity-0 group-hover:opacity-100">
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Configuration Panel (1/3) */}
        <div className="lg:col-span-1 glass-card overflow-hidden">
          <div className="p-5 border-b border-slate-200/50 flex items-center gap-3 bg-white/50">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
              <Send size={16} className="text-blue-500" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-wide">Integrasi Pengiriman</h3>
          </div>

          <div className="p-5 space-y-4">
            {/* Toggle 1 */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${telegramKepsek ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${telegramKepsek ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                  <Bell size={18} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${telegramKepsek ? 'text-primary' : 'text-slate-700'}`}>Telegram Kepsek</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Laporan harian otomatis</p>
                </div>
              </div>
              <button
                onClick={() => setTelegramKepsek(!telegramKepsek)}
                className={`transition-colors ${telegramKepsek ? 'text-primary' : 'text-slate-300 hover:text-slate-400'}`}
              >
                {telegramKepsek ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

            {/* Toggle 2 */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${telegramWalas ? 'bg-safe/5 border-safe/20' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${telegramWalas ? 'bg-safe/10 text-safe' : 'bg-slate-200 text-slate-500'}`}>
                  <Bell size={18} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${telegramWalas ? 'text-safe' : 'text-slate-700'}`}>Telegram Wali Kelas</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Notifikasi siswa spesifik</p>
                </div>
              </div>
              <button
                onClick={() => setTelegramWalas(!telegramWalas)}
                className={`transition-colors ${telegramWalas ? 'text-safe' : 'text-slate-300 hover:text-slate-400'}`}
              >
                {telegramWalas ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-amber-50/80 rounded-xl border border-amber-200/50">
              <div className="flex items-center gap-2 text-warning mb-2">
                <span className="text-lg">💡</span>
                <p className="font-bold text-sm tracking-wide text-amber-900">Petunjuk Integrasi</p>
              </div>
              <p className="text-xs font-medium text-amber-800 leading-relaxed">
                Pastikan Bot Telegram Sistem Monitoring telah ditambahkan dan diberikan akses yang sesuai pada menu <b>Pengaturan Sistem</b>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
