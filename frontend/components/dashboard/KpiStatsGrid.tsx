"use client";

import { Users, AlertOctagon, ShieldCheck, Activity } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  accentColor: string;
}

function KpiCard({ title, value, icon: Icon, trend, trendUp, accentColor }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm hover:bg-slate-800 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-100">{value}</h3>
        </div>
        <div className={`rounded-lg p-2 bg-opacity-10 ${accentColor.replace('text-', 'bg-')}`}>
          <Icon className={`h-5 w-5 ${accentColor}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className={trendUp ? "text-emerald-400" : "text-rose-400"}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
          <span className="text-slate-500">vs last week</span>
        </div>
      )}
    </div>
  );
}

export default function KpiStatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total Workers"
        value="124"
        icon={Users}
        trend="12%"
        trendUp={true}
        accentColor="text-blue-500"
      />
      <KpiCard
        title="Compliance Rate"
        value="94.2%"
        icon={ShieldCheck}
        trend="2.1%"
        trendUp={true}
        accentColor="text-emerald-500"
      />
      <KpiCard
        title="Active Violations"
        value="3"
        icon={AlertOctagon}
        accentColor="text-rose-500 animate-pulse"
      />
      <KpiCard
        title="Safety Score"
        value="88/100"
        icon={Activity}
        trend="5pts"
        trendUp={true}
        accentColor="text-purple-500"
      />
    </div>
  );
}
