"use client";

import React from "react";
import Link from "next/link";
import WebcamPlayer from "@/components/WebcamPlayer";
import { ArrowLeft, Camera, Video, AlertTriangle, Shield, Clock, User, Activity } from "lucide-react";

// Dummy Data Logs
const RECENT_LOGS = [
  { time: "10:45:12", type: "info", msg: "Person Detected (ID: 482)" },
  { time: "10:45:15", type: "success", msg: "PPE Verified: Helmet OK" },
  { time: "10:45:16", type: "success", msg: "PPE Verified: Vest OK" },
  { time: "10:46:02", type: "warning", msg: "Motion in Restricted Zone B" },
  { time: "10:48:30", type: "info", msg: "System Auto-Calibration" },
];

export default function LiveFocusPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950 text-white p-6 gap-6">
      
      {/* 1. HEADER PAGE */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/monitoring" 
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <ArrowLeft size={20} className="text-slate-300" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Video size={24} className="text-orange-500" />
              CAM-01: Main Gate Webcam
            </h1>
            <p className="text-slate-400 text-sm">Live Feed • Building A • Floor 1</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
           <div className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-800 rounded-full text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SYSTEM ONLINE
           </div>
           <div className="text-xs font-mono text-slate-500">Latency: 24ms</div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT (Grid 2 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* --- KOLOM KIRI: VIDEO PLAYER (70%) --- */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Video Container */}
          <div className="flex-1 bg-black rounded-xl border border-slate-800 overflow-hidden shadow-2xl relative">
            <WebcamPlayer />
          </div>

          {/* Control Bar */}
          <div className="h-16 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between px-6">
             <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-all active:scale-95">
                   <Camera size={18} />
                   <span className="text-sm font-medium">Snapshot</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-all active:scale-95">
                   <Video size={18} />
                   <span className="text-sm font-medium">Record Clip</span>
                </button>
             </div>

             <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg transition-colors">
                <AlertTriangle size={18} />
                <span className="text-sm font-bold">Report Incident</span>
             </button>
          </div>
        </div>


        {/* --- KOLOM KANAN: ANALYTICS PANEL (30%) --- */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
           
           {/* Panel Header */}
           <div className="p-4 border-b border-slate-800 bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity size={16} className="text-orange-500" />
                Live Analytics
              </h3>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* 1. Detected Objects Card */}
              <div className="space-y-3">
                 <h4 className="text-xs text-slate-500 font-bold uppercase">Real-time Detection</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/30 relative overflow-hidden">
                       <div className="text-2xl font-bold text-white">1</div>
                       <div className="text-xs text-slate-400">Person</div>
                       <User className="absolute right-2 bottom-2 text-emerald-500 opacity-20" size={32} />
                       <div className="absolute top-0 right-0 p-1 bg-emerald-500/20 rounded-bl-lg">
                          <Shield size={12} className="text-emerald-500" />
                       </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 relative">
                       <div className="text-2xl font-bold text-slate-500">0</div>
                       <div className="text-xs text-slate-400">Vehicles</div>
                    </div>
                 </div>
                 
                 {/* PPE Checklist */}
                 <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                       <span className="text-sm text-slate-300">Helmet</span>
                       <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded border border-emerald-500/30">DETECTED</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-sm text-slate-300">Safety Vest</span>
                       <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded border border-emerald-500/30">DETECTED</span>
                    </div>
                    <div className="flex justify-between items-center opacity-50">
                       <span className="text-sm text-slate-300">Gloves</span>
                       <span className="text-xs text-slate-500">N/A</span>
                    </div>
                 </div>
              </div>

              {/* 2. Worker Profile (Dummy) */}
              <div className="space-y-3">
                 <h4 className="text-xs text-slate-500 font-bold uppercase">Identity Match</h4>
                 <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-700 rounded-full overflow-hidden border-2 border-emerald-500">
                       <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Worker" className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <div className="text-sm font-bold text-white">Budi Santoso</div>
                       <div className="text-xs text-slate-400">ID: ENG-482 • Engineering</div>
                       <div className="text-[10px] text-emerald-400 mt-1">Confidence: 98.2%</div>
                    </div>
                 </div>
              </div>

              {/* 3. Recent Logs */}
              <div className="space-y-3">
                 <h4 className="text-xs text-slate-500 font-bold uppercase">Activity Log</h4>
                 <div className="space-y-2">
                    {RECENT_LOGS.map((log, i) => (
                       <div key={i} className="flex gap-3 items-start text-xs border-l-2 border-slate-700 pl-3 py-0.5">
                          <span className="font-mono text-slate-500">{log.time}</span>
                          <span className={`${
                             log.type === 'warning' ? 'text-yellow-500' : 
                             log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                          }`}>
                             {log.msg}
                          </span>
                       </div>
                    ))}
                 </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
