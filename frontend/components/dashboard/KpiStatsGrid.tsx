import { Users, AlertTriangle, Award, Camera, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  accentColor: string;
  subValue?: string;
  iconBg: string;
}

function KpiCard({ title, value, icon: Icon, trend, trendUp, accentColor, subValue, iconBg }: KpiCardProps) {
  return (
    <div className="glass-card p-6 flex flex-col justify-between group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            {trend && (
              <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${trendUp ? "text-safe bg-safe/10" : "text-critical bg-critical/10"}`}>
                {trendUp ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {trend}
              </span>
            )}
          </div>
          {subValue && <p className="text-xs font-medium text-slate-400 mt-1">{subValue}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft transition-transform group-hover:scale-110 ${iconBg}`}>
          <Icon className={`h-6 w-6 ${accentColor}`} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

export default function KpiStatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total Siswa"
        value="850"
        icon={Users}
        trend="2.4%"
        trendUp={true}
        accentColor="text-primary"
        iconBg="bg-primary/10"
        subValue="Active students"
      />
      <KpiCard
        title="Pelanggaran"
        value="12"
        icon={AlertTriangle}
        trend="1.8%"
        trendUp={false}
        accentColor="text-critical"
        iconBg="bg-critical/10"
        subValue="Today's anomalies"
      />
      <KpiCard
        title="Kepatuhan"
        value="94%"
        icon={Award}
        trend="0.5%"
        trendUp={true}
        accentColor="text-safe"
        iconBg="bg-safe/10"
        subValue="Compliance rate"
      />
      <KpiCard
        title="CCTV Gerbang"
        value="Online"
        subValue="Live Monitoring Active"
        icon={Camera}
        accentColor="text-info"
        iconBg="bg-info/10"
      />
    </div>
  );
}
