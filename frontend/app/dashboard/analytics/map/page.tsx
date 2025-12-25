"use client";

import MapHeatmap from "@/components/MapHeatmap";
import dynamic from 'next/dynamic';

const MapHeatmapDynamic = dynamic(() => import('@/components/MapHeatmap'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center">Loading Map...</div>
});

export default function AnalyticsMapPage() {
    return (
        <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Geospatial Analytics</h1>
                    <p className="text-slate-500">Vizualisasi heatmap pelanggaran berdasarkan lokasi kamera.</p>
                </div>
                <div className="flex gap-2">
                    {/* Time filters could go here */}
                    <select className="px-4 py-2 bg-white border rounded-lg text-sm shadow-sm">
                        <option>Last 24 Hours</option>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[500px]">
                <MapHeatmapDynamic />
            </div>
        </div>
    );
}
