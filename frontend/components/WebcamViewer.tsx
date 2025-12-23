"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Camera, CameraOff, RefreshCw, Maximize2, Volume2, VolumeX } from "lucide-react";

interface WebcamViewerProps {
    className?: string;
    onFrame?: (imageData: string) => void;
    showControls?: boolean;
}

export default function WebcamViewer({
    className = "",
    onFrame,
    showControls = true
}: WebcamViewerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [fps, setFps] = useState(0);
    const [resolution, setResolution] = useState({ width: 0, height: 0 });

    // Start webcam
    const startWebcam = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: false
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();

                // Get actual resolution
                const settings = stream.getVideoTracks()[0].getSettings();
                setResolution({
                    width: settings.width || 0,
                    height: settings.height || 0
                });

                setIsActive(true);
            }
        } catch (err) {
            console.error("Webcam error:", err);
            setError("Gagal mengakses webcam. Pastikan izin sudah diberikan.");
            setIsActive(false);
        }
    }, []);

    // Stop webcam
    const stopWebcam = useCallback(() => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsActive(false);
    }, []);

    // Toggle webcam
    const toggleWebcam = useCallback(() => {
        if (isActive) {
            stopWebcam();
        } else {
            startWebcam();
        }
    }, [isActive, startWebcam, stopWebcam]);

    // Capture frame for processing
    const captureFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !isActive) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!ctx) return null;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        return canvas.toDataURL("image/jpeg", 0.8);
    }, [isActive]);

    // FPS counter
    useEffect(() => {
        if (!isActive) return;

        let frameCount = 0;
        let lastTime = performance.now();

        const countFps = () => {
            frameCount++;
            const now = performance.now();
            if (now - lastTime >= 1000) {
                setFps(frameCount);
                frameCount = 0;
                lastTime = now;
            }
            if (isActive) {
                requestAnimationFrame(countFps);
            }
        };

        requestAnimationFrame(countFps);
    }, [isActive]);

    // Send frames to parent for AI processing
    useEffect(() => {
        if (!isActive || !onFrame) return;

        const interval = setInterval(() => {
            const frame = captureFrame();
            if (frame) {
                onFrame(frame);
            }
        }, 5000); // Every 5 seconds

        return () => clearInterval(interval);
    }, [isActive, onFrame, captureFrame]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopWebcam();
        };
    }, [stopWebcam]);

    return (
        <div className={`relative bg-slate-900 rounded-xl overflow-hidden ${className}`}>
            {/* Video element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isMuted}
                className={`w-full h-full object-cover ${isActive ? "block" : "hidden"}`}
            />

            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Placeholder when inactive */}
            {!isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    {error ? (
                        <>
                            <CameraOff className="w-16 h-16 text-red-500 mb-4" />
                            <p className="text-red-400 text-sm text-center px-4">{error}</p>
                            <button
                                onClick={startWebcam}
                                className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Coba Lagi
                            </button>
                        </>
                    ) : (
                        <>
                            <Camera className="w-16 h-16 text-slate-500 mb-4" />
                            <p className="text-slate-400 text-sm">Kamera tidak aktif</p>
                            <button
                                onClick={startWebcam}
                                className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                                Aktifkan Webcam
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Overlay info */}
            {isActive && (
                <>
                    {/* Top header */}
                    <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start bg-gradient-to-b from-black/70 to-transparent">
                        <div>
                            <h4 className="text-white font-bold text-sm">TITIK A - WEBCAM</h4>
                            <p className="text-white/70 text-xs">Live Stream</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold uppercase animate-pulse">
                            LIVE
                        </span>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end bg-gradient-to-t from-black/70 to-transparent">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-white/80 text-xs font-mono">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                REC
                            </span>
                            <span className="text-white/60 text-xs font-mono">{fps} FPS</span>
                            <span className="text-white/60 text-xs font-mono">
                                {resolution.width}x{resolution.height}
                            </span>
                        </div>
                        <span className="text-white/50 text-xs font-mono">
                            {new Date().toLocaleTimeString("id-ID")}
                        </span>
                    </div>
                </>
            )}

            {/* Controls */}
            {showControls && isActive && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                        onClick={stopWebcam}
                        className="p-3 bg-red-500/80 hover:bg-red-500 rounded-full transition-all shadow-lg"
                        title="Stop Webcam"
                    >
                        <CameraOff className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-3 bg-white/25 hover:bg-white/40 rounded-full transition-all"
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? (
                            <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                            <Volume2 className="w-5 h-5 text-white" />
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
