"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Mail, Shield, Key, LogOut, Camera, Bell, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const handleLogout = () => {
        // Clear auth cookie
        document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push("/login");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Profil Akun</h1>
                    <p className="text-slate-500">Kelola informasi akun dan keamanan Anda</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium"
                >
                    <LogOut size={18} />
                    Keluar
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-6">

                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            AD
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-colors">
                            <Camera size={14} />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900">Administrator</h2>
                        <p className="text-slate-500">admin@smartapd.id</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                HSE Supervisor
                            </span>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                Admin Access
                            </span>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
                    >
                        {isEditing ? "Batal" : "Edit Profil"}
                    </button>
                </div>

                {/* Form */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <User size={14} className="inline mr-2" />
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            defaultValue="Administrator"
                            disabled={!isEditing}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-60"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Mail size={14} className="inline mr-2" />
                            Email
                        </label>
                        <input
                            type="email"
                            defaultValue="admin@smartapd.id"
                            disabled={!isEditing}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-60"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Shield size={14} className="inline mr-2" />
                            Role
                        </label>
                        <input
                            type="text"
                            defaultValue="HSE Supervisor"
                            disabled
                            className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl opacity-60"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Key size={14} className="inline mr-2" />
                            Password
                        </label>
                        <button className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-slate-500 hover:bg-slate-100 transition-colors">
                            ••••••••  (Klik untuk ubah)
                        </button>
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-6 flex justify-end">
                        <button className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg transition-colors">
                            <Save size={18} />
                            Simpan Perubahan
                        </button>
                    </div>
                )}
            </div>

            {/* Notification Settings */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Bell size={20} className="text-orange-500" />
                    Pengaturan Notifikasi
                </h3>

                <div className="space-y-4">
                    {[
                        { label: "Notifikasi pelanggaran APD", desc: "Terima alert saat ada deteksi pelanggaran", enabled: true },
                        { label: "Laporan harian via email", desc: "Kirim ringkasan harian ke email", enabled: false },
                        { label: "Alert kritis ke Telegram", desc: "Kirim notifikasi darurat via bot Telegram", enabled: true },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="font-medium text-slate-900">{item.label}</p>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                            <button className={`w-12 h-7 rounded-full transition-colors ${item.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
