"use client";

import { AlertTriangle, Eye, ArrowRight } from "lucide-react";

interface Alert {
  id: string;
  time: string;
  location: string;
  type: string;
  severity: "high" | "medium" | "low";
  studentName?: string;
}

const RECENT_ALERTS: Alert[] = [
  { id: "1", time: "07:15 WIB", location: "Gerbang Depan", type: "Tidak Ada Dasi", severity: "medium", studentName: "Siswa Budi Santoso" },
  { id: "2", time: "07:12 WIB", location: "Koridor Utama", type: "Sepatu Warna", severity: "low", studentName: "Siswa Siti Aminah" },
  { id: "3", time: "07:08 WIB", location: "Area Parkir", type: "Terlambat", severity: "medium", studentName: "Siswa Rizky Firmansyah" },
  { id: "4", time: "07:05 WIB", location: "Gerbang Depan", type: "Tidak Ada Dasi", severity: "medium", studentName: "Siswa Dewi Lestari" },
  { id: "5", time: "06:58 WIB", location: "Kantin", type: "Rambut Gondrong", severity: "low", studentName: "Siswa Ahmad Dani" },
];

export default function RecentAlertsFeed() {
  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="font-bold text-slate-800">Pelanggaran Terkini</h3>
        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-600 animate-pulse">Live Feed</span>
      </header>

      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {RECENT_ALERTS.map((alert) => (
            <li key={alert.id} className="group flex items-center justify-between rounded-lg p-3 hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
              <div className="flex items-start gap-3">
                <div className={`mt-1 rounded-lg p-2 shadow-sm ${alert.severity === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{alert.type}</p>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">{alert.studentName}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-mono">{alert.time}</span>
                    <span>•</span>
                    <span>{alert.location}</span>
                  </div>
                </div>
              </div>

              <button className="opacity-0 group-hover:opacity-100 rounded-full bg-white border border-slate-200 p-2 text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all">
                <Eye className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-slate-100 p-4">
        <button className="w-full rounded-lg bg-slate-50 border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2">
          Lihat Semua Aktivitas
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
