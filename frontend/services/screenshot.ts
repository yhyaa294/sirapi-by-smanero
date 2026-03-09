"use client";

// Screenshot Service for SiRapi
// Captures screenshots from webcam or canvas when violations are detected

interface ScreenshotResult {
    dataUrl: string;
    timestamp: Date;
    filename: string;
}

class ScreenshotService {
    private lastScreenshot: ScreenshotResult | null = null;

    // Capture screenshot from video element
    captureFromVideo(videoElement: HTMLVideoElement): ScreenshotResult | null {
        if (!videoElement || !videoElement.videoWidth) {
            console.warn("Video element not ready for capture");
            return null;
        }

        try {
            const canvas = document.createElement("canvas");
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            const ctx = canvas.getContext("2d");
            if (!ctx) return null;

            ctx.drawImage(videoElement, 0, 0);

            const timestamp = new Date();
            const filename = `violation_${timestamp.toISOString().replace(/[:.]/g, "-")}.jpg`;
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

            this.lastScreenshot = { dataUrl, timestamp, filename };
            return this.lastScreenshot;
        } catch (error) {
            console.error("Failed to capture screenshot:", error);
            return null;
        }
    }

    // Capture screenshot from canvas element
    captureFromCanvas(canvasElement: HTMLCanvasElement): ScreenshotResult | null {
        if (!canvasElement) {
            console.warn("Canvas element not available");
            return null;
        }

        try {
            const timestamp = new Date();
            const filename = `violation_${timestamp.toISOString().replace(/[:.]/g, "-")}.jpg`;
            const dataUrl = canvasElement.toDataURL("image/jpeg", 0.9);

            this.lastScreenshot = { dataUrl, timestamp, filename };
            return this.lastScreenshot;
        } catch (error) {
            console.error("Failed to capture screenshot:", error);
            return null;
        }
    }

    // Generate a placeholder screenshot (for demo mode without webcam)
    generatePlaceholder(violationType: string, cameraId: string): ScreenshotResult {
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 360;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return {
                dataUrl: "",
                timestamp: new Date(),
                filename: "placeholder.jpg",
            };
        }

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 640, 360);
        gradient.addColorStop(0, "#1e293b");
        gradient.addColorStop(1, "#0f172a");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 640, 360);

        // Grid pattern
        ctx.strokeStyle = "rgba(251, 146, 60, 0.1)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 640; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 360);
            ctx.stroke();
        }
        for (let i = 0; i < 360; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(640, i);
            ctx.stroke();
        }

        // Violation text
        ctx.font = "bold 24px system-ui";
        ctx.fillStyle = "#ef4444";
        ctx.textAlign = "center";
        ctx.fillText(`⚠️ ${violationType.toUpperCase().replace("_", " ")}`, 320, 160);

        // Camera ID
        ctx.font = "16px monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(`Camera: TITIK ${cameraId}`, 320, 200);

        // Timestamp
        const timestamp = new Date();
        ctx.font = "12px monospace";
        ctx.fillStyle = "#64748b";
        ctx.fillText(timestamp.toLocaleString("id-ID"), 320, 240);

        // Demo badge
        ctx.font = "bold 10px system-ui";
        ctx.fillStyle = "#f97316";
        ctx.fillText("DEMO MODE - SIMULATED CAPTURE", 320, 340);

        const filename = `violation_${timestamp.toISOString().replace(/[:.]/g, "-")}.jpg`;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

        this.lastScreenshot = { dataUrl, timestamp, filename };
        return this.lastScreenshot;
    }

    // Download screenshot
    download(screenshot: ScreenshotResult): void {
        const link = document.createElement("a");
        link.href = screenshot.dataUrl;
        link.download = screenshot.filename;
        link.click();
    }

    // Get last screenshot
    getLastScreenshot(): ScreenshotResult | null {
        return this.lastScreenshot;
    }

    // Save screenshot to server (if backend is available)
    async saveToServer(
        screenshot: ScreenshotResult,
        metadata: {
            violationType: string;
            cameraId: string;
            confidence: number;
        }
    ): Promise<boolean> {
        try {
            // Convert base64 to blob
            const response = await fetch(screenshot.dataUrl);
            const blob = await response.blob();

            const formData = new FormData();
            formData.append("file", blob, screenshot.filename);
            formData.append("violation_type", metadata.violationType);
            formData.append("camera_id", metadata.cameraId);
            formData.append("confidence", String(metadata.confidence));
            formData.append("timestamp", screenshot.timestamp.toISOString());

            const result = await fetch("/api/screenshots", {
                method: "POST",
                body: formData,
            });

            return result.ok;
        } catch (error) {
            console.error("Failed to save screenshot to server:", error);
            return false;
        }
    }
}

// Singleton instance
let screenshotService: ScreenshotService | null = null;

export function getScreenshotService(): ScreenshotService {
    if (!screenshotService) {
        screenshotService = new ScreenshotService();
    }
    return screenshotService;
}

export function useScreenshot() {
    const service = getScreenshotService();

    return {
        captureFromVideo: (video: HTMLVideoElement) => service.captureFromVideo(video),
        captureFromCanvas: (canvas: HTMLCanvasElement) => service.captureFromCanvas(canvas),
        generatePlaceholder: (type: string, cameraId: string) =>
            service.generatePlaceholder(type, cameraId),
        download: (screenshot: ScreenshotResult) => service.download(screenshot),
        getLastScreenshot: () => service.getLastScreenshot(),
        saveToServer: (
            screenshot: ScreenshotResult,
            metadata: { violationType: string; cameraId: string; confidence: number }
        ) => service.saveToServer(screenshot, metadata),
    };
}

export type { ScreenshotResult };
export default ScreenshotService;
