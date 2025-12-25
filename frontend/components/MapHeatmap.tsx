"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Leaflet icon fix
const fixLeafletIcon = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

interface HeatPoint {
    lat: number;
    lng: number;
    intensity: number;
    location: string;
}

export default function MapHeatmap() {
    const [points, setPoints] = useState<HeatPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fixLeafletIcon();

        // Fetch heatmap data
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/v1/analytics/heatmap');
                const data = await res.json();
                if (data.success) setPoints(data.data || []);
            } catch (e) {
                console.error("Failed to load map data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Center map
    const defaultCenter: [number, number] = [-7.5595, 112.4353];
    const center = points.length > 0 ? [points[0].lat, points[0].lng] as [number, number] : defaultCenter;

    // Calculate max intensity for color scale
    const maxIntensity = Math.max(...points.map(p => p.intensity), 1);

    const getColor = (intensity: number) => {
        const ratio = intensity / maxIntensity;
        if (ratio > 0.8) return '#ef4444'; // Red
        if (ratio > 0.5) return '#f97316'; // Orange
        return '#22c55e'; // Green
    };

    const getRadius = (intensity: number) => {
        // Base size 10, scale up to 30
        return 10 + (intensity / maxIntensity) * 20;
    };

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative z-0">
            <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Heatmap Points (Simulated with Circles) */}
                {points.map((p, idx) => (
                    p.lat && p.lng ? (
                        <Circle
                            key={idx}
                            center={[p.lat, p.lng]}
                            pathOptions={{
                                fillColor: getColor(p.intensity),
                                color: getColor(p.intensity),
                                fillOpacity: 0.6,
                                weight: 1 // No border
                            }}
                            radius={getRadius(p.intensity) * 2} // Size in meters? CircleMarker uses pixels
                        >
                            <Popup>
                                <div className="text-center">
                                    <h4 className="font-bold">{p.location}</h4>
                                    <div className="text-xl font-mono font-bold text-orange-600">{p.intensity}</div>
                                    <div className="text-xs text-slate-500">Violations</div>
                                </div>
                            </Popup>
                        </Circle>
                    ) : null
                ))}
            </MapContainer>

            {/* Legend overlay */}
            <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 p-4 rounded-xl shadow-lg backdrop-blur text-xs">
                <h4 className="font-bold mb-2">Heatmap Intensity</h4>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span> High Risk
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span> Medium Risk
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span> Low Risk
                </div>
            </div>
        </div>
    );
}
