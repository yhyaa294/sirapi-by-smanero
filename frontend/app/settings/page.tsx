"use client";

import { useState } from "react";
import Link from "next/link";
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
  ArrowLeft,
  Globe,
  Languages,
  Clock
} from "lucide-react";

export default function SettingsPage() {
  const [autoRefresh, setAutoRefresh] = useState("10");
  const [language, setLanguage] = useState("id-ID");
  const [telegramEnabled, setTelegramEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pengaturan Sistem</h1>
            <p className="text-sm opacity-90">Sesuaikan pengalaman SmartAPD™ untuk operasional harian</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/mobile"
              className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-30 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Mobile
            </Link>
            <button
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
            >
              <Save className="w-4 h-4" />
              Simpan Preferensi
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-orange-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Preferensi Mobile</h2>
                <p className="text-sm text-gray-600">Atur refresh rate dan tampilan untuk mandor di lapangan</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              <span className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4" /> Interval Refresh (detik)</span>
              <select
                value={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="5">5 detik (Real-time)</option>
                <option value="10">10 detik (Seimbang)</option>
                <option value="30">30 detik (Hemat baterai)</option>
              </select>
              <span className="text-xs text-gray-500">Refresh 10 detik direkomendasikan untuk keseimbangan performa & baterai.</span>
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-700">
              <span className="font-semibold flex items-center gap-2"><Languages className="w-4 h-4" /> Bahasa Interface</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="id-ID">Bahasa Indonesia</option>
                <option value="en-US">English (Beta)</option>
              </select>
              <span className="text-xs text-gray-500">Bahasa Inggris masih eksperimen untuk kebutuhan presentasi internasional.</span>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <BellRing className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifikasi & Peringatan</h2>
              <p className="text-sm text-gray-600">Kelola push notification, email, dan integrasi messaging</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Settings className="w-4 h-4" /> Push Notification</h3>
              <p className="text-xs text-gray-500">Aktifkan agar mandor menerima alert real-time langsung di HP.</p>
              <PushNotificationManager />
            </div>

            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Integrasi Telegram</h3>
              <p className="text-xs text-gray-500">Kirim ringkasan pelanggaran otomatis via bot Telegram.</p>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={telegramEnabled}
                  onChange={(e) => setTelegramEnabled(e.target.checked)}
                  className="w-4 h-4 text-orange-500 focus:ring-orange-500 rounded"
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
        </section>

        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-green-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Instalasi & Akses</h2>
              <p className="text-sm text-gray-600">Pastikan SmartAPD tersedia saat offline dan mudah diakses</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Smartphone className="w-4 h-4" /> Install Aplikasi</h3>
              <p className="text-xs text-gray-500">Tambahkan SmartAPD ke home screen agar terasa seperti aplikasi native.</p>
              <InstallPrompt showOnDesktop showOnMobile />
            </div>
            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Globe className="w-4 h-4" /> Pilihan Server</h3>
              <p className="text-xs text-gray-500">Gunakan domain produksi agar mandor di lapangan tidak tergantung IP lokal.</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Demo lokal: <code>http://localhost:3000</code></li>
                <li>• Staging: <code>https://staging.smartapd.id</code></li>
                <li>• Produksi: <code>https://app.smartapd.id</code> (target)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
