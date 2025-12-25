"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface Alert {
    ID: number;
    Severity: string;
    Message: string;
    Status: string;
    CreatedAt: string;
}

export default function NotificationPanel() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchAlerts = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/v1/alerts?status=pending&limit=5');
            const data = await res.json();
            if (data.success) {
                setAlerts(data.data);
                setUnreadCount(data.data.length); // Simplification: pending = unread
            }
        } catch (err) {
            console.error("Failed to fetch alerts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAcknowledge = async (id: number) => {
        try {
            await fetch(`http://localhost:8080/api/v1/alerts/${id}/acknowledge?user=admin`, { method: 'PUT' });
            // Optimistic update
            setAlerts(prev => prev.filter(a => a.ID !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to ack alert:", err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center border-2 border-white animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loading && <div className="p-4 text-center text-slate-400 text-xs">Loading...</div>}
                        {!loading && alerts.length === 0 && (
                            <div className="p-8 text-center text-slate-400">
                                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No pending alerts</p>
                            </div>
                        )}

                        {alerts.map(alert => (
                            <div key={alert.ID} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group relative">
                                <div className="flex gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${alert.Severity === 'critical' ? 'bg-red-500' :
                                            alert.Severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                                        }`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900 leading-snug mb-1">{alert.Message}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mb-3">
                                            {new Date(alert.CreatedAt).toLocaleString('id-ID')}
                                        </p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAcknowledge(alert.ID)}
                                                className="flex items-center gap-1 text-[10px] font-bold bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 px-2 py-1.5 rounded-lg transition-colors shadow-sm"
                                            >
                                                <Check size={12} /> Acknowledge
                                            </button>
                                            <button className="flex items-center gap-1 text-[10px] font-bold bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 px-2 py-1.5 rounded-lg transition-colors shadow-sm">
                                                <UserPlus size={12} /> Assign
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link href="/dashboard/alerts" className="block p-3 text-center text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors border-t border-slate-100">
                        View All History
                    </Link>
                </div>
            )}
        </div>
    );
}
