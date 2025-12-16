"use client";

import React, { useState, useEffect } from 'react';
import { Maximize2, Camera, Battery, Wifi, Signal, Aperture, Link as LinkIcon, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function MonitoringPage() {
  // State untuk jam digital dummy
  const [currentTime, setCurrentTime] = useState<string>("");

  // Efek timer untuk jam berjalan
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    
    updateTime(); // Initial call
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pantauan CCTV Langsung</h1>
          <p className="text-slate-400 text-sm mt-1">Visualisasi umpan pengawasan waktu nyata.</p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded-full border border-emerald-500/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sistem Online
            </span>
        </div>
      </div>

      {/* Grid CCTV */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 pb-8">

        {/* --- KOTAK 1: LIVE WEBCAM LINK (UPDATED) --- */}
        <Link href="/dashboard/monitoring/live" className="block relative group bg-slate-900 border-2 border-emerald-500/50 hover:border-emerald-400 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] min-h-[280px] transition-all duration-300">
            
            {/* Background Pattern (Tech Grid) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)] opacity-50"></div>

            {/* Content Center: Call to Action */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 space-y-4 group-hover:scale-105 transition-transform duration-500">
                <div className="relative">
                    <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                        <PlayCircle size={40} strokeWidth={1.5} />
                    </div>
                </div>
                
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-white tracking-wider">HUBUNGKAN KE FEED LANGSUNG</h3>
                    <p className="text-xs text-emerald-400/80 font-mono">KLIK UNTUK MENGAKSES KAMERA WEB</p>
                </div>
            </div>

            {/* UI Overlay: POJOK KIRI ATAS (Status Live) */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-lg z-10">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="text-xs font-bold text-white tracking-widest uppercase">READY</span>
              <div className="h-3 w-px bg-white/20 mx-1"></div>
              <span className="text-xs text-emerald-400 font-medium tracking-wide">CAM-01 UTAMA</span>
            </div>

            {/* UI Overlay: POJOK KANAN ATAS (Tech Stats) */}
            <div className="absolute top-4 right-4 flex items-center gap-3 text-slate-200 bg-black/60 p-1.5 rounded-lg backdrop-blur-sm border border-white/5 z-10">
              <Wifi size={14} className="text-emerald-500" />
              <Battery size={14} className="text-emerald-500" />
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-emerald-500/30 rounded-tl-xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-emerald-500/30 rounded-br-xl"></div>
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20"></div>
        </Link>


        {/* --- KOTAK 2-6: PLACEHOLDER OFFLINE (NO SIGNAL) --- */}
        {[2, 3, 4, 5, 6].map((num) => (
          <div key={num} className="bg-slate-800/30 border border-slate-700/50 rounded-xl flex flex-col items-center justify-center min-h-[280px] relative group overflow-hidden">
            {/* Noise Effect Background */}
            <div className="absolute inset-0 opacity-5 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/TV_noise.gif')] bg-cover pointer-events-none mix-blend-overlay"></div>
            
            <div className="p-4 bg-slate-900/50 rounded-full mb-3 group-hover:scale-110 transition-transform border border-slate-700 shadow-inner">
               <Signal size={24} className="text-slate-600" />
            </div>
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-widest">Sinyal Hilang</h3>
            <p className="text-slate-600 text-xs mt-1 font-mono">Menunggu koneksi...</p>

            {/* Label ID */}
            <div className="absolute top-4 left-4 px-2 py-1 bg-slate-900/80 rounded border border-slate-700 backdrop-blur-sm">
               <span className="text-xs text-slate-500 font-mono font-bold">CAM-0{num}</span>
            </div>

            {/* Reconnect Button (Dummy) */}
            <button className="mt-4 px-4 py-1.5 rounded-full border border-slate-600 text-slate-400 text-xs hover:bg-slate-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
               Coba Sambungkan
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}
