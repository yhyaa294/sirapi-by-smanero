"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import PushNotificationManager from "@/components/PushNotificationManager";
import InstallPrompt from "@/components/InstallPrompt";
import {
  BellRing,
  ShieldCheck,
  Smartphone,
  Settings,
  MessageSquare,
  Save,
  Globe,
  Languages,
  Clock,
} from "lucide-react";

const SettingsPanel = () => {
  const [autoRefresh, setAutoRefresh] = useState("10");
  const [language, setLanguage] = useState("id-ID");
  const [telegramEnabled, setTelegramEnabled] = useState(true);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-500" /> Pengaturan Sistem
          </h2>
          <p className="text-sm text-gray-600">
            Sesuaikan preferensi SmartAPD™ agar sesuai dengan kebutuhan operasional harian.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
          <Save className="h-4 w-4" /> Simpan Preferensi
        </button>
      </header>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-orange-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Preferensi Mobile</h3>
              <p className="text-sm text-gray-600">Atur refresh rate dan tampilan untuk mandor di lapangan.</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-gray-700">
            <span className="flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4" /> Interval Refresh (detik)
            </span>
            <select
              value={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="5">5 detik (Real-time)</option>
              <option value="10">10 detik (Seimbang)</option>
              <option value="30">30 detik (Hemat baterai)</option>
            </select>
            <span className="text-xs text-gray-500">
              Refresh 10 detik direkomendasikan untuk keseimbangan performa & baterai.
            </span>
          </label>

          <label className="flex flex-col gap-2 text-sm text-gray-700">
            <span className="flex items-center gap-2 font-semibold">
              <Languages className="h-4 w-4" /> Bahasa Interface
            </span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="id-ID">Bahasa Indonesia</option>
              <option value="en-US">English (Beta)</option>
            </select>
            <span className="text-xs text-gray-500">
              Bahasa Inggris masih eksperimen untuk kebutuhan presentasi internasional.
            </span>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <BellRing className="h-6 w-6 text-orange-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notifikasi & Peringatan</h3>
            <p className="text-sm text-gray-600">Kelola push notification, email, dan integrasi messaging.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <h4 className="flex items-center gap-2 font-semibold text-gray-800">
              <Settings className="h-4 w-4" /> Push Notification
            </h4>
            <p className="text-xs text-gray-500">Aktifkan agar mandor menerima alert real-time langsung di HP.</p>
            <PushNotificationManager />
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <h4 className="flex items-center gap-2 font-semibold text-gray-800">
              <MessageSquare className="h-4 w-4" /> Integrasi Telegram
            </h4>
            <p className="text-xs text-gray-500">Kirim ringkasan pelanggaran otomatis via bot Telegram.</p>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={(event) => setTelegramEnabled(event.target.checked)}
                className="h-4 w-4 rounded text-orange-500 focus:ring-orange-500"
              />
              Aktifkan broadcast Telegram @SmartAPD_Bot
            </label>
            {telegramEnabled && (
              <div className="flex flex-col gap-1 text-xs text-gray-500">
                <span>Token & Chat ID diambil dari `.env` backend.</span>
                <span>Authentication siap untuk escalation rules.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-green-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Instalasi & Akses</h3>
            <p className="text-sm text-gray-600">Pastikan SmartAPD tersedia saat offline dan mudah diakses.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <h4 className="flex items-center gap-2 font-semibold text-gray-800">
              <Smartphone className="h-4 w-4" /> Install Aplikasi
            </h4>
            <p className="text-xs text-gray-500">Tambahkan SmartAPD ke home screen agar terasa seperti aplikasi native.</p>
            <InstallPrompt showOnDesktop showOnMobile />
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <h4 className="flex items-center gap-2 font-semibold text-gray-800">
              <Globe className="h-4 w-4" /> Pilihan Server
            </h4>
            <p className="text-xs text-gray-500">Gunakan domain produksi agar mandor di lapangan tidak tergantung IP lokal.</p>
            <ul className="space-y-1 text-xs text-gray-500">
              <li>• Demo lokal: <code>http://localhost:3000</code></li>
              <li>• Staging: <code>https://staging.smartapd.id</code></li>
              <li>• Produksi: <code>https://app.smartapd.id</code> (target)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsPanel;
