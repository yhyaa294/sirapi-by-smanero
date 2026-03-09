"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Maximize2, X, AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Image from "next/image";

interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline";
  lastDetection?: {
    time: string;
    type: "violation" | "safe";
    message: string;
  };
  thumbnail: string;
}

const MOCK_CAMERAS: CameraFeed[] = [
  {
    id: "CAM-01",
    name: "Gerbang Utama",
    location: "Pintu Masuk Barat",
    status: "online",
    lastDetection: {
      time: "Baru saja",
      type: "safe",
      message: "Atribut Lengkap (Dasi & Sabuk)",
    },
    thumbnail: "/images/cctv.png", // Ensure this exists or use placeholder
  },
  {
    id: "CAM-02",
    name: "Koridor X-IPA",
    location: "Lantai 1 Sayap Kanan",
    status: "online",
    lastDetection: {
      time: "2 menit lalu",
      type: "violation",
      message: "Terdeteksi: Tanpa Dasi",
    },
    thumbnail: "/images/cctv.png",
  },
  {
    id: "CAM-03",
    name: "Area Parkir Siswa",
    location: "Parkiran Motor A",
    status: "offline",
    thumbnail: "/images/cctv.png",
  },
  {
    id: "CAM-04",
    name: "Kantin Utama",
    location: "Area Istirahat",
    status: "online",
    lastDetection: {
      time: "1 menit lalu",
      type: "safe",
      message: "Seragam Rapi",
    },
    thumbnail: "/images/cctv.png",
  },
];

export function LiveCameraGrid() {
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_CAMERAS.map((camera, index) => (
          <motion.div
            key={camera.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="group relative rounded-xl overflow-hidden bg-slate-900 shadow-md border border-slate-200">
              {/* Camera Preview */}
              <div className="relative h-48 bg-slate-800 overflow-hidden">
                {/* Fallback pattern if image fails or for demo */}
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                  <div className="grid grid-cols-12 gap-1 opacity-20 w-full h-full">
                    {Array.from({ length: 144 }).map((_, i) => <div key={i} className="bg-slate-700 aspect-square rounded-sm" />)}
                  </div>
                </div>

                {/* Simulated Image Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="text-slate-700 w-16 h-16 opacity-50" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />

                {/* Status Badge Overlay */}
                <div className="absolute top-3 left-3">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${camera.status === 'online' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-500 text-slate-200'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${camera.status === 'online' ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                    {camera.status === 'online' ? 'LIVE' : 'OFFLINE'}
                  </div>
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={() => setSelectedCamera(camera)}
                  className="absolute top-3 right-3 p-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
                >
                  <Maximize2 size={14} className="text-white" />
                </button>

                {/* Camera Info Overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                    <Camera size={14} className="text-blue-400" />
                    {camera.name}
                  </h4>

                  {/* Last Detection Bubble */}
                  {camera.lastDetection && camera.status === "online" && (
                    <div className={`mt-2 flex items-center gap-2 px-2 py-1.5 rounded-lg border backdrop-blur-sm ${camera.lastDetection.type === 'violation'
                        ? 'bg-rose-500/20 border-rose-500/30 text-rose-200'
                        : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
                      }`}>
                      {camera.lastDetection.type === 'violation' ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                      <span className="text-xs font-medium truncate">{camera.lastDetection.message}</span>
                    </div>
                  )}
                  {camera.status === "offline" && (
                    <div className="mt-2 text-xs text-slate-400 italic">Sinyal terputus...</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {selectedCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setSelectedCamera(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Camera className="text-blue-500" /> {selectedCamera.name}
                  </h2>
                  <p className="text-slate-400 text-sm ml-8">{selectedCamera.location} • {selectedCamera.id}</p>
                </div>
                <button
                  onClick={() => setSelectedCamera(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Big Viewport */}
              <div className="bg-slate-900 h-[600px] relative flex items-center justify-center">
                <div className="grid grid-cols-12 gap-1 opacity-10 w-full h-full absolute inset-0">
                  {Array.from({ length: 144 }).map((_, i) => <div key={i} className="bg-white aspect-square rounded-sm" />)}
                </div>
                <div className="text-center z-10">
                  <Shield className="w-32 h-32 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-mono">LIVE FEED STREAM: {selectedCamera.id}</p>
                  <p className="text-xs text-slate-600 mt-2">Enkripsi AES-256 Aktif</p>
                </div>

                {/* AI Bounding Box Simulation */}
                {selectedCamera.status === 'online' && (
                  <div className="absolute top-1/2 left-1/3 w-24 h-48 border-2 border-dashed border-emerald-500 rounded flex flex-col items-center">
                    <div className="bg-emerald-500 text-black text-[10px] font-bold px-1 uppercase mt-[-10px]">Siswa Deteksi</div>
                  </div>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}