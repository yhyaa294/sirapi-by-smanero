"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamic import WebcamViewer (no SSR)
const WebcamViewer = dynamic(() => import("@/components/WebcamViewer"), {
    ssr: false,
    loading: () => (
        <div className="w-full aspect-video bg-slate-800 flex items-center justify-center">
            <span className="text-slate-400">Loading webcam...</span>
        </div>
    ),
});
import {
    ArrowLeft,
    Camera,
    Shield,
    AlertTriangle,
    Activity,
    Cpu,
    Eye,
    HardHat,
    Shirt,
    Hand,
    Footprints,
    Clock,
    Zap,
    RefreshCw,
    Volume2,
    Maximize2,
    Settings,
    Download,
} from "lucide-react";

// Camera data mapping
const cameraData: Record<string, { name: string; location: string; image: string; status: string }> = {
    "A": { name: "TITIK A", location: "Gudang Utama", image: "/images/worker 1.png", status: "online" },
    "B": { name: "TITIK B", location: "Area Assembly", image: "/images/worker 2.png", status: "alert" },
    "C": { name: "TITIK C", location: "Welding Bay", image: "/images/worker 3.png", status: "online" },
    "D": { name: "TITIK D", location: "Loading Dock", image: "/images/worker 4.png", status: "online" },
};

// Simulated AI detection results
const detectionResults = [
    { id: 1, type: "helmet", label: "Helmet", status: "detected", confidence: 98.5, color: "emerald", x: "25%", y: "8%", w: "18%", h: "15%" },
    { id: 2, type: "vest", label: "Vest", status: "detected", confidence: 95.2, color: "emerald", x: "22%", y: "25%", w: "25%", h: "30%" },
    { id: 3, type: "gloves", label: "Gloves", status: "missing", confidence: 94.8, color: "red", x: "15%", y: "50%", w: "12%", h: "10%" },
    { id: 4, type: "boots", label: "Safety Boots", status: "detected", confidence: 91.3, color: "emerald", x: "20%", y: "75%", w: "20%", h: "18%" },
];

// Simulated real-time logs
const initialLogs = [
    { time: "10:11:22", event: "AI Detection cycle completed", type: "info" },
    { time: "10:11:20", event: "⚠️ Missing Gloves detected", type: "warning" },
    { time: "10:11:18", event: "Helmet verified - 98.5%", type: "success" },
    { time: "10:11:15", event: "Vest verified - 95.2%", type: "success" },
    { time: "10:11:10", event: "Worker entered frame", type: "info" },
    { time: "10:11:05", event: "Camera feed stable", type: "info" },
];

export default function SingleCameraPage() {
    const params = useParams();
    const cameraId = (params.id as string)?.toUpperCase() || "A";
    const camera = cameraData[cameraId] || cameraData["A"];

    const [currentTime, setCurrentTime] = useState("");
    const [fps, setFps] = useState(28);
    const [detectionSpeed, setDetectionSpeed] = useState(42);
    const [logs, setLogs] = useState(initialLogs);

    // Update time every second
    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString("id-ID"));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // Simulate FPS and detection speed fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setFps(Math.floor(25 + Math.random() * 8));
            setDetectionSpeed(Math.floor(38 + Math.random() * 15));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Simulate new log entries
    useEffect(() => {
        const interval = setInterval(() => {
            const events = [
                { event: "AI Detection cycle completed", type: "info" },
                { event: "Frame processed successfully", type: "info" },
                { event: "All APD verified", type: "success" },
                { event: "Worker position tracked", type: "info" },
            ];
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            const newLog = {
                time: new Date().toLocaleTimeString("id-ID"),
                ...randomEvent,
            };
            setLogs((prev) => [newLog, ...prev.slice(0, 9)]);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const getAPDIcon = (type: string) => {
        switch (type) {
            case "helmet": return <HardHat className="w-4 h-4" />;
            case "vest": return <Shirt className="w-4 h-4" />;
            case "gloves": return <Hand className="w-4 h-4" />;
            case "boots": return <Footprints className="w-4 h-4" />;
            default: return <Shield className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-6">
            {/* Header - Consistent with Dashboard */}
            <div className="flex flex-col gap-4 mb-6">
                {/* Top Row - Title and Time */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white text-sm transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Grid
                        </Link>
                        <div className="w-px h-8 bg-slate-700"></div>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Camera className="w-6 h-6 text-orange-500" />
                                {camera.name} - {camera.location}
                            </h1>
                            <p className="text-slate-400 text-sm">Live AI Monitoring • Camera ID: CAM-{cameraId}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Date/Time Display - Same as Dashboard */}
                        <div className="text-right hidden md:block">
                            <div className="text-xl font-mono font-bold text-white tracking-tight" suppressHydrationWarning>
                                {currentTime || "--:--:--"}
                            </div>
                            <div className="text-[10px] text-slate-500" suppressHydrationWarning>
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>

                        <div className="h-10 w-px bg-slate-700 hidden md:block"></div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-emerald-400 font-medium">LIVE</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Camera Navigation Tabs (Scrollable on Mobile) */}
                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex items-center gap-2 bg-slate-900/50 rounded-xl p-1.5 border border-slate-800 w-fit min-w-max">
                        {/* ALL Button */}
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                        >
                            <Eye size={16} />
                            ALL
                        </Link>

                        {/* Camera Buttons */}
                        {[
                            { id: "A", dotColor: "bg-emerald-500" },
                            { id: "B", dotColor: "bg-amber-500" },
                            { id: "C", dotColor: "bg-emerald-500" },
                            { id: "D", dotColor: "bg-red-500" },
                        ].map(({ id, dotColor }) => {
                            const isActive = cameraId === id;

                            return (
                                <Link
                                    key={id}
                                    href={`/dashboard/monitor/${id.toLowerCase()}`}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${isActive
                                        ? "bg-white text-slate-900 shadow-lg font-bold"
                                        : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white"
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${isActive ? "bg-slate-900" : dotColor}`}></span>
                                    TITIK {id}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content - Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Left Panel - Camera Feed (70%) */}
                <div className="lg:col-span-7">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        {/* Camera Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                    <span className="text-white font-mono text-sm">REC</span>
                                </div>
                                <span className="text-slate-400 text-sm">|</span>
                                <span className="text-slate-400 text-sm font-mono">1920x1080 @ {fps}fps</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                    <Volume2 className="w-4 h-4 text-slate-400" />
                                </button>
                                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                    <Settings className="w-4 h-4 text-slate-400" />
                                </button>
                                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                    <Maximize2 className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Camera Feed with AI Overlay */}
                        <div className="relative aspect-video bg-black">
                            {/* Camera Feed - AI Stream for TITIK A, Image for others */}
                            {cameraId === "A" ? (
                                <img
                                    src="http://localhost:8000/video_feed"
                                    alt="Live AI Feed"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <>
                                    <Image
                                        src={camera.image}
                                        alt={`Camera ${cameraId} Feed`}
                                        fill
                                        className="object-contain"
                                        priority
                                    />

                                    {/* AI Detection Bounding Boxes - Only for non-AI cameras */}
                                    {detectionResults.map((detection) => (
                                        <div
                                            key={detection.id}
                                            className={`absolute border-2 rounded transition-all ${detection.color === "emerald"
                                                ? "border-emerald-500 shadow-lg shadow-emerald-500/20"
                                                : "border-red-500 shadow-lg shadow-red-500/20 animate-pulse"
                                                }`}
                                            style={{
                                                left: detection.x,
                                                top: detection.y,
                                                width: detection.w,
                                                height: detection.h,
                                            }}
                                        >
                                            {/* Label */}
                                            <div
                                                className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${detection.color === "emerald"
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-red-500 text-white"
                                                    }`}
                                            >
                                                {detection.status === "detected" ? "✓" : "✗"} {detection.label}: {detection.confidence}%
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Timestamp Overlay */}
                            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 rounded-lg">
                                <span className="text-white font-mono text-sm" suppressHydrationWarning>
                                    {new Date().toLocaleDateString("id-ID")} • {currentTime}
                                </span>
                            </div>

                            {/* AI Processing Indicator */}
                            <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/70 rounded-lg">
                                <Cpu className="w-4 h-4 text-orange-500 animate-pulse" />
                                <span className="text-orange-400 font-mono text-sm">AI: {detectionSpeed}ms</span>
                            </div>
                        </div>

                        {/* Control Bar */}
                        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/80">
                            <div className="flex items-center gap-4">
                                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white text-sm font-medium transition-colors">
                                    <AlertTriangle className="w-4 h-4" />
                                    Report Incident
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm font-medium transition-colors">
                                    <Download className="w-4 h-4" />
                                    Screenshot
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Eye className="w-4 h-4" />
                                <span>YOLOv8 • SmartAPD Engine v1.0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - AI Info (30%) */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Detection Stats */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-orange-500" />
                            Detection Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-emerald-400">{fps}</p>
                                <p className="text-xs text-slate-400">FPS</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-orange-400">{detectionSpeed}ms</p>
                                <p className="text-xs text-slate-400">Inference</p>
                            </div>
                        </div>
                    </div>

                    {/* APD Status */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            APD Status
                        </h3>
                        <div className="space-y-3">
                            {detectionResults.map((detection) => (
                                <div
                                    key={detection.id}
                                    className={`flex items-center justify-between p-3 rounded-xl border ${detection.status === "detected"
                                        ? "bg-emerald-500/10 border-emerald-500/30"
                                        : "bg-red-500/10 border-red-500/30"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-2 rounded-lg ${detection.status === "detected" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                                }`}
                                        >
                                            {getAPDIcon(detection.type)}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${detection.status === "detected" ? "text-emerald-400" : "text-red-400"}`}>
                                                {detection.label}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {detection.status === "detected" ? "Detected" : "⚠️ Missing"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-mono ${detection.status === "detected" ? "text-emerald-400" : "text-red-400"}`}>
                                        {detection.confidence}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Real-time Logs */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                Real-time Logs
                            </h3>
                            <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                                <RefreshCw className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {logs.map((log, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 p-2 bg-slate-800/30 rounded-lg text-xs"
                                >
                                    <span className="text-slate-500 font-mono whitespace-nowrap">{log.time}</span>
                                    <span
                                        className={`${log.type === "success"
                                            ? "text-emerald-400"
                                            : log.type === "warning"
                                                ? "text-amber-400"
                                                : "text-slate-400"
                                            }`}
                                    >
                                        {log.event}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
