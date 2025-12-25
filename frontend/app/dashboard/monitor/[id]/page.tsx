"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    AlertTriangle,
    CheckCircle,
    Video,
    Maximize2,
    Activity,
    History,
    Settings,
    ArrowLeft,
    Siren,
    Eye,
    Settings2
} from "lucide-react";
import dynamic from 'next/dynamic';
import Link from "next/link";
import { api, Camera } from "@/services/api";

const WebcamViewer = dynamic(() => import("@/components/WebcamViewer"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 animate-pulse">
            <Video size={48} className="opacity-50" />
            <span className="ml-4 font-mono">INITIALIZING VIDEO FEED...</span>
        </div>
    )
});

export default function MonitorPage() {
    const params = useParams();
    const router = useRouter();
    const [id, setId] = useState<string>("");

    const [camera, setCamera] = useState<Camera | null>(null);
    const [allCameras, setAllCameras] = useState<Camera[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Initialize ID
    useEffect(() => {
        if (params?.id) {
            setId(Array.isArray(params.id) ? params.id[0] : params.id);
        }
    }, [params]);

    // Fetch Cameras & Current Camera
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // 1. Get all cameras for nav
                const cameras = await api.getCameras();
                setAllCameras(cameras);

                // 2. Find current camera
                if (id) {
                    const camId = parseInt(id);
                    if (!isNaN(camId)) {
                        const cam = await api.getCamera(camId);
                        if (cam) setCamera(cam);
                        else setError("Kamera tidak ditemukan");
                    } else {
                        // Fallback logic for string IDs if necessary
                        setError("ID Kamera tidak valid");
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Gagal memuat data kamera");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) loadData();
    }, [id]);

    // Simulated Real-time Logs
    const [logs, setLogs] = useState([
        { time: "10:45:22", type: "info", message: "System check completed" },
        { time: "10:42:15", type: "success", message: "Camera connected successfully" },
        { time: "10:40:00", type: "info", message: "Motion detection active" },
    ]);

    // Render Source Logic
    const renderVideoSource = () => {
        if (!camera) return null;

        // Check if RTSP URL is actually a webcam device ID (number) or special ID
        const isWebcam = !isNaN(Number(camera.rtsp_url)) || camera.rtsp_url.length < 5;

        // Note: We prioritize the AI Engine stream (localhost:8000/video_feed) 
        // because the Python backend locks the camera access. 
        // Direct getUserMedia would fail or conflict.

        if (isWebcam) {
            return (
                <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden">
                    <img
                        src="http://localhost:8000/video_feed"
                        alt="Live AI Feed"
                        className="w-full h-full object-cover absolute inset-0 z-10"
                        onError={(e) => {
                            // Fallback UI if stream is down
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                    {/* Offline / Loading State */}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800 hidden">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Video className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">Stream Unavailable</h3>
                            <p className="text-slate-400 text-sm">Pastikan AI Engine berjalan di port 8000</p>
                        </div>
                    </div>

                    {/* Overlay Info */}
                    <div className="absolute top-4 left-4 z-20">
                        <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded shadow-lg animate-pulse flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                            LIVE AI FEED
                        </span>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="relative w-full h-full">
                    {/* Placeholder for RTSP stream */}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white rounded-2xl">
                        <div className="text-center">
                            <Activity className="w-12 h-12 mx-auto mb-2 animate-pulse text-orange-500" />
                            <p className="font-bold">RTSP Stream</p>
                            <p className="text-xs opacity-50 font-mono mt-1 px-4 py-1 bg-black/50 rounded">{camera.rtsp_url}</p>
                            <p className="text-xs text-slate-500 mt-2">(Stream Proxy Required)</p>
                        </div>
                    </div>
                </div>
            )
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-mono animate-pulse">CONNECTING TO SECURE FEED...</p>
                </div>
            </div>
        )
    }

    if (error || !camera) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
                <AlertTriangle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Error</h2>
                <p className="text-slate-500 mb-6">{error || "Camera Not Found"}</p>
                <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
                    Kembali ke Dashboard
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">

            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            {camera.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${camera.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            <span className={`text-sm font-bold uppercase tracking-wider ${camera.status === 'online' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {camera.status.toUpperCase()}
                            </span>
                            <span className="text-slate-300 mx-2">|</span>
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                                <Video size={14} />
                                {camera.location}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Nav Tabs */}
                <div className="flex overflow-x-auto pb-2 md:pb-0 bg-white p-1 rounded-xl border border-slate-200 scrollbar-hide">
                    {allCameras.map(cam => (
                        <Link
                            key={cam.ID}
                            href={`/dashboard/monitor/${cam.ID}`}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${cam.ID === camera.ID
                                ? "bg-slate-900 text-white shadow-md"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                        >
                            {cam.name.replace("Kamera ", "").replace("Camera ", "")}
                        </Link>
                    ))}
                    <Link
                        href="/dashboard/settings"
                        className="px-3 py-2 text-slate-400 hover:text-orange-500 transition-colors flex items-center"
                        title="Configure Cameras"
                    >
                        <Settings size={16} />
                    </Link>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">

                {/* Left Column: Video Feed (Span 2) */}
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                    {/* Video Player */}
                    <div className="flex-1 bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800 group">

                        {renderVideoSource()}

                        {/* Overlay Controls */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-black/50 backdrop-blur text-white rounded-lg hover:bg-orange-500 transition-colors">
                                <Maximize2 size={20} />
                            </button>
                        </div>

                        {/* AI Stats Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 flex gap-4">
                            <div className="flex-1 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-lg">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">98.5%</p>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider">Compliance Rate</p>
                                </div>
                            </div>
                            <div className="flex-1 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg">
                                    <Eye size={24} />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">Active</p>
                                    <p className="text-slate-400 text-xs uppercase tracking-wider">AI Monitoring</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Real-time Data */}
                <div className="space-y-6 flex flex-col h-full overflow-hidden">

                    {/* Live Detections */}
                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Siren size={18} className="text-orange-500" />
                                Live Detections
                            </h3>
                            <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded animate-pulse">
                                LIVE
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {/* Mock Detections for now */}
                            <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 animate-pulse"></div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Monitoring Area...</p>
                                    <p className="text-xs text-slate-500 mt-1">Waiting for API events...</p>
                                    <p className="text-xs text-slate-400 mt-2 font-mono">{new Date().toLocaleTimeString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Logs */}
                    <div className="h-1/3 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
                                <History size={16} className="text-blue-400" />
                                System Logs
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-3 text-slate-400">
                                    <span className="text-slate-600">{log.time}</span>
                                    <span className={
                                        log.type === 'error' ? 'text-red-400' :
                                            log.type === 'success' ? 'text-emerald-400' :
                                                'text-blue-400'
                                    }>[{log.type.toUpperCase()}]</span>
                                    <span>{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
