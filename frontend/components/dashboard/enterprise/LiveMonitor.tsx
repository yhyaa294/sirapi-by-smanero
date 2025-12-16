"use client";

import { useState } from "react";
import { Maximize2, Mic, MicOff, MoreVertical, Ban, ShieldAlert } from "lucide-react";

export default function LiveMonitor() {
    const [fullscreen, setFullscreen] = useState<number | null>(null);

    const cameras = [
        { id: 1, name: "GATE A - MAIN ENTRY", status: "live", workers: 12, alerts: 0, image: "/images/cctv-1.jpg" },
        { id: 2, name: "WAREHOUSE ZONE B", status: "live", workers: 5, alerts: 0, image: "/images/cctv-2.jpg" },
        { id: 3, name: "ASSEMBLY LINE 1", status: "live", workers: 18, alerts: 2, image: "/images/cctv-3.jpg" },
        { id: 4, name: "LOADING DOCK", status: "offline", workers: 0, alerts: 0, image: "/images/noise.png" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 h-full">
            {cameras.map((cam) => (
                <div
                    key={cam.id}
                    className={`relative group bg-black rounded-sm border border-border overflow-hidden ${fullscreen === cam.id ? "fixed inset-4 z-50 border-primary shadow-2xl" : "aspect-video"
                        }`}
                >
                    {/* Mock Video Feed */}
                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                        {/* Replace with actual image/video element */}
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-700 font-mono text-xs">
                            IP_CAMERA_FEED_0{cam.id} // 192.168.1.10{cam.id}
                        </div>
                    </div>

                    {/* Overlays */}
                    <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${cam.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                            <span className="font-mono text-xs font-bold text-white tracking-wider">{cam.status === 'live' ? 'REC' : 'OFFLINE'}</span>
                        </div>
                        <div className="text-right">
                            <div className="font-mono text-xs font-bold text-white">{cam.name}</div>
                            <div className="font-mono text-[10px] text-zinc-400">15 MAR 2024 14:32:45</div>
                        </div>
                    </div>

                    {/* Alert Overlay (Simulated) */}
                    {cam.alerts > 0 && (
                        <div className="absolute inset-0 border-2 border-critical animate-pulse pointer-events-none flex items-center justify-center">
                            <div className="bg-critical/90 text-white px-4 py-2 rounded-sm font-bold flex items-center gap-2 backdrop-blur-md">
                                <ShieldAlert className="w-5 h-5" />
                                DETECTED: NO HELMET
                            </div>
                        </div>
                    )}

                    {/* Controls (Hover) */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex justify-between items-end">
                        <div className="flex gap-2 text-[10px] font-mono text-zinc-400">
                            <div>ppl: {cam.workers}</div>
                            <div className={cam.alerts > 0 ? "text-critical font-bold" : "text-safe"}>violation: {cam.alerts}</div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-white/10 rounded-sm text-white" title="PTZ Control">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-sm text-white" title="Audio">
                                <MicOff className="w-4 h-4" />
                            </button>
                            <button
                                className="p-2 hover:bg-white/10 rounded-sm text-white"
                                onClick={() => setFullscreen(fullscreen === cam.id ? null : cam.id)}
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
