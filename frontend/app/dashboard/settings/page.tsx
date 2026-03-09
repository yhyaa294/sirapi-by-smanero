"use client";

import { useState } from "react";
import {
    Settings,
    Building,
    Link2,
    Brain,
    Bell,
    Save,
    Check,
    Loader2,
    Camera,
    MessageSquare,
    Wifi,
    Clock,
    Users,
    Shield,
    GraduationCap,
    Eye,
    Footprints,
    Shirt,
    CalendarDays
} from "lucide-react";

// Tab Configuration
const TABS = [
    { id: "umum", label: "Umum", icon: Building },
    { id: "integrasi", label: "Integrasi", icon: Link2 },
    { id: "ai", label: "Konfigurasi AI", icon: Brain },
    { id: "notifikasi", label: "Notifikasi", icon: Bell },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("umum");
    const [isSaving, setIsSaving] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionSuccess, setConnectionSuccess] = useState(false);

    // Form States
    const [schoolName, setSchoolName] = useState("SMAN Ngoro Jombang");
    const [jamMasuk, setJamMasuk] = useState("07:00");
    const [jamPulang, setJamPulang] = useState("15:00");
    const [maxViolation, setMaxViolation] = useState("3");
    const [activeDays, setActiveDays] = useState<Record<string, boolean>>({
        senin: true,
        selasa: true,
        rabu: true,
        kamis: true,
        jumat: true,
        sabtu: false,
        minggu: false,
    });

    const [botToken, setBotToken] = useState("••••••••••••••••");
    const [chatId, setChatId] = useState("-1001234567890");
    const [rtspUrl, setRtspUrl] = useState("rtsp://192.168.1.100:554/stream1");

    const [sensitivity, setSensitivity] = useState(75);
    const [detectTie, setDetectTie] = useState(true);
    const [detectBelt, setDetectBelt] = useState(true);
    const [detectShoes, setDetectShoes] = useState(true);
    const [detectHat, setDetectHat] = useState(true);

    const [dailyReport, setDailyReport] = useState(true);
    const [realtimeAlert, setRealtimeAlert] = useState(true);

    const handleTestConnection = () => {
        setTestingConnection(true);
        setConnectionSuccess(false);
        setTimeout(() => {
            setTestingConnection(false);
            setConnectionSuccess(true);
            setTimeout(() => setConnectionSuccess(false), 3000);
        }, 2000);
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <div className="max-w-[1400px] mx-auto pb-10">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner">
                            <Settings size={22} className="text-primary" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                            Pengaturan Sistem
                        </h1>
                    </div>
                    <p className="text-slate-500 mt-1 text-sm font-medium ml-14">
                        Konfigurasi integrasi, AI detection, dan notifikasi
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </header>

            {/* Main Content: Sidebar Tabs + Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Sidebar Tabs */}
                <div className="lg:col-span-1">
                    <nav className="glass-card p-3 space-y-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all text-sm font-bold ${activeTab === tab.id
                                    ? "bg-primary text-white shadow-md relative overflow-hidden"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                    }`}
                            >
                                {activeTab === tab.id && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                                )}
                                <tab.icon size={20} className={`relative z-10 ${activeTab === tab.id ? "text-white" : "text-slate-400"}`} />
                                <span className="relative z-10 tracking-wide">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="lg:col-span-3 glass-card p-8">

                    {/* TAB 1: UMUM */}
                    {activeTab === "umum" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-1 tracking-wide">Profil Sekolah</h2>
                                <p className="text-sm font-medium text-slate-500">Informasi dasar tentang institusi Anda</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Sekolah</label>
                                    <input
                                        type="text"
                                        value={schoolName}
                                        onChange={(e) => setSchoolName(e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kuota Pelanggaran Maksimal</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={maxViolation}
                                            onChange={(e) => setMaxViolation(e.target.value)}
                                            className="w-full px-5 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white/50 outline-none"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">x Peringatan</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        <Clock size={14} className="text-primary" />
                                        Jam Masuk
                                    </label>
                                    <input
                                        type="time"
                                        value={jamMasuk}
                                        onChange={(e) => setJamMasuk(e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        <Clock size={14} className="text-primary" />
                                        Jam Pulang
                                    </label>
                                    <input
                                        type="time"
                                        value={jamPulang}
                                        onChange={(e) => setJamPulang(e.target.value)}
                                        className="w-full px-5 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white/50 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Hari Aktif Sekolah Section */}
                            <div className="pt-8 border-t border-slate-200/50 mt-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <CalendarDays size={20} className="text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 tracking-wide">Hari Aktif Sekolah</h2>
                                </div>
                                <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed max-w-2xl">Pilih hari kerja aktif untuk institusi Anda. Pemantauan AI dan peringatan pelanggaran tata tertib hanya akan diaktifkan pada hari-hari yang dipilih.</p>

                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { key: 'senin', label: 'Senin' },
                                        { key: 'selasa', label: 'Selasa' },
                                        { key: 'rabu', label: 'Rabu' },
                                        { key: 'kamis', label: 'Kamis' },
                                        { key: 'jumat', label: 'Jumat' },
                                        { key: 'sabtu', label: 'Sabtu' },
                                        { key: 'minggu', label: 'Minggu' },
                                    ].map((day) => (
                                        <button
                                            key={day.key}
                                            onClick={() => setActiveDays(prev => ({ ...prev, [day.key]: !prev[day.key] }))}
                                            className={`px-5 py-3 rounded-xl text-sm font-bold transition-all border-2 flex items-center gap-2 ${activeDays[day.key]
                                                ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                                                : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${activeDays[day.key] ? 'border-primary bg-primary' : 'border-slate-300 bg-white'}`}>
                                                {activeDays[day.key] && <Check size={10} className="text-white" />}
                                            </div>
                                            {day.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200/50 flex items-start gap-3">
                                    <div className="text-xl">💡</div>
                                    <p className="text-sm font-medium text-amber-800 leading-relaxed">
                                        <b>Tip Konfigurasi:</b> Sesuaikan dengan jadwal khusus sekolah Anda. Jika sekolah menerapkan sistem 5 hari kerja (Senin-Jumat), pastikan Sabtu dan Minggu dinonaktifkan untuk menghindari laporan kosong.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: INTEGRASI */}
                    {activeTab === "integrasi" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Connection Status Banner */}
                            <div className="p-5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                                {/* Decorative Glow */}
                                <div className="absolute top-1/2 left-0 w-32 h-32 bg-emerald-400/10 blur-2xl rounded-full -translate-y-1/2 pointer-events-none"></div>

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shadow-inner border border-emerald-200">
                                        <Check size={24} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900 tracking-wide">Status Integrasi: Aktif</p>
                                        <p className="text-xs font-medium text-emerald-700 mt-1">Terhubung sebagai <span className="font-mono bg-emerald-200/50 px-1.5 py-0.5 rounded text-emerald-800 font-bold ml-1">@SiRapiBot</span></p>
                                    </div>
                                </div>
                                <span className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 relative z-10">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    Sistem Online
                                </span>
                            </div>

                            {/* Telegram Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500 border border-blue-100">
                                            <MessageSquare size={20} />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-800 tracking-wide">Telegram Notification Bot</h2>
                                    </div>
                                    <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:text-blue-700 hover:underline px-3 py-1.5 bg-primary/5 rounded-lg transition-colors border border-primary/10">
                                        Panduan Setup →
                                    </a>
                                </div>

                                <div className="space-y-5 p-6 bg-slate-50/50 rounded-2xl border border-slate-200">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bot API Token</label>
                                        <div className="relative">
                                            <input
                                                type={botToken === "••••••••••••••••" ? "password" : "text"}
                                                value={botToken}
                                                onChange={(e) => setBotToken(e.target.value)}
                                                className="w-full px-5 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white outline-none pr-12 shadow-sm"
                                                placeholder="123456789:ABC-DEF..."
                                            />
                                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-1.5 rounded-md">
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                        <p className="text-xs font-medium text-slate-400 mt-2 ml-1">Kredensial unik dari @BotFather untuk identifikasi bot.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Chat ID (Grup/Personal)</label>
                                        <input
                                            type="text"
                                            value={chatId}
                                            onChange={(e) => setChatId(e.target.value)}
                                            className="w-full px-5 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white outline-none shadow-sm"
                                            placeholder="-1001234567890"
                                        />
                                        <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline mt-2 inline-flex items-center gap-1 ml-1">
                                            <span className="text-base">🔍</span> Cara mendapatkan Chat ID
                                        </a>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-200/50 mt-2">
                                        <button
                                            onClick={handleTestConnection}
                                            disabled={testingConnection}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm disabled:opacity-50 shadow-sm hover:shadow-md"
                                        >
                                            {testingConnection ? <Loader2 size={18} className="animate-spin" /> : <Wifi size={18} />}
                                            {testingConnection ? "Menghubungi API..." : "Test Notifikasi"}
                                        </button>
                                        {connectionSuccess && (
                                            <span className="text-safe text-sm font-bold flex items-center gap-1.5 bg-safe/10 px-3 py-1.5 rounded-lg border border-safe/20 animate-in fade-in slide-in-from-left-4">
                                                <div className="w-5 h-5 bg-safe rounded-full flex items-center justify-center">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                                Pesan berhasil terkirim!
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Notification Triggers */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-50 rounded-lg text-amber-500 border border-amber-100">
                                        <Bell size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 tracking-wide">Pemicu Notifikasi</h2>
                                </div>

                                <div className="space-y-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-200">
                                    <label className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-primary/40 hover:shadow-soft transition-all group">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">Pelanggaran Atribut Berat</p>
                                            <p className="text-xs font-medium text-slate-500 mt-1">Kirim peringatan instan saat siswa terdeteksi tidak memakai atribut wajib (Sepatu/Dasi/Sabuk).</p>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-primary/40 hover:shadow-soft transition-all group">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">Rekapitulasi Laporan Harian (PDF)</p>
                                            <p className="text-xs font-medium text-slate-500 mt-1">Kirim file PDF berisi rekap data pelanggaran secara otomatis setiap pukul 16:00 WIB.</p>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-primary/40 hover:shadow-soft transition-all group">
                                        <input type="checkbox" className="w-5 h-5 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">Peringatan Status CCTV (Offline Alert)</p>
                                            <p className="text-xs font-medium text-slate-500 mt-1">Sistem akan memberi tahu admin jika koneksi kamera (RTSP) terputus lebih dari 5 menit.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* CCTV Section */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600 border border-purple-100">
                                        <Camera size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 tracking-wide">Koneksi Stream CCTV</h2>
                                </div>

                                <div className="space-y-5 p-6 bg-slate-50/50 rounded-2xl border border-slate-200">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">RTSP URL (Alamat Kamera)</label>
                                        <input
                                            type="text"
                                            value={rtspUrl}
                                            onChange={(e) => setRtspUrl(e.target.value)}
                                            className="w-full px-5 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white shadow-sm outline-none"
                                            placeholder="rtsp://192.168.1.100:554/stream1"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                                        <span className="px-4 py-2 bg-safe/10 text-safe rounded-xl text-xs font-bold border border-safe/20 flex items-center justify-center gap-2 shadow-sm">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-safe"></span>
                                            </span>
                                            Kamera Online & Decoding
                                        </span>
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200">
                                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">Ping: 24ms</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">FPS: 30</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">1920x1080</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* TAB 3: KONFIGURASI AI */}
                    {activeTab === "ai" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-1 tracking-wide">Fine Tuning Model AI</h2>
                                <p className="text-sm font-medium text-slate-500">Sesuaikan parameter deteksi Computer Vision</p>
                            </div>

                            {/* Sensitivity Slider */}
                            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-200">
                                <label className="block text-sm font-bold text-slate-700 mb-6 flex items-center justify-between">
                                    <span className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shadow-sm">
                                            <Brain size={18} />
                                        </div>
                                        Tingkat Kepercayaan Deteksi (Confidence Threshold)
                                    </span>
                                    <span className="px-4 py-1.5 bg-primary font-mono text-white rounded-lg text-sm font-bold shadow-sm shadow-blue-200">{sensitivity}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sensitivity}
                                    onChange={(e) => setSensitivity(Number(e.target.value))}
                                    className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary hover:accent-blue-700 transition-all shadow-inner"
                                />
                                <div className="flex justify-between text-xs font-bold text-slate-400 mt-4 px-1">
                                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">Lebih Sensitif (Banyak False-Positive)</span>
                                    <span className="text-slate-300">Skor Optimal: 70-85%</span>
                                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">Lebih Akurat (Ketat)</span>
                                </div>
                            </div>

                            {/* Detection Toggles */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Filter Kelas Objek Aktif</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Toggle Item */}
                                    <ToggleItem
                                        icon={<Shirt size={20} className="text-blue-500" />}
                                        label="Klasifikasi Dasi"
                                        description="Deteksi penggunaan dasi seragam"
                                        checked={detectTie}
                                        onChange={() => setDetectTie(!detectTie)}
                                    />
                                    <ToggleItem
                                        icon={<Shield size={20} className="text-amber-500" />}
                                        label="Klasifikasi Sabuk"
                                        description="Deteksi penggunaan sabuk/gesper"
                                        checked={detectBelt}
                                        onChange={() => setDetectBelt(!detectBelt)}
                                    />
                                    <ToggleItem
                                        icon={<Footprints size={20} className="text-rose-500" />}
                                        label="Klasifikasi Sepatu"
                                        description="Deteksi warna/jenis sepatu"
                                        checked={detectShoes}
                                        onChange={() => setDetectShoes(!detectShoes)}
                                    />
                                    <ToggleItem
                                        icon={<GraduationCap size={20} className="text-emerald-500" />}
                                        label="Klasifikasi Topi"
                                        description="Dikhususkan untuk hari upacara"
                                        checked={detectHat}
                                        onChange={() => setDetectHat(!detectHat)}
                                    />
                                </div>
                                <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                                    <div className="text-xl">ℹ️</div>
                                    <p className="text-sm font-medium text-blue-800 leading-relaxed">
                                        Mematikan flag klasifikasi yang tidak dibutuhkan dapat mengurangi beban pemrosesan (inference time) dan meningkatkan stabilitas FPS kamera.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: NOTIFIKASI */}
                    {activeTab === "notifikasi" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-1 tracking-wide">Preferensi Pemberitahuan</h2>
                                <p className="text-sm font-medium text-slate-500">Atur jadwal dan metode pengiriman informasi pelanggaran</p>
                            </div>

                            <div className="space-y-4">
                                <ToggleItem
                                    icon={<Bell size={20} className="text-blue-500" />}
                                    label="Distribusi Laporan Harian Terjadwal (PDF)"
                                    description="Kirim ringkasan statistik dan daftar pelanggar ke grup Telegram manajemen sekolah setiap jam 16:00."
                                    checked={dailyReport}
                                    onChange={() => setDailyReport(!dailyReport)}
                                />
                                <ToggleItem
                                    icon={<MessageSquare size={20} className="text-rose-500" />}
                                    label="Sistem Peringatan Dini (Real-time Alerts)"
                                    description="Kirim notifikasi instan segera setelah kamera mendeteksi siswa yang melanggar atribut berat."
                                    checked={realtimeAlert}
                                    onChange={() => setRealtimeAlert(!realtimeAlert)}
                                />
                            </div>
                            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-sm font-medium text-slate-600 text-center">Lebih banyak opsi integrasi pengiriman (Email, WhatsApp) akan hadir pada pembaruan mendatang.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Toggle Component
function ToggleItem({ icon, label, description, checked, onChange }: { icon: React.ReactNode; label: string; description?: string; checked: boolean; onChange: () => void }) {
    return (
        <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 font-sans cursor-pointer group ${checked ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-soft'}`} onClick={onChange}>
            <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl transition-colors ${checked ? 'bg-white shadow-sm border border-primary/10' : 'bg-slate-50 border border-slate-100 group-hover:bg-slate-100'}`}>
                    {icon}
                </div>
                <div className="mt-0.5 pr-4">
                    <p className={`text-sm font-bold tracking-wide transition-colors ${checked ? 'text-slate-800' : 'text-slate-600 group-hover:text-slate-800'}`}>{label}</p>
                    {description && <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{description}</p>}
                </div>
            </div>
            <div
                className={`flex-shrink-0 relative w-14 h-7 rounded-full transition-colors duration-300 flex items-center px-1 border-2 ${checked ? 'bg-primary border-primary' : 'bg-slate-200 border-slate-200'}`}
            >
                <span className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'translate-x-7' : 'translate-x-0'}`} />
            </div>
        </div>
    );
}
