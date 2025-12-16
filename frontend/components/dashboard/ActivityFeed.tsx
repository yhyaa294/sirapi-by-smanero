"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Camera,
  MapPin,
  Clock,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface Activity {
  id: string;
  time: string;
  camera: string;
  location: string;
  message: string;
  severity: "critical" | "warning" | "info" | "success";
}

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "1",
    time: "10:45:23",
    camera: "CAM-02",
    location: "Area Perakitan A",
    message: "Pelanggaran: Helm tidak terdeteksi",
    severity: "critical",
  },
  {
    id: "2",
    time: "10:44:15",
    camera: "CAM-01",
    location: "Gerbang Utama",
    message: "Aman: Semua APD lengkap",
    severity: "success",
  },
  {
    id: "3",
    time: "10:43:42",
    camera: "CAM-04",
    location: "Gudang Kimia",
    message: "Peringatan: Rompi safety tidak terdeteksi",
    severity: "warning",
  },
  {
    id: "4",
    time: "10:42:30",
    camera: "CAM-03",
    location: "Workshop B",
    message: "Info: Pekerja memasuki zona hijau",
    severity: "info",
  },
  {
    id: "5",
    time: "10:41:18",
    camera: "CAM-02",
    location: "Area Perakitan A",
    message: "Aman: Sepatu safety terdeteksi",
    severity: "success",
  },
];

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const feedRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: Activity = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        camera: `CAM-0${Math.floor(Math.random() * 4) + 1}`,
        location: ["Area Perakitan", "Gudang Utama", "Workshop", "Gerbang"][
          Math.floor(Math.random() * 4)
        ],
        message: [
          "Aman: Semua APD lengkap",
          "Pelanggaran: Helm tidak terdeteksi",
          "Peringatan: Rompi tidak lengkap",
          "Info: Pekerja di zona aman",
        ][Math.floor(Math.random() * 4)],
        severity: ["success", "critical", "warning", "info"][
          Math.floor(Math.random() * 4)
        ] as Activity["severity"],
      };

      setActivities((prev) => [newActivity, ...prev].slice(0, 20));

      if (autoScroll && feedRef.current) {
        feedRef.current.scrollTop = 0;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoScroll]);

  const getSeverityConfig = (severity: Activity["severity"]) => {
    const configs = {
      critical: {
        icon: AlertTriangle,
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400",
        iconBg: "bg-red-500/20",
      },
      warning: {
        icon: AlertTriangle,
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        text: "text-yellow-400",
        iconBg: "bg-yellow-500/20",
      },
      success: {
        icon: CheckCircle,
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        iconBg: "bg-emerald-500/20",
      },
      info: {
        icon: Info,
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-400",
        iconBg: "bg-blue-500/20",
      },
    };
    return configs[severity];
  };

  return (
    <GlassCard className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Clock size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Live Activity Feed
            </h3>
            <p className="text-xs text-slate-400">Real-time monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">LIVE</span>
        </div>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          setAutoScroll(target.scrollTop === 0);
        }}
      >
        <AnimatePresence initial={false}>
          {activities.map((activity, index) => {
            const config = getSeverityConfig(activity.severity);
            const Icon = config.icon;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`
                  border-b border-slate-700/30 p-4 hover:bg-slate-800/30 
                  transition-colors cursor-pointer
                  ${index === 0 ? "bg-slate-800/20" : ""}
                `}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${config.iconBg} flex-shrink-0`}>
                    <Icon size={16} className={config.text} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm font-semibold ${config.text}`}>
                        {activity.message}
                      </p>
                      <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Camera size={12} />
                        <span className="font-medium">{activity.camera}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span>{activity.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700/50 text-center">
        <button className="text-xs text-slate-400 hover:text-white transition-colors font-medium">
          Lihat Semua Aktivitas →
        </button>
      </div>
    </GlassCard>
  );
}