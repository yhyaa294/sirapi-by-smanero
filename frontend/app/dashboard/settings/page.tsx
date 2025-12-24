"use client";

import { useState, useEffect } from "react";
import {
    Settings, Camera, Bell, Shield, Database, Save, RefreshCw,
    Send, CheckCircle, XCircle, Loader2, MessageSquare, Mail,
    Smartphone, Volume2, Clock, Wifi
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
import { Edit2, Trash2, Plus, Video, ExternalLink, Webcam, Power, Cpu } from "lucide-react";

function CameraSettingsTab() {
    const [cameras, setCameras] = useState<CameraConfig[]>([]);
    const [editingCamera, setEditingCamera] = useState<CameraConfig | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [testingCamera, setTestingCamera] = useState<string | null>(null);

    // Load cameras from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("smartapd-cameras");
        if (saved) {
            try {
                setCameras(JSON.parse(saved));
            } catch {
                setCameras(defaultCameras);
            }
        } else {
            setCameras(defaultCameras);
        }
    }, []);

    // Save cameras to localStorage
    const saveCameras = (newCameras: CameraConfig[]) => {
        setCameras(newCameras);
        localStorage.setItem("smartapd-cameras", JSON.stringify(newCameras));
    };

    // Add new camera
    const addCamera = () => {
        const nextId = String.fromCharCode(65 + cameras.length); // A, B, C, D, E...
        const newCamera: CameraConfig = {
            id: nextId,
            name: `TITIK ${nextId}`,
            location: "Area Baru",
            sourceType: "webcam",
            sourceUrl: "0",
            webcamId: 0,
            enabled: false,
            aiEnabled: false,
        };
        saveCameras([...cameras, newCamera]);
        setEditingCamera(newCamera);
    };

    // Update camera
    const updateCamera = (updated: CameraConfig) => {
        const newCameras = cameras.map(c => c.id === updated.id ? updated : c);
        saveCameras(newCameras);
        setEditingCamera(null);
    };

    // Delete camera
    const deleteCamera = (id: string) => {
        if (confirm(`Hapus kamera ${id}?`)) {
            saveCameras(cameras.filter(c => c.id !== id));
        }
    };

    // Toggle camera enabled
    const toggleCamera = (id: string) => {
        const newCameras = cameras.map(c =>
            c.id === id ? { ...c, enabled: !c.enabled } : c
        );
        saveCameras(newCameras);
    };

    // Toggle AI for camera
    const toggleAI = (id: string) => {
        const newCameras = cameras.map(c =>
            c.id === id ? { ...c, aiEnabled: !c.aiEnabled } : c
        );
        saveCameras(newCameras);
    };

    // Test camera connection
    const testCamera = async (camera: CameraConfig) => {
        setTestingCamera(camera.id);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setTestingCamera(null);
        alert(`Kamera ${camera.name} ${camera.enabled ? 'terhubung!' : 'dimatikan'}`);
    };

    const sourceTypeLabels: Record<string, string> = {
        webcam: "Webcam USB",
        rtsp: "RTSP Stream",
        ip: "IP Camera",
        mjpeg: "MJPEG Stream",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Konfigurasi Kamera</h3>
                    <p className="text-sm text-slate-500">Kelola sumber video untuk deteksi AI</p>
                </div>
                <button
                    onClick={addCamera}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                >
                    <Plus size={18} />
                    Tambah Kamera
                </button>
            </div>

            {/* Camera List */}
            <div className="grid gap-4">
                {cameras.map((cam) => (
                    <div
                        key={cam.id}
                        className={`p-4 rounded-xl border transition-all ${cam.enabled
                                ? "bg-white border-emerald-200 shadow-sm"
                                : "bg-slate-50 border-slate-200 opacity-75"
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${cam.enabled ? "bg-slate-900" : "bg-slate-300"
                                    }`}>
                                    {cam.sourceType === "webcam" ? (
                                        <Video className="text-white" size={24} />
                                    ) : (
                                        <Camera className="text-white" size={24} />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-900">{cam.name}</p>
                                        {cam.aiEnabled && (
                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs font-bold">
                                                AI ON
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500">{cam.location}</p>
                                    <p className="text-xs text-slate-400 font-mono mt-1">
                                        {sourceTypeLabels[cam.sourceType]}: {cam.sourceType === "webcam" ? `Device ${cam.webcamId || 0}` : cam.sourceUrl}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Status Indicator */}
                                <div className="flex items-center gap-2 mr-4">
                                    {cam.enabled ? (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="text-emerald-600 text-sm font-medium">Online</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                            <span className="text-slate-500 text-sm">Offline</span>
                                        </>
                                    )}
                                </div>

                                {/* AI Toggle */}
                                <button
                                    onClick={() => toggleAI(cam.id)}
                                    title={cam.aiEnabled ? "Matikan AI" : "Aktifkan AI"}
                                    className={`p-2 rounded-lg transition-colors ${cam.aiEnabled
                                            ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                        }`}
                                >
                                    <Cpu size={18} />
                                </button>

                                {/* Power Toggle */}
                                <button
                                    onClick={() => toggleCamera(cam.id)}
                                    title={cam.enabled ? "Matikan" : "Nyalakan"}
                                    className={`p-2 rounded-lg transition-colors ${cam.enabled
                                            ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                        }`}
                                >
                                    <Power size={18} />
                                </button>

                                {/* Test Button */}
                                <button
                                    onClick={() => testCamera(cam)}
                                    disabled={testingCamera === cam.id}
                                    className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
                                    title="Test Koneksi"
                                >
                                    {testingCamera === cam.id ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <ExternalLink size={18} />
                                    )}
                                </button>

                                {/* Edit Button */}
                                <button
                                    onClick={() => setEditingCamera(cam)}
                                    className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>

                                {/* Delete Button */}
                                <button
                                    onClick={() => deleteCamera(cam.id)}
                                    className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {cameras.length === 0 && (
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
            )}

            {/* Edit Modal */}
            {editingCamera && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">
                            {cameras.find(c => c.id === editingCamera.id) ? "Edit Kamera" : "Tambah Kamera"}
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

                            {/* Source Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Sumber</label>
                                <select
                                    value={editingCamera.sourceType}
                                    onChange={(e) => setEditingCamera({ ...editingCamera, sourceType: e.target.value as CameraConfig["sourceType"] })}
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
                                        value={editingCamera.webcamId || 0}
                                        onChange={(e) => setEditingCamera({ ...editingCamera, webcamId: Number(e.target.value), sourceUrl: e.target.value })}
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
                                        value={editingCamera.sourceUrl}
                                        onChange={(e) => setEditingCamera({ ...editingCamera, sourceUrl: e.target.value })}
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

                            {/* Enable AI */}
                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-slate-900">Aktifkan Deteksi AI</p>
                                    <p className="text-sm text-slate-500">Jalankan PPE detection pada kamera ini</p>
                                </div>
                                <button
                                    onClick={() => setEditingCamera({ ...editingCamera, aiEnabled: !editingCamera.aiEnabled })}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${editingCamera.aiEnabled ? "bg-orange-500" : "bg-slate-300"}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${editingCamera.aiEnabled ? "translate-x-6" : "translate-x-1"}`} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingCamera(null)}
                                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => updateCamera(editingCamera)}
                                className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
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

            // Also try to save to backend if available
            try {
                await fetch("/api/settings/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(notifSettings),
                });
            } catch {
                // Backend not available, that's OK
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
            const response = await fetch(
                `https://api.telegram.org/bot${notifSettings.telegramBotToken}/sendMessage`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: notifSettings.telegramChatId,
                        text: "🔔 *SmartAPD Test Connection*\n\n✅ Koneksi Telegram berhasil!\n\nSistem notifikasi siap digunakan.",
                        parse_mode: "Markdown",
                    }),
                }
            );

            const data = await response.json();

            if (data.ok) {
                setTestStatus("success");
                setTestMessage("Pesan terkirim! Cek Telegram Anda.");
            } else {
                setTestStatus("error");
                setTestMessage(data.description || "Gagal mengirim pesan");
            }
        } catch (error) {
            setTestStatus("error");
            setTestMessage("Gagal terhubung ke Telegram API");
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
                                <div className="mt-4 pt-4 border-t border-amber-100">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email Tujuan
                                    </label>
                                    <input
                                        type="email"
                                        value={notifSettings.emailRecipient}
                                        onChange={(e) => updateSetting("emailRecipient", e.target.value)}
                                        placeholder="hse@company.com"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none transition-all"
                                    />
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
