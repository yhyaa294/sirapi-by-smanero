"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Maximize2, X, AlertTriangle, CheckCircle } from "lucide-react";
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
    location: "Pintu Masuk A",
    status: "online",
    lastDetection: {
      time: "2 menit lalu",
      type: "safe",
      message: "Semua APD lengkap",
    },
    thumbnail: "/images/cctv.png",
  },
  {
    id: "CAM-02",
    name: "Area Perakitan",
    location: "Workshop A",
    status: "online",
    lastDetection: {
      time: "5 menit lalu",
      type: "violation",
      message: "Helm tidak terdeteksi",
    },
    thumbnail: "/images/cctv.png",
  },
  {
    id: "CAM-03",
    name: "Gudang Utama",
    location: "Warehouse B",
    status: "offline",
    thumbnail: "/images/cctv.png",
  },
  {
    id: "CAM-04",
    name: "Area Kimia",
    location: "Chemical Zone",
    status: "online",
    lastDetection: {
      time: "1 menit lalu",
      type: "safe",
      message: "Rompi safety terdeteksi",
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard
              className="group cursor-pointer overflow-hidden"
              glowColor={camera.status === "online" ? "emerald" : "none"}
              hover={true}
            >
              {/* Camera Preview */}
              <div className="relative h-40 bg-slate-950 overflow-hidden">
                <Image
                  src={camera.thumbnail}
                  alt={camera.name}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300"
                />
                
                {/* Status Badge Overlay */}
                <div className="absolute top-3 left-3">
                  <StatusBadge
                    status={camera.status === "online" ? "success" : "offline"}
                    label={camera.status === "online" ? "LIVE" : "OFFLINE"}
                    size="sm"
                  />
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={() => setSelectedCamera(camera)}
                  className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800"
                >
                  <Maximize2 size={16} className="text-white" />
                </button>

                {/* Recording Indicator */}
                {camera.status === "online" && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-red-400 font-medium">REC</span>
                  </div>
                )}
              </div>

              {/* Camera Info */}
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Camera size={14} className="text-orange-500" />
                      {camera.id}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400">{camera.location}</p>
                </div>

                {/* Last Detection */}
                {camera.lastDetection && camera.status === "online" && (
                  <div
                    className={`
                      p-2 rounded-lg border text-xs
                      ${
                        camera.lastDetection.type === "violation"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      {camera.lastDetection.type === "violation" ? (
                        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{camera.lastDetection.message}</p>
                        <p className="text-[10px] opacity-70 mt-0.5">{camera.lastDetection.time}</p>
                      </div>
                    </div>
                  </div>
                )}

                {camera.status === "offline" && (
                  <div className="p-2 rounded-lg border bg-slate-500/10 border-slate-500/20 text-slate-400 text-xs text-center">
                    Kamera tidak aktif
                  </div>
                )}
              </div>
            </GlassCard>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCamera(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="overflow-hidden">
                <div className="relative h-[60vh] bg-slate-950">
                  <Image
                    src={selectedCamera.thumbnail}
                    alt={selectedCamera.name}
                    fill
                    className="object-contain"
                  />
                  
                  <button
                    onClick={() => setSelectedCamera(null)}
                    className="absolute top-4 right-4 p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusBadge
                        status={selectedCamera.status === "online" ? "success" : "offline"}
                        label={selectedCamera.status === "online" ? "LIVE" : "OFFLINE"}
                      />
                      <div>
                        <h3 className="text-white font-bold">{selectedCamera.name}</h3>
                        <p className="text-slate-400 text-sm">{selectedCamera.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}