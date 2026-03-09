"use client";

import { BarChart2 } from "lucide-react";

// Empty data - will be populated from backend
const data: Array<{ day: string; violations: number; safe: number }> = [];

export default function ViolationTrendChart() {
  return (
    <section className="glass-card p-6 h-full flex flex-col relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>

      <div className="mb-6 flex items-start justify-between relative z-10">
        <div>
          <h3 className="font-bold text-slate-800 tracking-wide">Tren Pelanggaran Minggu Ini</h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Overview kepatuhan 7 hari terakhir</p>
        </div>
        <select className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      {/* Empty State */}
      {data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
            <BarChart2 size={32} className="text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-600 tracking-wide">Belum Ada Data</p>
          <p className="text-xs font-medium text-slate-400 mt-1 max-w-[200px] text-center">Data tren akan muncul setelah sistem aktif melakukan monitoring</p>
        </div>
      ) : (
        <div className="flex-1 w-full relative z-10">
          {/* Chart will render when data exists */}
        </div>
      )}
    </section>
  );
}
