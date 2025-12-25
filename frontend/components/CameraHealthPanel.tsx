'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff, Clock, Gauge, AlertTriangle } from 'lucide-react';
import { api, Camera } from '@/services/api';

interface CameraHealthPanelProps {
    cameras: Camera[];
    onReconnect: (id: number) => void;
    loading?: boolean;
}

const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
        online: 'bg-green-500',
        offline: 'bg-red-500',
        reconnecting: 'bg-yellow-500',
        error: 'bg-orange-500',
    };

    const icons = {
        online: <Wifi className="w-3 h-3" />,
        offline: <WifiOff className="w-3 h-3" />,
        reconnecting: <RefreshCw className="w-3 h-3 animate-spin" />,
        error: <AlertTriangle className="w-3 h-3" />,
    };

    const color = colors[status as keyof typeof colors] || 'bg-gray-500';
    const icon = icons[status as keyof typeof icons] || null;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${color}`}>
            {icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

export default function CameraHealthPanel({ cameras, onReconnect, loading }: CameraHealthPanelProps) {
    const [reconnecting, setReconnecting] = useState<number | null>(null);

    const handleReconnect = async (id: number) => {
        setReconnecting(id);
        await onReconnect(id);
        setTimeout(() => setReconnecting(null), 3000);
    };

    const formatLastSeen = (lastSeen?: string) => {
        if (!lastSeen) return 'Never';
        const date = new Date(lastSeen);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString('id-ID');
    };

    const onlineCount = cameras.filter(c => c.status === 'online').length;
    const offlineCount = cameras.filter(c => c.status === 'offline').length;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Camera Health Monitor</h3>
                <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {onlineCount} Online
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {offlineCount} Offline
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="text-left py-3 px-4 font-medium">Camera</th>
                            <th className="text-left py-3 px-4 font-medium">Location</th>
                            <th className="text-center py-3 px-4 font-medium">Status</th>
                            <th className="text-center py-3 px-4 font-medium">Last Seen</th>
                            <th className="text-center py-3 px-4 font-medium">FPS</th>
                            <th className="text-center py-3 px-4 font-medium">Latency</th>
                            <th className="text-center py-3 px-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-500">
                                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                                    Loading cameras...
                                </td>
                            </tr>
                        ) : cameras.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-500">
                                    No cameras configured
                                </td>
                            </tr>
                        ) : (
                            cameras.map((camera) => (
                                <tr key={camera.ID} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-gray-800">{camera.name}</div>
                                        {camera.last_error && (
                                            <div className="text-xs text-red-500 mt-1">{camera.last_error}</div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{camera.location}</td>
                                    <td className="py-3 px-4 text-center">
                                        <StatusBadge status={reconnecting === camera.ID ? 'reconnecting' : camera.status} />
                                    </td>
                                    <td className="py-3 px-4 text-center text-gray-600">
                                        <div className="flex items-center justify-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatLastSeen(camera.last_seen)}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center font-mono text-gray-700">
                                        {camera.fps || '-'} fps
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Gauge className="w-3 h-3 text-gray-400" />
                                            <span className={camera.latency && camera.latency > 200 ? 'text-orange-500' : 'text-gray-700'}>
                                                {camera.latency || '-'} ms
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => handleReconnect(camera.ID)}
                                            disabled={reconnecting === camera.ID}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 mx-auto
                        ${reconnecting === camera.ID
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                }`}
                                        >
                                            <RefreshCw className={`w-3 h-3 ${reconnecting === camera.ID ? 'animate-spin' : ''}`} />
                                            {reconnecting === camera.ID ? 'Reconnecting...' : 'Reconnect'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
