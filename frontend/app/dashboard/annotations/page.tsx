'use client';

import { useState, useEffect } from 'react';
import {
    Download, RefreshCw, CheckCircle, XCircle, HelpCircle,
    FileSpreadsheet, Filter, Image, Tag, Clock, User
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface AnnotationItem {
    id: number;
    detection_id: number;
    image_path: string;
    label: string;
    status: string;
    notes: string;
    assigned_to?: number;
    created_at: string;
    exported_at?: string;
}

interface Stats {
    by_status: { pending: number; labeled: number; exported: number };
    by_label: { tp: number; fp: number; uncertain: number };
    total: number;
}

const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    labeled: 'bg-blue-100 text-blue-700',
    exported: 'bg-green-100 text-green-700',
};

const labelColors: Record<string, string> = {
    tp: 'bg-green-500 text-white',
    fp: 'bg-red-500 text-white',
    uncertain: 'bg-yellow-500 text-white',
};

const labelIcons: Record<string, React.ReactNode> = {
    tp: <CheckCircle className="w-4 h-4" />,
    fp: <XCircle className="w-4 h-4" />,
    uncertain: <HelpCircle className="w-4 h-4" />,
};

export default function AnnotationsPage() {
    const [items, setItems] = useState<AnnotationItem[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [filter, setFilter] = useState({ status: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter.status) params.set('status', filter.status);
            params.set('limit', '100');

            const [backlogRes, statsRes] = await Promise.all([
                fetch(`${API_BASE}/annotations/backlog?${params}`),
                fetch(`${API_BASE}/annotations/stats`)
            ]);

            if (backlogRes.ok) {
                const data = await backlogRes.json();
                setItems(data.data || []);
            }
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch annotations:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [filter]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await fetch(`${API_BASE}/annotations/export`, { method: 'POST' });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `annotations_${Date.now()}.zip`;
                a.click();
                window.URL.revokeObjectURL(url);
                fetchData();
            } else {
                alert('No labeled items to export');
            }
        } catch (error) {
            console.error('Export failed:', error);
        }
        setExporting(false);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Annotation Backlog</h1>
                    <p className="text-gray-500">Manage ML training samples from operator feedback</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting || !stats?.by_status.labeled}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
                        Export ({stats?.by_status.labeled || 0} items)
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats?.total || 0}</div>
                    <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-gray-700">{stats?.by_status.pending || 0}</div>
                    <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                    <div className="text-2xl font-bold text-blue-700">{stats?.by_status.labeled || 0}</div>
                    <div className="text-sm text-blue-500">Labeled</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-700">{stats?.by_label.tp || 0}</div>
                    <div className="text-sm text-green-500">True Positive</div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-center">
                    <div className="text-2xl font-bold text-red-700">{stats?.by_label.fp || 0}</div>
                    <div className="text-sm text-red-500">False Positive</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
                    <div className="text-2xl font-bold text-yellow-700">{stats?.by_label.uncertain || 0}</div>
                    <div className="text-sm text-yellow-500">Uncertain</div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded-xl border border-gray-200">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="labeled">Labeled</option>
                    <option value="exported">Exported</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Image</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Detection ID</th>
                            <th className="text-center px-4 py-3 font-medium text-gray-600">Label</th>
                            <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Notes</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-500">
                                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                                    Loading...
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-500">
                                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    No annotations yet. Label detections in the Review Queue.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                                            {item.image_path ? (
                                                <img
                                                    src={`http://localhost:8000${item.image_path}`}
                                                    alt="Detection"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Image className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-gray-700">#{item.detection_id}</td>
                                    <td className="px-4 py-3 text-center">
                                        {item.label ? (
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${labelColors[item.label]}`}>
                                                {labelIcons[item.label]}
                                                {item.label.toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{item.notes || '-'}</td>
                                    <td className="px-4 py-3 text-gray-500 text-sm">
                                        {new Date(item.created_at).toLocaleDateString('id-ID')}
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
