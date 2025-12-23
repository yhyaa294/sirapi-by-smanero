"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, X, ExternalLink, Camera, Clock, Shield } from "lucide-react";
import Link from "next/link";

interface ViolationAlert {
    id: string;
    type: string;
    camera: string;
    cameraId: string;
    location: string;
    confidence: number;
    timestamp: Date;
    severity: "critical" | "high" | "medium" | "low" | "info";
}

interface AlertToastProps {
    alert: ViolationAlert;
    onDismiss: (id: string) => void;
    autoHide?: number; // ms, 0 = no auto hide
}

// Individual Alert Toast
function AlertToast({ alert, onDismiss, autoHide = 10000 }: AlertToastProps) {
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (autoHide > 0) {
            const timer = setTimeout(() => {
                setIsLeaving(true);
                setTimeout(() => onDismiss(alert.id), 300);
            }, autoHide);
            return () => clearTimeout(timer);
        }
    }, [alert.id, autoHide, onDismiss]);

    const handleDismiss = () => {
        setIsLeaving(true);
        setTimeout(() => onDismiss(alert.id), 300);
    };

    const severityColors = {
        critical: "border-red-500 bg-red-500/10",
        high: "border-orange-500 bg-orange-500/10",
        medium: "border-amber-500 bg-amber-500/10",
        low: "border-emerald-500 bg-emerald-500/10",
        info: "border-blue-500 bg-blue-500/10",
    };

    const severityTextColors = {
        critical: "text-red-500",
        high: "text-orange-500",
        medium: "text-amber-500",
        low: "text-emerald-500",
        info: "text-blue-500",
    };

    const typeLabels: Record<string, string> = {
        no_helmet: "Tidak Memakai Helm",
        no_vest: "Tidak Memakai Rompi",
        no_gloves: "Tidak Memakai Sarung Tangan",
        no_boots: "Tidak Memakai Sepatu Safety",
    };

    return (
        <div
            className={`w-96 max-w-[calc(100vw-2rem)] border-l-4 rounded-xl shadow-2xl backdrop-blur-xl transition-all duration-300 ${severityColors[alert.severity]
                } ${isLeaving ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-white/10`}>
                        <AlertTriangle className={`w-4 h-4 ${severityTextColors[alert.severity]}`} />
                    </div>
                    <span className={`text-sm font-bold uppercase ${severityTextColors[alert.severity]}`}>
                        {alert.severity === "critical" ? "ALERT KRITIKAL" : "PELANGGARAN APD"}
                    </span>
                </div>
                <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold truncate">
                            {typeLabels[alert.type] || alert.type.replace("_", " ").toUpperCase()}
                        </h4>
                        <p className="text-slate-400 text-sm truncate">{alert.location}</p>
                    </div>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-mono text-slate-300">
                        {alert.confidence.toFixed(1)}%
                    </span>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>{alert.camera}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span suppressHydrationWarning>
                            {alert.timestamp.toLocaleTimeString("id-ID")}
                        </span>
                    </div>
                </div>

                {/* Action */}
                <Link
                    href={`/dashboard/monitor/${alert.cameraId.toLowerCase()}`}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    Lihat Kamera
                </Link>
            </div>

            {/* Progress bar for auto-hide */}
            {autoHide > 0 && (
                <div className="h-1 bg-white/5 overflow-hidden rounded-b-xl">
                    <div
                        className={`h-full ${severityColors[alert.severity].replace("/10", "")} transition-all`}
                        style={{
                            animation: `shrink ${autoHide}ms linear forwards`,
                        }}
                    />
                </div>
            )}

            <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
}

// Alert Toast Container - manages multiple alerts
interface AlertToastContainerProps {
    maxAlerts?: number;
}

export function AlertToastContainer({ maxAlerts = 5 }: AlertToastContainerProps) {
    const [alerts, setAlerts] = useState<ViolationAlert[]>([]);

    // Listen for new violation events
    useEffect(() => {
        const handleNewViolation = (event: CustomEvent<ViolationAlert>) => {
            const newAlert = event.detail;
            setAlerts((prev) => {
                const updated = [newAlert, ...prev.slice(0, maxAlerts - 1)];
                return updated;
            });
        };

        window.addEventListener("smartapd-violation", handleNewViolation as EventListener);
        return () => {
            window.removeEventListener("smartapd-violation", handleNewViolation as EventListener);
        };
    }, [maxAlerts]);

    const dismissAlert = useCallback((id: string) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, []);

    if (alerts.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-3">
            {alerts.map((alert) => (
                <AlertToast key={alert.id} alert={alert} onDismiss={dismissAlert} />
            ))}
        </div>
    );
}

// Helper to trigger a violation alert
export function triggerViolationAlert(alert: Omit<ViolationAlert, "id" | "timestamp">) {
    const fullAlert: ViolationAlert = {
        ...alert,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date(),
    };

    window.dispatchEvent(
        new CustomEvent("smartapd-violation", { detail: fullAlert })
    );
}

export type { ViolationAlert };
export default AlertToastContainer;
