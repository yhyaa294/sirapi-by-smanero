"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const data = [
  { day: "Mon", violations: 12, safe: 88 },
  { day: "Tue", violations: 8, safe: 92 },
  { day: "Wed", violations: 15, safe: 85 },
  { day: "Thu", violations: 5, safe: 95 },
  { day: "Fri", violations: 10, safe: 90 },
  { day: "Sat", violations: 4, safe: 96 },
  { day: "Sun", violations: 2, safe: 98 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 shadow-xl">
        <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>
        <p className="text-sm font-bold text-rose-400">
          {payload[0].value} Violations
        </p>
      </div>
    );
  }
  return null;
};

export default function ViolationTrendChart() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-100">Weekly Violation Trend</h3>
          <p className="text-xs text-slate-400">7-day safety compliance overview</p>
        </div>
        <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300 outline-none focus:border-blue-500">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="day" 
              tick={{ fill: "#64748b", fontSize: 12 }} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              tick={{ fill: "#64748b", fontSize: 12 }} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#334155" }} />
            <Area
              type="monotone"
              dataKey="violations"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorViolations)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
