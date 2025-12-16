"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Maximize2, AlertTriangle, Video, StopCircle, Radio, User } from "lucide-react";

export default function WebcamPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Efek timer untuk jam berjalan (Overlay CCTV)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fungsi untuk mengakses webcam asli browser
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } // Resolusi HD
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreamActive(true);
        }
      } catch (err) {
        console.error("Gagal mengakses webcam:", err);
        setIsStreamActive(false);
      }
    };

    startWebcam();

    // Cleanup: Matikan kamera saat pindah halaman
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full aspect-video bg-black border-2 border-slate-800 rounded-xl overflow-hidden shadow-2xl group">
      
      {/* 1. VIDEO ELEMENT (Real Webcam) */}
      {isStreamActive ? (
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted
          onLoadedMetadata={() => {
            const video = videoRef.current;
            if (video) {
              video.play().catch(err => console.error("Video play failed:", err));
            }
          }}
          className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
        />
      ) : (
        // Placeholder jika kamera belum aktif/izin ditolak
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
           <div className="p-4 bg-slate-800 rounded-full mb-4 animate-pulse">
             <Camera size={48} />
           </div>
           <p>Requesting Camera Access...</p>
           <p className="text-xs mt-2 text-slate-600">Please allow camera permission in your browser.</p>
        </div>
      )}

      {/* 2. OVERLAY UI (Style CCTV) */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Vignette Effect (Pinggiran gelap) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_60%,rgba(0,0,0,0.7)_100%)]"></div>
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
           {/* Status Tag */}
           <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-md border border-white/10">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
              <span className="text-xs font-bold text-white tracking-widest">LIVE REC</span>
           </div>
           
           {/* Time & Info */}
           <div className="text-right">
              <div className="text-lg font-mono font-bold text-white tracking-widest drop-shadow-md">{currentTime}</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1">CAM-01 • 1080p • 30FPS</div>
           </div>
        </div>

        {/* Crosshair / Fokus Tengah */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/20 rounded-full opacity-50">
           <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Artificial Intelligence Bounding Box (Statik Visual) */}
        {isStreamActive && (
          <div className="absolute top-1/4 left-1/3 w-48 h-64 border-2 border-emerald-500/70 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse hidden md:block">
             <div className="absolute -top-6 left-0 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-t-sm flex items-center gap-1">
               <User size={10} /> 
               PERSON (98%)
             </div>
             {/* Pojok Siku-siku */}
             <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-emerald-300"></div>
             <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-emerald-300"></div>
             <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-emerald-300"></div>
             <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-emerald-300"></div>
          </div>
        )}

        {/* Footer Info */}
        <div className="absolute bottom-4 left-4">
           <div className="flex items-center gap-2 text-xs text-slate-300 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
             <Radio size={12} className="text-emerald-500" />
             <span>Signal: Excellent (48ms)</span>
           </div>
        </div>

      </div>
    </div>
  );
}
