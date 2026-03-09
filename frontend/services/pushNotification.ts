"use client";

// Push Notification Service for SiRapi
// Handles browser push notifications for violations

interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
}

class PushNotificationService {
    private permission: NotificationPermission = "default";
    private enabled: boolean = false;

    constructor() {
        if (typeof window !== "undefined" && "Notification" in window) {
            this.permission = Notification.permission;
            this.enabled = this.permission === "granted";
        }
    }

    // Check if notifications are supported
    isSupported(): boolean {
        return typeof window !== "undefined" && "Notification" in window;
    }

    // Check if notifications are enabled
    isEnabled(): boolean {
        return this.enabled;
    }

    // Request permission from user
    async requestPermission(): Promise<boolean> {
        if (!this.isSupported()) {
            console.warn("Push notifications not supported");
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            this.enabled = permission === "granted";
            return this.enabled;
        } catch (error) {
            console.error("Failed to request notification permission:", error);
            return false;
        }
    }

    // Send a notification
    async notify(payload: NotificationPayload): Promise<Notification | null> {
        if (!this.isSupported() || !this.enabled) {
            console.warn("Notifications not enabled");
            return null;
        }

        try {
            const notification = new Notification(payload.title, {
                body: payload.body,
                icon: payload.icon || "/images/logo.jpg",
                badge: payload.badge || "/images/logo.jpg",
                tag: payload.tag,
                data: payload.data,
                requireInteraction: true, // Keep notification until user interacts
                silent: false, // Play sound
            });

            // Handle click
            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();

                // Navigate to alerts if data contains cameraId
                if (payload.data?.cameraId) {
                    window.location.href = `/dashboard/monitor/${payload.data.cameraId}`;
                } else {
                    window.location.href = "/dashboard/alerts";
                }

                notification.close();
            };

            return notification;
        } catch (error) {
            console.error("Failed to send notification:", error);
            return null;
        }
    }

    // Send a violation notification
    async notifyViolation(
        violationType: string,
        location: string,
        confidence: number,
        cameraId?: string
    ): Promise<Notification | null> {
        const typeLabels: Record<string, string> = {
            no_topi: "Tidak Memakai Helm",
            no_dasi: "Tidak Memakai Rompi",
            no_sabuk: "Tidak Memakai Sarung Tangan",
            no_sepatu: "Tidak Memakai Sepatu Safety",
        };

        const typeEmoji: Record<string, string> = {
            no_topi: "⚠️",
            no_dasi: "🦺",
            no_sabuk: "🧤",
            no_sepatu: "👢",
        };

        const label = typeLabels[violationType] || violationType;
        const emoji = typeEmoji[violationType] || "⚠️";

        return this.notify({
            title: `${emoji} PELANGGARAN APD TERDETEKSI`,
            body: `${label} di ${location}\nKepercayaan: ${confidence.toFixed(1)}%`,
            tag: `violation-${violationType}-${Date.now()}`,
            data: { violationType, location, confidence, cameraId },
        });
    }

    // Send a critical alert notification
    async notifyCritical(message: string, location: string): Promise<Notification | null> {
        return this.notify({
            title: "🚨 ALERT KRITIKAL",
            body: `${message}\nLokasi: ${location}`,
            tag: `critical-${Date.now()}`,
        });
    }
}

// Singleton instance
let notificationService: PushNotificationService | null = null;

export function getPushNotificationService(): PushNotificationService {
    if (!notificationService) {
        notificationService = new PushNotificationService();
    }
    return notificationService;
}

export function usePushNotification() {
    const service = getPushNotificationService();

    return {
        isSupported: service.isSupported(),
        isEnabled: service.isEnabled(),
        requestPermission: () => service.requestPermission(),
        notify: (payload: NotificationPayload) => service.notify(payload),
        notifyViolation: (
            violationType: string,
            location: string,
            confidence: number,
            cameraId?: string
        ) => service.notifyViolation(violationType, location, confidence, cameraId),
        notifyCritical: (message: string, location: string) =>
            service.notifyCritical(message, location),
    };
}

export default PushNotificationService;
