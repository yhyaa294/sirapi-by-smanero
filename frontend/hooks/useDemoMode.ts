"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { triggerViolationAlert } from "@/components/AlertToast";
import { api } from "@/services/api";

// Types for demo detections
export interface DemoDetection {
    id: string;
    timestamp: Date;
    camera: string;
    cameraId: string;
    location: string;
    type: "no_helmet" | "no_vest" | "no_gloves" | "no_boots" | "person" | "helmet" | "vest";
    severity: "critical" | "high" | "medium" | "low" | "info";
    confidence: number;
    status: "detected" | "missing";
    x: number;
    y: number;
    width: number;
    height: number;
}

// Camera data for demo
const cameras = [
    { id: "A", name: "TITIK A", location: "Gudang Utama" },
    { id: "B", name: "TITIK B", location: "Area Assembly" },
    { id: "C", name: "TITIK C", location: "Welding Bay" },
    { id: "D", name: "TITIK D", location: "Loading Dock" },
];

// Violation types with weights (higher = more common)
const violationTypes: Array<{
    type: DemoDetection["type"];
    severity: DemoDetection["severity"];
    weight: number;
}> = [
        { type: "no_helmet", severity: "critical", weight: 30 },
        { type: "no_vest", severity: "high", weight: 25 },
        { type: "no_gloves", severity: "medium", weight: 20 },
        { type: "no_boots", severity: "medium", weight: 15 },
        { type: "helmet", severity: "info", weight: 5 },
        { type: "vest", severity: "info", weight: 5 },
    ];

// Generate random ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Generate random position for bounding box
const generatePosition = () => ({
    x: 10 + Math.random() * 60,
    y: 10 + Math.random() * 50,
    width: 15 + Math.random() * 20,
    height: 20 + Math.random() * 25,
});

// Pick random item based on weights
const weightedRandom = <T extends { weight: number }>(items: T[]): T => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
        random -= item.weight;
        if (random <= 0) return item;
    }
    return items[0];
};

// Generate a single demo detection
const generateDemoDetection = (): DemoDetection => {
    const camera = cameras[Math.floor(Math.random() * cameras.length)];
    const violation = weightedRandom(violationTypes);
    const pos = generatePosition();

    return {
        id: generateId(),
        timestamp: new Date(),
        camera: camera.name,
        cameraId: camera.id,
        location: camera.location,
        type: violation.type,
        severity: violation.severity,
        confidence: 85 + Math.random() * 14, // 85-99%
        status: violation.type.startsWith("no_") ? "missing" : "detected",
        ...pos,
    };
};

// Hook for demo mode
export function useDemoMode() {
    const [isDemo, setIsDemo] = useState(false);
    const [detections, setDetections] = useState<DemoDetection[]>([]);
    const [stats, setStats] = useState({
        totalDetections: 0,
        violations: 0,
        compliance: 94.2,
        fps: 28,
        inferenceTime: 42,
    });

    // Listen for demo mode changes from layout
    useEffect(() => {
        const handleDemoModeChange = (event: CustomEvent<boolean>) => {
            setIsDemo(event.detail);
        };

        // Check initial state from localStorage
        const saved = localStorage.getItem("smartapd-demo-mode");
        if (saved === "true") {
            setIsDemo(true);
        }

        window.addEventListener("demo-mode-change", handleDemoModeChange as EventListener);
        return () => {
            window.removeEventListener("demo-mode-change", handleDemoModeChange as EventListener);
        };
    }, []);

    // Generate detections when demo mode is active
    useEffect(() => {
        if (!isDemo) {
            setDetections([]);
            return;
        }

        // Generate initial detections
        const initial = Array.from({ length: 3 }, generateDemoDetection);
        setDetections(initial);

        // Generate new detections every 5-10 seconds
        const interval = setInterval(() => {
            const newDetection = generateDemoDetection();

            setDetections((prev) => {
                const updated = [newDetection, ...prev.slice(0, 19)]; // Keep last 20
                return updated;
            });

            // Update stats
            setStats((prev) => ({
                ...prev,
                totalDetections: prev.totalDetections + 1,
                violations: newDetection.status === "missing" ? prev.violations + 1 : prev.violations,
                compliance: Math.max(80, Math.min(99, prev.compliance + (Math.random() - 0.5) * 2)),
                fps: 25 + Math.floor(Math.random() * 8),
                inferenceTime: 38 + Math.floor(Math.random() * 15),
            }));

            // Trigger toast notification for violations
            if (newDetection.status === "missing") {
                triggerViolationAlert({
                    type: newDetection.type,
                    camera: newDetection.camera,
                    cameraId: newDetection.cameraId,
                    location: newDetection.location,
                    confidence: newDetection.confidence,
                    severity: newDetection.severity,
                });

                // Save to backend database
                const cameraIndex = cameras.findIndex(c => c.id === newDetection.cameraId);
                api.createDetection({
                    camera_id: cameraIndex >= 0 ? cameraIndex + 1 : 1,
                    violation_type: newDetection.type,
                    confidence: newDetection.confidence / 100,
                    location: newDetection.location,
                    is_violation: true,
                }).catch(err => console.log("Backend save skipped:", err));
            }
        }, 5000 + Math.random() * 5000); // 5-10 seconds

        return () => clearInterval(interval);
    }, [isDemo]);

    // Clear all detections
    const clearDetections = useCallback(() => {
        setDetections([]);
        setStats((prev) => ({ ...prev, totalDetections: 0, violations: 0 }));
    }, []);

    // Get violations only - memoized to prevent infinite re-renders
    const violations = useMemo(() => detections.filter((d) => d.status === "missing"), [detections]);

    // Get detections by camera
    const getDetectionsByCamera = useCallback(
        (cameraId: string) => detections.filter((d) => d.cameraId === cameraId),
        [detections]
    );

    // Get latest detection
    const latestDetection = detections[0] || null;

    return {
        isDemo,
        detections,
        violations,
        stats,
        latestDetection,
        clearDetections,
        getDetectionsByCamera,
    };
}

export default useDemoMode;
