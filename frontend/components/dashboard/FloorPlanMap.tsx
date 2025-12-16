"use client";

import React from "react";
import { Camera, AlertTriangle, WifiOff } from "lucide-react";

// Data Dummy Kamera
const dummyMapPoints = [
  { id: 1, name: 'Gerbang Depan', x: 20, y: 80, status: 'ok' },
  { id: 2, name: 'Area Produksi A', x: 50, y: 50, status: 'alert' },
  { id: 3, name: 'Gudang Belakang', x: 80, y: 20, status: 'offline' },
  { id: 4, name: 'Lobby Utama', x: 20, y: 20, status: 'ok' },
  { id: 5, name: 'Area Loading', x: 80, y: 80, status: 'ok' },
];

export default function FloorPlanMap() {
  return (
    <div className="relative w-full h-[400px] md:h-full min-h-[400px] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-inner group">
      
      {/* 1. Background Grid Pattern (Blueprint Style) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* 2. Header / Label */}
      <div className="absolute top-4 left-4 z-10 bg-slate-950/80 px-3 py-1 rounded-md border border-slate-700 backdrop-blur-sm">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Floor Plan
        </h3>
      </div>

      {/* 3. Mapping Points (Markers) */}
      {dummyMapPoints.map((point) => {
        // Tentukan warna berdasarkan status
        let colorClass = "text-emerald-400 bg-emerald-500/20 border-emerald-500";
        let glowClass = "shadow-[0_0_15px_rgba(16,185,129,0.5)]";
        
        if (point.status === 'alert') {
          colorClass = "text-red-500 bg-red-500/20 border-red-500 animate-pulse";
          glowClass = "shadow-[0_0_15px_rgba(239,68,68,0.6)]";
        } else if (point.status === 'offline') {
          colorClass = "text-slate-500 bg-slate-500/20 border-slate-500";
          glowClass = "";
        }

        return (
          <div
            key={point.id}
            className="absolute group/marker cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 z-20"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            {/* Icon Kamera */}
            <div className={`p-2 rounded-full border ${colorClass} ${glowClass} relative`}>
              {point.status === 'alert' ? <AlertTriangle size={20} /> : 
               point.status === 'offline' ? <WifiOff size={20} /> : 
               <Camera size={20} />}
              
              {/* Cone of Vision (Efek Sorotan CCTV) */}
              <div className={`absolute top-full left-1/2 -translate-x-1/2 w-16 h-24 bg-gradient-to-b from-current to-transparent opacity-10 clip-triangle pointer-events-none transform origin-top transition-transform group-hover/marker:scale-125 ${point.status === 'offline' ? 'hidden' : ''}`} 
                   style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
              </div>
            </div>

            {/* Tooltip */}
            <div className="absolute top-[-35px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/marker:opacity-100 transition-opacity border border-slate-700 pointer-events-none z-30">
              {point.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
