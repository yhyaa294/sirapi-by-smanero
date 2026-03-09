"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    AlertTriangle,
    Video,
    Maximize2,
    Activity,
    History,
    Settings,
    ArrowLeft,
    Eye,
    Camera,
    Info,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Wifi,
    WifiOff,
} from "lucide-react";
import dynamic from 'next/dynamic';
import { api, Camera as CameraType } from "@/services/api";

const WebcamViewer = dynamic(() => import("@/components/WebcamViewer"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-[#111528] flex items-center justify-center text-slate-500 animate-pulse">
            <Video size={40} className="opacity-50" />
            <span className="ml-3 font-mono text-sm">INITIALIZING...</span>
        </div>
    )
});

export default function MonitorPage() {
    const params = useParams();
    const router = useRouter();
    const [id, setId] = useState<string>("");
    const [camera, setCamera] = useState<CameraType | null>(null);
    const [allCameras, setAllCameras] = useState<CameraType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showConfig, setShowConfig] = useState(true);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    // Config state
    const [brightness, setBrightness] = useState(50);
    const [contrast, setContrast] = useState(50);
    const [saturation, setSaturation] = useState(50);
    const [zoom, setZoom] = useState(30);

    // Log state
    const [logs] = useState([
        { time: "10:45:22", type: "info", message: "System check completed" },
        { time: "10:42:15", type: "success", message: "Camera connected" },
        { time: "10:40:00", type: "info", message: "Motion detection active" },
    ]);

    useEffect(() => {
        if (params?.id) setId(Array.isArray(params.id) ? params.id[0] : params.id);
    }, [params]);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const cameras = await api.getCameras();
                setAllCameras(cameras);
                if (id) {
                    const camId = parseInt(id);
                    if (!isNaN(camId)) {
                        const cam = await api.getCamera(camId);
                        if (cam) setCamera(cam);
                        else setError("Kamera tidak ditemukan");
                    } else {
                        setError("ID Kamera tidak valid");
                    }
                }
            } catch {
                setError("Gagal memuat data kamera");
            } finally {
                setIsLoading(false);
            }
        };
        if (id) loadData();
    }, [id]);

    const formatTime = (date: Date | null) => {
        if (!date) return "--:--:--";
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const renderVideoSource = () => {
        if (!camera) return null;
        const isWebcam = !isNaN(Number(camera.rtsp_url)) || camera.rtsp_url.length < 5;

        if (isWebcam) {
            return (
                <div className="relative w-full h-full bg-[#111528] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="http://localhost:8000/video_feed"
                        alt="Live AI Feed"
                        className="w-full h-full object-cover absolute inset-0 z-10"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-[#111528] hidden">
                        <div className="text-center">
                            <Video className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                            <p className="text-white font-medium text-sm mb-1">Stream Tidak Tersedia</p>
                            <p className="text-slate-500 text-xs">Pastikan AI Engine berjalan di port 8000</p>
                        </div>
                    </div>
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            LIVE
                        </span>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="relative w-full h-full bg-[#111528] flex items-center justify-center">
                    <div className="text-center">
                        <Activity className="w-10 h-10 mx-auto mb-3 animate-pulse text-blue-500" />
                        <p className="text-white font-medium text-sm">RTSP Stream</p>
                        <p className="text-xs text-slate-500 font-mono mt-1 px-3 py-1 bg-black/40 rounded">{camera.rtsp_url}</p>
                    </div>
                </div>
            );
        }
    };

    // Navigation helpers
    const currentIndex = allCameras.findIndex(c => c.ID === camera?.ID);
    const prevCamera = currentIndex > 0 ? allCameras[currentIndex - 1] : null;
    const nextCamera = currentIndex < allCameras.length - 1 ? allCameras[currentIndex + 1] : null;

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#0c0f1a] -m-6 lg:-m-8 flex items-center justify-center rounded-2xl">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-sm font-mono">CONNECTING...</p>
                </div>
            </div>
        );
    }

    if (error || !camera) {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#0c0f1a] -m-6 lg:-m-8 flex items-center justify-center rounded-2xl">
                <div className="text-center">
                    <AlertTriangle size={40} className="text-red-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-white mb-1">Error</h2>
                    <p className="text-slate-400 text-sm mb-5">{error || "Kamera tidak ditemukan"}</p>
                    <button onClick={() => router.push('/dashboard/cctv')} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#0c0f1a] -m-6 lg:-m-8 flex flex-col text-white rounded-2xl overflow-hidden">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-5 py-3 bg-[#111528] border-b border-white/5">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/cctv" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-white flex items-center gap-2">
                            {camera.name}
                            <span className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        </h1>
                        <p className="text-xs text-slate-500">{camera.location}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Camera Nav */}
                    <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/5">
                        {allCameras.slice(0, 8).map(cam => (
                            <Link
                                key={cam.ID}
                                href={`/dashboard/monitor/${cam.ID}`}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${cam.ID === camera.ID ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {cam.name.replace("Kamera ", "").replace("Camera ", "")}
                            </Link>
                        ))}
                    </div>

                    {/* Prev/Next */}
                    <div className="flex items-center gap-1">
                        {prevCamera && (
                            <Link href={`/dashboard/monitor/${prevCamera.ID}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
                                <ChevronLeft size={16} />
                            </Link>
                        )}
                        {nextCamera && (
                            <Link href={`/dashboard/monitor/${nextCamera.ID}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
                                <ChevronRight size={16} />
                            </Link>
                        )}
                    </div>

                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className={`p-2 rounded-lg transition-colors ${showConfig ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        <SlidersHorizontal size={16} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex min-h-0">
                {/* Video Feed */}
                <div className="flex-1 relative">
                    {renderVideoSource()}

                    {/* Bottom Bar Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-mono text-white/70" suppressHydrationWarning>
                                    {formatTime(currentTime)}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {camera.resolution || '1920×1080'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Eye size={12} /> AI Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Config Panel */}
                {showConfig && (
                    <aside className="w-72 bg-[#111528] border-l border-white/5 flex flex-col overflow-y-auto">
                        {/* Stream Info */}
                        <div className="p-4 border-b border-white/5">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Info size={13} />
                                Stream Info
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white/5 rounded-lg p-2.5">
                                    <p className="text-slate-500 mb-0.5">Codec</p>
                                    <p className="text-white font-medium">H.265</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-2.5">
                                    <p className="text-slate-500 mb-0.5">Resolution</p>
                                    <p className="text-white font-medium">{camera.resolution || '1920×1080'}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-2.5">
                                    <p className="text-slate-500 mb-0.5">FPS</p>
                                    <p className="text-white font-medium">{camera.fps || 25}</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-2.5">
                                    <p className="text-slate-500 mb-0.5">Latency</p>
                                    <p className="text-white font-medium">{camera.latency || 24}ms</p>
                                </div>
                            </div>
                        </div>

                        {/* Image Controls */}
                        <div className="p-4 border-b border-white/5">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <SlidersHorizontal size={13} />
                                Image
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Brightness", value: brightness, setter: setBrightness },
                                    { label: "Contrast", value: contrast, setter: setContrast },
                                    { label: "Saturation", value: saturation, setter: setSaturation },
                                ].map((ctrl) => (
                                    <div key={ctrl.label}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs text-slate-400">{ctrl.label}</span>
                                            <span className="text-xs text-white font-mono">{ctrl.value}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            value={ctrl.value}
                                            onChange={(e) => ctrl.setter(Number(e.target.value))}
                                            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lens Controls */}
                        <div className="p-4 border-b border-white/5">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Camera size={13} />
                                Lens
                            </h3>
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs text-slate-400">Zoom</span>
                                    <span className="text-xs text-white font-mono">{zoom}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
                                />
                            </div>
                            <button className="w-full mt-3 py-2 text-xs font-medium text-slate-400 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
                                ↺ Reset
                            </button>
                        </div>

                        {/* System Logs */}
                        <div className="p-4 flex-1">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <History size={13} />
                                System Log
                            </h3>
                            <div className="space-y-2">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-2 text-[11px] font-mono">
                                        <span className="text-slate-600 shrink-0">{log.time}</span>
                                        <span className={
                                            log.type === 'error' ? 'text-red-400' :
                                                log.type === 'success' ? 'text-emerald-400' :
                                                    'text-blue-400'
                                        }>{log.message}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* Bottom Status */}
            <footer className="px-5 py-2 bg-[#111528] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        {camera.status === 'online' ? <Wifi size={12} className="text-emerald-500" /> : <WifiOff size={12} className="text-red-500" />}
                        {camera.status.toUpperCase()}
                    </span>
                    <span>{camera.resolution || '1920×1080'}</span>
                </div>
                <span className="text-slate-600" suppressHydrationWarning>
                    {formatTime(currentTime)}
                </span>
            </footer>
        </div>
    );
}
