"use client";

import { useEffect, useState, useMemo, memo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Camera, AlertTriangle, Shield, Video, MapPin } from "lucide-react";

// Leaflet CSS must be imported
import "leaflet/dist/leaflet.css";

// Types for CCTV data
interface CCTVData {
    id: string;
    name: string;
    position: [number, number]; // [latitude, longitude]
    angle: number; // Direction in degrees (0-360, 0 = North)
    fovAngle: number; // Field of view angle width in degrees
    fovRange: number; // Range in meters
    status: "online" | "offline" | "alert";
    zone: string;
    detections: number;
}

// CCTV Data - 4 cameras spread across a simulated industrial area
// Using Jombang, East Java coordinates as reference (around SMAN Ngoro area)
const cctvData: CCTVData[] = [
    {
        id: "CAM-01",
        name: "Kamera Gudang Utama",
        position: [-7.5685, 112.4125],
        angle: 135, // Facing Southeast
        fovAngle: 60,
        fovRange: 80,
        status: "online",
        zone: "Zona A - Gudang",
        detections: 45,
    },
    {
        id: "CAM-02",
        name: "Kamera Area Assembly",
        position: [-7.5668, 112.4148],
        angle: 225, // Facing Southwest
        fovAngle: 75,
        fovRange: 100,
        status: "alert",
        zone: "Zona B - Assembly",
        detections: 128,
    },
    {
        id: "CAM-03",
        name: "Kamera Welding Bay",
        position: [-7.5702, 112.4112],
        angle: 45, // Facing Northeast
        fovAngle: 55,
        fovRange: 70,
        status: "online",
        zone: "Zona C - Welding",
        detections: 67,
    },
    {
        id: "CAM-04",
        name: "Kamera Loading Dock",
        position: [-7.5695, 112.4165],
        angle: 315, // Facing Northwest
        fovAngle: 90,
        fovRange: 120,
        status: "online",
        zone: "Zona D - Loading Dock",
        detections: 89,
    },
];

/**
 * Helper function to calculate V-shaped FOV polygon coordinates
 * @param center - Center point [lat, lng]
 * @param angle - Direction angle in degrees (0 = North, clockwise)
 * @param fovAngle - Field of view width in degrees
 * @param range - Range in meters
 * @param segments - Number of arc segments for smooth curve
 */
function calculateFOVPolygon(
    center: [number, number],
    angle: number,
    fovAngle: number,
    range: number,
    segments: number = 20
): [number, number][] {
    const points: [number, number][] = [];

    // Start from center point
    points.push(center);

    // Convert range from meters to approximate degrees
    // 1 degree ≈ 111,320 meters at equator
    const rangeDegrees = range / 111320;

    // Calculate start and end angles
    const startAngle = angle - fovAngle / 2;
    const endAngle = angle + fovAngle / 2;

    // Generate arc points
    for (let i = 0; i <= segments; i++) {
        const currentAngle = startAngle + (endAngle - startAngle) * (i / segments);
        // Convert to radians and adjust for map coordinates (0 = North in our case)
        const radians = ((90 - currentAngle) * Math.PI) / 180;

        const lat = center[0] + rangeDegrees * Math.sin(radians);
        const lng = center[1] + rangeDegrees * Math.cos(radians) / Math.cos((center[0] * Math.PI) / 180);

        points.push([lat, lng]);
    }

    // Close the polygon back to center
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
    const [L, setL] = useState<typeof import("leaflet") | null>(null);
    const [ReactLeaflet, setReactLeaflet] = useState<typeof import("react-leaflet") | null>(null);

    useEffect(() => {
        // Dynamic import of leaflet modules
        Promise.all([
            import("leaflet"),
            import("react-leaflet")
        ]).then(([leaflet, reactLeaflet]) => {
            setL(leaflet.default);
            setReactLeaflet(reactLeaflet);
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

    const { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip } = ReactLeaflet;

    // Memoize camera icon creator to prevent recreation on every render
    const createCameraIcon = useCallback((status: string) => {
        const color = status === "alert" ? "#EF4444" : status === "offline" ? "#94A3B8" : "#10B981";
        const pulseClass = status !== "offline" ? "animate-pulse" : "";

        return L.divIcon({
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
    }, [L]);

    // Memoize map center calculation - only calculate once
    const mapCenter = useMemo<[number, number]>(() => [
        cctvData.reduce((sum, c) => sum + c.position[0], 0) / cctvData.length,
        cctvData.reduce((sum, c) => sum + c.position[1], 0) / cctvData.length,
    ], []);

    // Memoize FOV polygons data to prevent recalculation on every render
    const fovPolygonsData = useMemo(() => cctvData.map(cctv => ({
        ...cctv,
        fovPoints: calculateFOVPolygon(
            cctv.position,
            cctv.angle,
            cctv.fovAngle,
            cctv.fovRange,
            12 // Reduced segments for better performance
        ),
        colors: getFOVColor(cctv.status)
    })), []);

    return (
        <MapContainer
            center={mapCenter}
            zoom={17}
            className="h-full w-full rounded-xl"
            style={{ background: "#0f172a" }}
        >
            {/* Dark Theme Tile Layer - CartoDB Dark Matter */}
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Render FOV Polygons for each camera - Optimized */}
            {fovPolygonsData.map((fovData) => {
                const isSelected = selectedCCTV === fovData.id;

                return (
                    <Polygon
                        key={`fov-${fovData.id}`}
                        positions={fovData.fovPoints}
                        pathOptions={{
                            fillColor: fovData.colors.fill,
                            fillOpacity: isSelected ? 0.5 : 0.25,
                            color: fovData.colors.stroke,
                            weight: isSelected ? 2 : 1,
                            dashArray: fovData.status === "offline" ? "5, 5" : undefined,
                        }}
                        interactive={isSelected} // Only interactive when selected - performance boost
                        eventHandlers={{
                            click: () => setSelectedCCTV(isSelected ? null : fovData.id),
                        }}
                    >
                        {isSelected && (
                            <Tooltip sticky>
                                <div className="text-xs">
                                    <strong>{fovData.id}</strong> - {fovData.zone}
                                </div>
                            </Tooltip>
                        )}
                    </Polygon>
                );
            })}

            {/* Render Camera Markers */}
            {cctvData.map((cctv) => {
                const isSelected = selectedCCTV === cctv.id;

                return (
                    <Marker
                        key={`marker-${cctv.id}`}
                        position={cctv.position}
                        icon={createCameraIcon(cctv.status)}
                        eventHandlers={{
                            click: () => setSelectedCCTV(isSelected ? null : cctv.id),
                        }}
                    >
                        <Popup>
                            <div className="min-w-[200px] p-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{
                                            backgroundColor:
                                                cctv.status === "alert"
                                                    ? "#EF4444"
                                                    : cctv.status === "offline"
                                                        ? "#94A3B8"
                                                        : "#10B981",
                                        }}
                                    >
                                        <Camera size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{cctv.id}</p>
                                        <p className="text-xs text-slate-500">{cctv.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Status:</span>
                                        <span
                                            className={`font-medium ${cctv.status === "online"
                                                ? "text-emerald-600"
                                                : cctv.status === "alert"
                                                    ? "text-red-600"
                                                    : "text-slate-500"
                                                }`}
                                        >
                                            {cctv.status === "online"
                                                ? "Online"
                                                : cctv.status === "alert"
                                                    ? "Alert Aktif"
                                                    : "Offline"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Zona:</span>
                                        <span className="font-medium text-slate-700">{cctv.zone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Deteksi Hari Ini:</span>
                                        <span className="font-medium text-orange-600">{cctv.detections}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">FOV:</span>
                                        <span className="font-medium text-slate-700">{cctv.fovAngle}° / {cctv.fovRange}m</span>
                                    </div>
                                </div>
                                {cctv.status === "alert" && (
                                    <div className="mt-2 p-2 bg-red-50 rounded border border-red-200 flex items-center gap-2">
                                        <AlertTriangle size={12} className="text-red-500" />
                                        <span className="text-[10px] text-red-700 font-medium">
                                            Pelanggaran APD Terdeteksi!
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
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

// Export CCTV data for use in parent components
export { cctvData };
export type { CCTVData };
