"use client";

import { AlertTriangle, Eye } from "lucide-react";

interface Alert {
  id: string;
  time: string;
  location: string;
  type: string;
  severity: "high" | "medium" | "low";
}

const RECENT_ALERTS: Alert[] = [
  { id: "1", time: "10:42 AM", location: "Zone A - Main Entrance", type: "Missing Helmet", severity: "high" },
  { id: "2", time: "10:38 AM", location: "Zone C - Loading Bay", type: "Vest Violation", severity: "medium" },
  { id: "3", time: "09:15 AM", location: "Zone B - Assembly", type: "Unauthorized Access", severity: "high" },
  { id: "4", time: "08:55 AM", location: "Zone A - Main Entrance", type: "Missing Helmet", severity: "high" },
  { id: "5", time: "08:30 AM", location: "Zone D - Warehouse", type: "Vest Violation", severity: "medium" },
];

export default function RecentAlertsFeed() {
  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/50">
      <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <h3 className="font-semibold text-slate-100">Recent Alerts</h3>
        <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-500">Live</span>
      </header>
      
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {RECENT_ALERTS.map((alert) => (
            <li key={alert.id} className="group flex items-center justify-between rounded-lg p-3 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`mt-1 rounded p-1 ${alert.severity === 'high' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{alert.type}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{alert.time}</span>
                    <span>•</span>
                    <span>{alert.location}</span>
                  </div>
                </div>
              </div>
              
              <button className="opacity-0 group-hover:opacity-100 rounded-md bg-slate-700 p-1.5 text-slate-300 hover:bg-slate-600 hover:text-white transition-all">
                <Eye className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="border-t border-slate-800 p-3">
        <button className="w-full rounded-lg border border-slate-700 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          View All Activity
        </button>
      </div>
    </section>
  );
}
