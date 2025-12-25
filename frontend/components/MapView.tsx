"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera } from '@/services/api';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix Leaflet icons
const fixLeafletIcon = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

interface MapViewProps {
    cameras: Camera[];
}

export default function MapView({ cameras }: MapViewProps) {
    useEffect(() => {
        fixLeafletIcon();
    }, []);

    // Default center (East Java - Mojokerto area as example based on previous context or default)
    // -7.5595, 112.4353
    const defaultCenter: [number, number] = [-7.5595, 112.4353];
    const center = cameras.length > 0 && cameras[0].latitude && cameras[0].longitude
        ? [cameras[0].latitude, cameras[0].longitude] as [number, number]
        : defaultCenter;

    return (
        <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-lg relative z-0">
            <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {cameras.map((cam) => (
                    cam.latitude && cam.longitude ? (
                        <Marker key={cam.ID} position={[cam.latitude, cam.longitude]}>
                            <Popup>
                                <div className="min-w-[150px]">
                                    <h3 className="font-bold text-sm text-slate-900">{cam.name}</h3>
                                    <p className="text-xs text-slate-500 mb-2">{cam.location}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cam.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {cam.is_active ? 'ONLINE' : 'OFFLINE'}
                                        </span>
                                        {cam.fps && <span className="text-[10px] text-slate-400 font-mono">{cam.fps} FPS</span>}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    );
}
