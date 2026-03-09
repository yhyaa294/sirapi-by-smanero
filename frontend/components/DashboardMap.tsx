"use client";

import { useEffect, useState, useMemo, memo, useCallback } from "react";

import { Video, AlertTriangle, Wifi, Ghost, Plus, MousePointerClick, Grid, RefreshCw } from "lucide-react";
import Link from "next/link";
import { api, Camera } from "@/services/api";

// Leaflet CSS must be imported
import "leaflet/dist/leaflet.css";

// Types for CCTV data (Map specific props)
interface CCTVData {
    id: string; // "CAM-01" etc.
    dbId: number; // Real DB ID
    name: string;
    position: [number, number]; // [latitude, longitude]
    angle: number; // Direction in degrees (0-360, 0 = North)
    fovAngle: number; // Field of view angle width in degrees
    fovRange: number; // Range in meters
    status: "online" | "offline" | "alert";
    zone: string;
    detections: number;
}

// Default center (Mojoagung)
const DEFAULT_CENTER: [number, number] = [-7.5595, 112.4353];

/**
 * Helper function to calculate V-shaped FOV polygon coordinates
 */
function calculateFOVPolygon(
    center: [number, number],
    angle: number,
    fovAngle: number,
    range: number,
    segments: number = 20
): [number, number][] {
    const points: [number, number][] = [];
    points.push(center);
    const rangeDegrees = range / 111320;
    const startAngle = angle - fovAngle / 2;
    const endAngle = angle + fovAngle / 2;

    for (let i = 0; i <= segments; i++) {
        const currentAngle = startAngle + (endAngle - startAngle) * (i / segments);
        const radians = ((90 - currentAngle) * Math.PI) / 180;
        const lat = center[0] + rangeDegrees * Math.sin(radians);
        const lng = center[1] + rangeDegrees * Math.cos(radians) / Math.cos((center[0] * Math.PI) / 180);
        points.push([lat, lng]);
    }
    points.push(center);
    return points;
}

// Get FOV color based on status
function getFOVColor(status: string): { fill: string; stroke: string } {
    switch (status) {
        case "alert":
            return { fill: "rgba(239, 68, 68, 0.25)", stroke: "rgba(239, 68, 68, 0.7)" };
        case "offline":
            return { fill: "rgba(148, 163, 184, 0.15)", stroke: "rgba(148, 163, 184, 0.5)" };
        default:
            return { fill: "rgba(16, 185, 129, 0.2)", stroke: "rgba(16, 185, 129, 0.6)" };
    }
}

// The Map component - Memoized to prevent unnecessary re-renders
const MapComponentInner = memo(function MapComponentInner() {
    const [selectedCCTV, setSelectedCCTV] = useState<string | null>(null);
    const [cctvCameras, setCctvCameras] = useState<CCTVData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingCamera, setIsAddingCamera] = useState(false);
    const [L, setL] = useState<typeof import("leaflet") | null>(null);
    const [ReactLeaflet, setReactLeaflet] = useState<typeof import("react-leaflet") | null>(null);

    // Initialize Leaflet
    useEffect(() => {
        Promise.all([
            import("leaflet"),
            import("react-leaflet")
        ]).then(([leaflet, reactLeaflet]) => {
            setL(leaflet.default);
            setReactLeaflet(reactLeaflet);
        });
    }, []);

    // Fetch Cameras on mount
    const fetchCameras = useCallback(async () => {
        setIsLoading(true);
        try {
            const apiCameras = await api.getCameras();

            // Map Backend Camera -> Map CCTVData
            const mappedCameras: CCTVData[] = apiCameras.map((cam, index) => {
                let position: [number, number];

                if (cam.latitude && cam.longitude && cam.latitude !== 0 && cam.longitude !== 0) {
                    position = [cam.latitude, cam.longitude];
                } else {
                    // Fallback: Create a circular layout around center
                    const offsetLat = 0.0015 * Math.cos((index * 2 * Math.PI) / (apiCameras.length || 1));
                    const offsetLng = 0.0015 * Math.sin((index * 2 * Math.PI) / (apiCameras.length || 1));
                    position = [DEFAULT_CENTER[0] + offsetLat, DEFAULT_CENTER[1] + offsetLng];
                }

                return {
                    id: `CAM-${String(cam.ID).padStart(2, '0')}`,
                    dbId: cam.ID,
                    name: cam.name,
                    position: position,
                    angle: (index * 360 / (apiCameras.length || 1)) + 180, // Face inward
                    fovAngle: 60,
                    fovRange: 80,
                    status: cam.is_active ? "online" : "offline",
                    zone: cam.location,
                    detections: 0
                };
            });

            // If empty, use mock? No, show empty state or single default
            setCctvCameras(mappedCameras.length > 0 ? mappedCameras : []);
        } catch (e) {
            console.error("Failed to load map cameras", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCameras();
    }, [fetchCameras]);

    // Memoize map center
    const mapCenter = useMemo<[number, number]>(() => {
        if (cctvCameras.length === 0) return DEFAULT_CENTER;
        return [
            cctvCameras.reduce((sum, c) => sum + c.position[0], 0) / cctvCameras.length,
            cctvCameras.reduce((sum, c) => sum + c.position[1], 0) / cctvCameras.length,
        ];
    }, [cctvCameras]);

    // Memoize FOV polygons
    const fovPolygonsData = useMemo(() => cctvCameras.map(cctv => ({
        ...cctv,
        fovPoints: calculateFOVPolygon(
            cctv.position,
            cctv.angle,
            cctv.fovAngle,
            cctv.fovRange,
            12
        ),
        colors: getFOVColor(cctv.status)
    })), [cctvCameras]);

    // Camera icon creator
    const createCameraIcon = useCallback((status: string, leaflet: typeof import("leaflet") | null) => {
        if (!leaflet) return null;
        const color = status === "alert" ? "#EF4444" : status === "offline" ? "#94A3B8" : "#10B981";
        const pulseClass = status !== "offline" ? "animate-pulse" : "";

        return leaflet.divIcon({
            className: "custom-camera-marker",
            html: `
                <div class="relative">
                  <div class="absolute -inset-2 rounded-full ${pulseClass}" style="background: ${color}33; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                  <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style="background: ${color};">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                      <circle cx="12" cy="13" r="3"/>
                    </svg>
                  </div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -20],
        });
    }, []);

    if (!L || !ReactLeaflet) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Memuat peta...</p>
                </div>
            </div>
        );
    }

    const { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } = ReactLeaflet;

    // Map click handler component
    const MapClickHandler = () => {
        useMapEvents({
            async click(e) {
                if (isAddingCamera) {
                    // Create new camera via API
                    if (confirm("Tambah kamera di lokasi ini?")) {
                        const success = await api.createCamera({
                            name: `Camera ${cctvCameras.length + 1}`,
                            location: "New Zone",
                            status: "offline",
                            resolution: "1920x1080",
                            latitude: e.latlng.lat,
                            longitude: e.latlng.lng,
                        });

                        if (success) {
                            fetchCameras(); // Refresh to show new cam
                            setIsAddingCamera(false);
                        } else {
                            alert("Gagal membuat kamera");
                        }
                    }
                }
            },
        });
        return null;
    };

    return (
        <div className="relative h-full w-full rounded-xl overflow-hidden shadow-2xl border border-slate-700">
            {/* Map Controls & Title Overlay */}
            <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 rounded-lg">
                        <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Peta Fasilitas Real-Time</h3>
                        <p className="text-slate-400 text-xs">Mojoagung Plant - Satellite View</p>
                    </div>
                    {isLoading && <RefreshCw className="w-4 h-4 text-slate-400 animate-spin ml-2" />}
                </div>
            </div>

            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <button
                    onClick={() => setIsAddingCamera(!isAddingCamera)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold shadow-lg transition-all ${isAddingCamera
                        ? "bg-orange-500 text-white animate-pulse"
                        : "bg-white text-slate-900 hover:bg-slate-100"
                        } `}
                >
                    {isAddingCamera ? (
                        <>
                            <MousePointerClick className="w-4 h-4" />
                            Klik Peta...
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4" />
                            Tambah Kamera
                        </>
                    )}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/90 text-white rounded-lg hover:bg-slate-700 font-medium shadow-lg backdrop-blur-sm transition-all border border-slate-600">
                    <Grid className="w-4 h-4" />
                    Atur Layout
                </button>
            </div>

            {isAddingCamera && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-orange-500 text-white px-6 py-2 rounded-full shadow-xl font-bold animate-bounce text-sm">
                    Klik lokasi pada peta untuk menempatkan kamera baru
                </div>
            )}

            <MapContainer
                center={mapCenter}
                zoom={17}
                scrollWheelZoom={false}
                className="h-full w-full bg-slate-900"
            >
                <MapClickHandler />

                {/* Satellite Tile Layer */}
                <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />

                {/* Render FOV Polygons */}
                {fovPolygonsData.map((fovData) => {
                    const isSelected = selectedCCTV === fovData.id;
                    return (
                        <Polygon
                            key={`fov-${fovData.id}`}
                            positions={fovData.fovPoints}
                            pathOptions={{
                                fillColor: fovData.colors.fill,
                                fillOpacity: isSelected ? 0.4 : 0.15,
                                color: fovData.colors.stroke,
                                weight: isSelected ? 2 : 1,
                                dashArray: fovData.status === "offline" ? "5, 5" : undefined,
                            }}
                            interactive={isSelected}
                            eventHandlers={{
                                click: () => setSelectedCCTV(isSelected ? null : fovData.id),
                            }}
                        />
                    );
                })}

                {/* Render Camera Markers */}
                {cctvCameras.map((cctv) => {
                    const isSelected = selectedCCTV === cctv.id;
                    return (
                        <Marker
                            key={`marker-${cctv.id}`}
                            position={cctv.position}
                            icon={createCameraIcon(cctv.status, L) || undefined}
                            eventHandlers={{
                                click: () => setSelectedCCTV(isSelected ? null : cctv.id),
                            }}
                        >
                            <Popup className="custom-popup">
                                <div className="min-w-[200px] p-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100">
                                            <Video size={16} className="text-slate-900" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{cctv.id}</p>
                                            <p className="text-xs text-slate-500">{cctv.name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-slate-50 p-1.5 rounded text-center">
                                            <div className="text-[10px] text-slate-400 uppercase">Status</div>
                                            <div className={`text-xs font-bold ${cctv.status === 'online' ? 'text-emerald-600' : cctv.status === 'alert' ? 'text-red-600' : 'text-slate-500'} `}>
                                                {cctv.status.toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-1.5 rounded text-center">
                                            <div className="text-[10px] text-slate-400 uppercase">Zone</div>
                                            <div className="text-xs font-bold text-slate-700 truncate">{cctv.zone.split('-')[1] || cctv.zone}</div>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/dashboard/monitor/${cctv.dbId}`} // Link uses backend ID
                                        className="block w-full text-center py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                                    >
                                        LIHAT LIVE STREAM
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
});

// Memoized main component
export default function DashboardMap() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-900 rounded-xl">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Memuat peta interaktif...</p>
                </div>
            </div>
        );
    }

    return <MapComponentInner />;
}

// Export CCTV data type
export type { CCTVData };
