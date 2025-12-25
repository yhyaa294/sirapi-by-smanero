'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle, XCircle, Clock, AlertTriangle, Image,
    ChevronLeft, ChevronRight, User, RefreshCw, Filter,
    Search, Keyboard
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface Detection {
    ID: number;
    camera_id: number;
    violation_type: string;
    confidence: number;
    image_path: string;
    location: string;
    detected_at: string;
    is_violation: boolean;
    review_status: string;
    priority: number;
    assigned_to?: number;
    review_notes: string;
}

const priorityColors: Record<number, string> = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-blue-500',
    5: 'bg-gray-400',
};

const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    in_review: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

export default function ReviewQueuePage() {
    const [detections, setDetections] = useState<Detection[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [filter, setFilter] = useState({ status: 'pending', priority: '' });
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const fetchQueue = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                status: filter.status,
                limit: String(limit),
                offset: String(page * limit),
            });
            if (filter.priority) params.set('priority', filter.priority);

            const res = await fetch(`${API_BASE}/review-queue?${params}`);
            const data = await res.json();
            if (data.success) {
                setDetections(data.data || []);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch queue:', error);
        }
        setLoading(false);
    }, [filter, page]);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showDetail) return;

            const currentIndex = detections.findIndex(d => d.ID === selectedId);

            switch (e.key) {
                case 'j':
                    if (currentIndex < detections.length - 1) {
                        setSelectedId(detections[currentIndex + 1].ID);
                    }
                    break;
                case 'k':
                    if (currentIndex > 0) {
                        setSelectedId(detections[currentIndex - 1].ID);
                    }
                    break;
                case 'Enter':
                case ' ':
                    if (selectedId) {
                        setShowDetail(true);
                    }
                    e.preventDefault();
                    break;
                case 'a':
                    if (selectedId) handleAction(selectedId, 'accept');
                    break;
                case 'r':
                    if (selectedId && !e.ctrlKey) handleAction(selectedId, 'reject');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [detections, selectedId, showDetail]);

    const handleAction = async (id: number, action: string, notes = '') => {
        try {
            await fetch(`${API_BASE}/review-queue/${id}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, notes }),
            });
            fetchQueue();
        } catch (error) {
            console.error('Action failed:', error);
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selected.size === 0) return;
        try {
            await fetch(`${API_BASE}/review-queue/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selected), action }),
            });
            setSelected(new Set());
            fetchQueue();
        } catch (error) {
            console.error('Bulk action failed:', error);
        }
    };

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const selectAll = () => {
        if (selected.size === detections.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(detections.map(d => d.ID)));
        }
    };

    const selectedDetection = detections.find(d => d.ID === selectedId);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
                    <p className="text-gray-500">Verifikasi deteksi AI</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchQueue}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                        <Keyboard className="w-4 h-4" />
                        J/K: Navigate, A: Accept, R: Reject
                    </div>
                </div>
            </div>

            {/* Filters & Bulk Actions */}
            <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="pending">Pending</option>
                            <option value="in_review">In Review</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                    <select
                        value={filter.priority}
                        onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">All Priorities</option>
                        <option value="1">🔴 Critical</option>
                        <option value="2">🟠 High</option>
                        <option value="3">🟡 Medium</option>
                        <option value="4">🔵 Low</option>
                        <option value="5">⚪ Lowest</option>
                    </select>
                    <span className="text-sm text-gray-500">{total} items</span>
                </div>

                {selected.size > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{selected.size} selected</span>
                        <button
                            onClick={() => handleBulkAction('accept')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Accept All
                        </button>
                        <button
                            onClick={() => handleBulkAction('reject')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                        >
                            <XCircle className="w-4 h-4" />
                            Reject All
                        </button>
                    </div>
                )}
            </div>

            {/* Queue List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-10 px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={selected.size === detections.length && detections.length > 0}
                                    onChange={selectAll}
                                    className="rounded"
                                />
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Thumbnail</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Detection</th>
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Priority</th>
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Time</th>
                            <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-gray-500">
                                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                                    Loading...
                                </td>
                            </tr>
                        ) : detections.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-gray-500">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                    Queue is empty!
                                </td>
                            </tr>
                        ) : (
                            detections.map((d) => (
                                <tr
                                    key={d.ID}
                                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedId === d.ID ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => setSelectedId(d.ID)}
                                    onDoubleClick={() => setShowDetail(true)}
                                >
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selected.has(d.ID)}
                                            onChange={() => toggleSelect(d.ID)}
                                            className="rounded"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                                            {d.image_path ? (
                                                <img
                                                    src={`http://localhost:8000${d.image_path}`}
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
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{d.violation_type}</div>
                                        <div className="text-sm text-gray-500">
                                            Camera {d.camera_id} • {(d.confidence * 100).toFixed(0)}% confidence
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block w-3 h-3 rounded-full ${priorityColors[d.priority]}`} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[d.review_status]}`}>
                                            {d.review_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {new Date(d.detected_at).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAction(d.ID, 'accept'); }}
                                                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                                                title="Accept"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAction(d.ID, 'reject'); }}
                                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                                title="Reject"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {total > limit && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-600">
                            Page {page + 1} of {Math.ceil(total / limit)}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2 border rounded-lg disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={(page + 1) * limit >= total}
                                className="p-2 border rounded-lg disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetail && selectedDetection && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetail(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl m-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Detection Detail</h2>

                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                                {selectedDetection.image_path ? (
                                    <img
                                        src={`http://localhost:8000${selectedDetection.image_path}`}
                                        alt="Detection"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Image className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-sm text-gray-500">Violation Type</span>
                                    <p className="font-medium">{selectedDetection.violation_type}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Confidence</span>
                                    <p className="font-medium">{(selectedDetection.confidence * 100).toFixed(1)}%</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Location</span>
                                    <p className="font-medium">{selectedDetection.location || 'Unknown'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Time</span>
                                    <p className="font-medium">{new Date(selectedDetection.detected_at).toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { handleAction(selectedDetection.ID, 'accept'); setShowDetail(false); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Accept (A)
                                </button>
                                <button
                                    onClick={() => { handleAction(selectedDetection.ID, 'reject'); setShowDetail(false); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Reject (R)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
