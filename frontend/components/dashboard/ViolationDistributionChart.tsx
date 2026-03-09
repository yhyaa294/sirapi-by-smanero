"use client";

import { PieChart as PieChartIcon } from "lucide-react";

// Empty data - will be populated from backend
const data: Array<{ name: string; value: number; color: string }> = [];

export default function ViolationDistributionChart() {
    return (
        <section className="glass-card p-6 h-full flex flex-col relative overflow-hidden">
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>

            <div className="mb-6 relative z-10">
                <h3 className="font-bold text-slate-800 tracking-wide">Jenis Pelanggaran</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Distribusi pelanggaran minggu ini</p>
            </div>

            {/* Empty State */}
            {data.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
                        <PieChartIcon size={32} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-600 tracking-wide">Belum Ada Data</p>
                    <p className="text-xs font-medium text-slate-400 mt-1 max-w-[200px] text-center">Distribusi akan muncul setelah sistem mendeteksi pelanggaran</p>
                </div>
            ) : (
                <div className="flex-1 w-full relative z-10">
                    {/* Chart will render when data exists */}
                </div>
            )}
        </section>
    );
}
