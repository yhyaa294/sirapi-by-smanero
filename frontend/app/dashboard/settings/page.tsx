"use client";

import { useState } from "react";
import { Settings, Camera, Bell, Shield, Database, Wifi, Save, RefreshCw } from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("camera");

    const tabs = [
        { id: "camera", label: "Kamera", icon: Camera },
        { id: "notification", label: "Notifikasi", icon: Bell },
        { id: "security", label: "Keamanan", icon: Shield },
        { id: "system", label: "Sistem", icon: Database },
    ];

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <Settings className="text-orange-500" />
                    Pengaturan Sistem
                </h1>
                <p className="text-slate-500">Konfigurasi kamera, notifikasi, dan sistem</p>
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

                {activeTab === "camera" && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-900">Konfigurasi Kamera</h3>

                        {/* Camera List */}
                        <div className="grid gap-4">
                            {["TITIK A", "TITIK B", "TITIK C", "TITIK D"].map((cam, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                                            <Camera className="text-white" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{cam}</p>
                                            <p className="text-sm text-slate-500 font-mono">rtsp://192.168.1.10{i + 1}:554/stream</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-emerald-600 text-sm font-medium">Connected</span>
                                        <button className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium transition-colors">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-orange-500 hover:text-orange-500 transition-colors w-full justify-center">
                            + Tambah Kamera Baru
                        </button>
                    </div>
                )}

                {activeTab === "notification" && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-900">Pengaturan Notifikasi</h3>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Telegram Bot Token</label>
                                <input
                                    type="text"
                                    placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-sm"
                                />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Telegram Chat ID</label>
                                <input
                                    type="text"
                                    placeholder="-1001234567890"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-sm"
                                />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email untuk Laporan</label>
                                <input
                                    type="email"
                                    placeholder="hse@company.com"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
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
                                <button className="w-12 h-7 rounded-full bg-slate-300">
                                    <div className="w-5 h-5 bg-white rounded-full shadow translate-x-1"></div>
                                </button>
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
                                <p className="text-lg font-bold text-slate-900 font-mono">PostgreSQL</p>
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
                <div className="mt-8 flex justify-end">
                    <button className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg transition-colors">
                        <Save size={18} />
                        Simpan Pengaturan
                    </button>
                </div>
            </div>

        </div>
    );
}
