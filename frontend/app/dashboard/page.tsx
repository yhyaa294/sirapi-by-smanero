"use client";

import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, UserCheck, TrendingUp, ArrowRight } from "lucide-react";
import LiveMonitor from "@/components/dashboard/enterprise/LiveMonitor";
import RiskHeatmap from "@/components/dashboard/enterprise/RiskHeatmap";

export default function DashboardPage() {
  return (
    <div className="space-y-4">

      {/* ROW 1: KEY METRICS (Pulse Score) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* BIG PULSE SCORE */}
        <div className="col-span-1 md:col-span-2 glass-panel p-6 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-safe/10 to-transparent"></div>

          <div>
            <h3 className="label-text mb-1">REAL-TIME COMPLIANCE SCORE</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white font-mono tracking-tighter">94.2</span>
              <span className="text-xl font-bold text-safe">%</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-mono text-safe">
              <TrendingUp size={14} />
              <span>+2.4% vs LAST WEEK</span>
            </div>
          </div>

          <div className="h-16 w-16 rounded-full border-4 border-safe/30 flex items-center justify-center relative">
            <ShieldCheck size={32} className="text-safe" />
            <div className="absolute inset-0 rounded-full border-t-4 border-safe animate-spin"></div>
          </div>
        </div>

        {/* SMALLER METRICS */}
        <div className="glass-panel p-4 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-sm bg-critical/10">
              <AlertTriangle className="text-critical w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-critical bg-critical/10 px-1 py-0.5 rounded">HIGH PRIORITY</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">12</div>
          <div className="label-text mt-1">OPEN VIOLATIONS</div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-sm bg-info/10">
              <UserCheck className="text-info w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-safe bg-safe/10 px-1 py-0.5 rounded">ACTIVE</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">248</div>
          <div className="label-text mt-1">WORKERS ON SITE</div>
        </div>
      </div>

      {/* ROW 2: MAIN MONITOR LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-[600px]">
        {/* COL 1: CAMERA GRID (Takes 2 columns) */}
        <div className="xl:col-span-2 glass-panel p-1 flex flex-col">
          <div className="px-3 py-2 flex justify-between items-center border-b border-border/50 mb-1">
            <h3 className="label-text flex items-center gap-2">
              <span className="status-dot status-dot-safe animate-pulse"></span>
              LIVE SURVEILLANCE FEED
            </h3>
            <button className="text-[10px] text-primary hover:text-white transition-colors font-mono uppercase">
              Configure View
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <LiveMonitor />
          </div>
        </div>

        {/* COL 2: RISK MAP & ALERTS */}
        <div className="flex flex-col gap-4">
          {/* MAP */}
          <div className="flex-1 glass-panel overflow-hidden flex flex-col">
            <RiskHeatmap />
          </div>

          {/* LATEST ALERTS LIST */}
          <div className="h-1/3 glass-panel p-3 overflow-hidden flex flex-col">
            <h3 className="label-text mb-3">RECENT ALERTS</h3>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-surface border border-border rounded-sm hover:border-primary/50 transition-colors group cursor-pointer">
                  <div className="h-8 w-8 bg-critical/10 rounded flex items-center justify-center shrink-0">
                    <AlertTriangle size={14} className="text-critical" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-white truncate">NO HELMET DETECTED</h4>
                      <span className="text-[9px] font-mono text-foreground-muted">2m ago</span>
                    </div>
                    <p className="text-[10px] text-foreground-muted truncate">Zone A - Welding Bay 02</p>
                  </div>
                  <ArrowRight size={14} className="text-foreground-dim group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
