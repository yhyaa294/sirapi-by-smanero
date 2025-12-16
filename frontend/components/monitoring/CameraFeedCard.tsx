"use client";

import { Video, Wifi, WifiOff, Users, AlertTriangle, Maximize2 } from "lucide-react";
import { useState, useEffect } from "react";

export interface CameraData {
  id: string;
  name: string;
  zone: string;
  status: "online" | "offline";
  violationStatus: "safe" | "warning" | "critical";
  workers: number;
  violations: number;
  thumbnail?: string; // Optional real image URL
}

interface CameraFeedCardProps {
  camera: CameraData;
  onClick: () => void;
}

export default function CameraFeedCard({ camera, onClick }: CameraFeedCardProps) {
  // Hydration safety: random animations can cause hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isCritical = camera.violationStatus === "critical";
  const isOffline = camera.status === "offline";

  return (
    <div 
      onClick={onClick}
      className={`group relative aspect-video w-full cursor-pointer overflow-hidden rounded-xl border-2 bg-slate-950 transition-all hover:scale-[1.02] hover:shadow-xl ${
        isCritical 
          ? "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse-slow" 
          : "border-slate-800 hover:border-blue-500/50"
      }`}
    >
      {/* Video Placeholder / Feed */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
        {isOffline ? (
          <div className="flex flex-col items-center gap-2 text-slate-600">
            <WifiOff className="h-8 w-8" />
            <span className="text-xs font-mono uppercase tracking-widest">Signal Lost</span>
          </div>
        ) : (
          <>
            {/* Static Noise / Placeholder Background */}
            <div className="absolute inset-0 bg-[url('https://media.istockphoto.com/id/175424635/photo/noise.jpg?s=612x612&w=0&k=20&c=BrLpeqXj0Yy7Q_B_Xf5rJqE6CqJK4z0v9y5zX0x_w=')] opacity-[0.03] mix-blend-overlay" />
            
            {/* Scan Line Animation */}
            {mounted && (
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan" style={{ height: '20%' }} />
            )}
            
            {/* Camera Icon Placeholder if no thumbnail */}
            <Video className="h-10 w-10 text-slate-800 opacity-50" />
          </>
        )}
      </div>

      {/* Overlay Top: Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between bg-gradient-to-b from-black/80 to-transparent p-3">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isOffline ? "bg-slate-500" : "bg-emerald-500 animate-pulse"}`} />
          <span className="text-xs font-bold text-slate-200 shadow-sm">{camera.name}</span>
        </div>
        <div className="flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 backdrop-blur-sm">
          {isOffline ? (
             <span className="text-[10px] font-medium text-slate-400">OFFLINE</span>
          ) : (
             <span className="text-[10px] font-medium text-emerald-400">LIVE</span>
          )}
        </div>
      </div>

      {/* Overlay Bottom: Stats */}
      {!isOffline && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 py-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 text-blue-400" />
              <span className="text-xs font-semibold text-slate-200">{camera.workers}</span>
            </div>
            {camera.violations > 0 ? (
              <div className="flex items-center gap-1.5 rounded bg-rose-500/20 px-1.5 py-0.5">
                <AlertTriangle className="h-3 w-3 text-rose-500" />
                <span className="text-xs font-bold text-rose-500">{camera.violations} Violations</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-emerald-500">● Compliance 100%</span>
              </div>
            )}
          </div>
          
          <Maximize2 className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* CSS for Custom Scan Animation */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: -20%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        .animate-pulse-slow {
           animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
