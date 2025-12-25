"use client";

import { useState, useEffect } from "react";
import {
    Settings, Camera, Bell, Shield, Database, Save, RefreshCw,
    Send, CheckCircle, XCircle, Loader2, MessageSquare, Mail,
    Smartphone, Volume2, Clock, Wifi,
    Edit2, Trash2, Plus, Video, ExternalLink, Webcam, Power, Cpu,
    HardDrive, Activity, Eye, Focus, Maximize, AlertCircle, Signal
} from "lucide-react";

interface NotificationSettings {
    telegramBotToken: string;
    telegramChatId: string;
    emailRecipient: string;
    enableTelegram: boolean;
    enableEmail: boolean;
    enablePushNotification: boolean;
    enableSound: boolean;
    notifyOnViolation: boolean;
    notifyOnCritical: boolean;
    cooldownSeconds: number;
    // Telegram Schedule Settings
    scheduledReportEnabled: boolean;
    scheduledReportTime: string;
    scheduledReportDays: string[];
    sendScreenshotsWithNotifications: boolean;
    notificationType: "violations" | "all";
}

const defaultNotificationSettings: NotificationSettings = {
    telegramBotToken: "",
    telegramChatId: "",
    emailRecipient: "",
    enableTelegram: true,
    enableEmail: false,
    enablePushNotification: true,
    enableSound: true,
    notifyOnViolation: true,
    notifyOnCritical: true,
    cooldownSeconds: 60,
    scheduledReportEnabled: false,
    scheduledReportTime: "08:00",
    scheduledReportDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    sendScreenshotsWithNotifications: true,
    notificationType: "violations",
};

// Camera Configuration
interface CameraConfig {
    id: string;
    name: string;
    location: string;
    sourceType: "webcam" | "rtsp" | "ip" | "mjpeg";
    sourceUrl: string;
    webcamId?: number;
    enabled: boolean;
    aiEnabled: boolean;
}

const defaultCameras: CameraConfig[] = [
    { id: "A", name: "TITIK A", location: "Gudang Utama", sourceType: "webcam", sourceUrl: "0", webcamId: 0, enabled: true, aiEnabled: true },
    { id: "B", name: "TITIK B", location: "Area Assembly", sourceType: "rtsp", sourceUrl: "rtsp://192.168.1.102:554/stream", enabled: false, aiEnabled: false },
    { id: "C", name: "TITIK C", location: "Welding Bay", sourceType: "rtsp", sourceUrl: "rtsp://192.168.1.103:554/stream", enabled: false, aiEnabled: false },
    { id: "D", name: "TITIK D", location: "Loading Dock", sourceType: "rtsp", sourceUrl: "rtsp://192.168.1.104:554/stream", enabled: false, aiEnabled: false },
];

// Camera Settings Tab Component
import { api, Camera as ApiCamera } from "@/services/api";

import { useSearchParams, useRouter } from "next/navigation";

function CameraSettingsTab() {
    const [cameras, setCameras] = useState<ApiCamera[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCamera, setEditingCamera] = useState<Partial<ApiCamera> & { sourceType?: string; webCamId?: number } | null>(null);
    const [testingCamera, setTestingCamera] = useState<number | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();

    // Load cameras from Backend
    const fetchCameras = async () => {
        setIsLoading(true);
        const data = await api.getCameras();
        setCameras(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCameras();
    }, []);

    // Check for "add" action in URL
    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            // Delay slightly to ensure component is ready, then open modal
            setTimeout(() => addCamera(), 100);

            // Clear the param so it doesn't reopen on refresh
            router.replace('/dashboard/settings?tab=camera', { scroll: false });
        }
    }, [searchParams]);

    // Add new camera
    const addCamera = () => {
        const newCamera: Partial<ApiCamera> & { sourceType?: string; webCamId?: number } = {
            name: "New Camera",
            location: "Unknown Location",
            rtsp_url: "0",
            status: "offline",
            resolution: "1920x1080",
            is_active: false,
            latitude: -7.5595, // Default coordinate (example)
            longitude: 112.4353,
            // UI helper fields
            sourceType: "webcam",
            webCamId: 0
        };
        setEditingCamera(newCamera);
    };

    // Save (Create or Update)
    const handleSaveCamera = async () => {
        if (!editingCamera) return;

        // map UI fields back to rtsp_url if needed
        let finalUrl = editingCamera.rtsp_url;
        if (editingCamera.sourceType === 'webcam') {
            finalUrl = editingCamera.webCamId?.toString() || "0";
        }

        const payload: Partial<ApiCamera> = {
            name: editingCamera.name,
            location: editingCamera.location,
            rtsp_url: finalUrl,
            status: editingCamera.status || "offline",
            resolution: editingCamera.resolution || "1920x1080",
            is_active: editingCamera.is_active,
            latitude: Number(editingCamera.latitude) || 0,
            longitude: Number(editingCamera.longitude) || 0,
        };

        let success = false;
        if (editingCamera.ID) {
            success = await api.updateCamera(editingCamera.ID, payload);
        } else {
            success = await api.createCamera(payload);
        }

        if (success) {
            setEditingCamera(null);
            fetchCameras();
        } else {
            alert("Gagal menyimpan kamera");
        }
    };

    // Delete camera
    const deleteCamera = async (id: number) => {
        if (confirm(`Hapus kamera?`)) {
            const success = await api.deleteCamera(id);
            if (success) fetchCameras();
            else alert("Gagal menghapus kamera");
        }
    };

    // Toggle camera enabled
    const toggleCamera = async (cam: Camera) => {
        const success = await api.updateCamera(cam.ID, { ...cam, is_active: !cam.is_active });
        if (success) fetchCameras();
    };

    // Test camera connection (mock test)
    const testCamera = async (camera: Camera) => {
        setTestingCamera(camera.ID);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setTestingCamera(null);
        alert(`Kamera ${camera.name} ${camera.is_active ? 'terhubung!' : 'dimatikan'}`);
    };

    const getSourceType = (url: string) => {
        if (!url) return "unknown";
        if (url.startsWith("rtsp")) return "rtsp";
        if (url.startsWith("http")) return "ip";
        if (!isNaN(Number(url))) return "webcam";
        return "mjpeg";
    };

    const sourceTypeLabels: Record<string, string> = {
        webcam: "Webcam USB",
        rtsp: "RTSP Stream",
        ip: "IP Camera",
        mjpeg: "MJPEG Stream",
        unknown: "Unknown Source"
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Konfigurasi Kamera</h3>
                    <p className="text-sm text-slate-500">Kelola sumber video untuk deteksi AI</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchCameras}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Refresh List"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={addCamera}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                    >
                        <Plus size={18} />
                        Tambah Kamera
                    </button>
                </div>
            </div>

            {/* Camera List */}
            {isLoading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-2" />
                    <p className="text-slate-500">Memuat data kamera...</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {cameras.map((cam) => {
                        const type = getSourceType(cam.rtsp_url);
                        return (
                            <div
                                key={cam.ID}
                                className={`p-4 rounded-xl border transition-all ${cam.is_active
                                    ? "bg-white border-emerald-200 shadow-sm"
                                    : "bg-slate-50 border-slate-200 opacity-75"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${cam.is_active ? "bg-slate-900" : "bg-slate-300"
                                            }`}>
                                            {type === "webcam" ? (
                                                <Video className="text-white" size={24} />
                                            ) : (
                                                <Camera className="text-white" size={24} />
                                            )}
                                        </div>

                                        <div className="flex-1 px-4">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-bold text-slate-900 text-lg">{cam.name}</h4>
                                                {cam.is_active ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                                            <Activity size={10} /> LIVE STREAM
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                                            <Cpu size={10} /> AI ANALYSIS
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wide">
                                                        STANDBY
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-3">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Connection</p>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-mono bg-slate-50 p-1.5 rounded border border-slate-100">
                                                        {type === 'webcam' ? <Webcam size={14} className="text-purple-500" /> :
                                                            type === 'rtsp' ? <Wifi size={14} className="text-blue-500" /> :
                                                                <HardDrive size={14} className="text-amber-500" />}
                                                        <span className="truncate max-w-[150px]" title={cam.rtsp_url}>{cam.rtsp_url || "N/A"}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Zone Area</p>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                                                        <Focus size={14} className="text-slate-400" />
                                                        <span>{cam.location || "Default Zone"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {cam.is_active && (
                                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Maximize size={12} />
                                                        <span>1920x1080</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Activity size={12} />
                                                        <span>30 FPS</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-emerald-600">
                                                        <Signal size={12} />
                                                        <span>Stable</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 border-l border-slate-100 pl-4 items-center justify-center">
                                        {/* Status Indicator */}
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${cam.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${cam.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                            {cam.is_active ? 'ACTIVE' : 'OFFLINE'}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 ml-2">

                                        {/* Power Toggle */}
                                        <button
                                            onClick={() => toggleCamera(cam)}
                                            title={cam.is_active ? "Matikan" : "Nyalakan"}
                                            className={`p-2 rounded-lg transition-colors ${cam.is_active
                                                ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                                }`}
                                        >
                                            <Power size={18} />
                                        </button>

                                        {/* Test Button */}
                                        <button
                                            onClick={() => testCamera(cam)}
                                            disabled={testingCamera === cam.ID}
                                            className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
                                            title="Test Koneksi"
                                        >
                                            {testingCamera === cam.ID ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <ExternalLink size={18} />
                                            )}
                                        </button>

                                        {/* Edit Button */}
                                        <button
                                            onClick={() => {
                                                const sType = getSourceType(cam.rtsp_url);
                                                setEditingCamera({
                                                    ...cam,
                                                    sourceType: sType,
                                                    webCamId: sType === 'webcam' ? Number(cam.rtsp_url) : 0
                                                });
                                            }}
                                            className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => deleteCamera(cam.ID)}
                                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )
            }

            {
                cameras.length === 0 && !isLoading && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Belum ada kamera dikonfigurasi</p>
                        <button
                            onClick={addCamera}
                            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium"
                        >
                            Tambah Kamera Pertama
                        </button>
                    </div>
                )
            }

            {/* Edit Modal */}
            {
                editingCamera && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">
                                {editingCamera.ID ? "Edit Kamera" : "Tambah Kamera"}
                            </h3>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kamera</label>
                                    <input
                                        type="text"
                                        value={editingCamera.name}
                                        onChange={(e) => setEditingCamera({ ...editingCamera, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
                                    <input
                                        type="text"
                                        value={editingCamera.location}
                                        onChange={(e) => setEditingCamera({ ...editingCamera, location: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                                    />
                                </div>

                                {/* Coordinates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={editingCamera.latitude || 0}
                                            onChange={(e) => setEditingCamera({ ...editingCamera, latitude: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={editingCamera.longitude || 0}
                                            onChange={(e) => setEditingCamera({ ...editingCamera, longitude: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Source Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Sumber</label>
                                    <select
                                        value={editingCamera.sourceType}
                                        onChange={(e) => setEditingCamera({ ...editingCamera, sourceType: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                                    >
                                        <option value="webcam">Webcam USB (Device ID)</option>
                                        <option value="rtsp">RTSP Stream (IP Camera)</option>
                                        <option value="ip">HTTP IP Camera</option>
                                        <option value="mjpeg">MJPEG Stream</option>
                                    </select>
                                </div>

                                {/* Source URL / Webcam ID */}
                                {editingCamera.sourceType === "webcam" ? (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Webcam Device ID</label>
                                        <select
                                            value={editingCamera.webCamId || 0}
                                            onChange={(e) => setEditingCamera({ ...editingCamera, webCamId: Number(e.target.value), rtsp_url: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                                        >
                                            <option value={0}>Device 0 (Default Webcam)</option>
                                            <option value={1}>Device 1</option>
                                            <option value={2}>Device 2</option>
                                            <option value={3}>Device 3</option>
                                        </select>
                                        <p className="mt-1 text-xs text-slate-500">Pilih webcam yang terpasang di komputer</p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {editingCamera.sourceType === "rtsp" ? "RTSP URL" :
                                                editingCamera.sourceType === "ip" ? "IP Camera URL" : "MJPEG URL"}
                                        </label>
                                        <input
                                            type="text"
                                            value={editingCamera.rtsp_url}
                                            onChange={(e) => setEditingCamera({ ...editingCamera, rtsp_url: e.target.value })}
                                            placeholder={
                                                editingCamera.sourceType === "rtsp"
                                                    ? "rtsp://192.168.1.100:554/stream"
                                                    : editingCamera.sourceType === "ip"
                                                        ? "http://192.168.1.100:8080/video"
                                                        : "http://localhost:8000/video_feed"
                                            }
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setEditingCamera(null)}
                                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveCamera}
                                    className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("notification");
    const [notifSettings, setNotifSettings] = useState<NotificationSettings>(defaultNotificationSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [testMessage, setTestMessage] = useState("");

    // Load settings from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("smartapd-notification-settings");
        if (saved) {
            try {
                setNotifSettings(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse settings:", e);
            }
        }
    }, []);

    // Save settings to localStorage
    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus("idle");


        try {
            localStorage.setItem("smartapd-notification-settings", JSON.stringify(notifSettings));

            // Save Telegram settings to Go Backend
            try {
                await fetch("http://localhost:8080/api/v1/settings/telegram", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        bot_token: notifSettings.telegramBotToken,
                        chat_id: notifSettings.telegramChatId,
                    }),
                });
            } catch {
                // Backend not available, settings saved locally
            }

            // Save Email settings to Go Backend
            if (notifSettings.enableEmail && notifSettings.emailRecipient) {
                try {
                    await fetch("http://localhost:8080/api/v1/email/settings", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            recipients: [notifSettings.emailRecipient],
                            enabled: notifSettings.enableEmail,
                        }),
                    });
                } catch {
                    // Backend not available
                }
            }

            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (error) {
            console.error("Failed to save settings:", error);
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

    // Test Telegram connection
    const testTelegramConnection = async () => {
        if (!notifSettings.telegramBotToken || !notifSettings.telegramChatId) {
            setTestMessage("Token dan Chat ID harus diisi!");
            setTestStatus("error");
            return;
        }


        setTestStatus("loading");
        setTestMessage("");

        try {
            // Use Go Backend for Telegram API
            const response = await fetch(
                "http://localhost:8080/api/v1/settings/telegram/test",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        bot_token: notifSettings.telegramBotToken,
                        chat_id: notifSettings.telegramChatId,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                setTestStatus("success");
                setTestMessage(data.message || "Pesan terkirim! Cek Telegram Anda.");
            } else {
                setTestStatus("error");
                setTestMessage(data.message || data.error || "Gagal mengirim pesan");
            }
        } catch (error) {
            setTestStatus("error");
            setTestMessage("Backend tidak aktif. Jalankan smartapd-backend.exe terlebih dahulu.");
        }
    };

    const tabs = [
        { id: "notification", label: "Notifikasi", icon: Bell },
        { id: "camera", label: "Kamera", icon: Camera },
        { id: "security", label: "Keamanan", icon: Shield },
        { id: "system", label: "Sistem", icon: Database },
    ];

    const updateSetting = <K extends keyof NotificationSettings>(
        key: K,
        value: NotificationSettings[K]
    ) => {
        setNotifSettings((prev) => ({ ...prev, [key]: value }));
    };

    // Toggle Switch Component
    const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
        <button
            onClick={onToggle}
            className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? "bg-orange-500" : "bg-slate-300"
                }`}
        >
            <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"
                    }`}
            />
        </button>
    );

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <Settings className="text-orange-500" />
                    Pengaturan Sistem
                </h1>
                <p className="text-slate-500">Konfigurasi notifikasi, kamera, dan sistem</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-2 shadow-lg">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${activeTab === tab.id
                            ? "bg-orange-500 text-white shadow-lg"
                            : "text-slate-600 hover:bg-slate-100"
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg">

                {activeTab === "notification" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Pengaturan Notifikasi</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Wifi size={16} className={notifSettings.telegramBotToken ? "text-emerald-500" : "text-slate-400"} />
                                {notifSettings.telegramBotToken ? "Telegram Terkonfigurasi" : "Telegram Belum Diatur"}
                            </div>
                        </div>

                        {/* Telegram Section */}
                        <div className="p-5 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <MessageSquare className="text-white" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">Telegram Bot</h4>
                                    <p className="text-sm text-slate-500">Terima notifikasi pelanggaran via Telegram</p>
                                </div>
                                <ToggleSwitch
                                    enabled={notifSettings.enableTelegram}
                                    onToggle={() => updateSetting("enableTelegram", !notifSettings.enableTelegram)}
                                />
                            </div>

                            {notifSettings.enableTelegram && (
                                <div className="space-y-4 mt-4 pt-4 border-t border-blue-100">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Bot Token <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={notifSettings.telegramBotToken}
                                            onChange={(e) => updateSetting("telegramBotToken", e.target.value)}
                                            placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all"
                                        />
                                        <p className="mt-1 text-xs text-slate-500">
                                            Dapatkan dari <a href="https://t.me/BotFather" target="_blank" className="text-blue-500 hover:underline">@BotFather</a>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Chat ID <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={notifSettings.telegramChatId}
                                            onChange={(e) => updateSetting("telegramChatId", e.target.value)}
                                            placeholder="-1001234567890 atau 123456789"
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all"
                                        />
                                        <p className="mt-1 text-xs text-slate-500">
                                            ID grup atau user. Kirim pesan ke bot lalu cek via API.
                                        </p>
                                    </div>

                                    {/* Test Connection Button */}
                                    <button
                                        onClick={testTelegramConnection}
                                        disabled={testStatus === "loading"}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${testStatus === "success"
                                            ? "bg-emerald-500 text-white"
                                            : testStatus === "error"
                                                ? "bg-red-500 text-white"
                                                : "bg-blue-500 hover:bg-blue-600 text-white"
                                            }`}
                                    >
                                        {testStatus === "loading" ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Menguji...
                                            </>
                                        ) : testStatus === "success" ? (
                                            <>
                                                <CheckCircle size={18} />
                                                Berhasil!
                                            </>
                                        ) : testStatus === "error" ? (
                                            <>
                                                <XCircle size={18} />
                                                Gagal
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Test Koneksi
                                            </>
                                        )}
                                    </button>

                                    {testMessage && (
                                        <p className={`text-sm ${testStatus === "success" ? "text-emerald-600" : "text-red-600"}`}>
                                            {testMessage}
                                        </p>
                                    )}

                                    {/* Telegram Schedule Settings */}
                                    <div className="mt-6 pt-6 border-t border-blue-100 space-y-4">
                                        <h5 className="font-bold text-slate-800 flex items-center gap-2">
                                            <Clock size={16} className="text-blue-500" />
                                            Jadwal Laporan Otomatis
                                        </h5>

                                        {/* Enable Scheduled Report */}
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                            <div>
                                                <p className="font-medium text-slate-800">Aktifkan Laporan Terjadwal</p>
                                                <p className="text-xs text-slate-500">Kirim laporan otomatis setiap hari</p>
                                            </div>
                                            <ToggleSwitch
                                                enabled={notifSettings.scheduledReportEnabled}
                                                onToggle={() => updateSetting("scheduledReportEnabled", !notifSettings.scheduledReportEnabled)}
                                            />
                                        </div>

                                        {notifSettings.scheduledReportEnabled && (
                                            <>
                                                {/* Report Time */}
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Jam Kirim Laporan
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={notifSettings.scheduledReportTime}
                                                        onChange={(e) => updateSetting("scheduledReportTime", e.target.value)}
                                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                                                    />
                                                </div>

                                                {/* Report Days */}
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Hari Aktif
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            { key: "monday", label: "Sen" },
                                                            { key: "tuesday", label: "Sel" },
                                                            { key: "wednesday", label: "Rab" },
                                                            { key: "thursday", label: "Kam" },
                                                            { key: "friday", label: "Jum" },
                                                            { key: "saturday", label: "Sab" },
                                                            { key: "sunday", label: "Min" },
                                                        ].map((day) => (
                                                            <button
                                                                key={day.key}
                                                                onClick={() => {
                                                                    const days = notifSettings.scheduledReportDays;
                                                                    if (days.includes(day.key)) {
                                                                        updateSetting("scheduledReportDays", days.filter(d => d !== day.key));
                                                                    } else {
                                                                        updateSetting("scheduledReportDays", [...days, day.key]);
                                                                    }
                                                                }}
                                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${notifSettings.scheduledReportDays.includes(day.key)
                                                                    ? "bg-blue-500 text-white"
                                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                                    }`}
                                                            >
                                                                {day.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Send Screenshots */}
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                            <div>
                                                <p className="font-medium text-slate-800">Sertakan Screenshot</p>
                                                <p className="text-xs text-slate-500">Kirim foto pelanggaran dalam notifikasi</p>
                                            </div>
                                            <ToggleSwitch
                                                enabled={notifSettings.sendScreenshotsWithNotifications}
                                                onToggle={() => updateSetting("sendScreenshotsWithNotifications", !notifSettings.sendScreenshotsWithNotifications)}
                                            />
                                        </div>

                                        {/* Notification Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Jenis Notifikasi
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateSetting("notificationType", "violations")}
                                                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${notifSettings.notificationType === "violations"
                                                        ? "bg-red-500 text-white"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                        }`}
                                                >
                                                    🚨 Pelanggaran Saja
                                                </button>
                                                <button
                                                    onClick={() => updateSetting("notificationType", "all")}
                                                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${notifSettings.notificationType === "all"
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                        }`}
                                                >
                                                    📊 Semua Aktivitas
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Email Section */}
                        <div className="p-5 bg-gradient-to-br from-amber-50 to-slate-50 rounded-xl border border-amber-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-500 rounded-lg">
                                    <Mail className="text-white" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">Email Laporan</h4>
                                    <p className="text-sm text-slate-500">Terima laporan harian via email</p>
                                </div>
                                <ToggleSwitch
                                    enabled={notifSettings.enableEmail}
                                    onToggle={() => updateSetting("enableEmail", !notifSettings.enableEmail)}
                                />
                            </div>

                            {notifSettings.enableEmail && (
                                <div className="mt-4 pt-4 border-t border-amber-100 space-y-4">
                                    {/* Info Box */}
                                    <div className="p-3 bg-amber-100 rounded-lg border border-amber-200">
                                        <p className="text-sm text-amber-800 font-medium">📧 Cara menggunakan Email:</p>
                                        <ol className="text-xs text-amber-700 mt-2 list-decimal list-inside space-y-1">
                                            <li>Gunakan akun Gmail</li>
                                            <li>Buat App Password di: <a href="https://myaccount.google.com/apppasswords" target="_blank" className="underline">Google App Passwords</a></li>
                                            <li>Masukkan email dan App Password di bawah</li>
                                        </ol>
                                    </div>

                                    {/* Email Recipient */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Email Penerima Laporan
                                        </label>
                                        <input
                                            type="email"
                                            value={notifSettings.emailRecipient}
                                            onChange={(e) => updateSetting("emailRecipient", e.target.value)}
                                            placeholder="hse@company.com"
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Note about future feature */}
                                    <p className="text-xs text-slate-500 italic">
                                        * Fitur email akan mengirim laporan harian/mingguan secara otomatis ke alamat di atas.
                                        Konfigurasi SMTP akan ditambahkan di versi selanjutnya.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Browser Push Section */}
                        <div className="p-5 bg-gradient-to-br from-purple-50 to-slate-50 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                    <Smartphone className="text-white" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">Push Notification</h4>
                                    <p className="text-sm text-slate-500">Notifikasi langsung di browser</p>
                                </div>
                                <ToggleSwitch
                                    enabled={notifSettings.enablePushNotification}
                                    onToggle={() => updateSetting("enablePushNotification", !notifSettings.enablePushNotification)}
                                />
                            </div>
                        </div>

                        {/* Sound Section */}
                        <div className="p-5 bg-gradient-to-br from-emerald-50 to-slate-50 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500 rounded-lg">
                                    <Volume2 className="text-white" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">Suara Notifikasi</h4>
                                    <p className="text-sm text-slate-500">Bunyi alarm saat ada pelanggaran</p>
                                </div>
                                <ToggleSwitch
                                    enabled={notifSettings.enableSound}
                                    onToggle={() => updateSetting("enableSound", !notifSettings.enableSound)}
                                />
                            </div>
                        </div>

                        {/* Cooldown Setting */}
                        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-500 rounded-lg">
                                    <Clock className="text-white" size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">Cooldown Notifikasi</h4>
                                    <p className="text-sm text-slate-500">Jeda antar notifikasi untuk zona yang sama</p>
                                </div>
                                <select
                                    value={notifSettings.cooldownSeconds}
                                    onChange={(e) => updateSetting("cooldownSeconds", Number(e.target.value))}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                >
                                    <option value={30}>30 detik</option>
                                    <option value={60}>1 menit</option>
                                    <option value={120}>2 menit</option>
                                    <option value={300}>5 menit</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "camera" && (
                    <CameraSettingsTab />
                )}

                {activeTab === "security" && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-900">Keamanan</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                                    <p className="text-sm text-slate-500">Tambahkan lapisan keamanan ekstra</p>
                                </div>
                                <ToggleSwitch enabled={false} onToggle={() => { }} />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-slate-900">Session Timeout</p>
                                    <p className="text-sm text-slate-500">Auto logout setelah tidak aktif</p>
                                </div>
                                <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg">
                                    <option>30 menit</option>
                                    <option>1 jam</option>
                                    <option>4 jam</option>
                                    <option>Tidak pernah</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "system" && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-900">Informasi Sistem</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-sm text-slate-500">Versi Aplikasi</p>
                                <p className="text-lg font-bold text-slate-900 font-mono">v2.0.0</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-sm text-slate-500">Model AI</p>
                                <p className="text-lg font-bold text-slate-900 font-mono">YOLOv8n</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-sm text-slate-500">Database</p>
                                <p className="text-lg font-bold text-slate-900 font-mono">SQLite</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-sm text-slate-500">Uptime</p>
                                <p className="text-lg font-bold text-emerald-600 font-mono">99.8%</p>
                            </div>
                        </div>

                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium transition-colors">
                            <RefreshCw size={18} />
                            Restart Sistem
                        </button>
                    </div>
                )}

                {/* Save Button */}
                <div className="mt-8 flex justify-end gap-3">
                    {saveStatus === "success" && (
                        <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle size={18} />
                            <span className="text-sm font-medium">Tersimpan!</span>
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg transition-colors disabled:opacity-70"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Simpan Pengaturan
                            </>
                        )}
                    </button>
                </div>
            </div>

        </div>
    );
}
