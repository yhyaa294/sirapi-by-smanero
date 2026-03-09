"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    User, Mail, Shield, Key, LogOut, Camera, Bell, Save,
    Activity, Calendar, Clock, Building2, Phone, MapPin,
    CheckCircle, AlertTriangle, Settings, RefreshCw, FileText, Download
} from "lucide-react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface UserProfile {
    name: string;
    email: string;
    role: string;
    department: string;
    phone: string;
    location: string;
    joinDate: string;
    lastActive: string;
}

interface ActivityLog {
    id: number;
    action: string;
    resource: string;
    created_at: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [profile, setProfile] = useState<UserProfile>({
        name: "Administrator",
        email: "admin@sirapi.id",
        role: "HSE Supervisor",
        department: "Keselamatan & Kesehatan Kerja",
        phone: "+62 812 3456 7890",
        location: "Mojoagung, Jombang",
        joinDate: "1 Januari 2024",
        lastActive: "Hari ini",
    });

    const [notifications, setNotifications] = useState([
        { id: 1, label: "Notifikasi pelanggaran APD", desc: "Terima alert saat ada deteksi pelanggaran", enabled: true },
        { id: 2, label: "Laporan harian via email", desc: "Kirim ringkasan harian ke email", enabled: false },
        { id: 3, label: "Alert kritis ke Telegram", desc: "Kirim notifikasi darurat via bot Telegram", enabled: true },
        { id: 4, label: "Notifikasi sistem", desc: "Update status kamera dan server", enabled: true },
    ]);

    useEffect(() => {
        const saved = localStorage.getItem("sirapi-profile");
        if (saved) {
            try { setProfile(JSON.parse(saved)); } catch { }
        }
    }, []);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await fetch(`${API_BASE}/security/audit-log?limit=10`);
                if (res.ok) {
                    const data = await res.json();
                    setActivities(data.data || []);
                }
            } catch (e) {
                console.error('Failed to fetch activities:', e);
            }
            setLoadingActivities(false);
        };
        fetchActivities();
    }, []);

    const handleLogout = () => {
        document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("sirapi-profile");
        router.push("/login");
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        localStorage.setItem("sirapi-profile", JSON.stringify(profile));
        setIsSaving(false);
        setIsEditing(false);
    };

    const toggleNotification = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'login': return { icon: Key, color: 'blue' };
            case 'logout': return { icon: LogOut, color: 'slate' };
            case 'create': return { icon: CheckCircle, color: 'emerald' };
            case 'update': return { icon: Settings, color: 'orange' };
            case 'delete': return { icon: AlertTriangle, color: 'red' };
            default: return { icon: Activity, color: 'blue' };
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return `Hari ini, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
        if (days === 1) return `Kemarin, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatAction = (log: ActivityLog) => {
        const actions: Record<string, string> = {
            login: 'Login ke sistem',
            logout: 'Logout dari sistem',
            create: `Membuat ${log.resource}`,
            update: `Mengubah ${log.resource}`,
            delete: `Menghapus ${log.resource}`,
        };
        return actions[log.action] || `${log.action} ${log.resource}`;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Profil Akun</h1>
                    <p className="text-slate-500">Kelola informasi akun dan keamanan Anda</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium">
                    <LogOut size={18} /> Keluar
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                            {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-full shadow-lg border border-slate-200 transition-colors">
                            <Camera size={16} />
                        </button>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                        <p className="text-slate-500">{profile.email}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1"><Shield size={12} />{profile.role}</span>
                            <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1"><Key size={12} />Admin Access</span>
                            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1"><Activity size={12} />Online</span>
                        </div>
                    </div>
                    <button onClick={() => setIsEditing(!isEditing)} className={`px-4 py-2.5 rounded-xl transition-colors font-medium ${isEditing ? "bg-red-100 hover:bg-red-200 text-red-600" : "bg-orange-100 hover:bg-orange-200 text-orange-600"}`}>
                        {isEditing ? "Batal" : "Edit Profil"}
                    </button>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2"><User size={14} />Nama Lengkap</label><input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:opacity-60 transition-all" /></div>
                    <div><label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2"><Mail size={14} />Email</label><input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:opacity-60 transition-all" /></div>
                    <div><label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2"><Phone size={14} />Nomor Telepon</label><input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:opacity-60 transition-all" /></div>
                    <div><label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2"><Building2 size={14} />Departemen</label><input type="text" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:opacity-60 transition-all" /></div>
                    <div><label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2"><MapPin size={14} />Lokasi</label><input type="text" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} disabled={!isEditing} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:opacity-60 transition-all" /></div>
                    <div><label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2"><Key size={14} />Password</label><button disabled={!isEditing} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:hover:bg-slate-50">•••••••• (Klik untuk ubah)</button></div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-xl"><Calendar size={18} className="mx-auto text-slate-400 mb-1" /><p className="text-xs text-slate-500">Bergabung</p><p className="text-sm font-bold text-slate-900">{profile.joinDate}</p></div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl"><Clock size={18} className="mx-auto text-emerald-500 mb-1" /><p className="text-xs text-slate-500">Terakhir Aktif</p><p className="text-sm font-bold text-emerald-600">{profile.lastActive}</p></div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl"><CheckCircle size={18} className="mx-auto text-blue-500 mb-1" /><p className="text-xs text-slate-500">Total Login</p><p className="text-sm font-bold text-slate-900">{activities.filter(a => a.action === 'login').length || '-'}</p></div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl"><AlertTriangle size={18} className="mx-auto text-orange-500 mb-1" /><p className="text-xs text-slate-500">Alert Ditangani</p><p className="text-sm font-bold text-slate-900">{activities.filter(a => a.resource === 'detection').length || '-'}</p></div>
                </div>

                {isEditing && (
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg transition-colors disabled:opacity-70">
                            {isSaving ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Menyimpan...</>) : (<><Save size={18} />Simpan Perubahan</>)}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Bell size={20} className="text-orange-500" />Pengaturan Notifikasi</h3>
                    <Link href="/dashboard/settings" className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium"><Settings size={14} />Pengaturan Lanjutan</Link>
                </div>
                <div className="space-y-3">
                    {notifications.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                            <div><p className="font-medium text-slate-900">{item.label}</p><p className="text-sm text-slate-500">{item.desc}</p></div>
                            <button onClick={() => toggleNotification(item.id)} className={`relative w-12 h-7 rounded-full transition-colors ${item.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><Activity size={20} className="text-blue-500" />Aktivitas Terbaru</h3>
                <div className="space-y-3">
                    {loadingActivities ? (
                        <div className="flex items-center justify-center py-8 text-slate-500"><RefreshCw size={20} className="animate-spin mr-2" />Memuat aktivitas...</div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">Belum ada aktivitas tercatat</div>
                    ) : (
                        activities.slice(0, 5).map((log) => {
                            const { icon: Icon, color } = getActionIcon(log.action);
                            return (
                                <div key={log.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className={`p-2 rounded-lg bg-${color}-100`}><Icon size={16} className={`text-${color}-600`} /></div>
                                    <div className="flex-1"><p className="text-sm font-medium text-slate-900">{formatAction(log)}</p><p className="text-xs text-slate-500">{formatTime(log.created_at)}</p></div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
