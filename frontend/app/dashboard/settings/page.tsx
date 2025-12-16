"use client";

import { useState } from "react";
import { Save, Server, Shield, User, Bell, Cpu, Check, Loader2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  
  // --- STATE FOR FORM INPUTS ---
  
  // 3. AI Config State
  const [confidence, setConfidence] = useState(75);
  const [scanInterval, setScanInterval] = useState(2);
  const [aiFeatures, setAiFeatures] = useState({
    helmet: true,
    vest: true,
    gloves: false,
    glasses: false
  });
  
  // 2. Notification State
  const [notifSettings, setNotifSettings] = useState({
    realtime: true,
    dailyEmail: true
  });
  const [adminPhone, setAdminPhone] = useState("6281234567890");

  // Handle Save
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        setIsSaving(false);
        alert("Pengaturan Berhasil Disimpan!");
    }, 1000);
  };

  // Toggle Checkbox Helper
  const toggleAiFeature = (key: keyof typeof aiFeatures) => {
    setAiFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pusat Pengaturan</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Kelola konfigurasi sistem, sensitivitas AI, dan keamanan akun.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* 1. INTERACTIVE TABS (KIRI) */}
         <div className="lg:col-span-3 space-y-2">
            {[
               { id: 'general', name: 'Umum', icon: Server },
               { id: 'notifications', name: 'Notifikasi', icon: Bell },
               { id: 'ai_config', name: 'Konfigurasi AI', icon: Cpu },
               { id: 'security', name: 'Akun & Keamanan', icon: Shield },
            ].map((item) => (
               <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                     activeTab === item.id 
                     ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20 translate-x-1' 
                     : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
               >
                  <item.icon size={18} className={activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-300"} />
                  {item.name}
               </button>
            ))}
         </div>

         {/* 2. KONTEN DINAMIS (KANAN) */}
         <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-xl p-8 shadow-lg dark:shadow-2xl relative overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                {activeTab === 'general' && <Server size={200} />}
                {activeTab === 'notifications' && <Bell size={200} />}
                {activeTab === 'ai_config' && <Cpu size={200} />}
                {activeTab === 'security' && <Shield size={200} />}
            </div>

            {/* --- TAB 1: UMUM --- */}
            {activeTab === 'general' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="border-b border-slate-800 pb-4">
                        <h2 className="text-xl font-bold text-white">Pengaturan Umum</h2>
                        <p className="text-slate-500 text-sm mt-1">Identitas dasar sistem dan preferensi lokal.</p>
                    </div>
                    
                    <div className="space-y-6 max-w-2xl">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Sistem</label>
                            <input type="text" defaultValue="SmartAPD Enterprise" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zona Waktu</label>
                                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none appearance-none cursor-pointer hover:border-slate-600 transition-colors">
                                    <option>WIB (Jakarta, GMT+7)</option>
                                    <option>WITA (Makassar, GMT+8)</option>
                                    <option>WIT (Jayapura, GMT+9)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bahasa Sistem</label>
                                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none appearance-none cursor-pointer hover:border-slate-600 transition-colors">
                                    <option>Bahasa Indonesia</option>
                                    <option>English (US)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 2: NOTIFIKASI --- */}
            {activeTab === 'notifications' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="border-b border-slate-800 pb-4">
                        <h2 className="text-xl font-bold text-white">Preferensi Notifikasi</h2>
                        <p className="text-slate-500 text-sm mt-1">Atur bagaimana dan kapan Anda menerima peringatan bahaya.</p>
                    </div>

                    <div className="space-y-6 max-w-2xl">
                        {/* Toggle 1 */}
                        <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-slate-200">Alert Real-time (Telegram/WA)</h3>
                                <p className="text-xs text-slate-500 mt-1">Kirim pesan instan saat pelanggaran terdeteksi.</p>
                            </div>
                            <button 
                                onClick={() => toggleNotif('realtime')}
                                className={`w-14 h-7 rounded-full transition-colors relative ${notifSettings.realtime ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${notifSettings.realtime ? 'left-8' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Toggle 2 */}
                        <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-slate-200">Laporan Rekap Harian</h3>
                                <p className="text-xs text-slate-500 mt-1">Kirim ringkasan PDF ke email setiap pukul 17:00.</p>
                            </div>
                            <button 
                                onClick={() => toggleNotif('dailyEmail')}
                                className={`w-14 h-7 rounded-full transition-colors relative ${notifSettings.dailyEmail ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${notifSettings.dailyEmail ? 'left-8' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="space-y-2 pt-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nomor WhatsApp Admin (Target Alert)</label>
                            <input 
                                type="text" 
                                value={adminPhone} 
                                onChange={(e) => setAdminPhone(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none font-mono" 
                            />
                            <p className="text-xs text-slate-500">Gunakan kode negara (contoh: 628...).</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 3: KONFIGURASI AI (CORE FEATURE) --- */}
            {activeTab === 'ai_config' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Cpu className="text-orange-500" />
                                Penyesuaian Model AI
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">Kalibrasi sensitivitas deteksi agar sesuai dengan kondisi lapangan.</p>
                        </div>
                        <div className="hidden md:block px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-400 font-mono">
                            MODEL: YOLOv8-Safety (v2.4)
                        </div>
                    </div>

                    <div className="space-y-8 max-w-3xl">
                        
                        {/* SLIDER 1: CONFIDENCE */}
                        <div className="bg-slate-950/30 p-6 rounded-xl border border-slate-800">
                            <div className="flex justify-between mb-4">
                                <label className="font-bold text-slate-300">AI Confidence Threshold</label>
                                <span className="text-orange-500 font-bold font-mono">{confidence}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="50" 
                                max="95" 
                                value={confidence} 
                                onChange={(e) => setConfidence(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <p className="text-xs text-slate-500 mt-3 flex items-start gap-2">
                                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                Semakin tinggi nilainya, AI semakin &quot;pilih-pilih&quot; (jarang salah deteksi, tapi mungkin melewatkan pelanggaran samar). Rekomendasi: 70-80%.
                            </p>
                        </div>

                         {/* SLIDER 2: INTERVAL */}
                         <div className="bg-slate-950/30 p-6 rounded-xl border border-slate-800">
                            <div className="flex justify-between mb-4">
                                <label className="font-bold text-slate-300">Interval Deteksi (Scanning)</label>
                                <span className="text-emerald-500 font-bold font-mono">{scanInterval} detik</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.5" 
                                max="5" 
                                step="0.5"
                                value={scanInterval} 
                                onChange={(e) => setScanInterval(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <p className="text-xs text-slate-500 mt-3">
                                Interval cepat (0.5s) membutuhkan performa server tinggi. Interval lambat (2s+) lebih hemat resource.
                            </p>
                        </div>

                        {/* CHECKBOXES: DETEKSI OBJEK */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Objek yang Wajib Dideteksi</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div 
                                    onClick={() => toggleAiFeature('helmet')}
                                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${aiFeatures.helmet ? 'bg-slate-800 border-orange-500' : 'bg-slate-950 border-slate-800 opacity-70 hover:opacity-100'}`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${aiFeatures.helmet ? 'bg-orange-500 border-orange-500 text-black' : 'border-slate-600'}`}>
                                        {aiFeatures.helmet && <Check size={14} strokeWidth={3} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Helm Safety</h4>
                                        <p className="text-xs text-slate-400">Wajib di semua zona.</p>
                                    </div>
                                </div>

                                <div 
                                    onClick={() => toggleAiFeature('vest')}
                                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${aiFeatures.vest ? 'bg-slate-800 border-orange-500' : 'bg-slate-950 border-slate-800 opacity-70 hover:opacity-100'}`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${aiFeatures.vest ? 'bg-orange-500 border-orange-500 text-black' : 'border-slate-600'}`}>
                                        {aiFeatures.vest && <Check size={14} strokeWidth={3} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Rompi Reflektor</h4>
                                        <p className="text-xs text-slate-400">High-visibility vest.</p>
                                    </div>
                                </div>

                                <div 
                                    onClick={() => toggleAiFeature('gloves')}
                                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${aiFeatures.gloves ? 'bg-slate-800 border-orange-500' : 'bg-slate-950 border-slate-800 opacity-70 hover:opacity-100'}`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${aiFeatures.gloves ? 'bg-orange-500 border-orange-500 text-black' : 'border-slate-600'}`}>
                                        {aiFeatures.gloves && <Check size={14} strokeWidth={3} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Sarung Tangan</h4>
                                        <p className="text-xs text-slate-400">Opsional (Area Kimia).</p>
                                    </div>
                                </div>

                                <div 
                                    onClick={() => toggleAiFeature('glasses')}
                                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${aiFeatures.glasses ? 'bg-slate-800 border-orange-500' : 'bg-slate-950 border-slate-800 opacity-70 hover:opacity-100'}`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${aiFeatures.glasses ? 'bg-orange-500 border-orange-500 text-black' : 'border-slate-600'}`}>
                                        {aiFeatures.glasses && <Check size={14} strokeWidth={3} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Kacamata Pelindung</h4>
                                        <p className="text-xs text-slate-400">Opsional (Las/Gerinda).</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 4: KEAMANAN --- */}
            {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="border-b border-slate-800 pb-4">
                        <h2 className="text-xl font-bold text-white">Keamanan Akun</h2>
                        <p className="text-slate-500 text-sm mt-1">Update kredensial akses administrator.</p>
                    </div>

                    <div className="space-y-6 max-w-md">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password Lama</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password Baru</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Konfirmasi Password Baru</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                        </div>

                        <button className="w-full py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 border border-slate-600 transition-colors mt-4">
                            Update Password
                        </button>
                    </div>
                </div>
            )}

            {/* --- FOOTER: SAVE ACTION --- */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex justify-end z-20 mt-8">
                 <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-lg hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                 >
                     {isSaving ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Menyimpan...
                        </>
                     ) : (
                        <>
                            <Save size={18} />
                            Simpan Perubahan
                        </>
                     )}
                  </button>
            </div>

         </div>
      </div>
    </div>
  );
}
