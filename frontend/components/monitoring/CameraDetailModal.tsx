"use client";

import { X, ShieldAlert, Clock, User } from "lucide-react";
import { CameraData } from "./CameraFeedCard";

interface CameraDetailModalProps {
  camera: CameraData | null;
  onClose: () => void;
}

// Mock logs generator
const generateLogs = (count: number) => {
  const actions = ["Worker Detected", "Safe: Helmet On", "Violation: No Vest", "Zone Entry", "Safe: Vest On"];
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    time: new Date(Date.now() - i * 1000 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    message: actions[i % actions.length],
    type: actions[i % actions.length].includes("Violation") ? "danger" : "info"
  }));
};

export default function CameraDetailModal({ camera, onClose }: CameraDetailModalProps) {
  if (!camera) return null;

  const logs = generateLogs(10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative flex h-[80vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl md:flex-row">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-slate-300 hover:bg-rose-500 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left: Large Video Feed */}
        <div className="relative flex-1 bg-slate-900 flex items-center justify-center border-b border-slate-800 md:border-b-0 md:border-r">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Simulated large feed content */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin mb-4" />
              <p className="text-slate-500 font-mono">Establishing Secure Stream...</p>
            </div>
            
            {/* Overlay Info */}
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur px-4 py-2 rounded-lg border border-slate-700">
              <h2 className="text-xl font-bold text-slate-100">{camera.name}</h2>
              <p className="text-sm text-slate-400">{camera.zone} • Floor 1</p>
            </div>
          </div>
        </div>

        {/* Right: Activity Log & Stats */}
        <div className="w-full md:w-96 bg-slate-950 flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <h3 className="font-semibold text-slate-100 mb-4">Real-time Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-500">Workers Present</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="text-xl font-bold text-slate-200">{camera.workers}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${camera.violations > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <p className="text-xs text-slate-500">Violations</p>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldAlert className={`h-4 w-4 ${camera.violations > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
                  <span className={`text-xl font-bold ${camera.violations > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {camera.violations}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Activity Log</h4>
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800">
                  <Clock className="h-4 w-4 text-slate-600 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${log.type === 'danger' ? 'text-rose-400' : 'text-slate-300'}`}>
                      {log.message}
                    </p>
                    <p className="text-xs text-slate-600">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
