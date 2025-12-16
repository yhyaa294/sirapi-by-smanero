"use client";

import Link from "next/link";
import { LifeBuoy, Phone, Mail, MessageCircle, ArrowLeft, Clock, MapPin } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Support Center</h1>
            <p className="text-sm opacity-90">Hubungi tim SmartAPD™ kapan pun untuk dukungan teknis dan operasional</p>
          </div>
          <Link
            href="/mobile"
            className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-30 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Mobile
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
          <header className="flex items-center gap-3">
            <LifeBuoy className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Kontak Prioritas</h2>
              <p className="text-sm text-gray-600">Gunakan jalur ini untuk insiden lapangan atau downtime sistem</p>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500" /> Hotline 24/7
              </p>
              <p className="text-xl font-bold text-gray-900">+62 21 555 0199</p>
              <p className="text-xs text-gray-500">Untuk pelaporan kecelakaan atau mandor yang butuh respon cepat.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" /> Email Dukungan
              </p>
              <p className="text-sm text-gray-700">support@smartapd.id</p>
              <p className="text-xs text-gray-500">Estimasi respon &lt; 1 jam pada jam kerja.</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-500" /> Live Assistance
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-900">WhatsApp Support</p>
              <p className="text-sm text-gray-600">+62 811 2222 3333</p>
              <p className="text-xs text-gray-500">Admin siap bantu update data atau investigate alert.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-900">Telegram SmartAPD Bot</p>
              <p className="text-sm text-gray-600">@SmartAPD_bot</p>
              <p className="text-xs text-gray-500">Dapatkan ringkasan harian & update status sistem.</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Jam Operasional</h2>
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Senin - Jumat: 07.00 - 21.00 WIB</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Sabtu: 08.00 - 17.00 WIB</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Minggu: Support Darurat via hotline</span>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" /> Kunjungan & Training
          </h2>
          <p className="text-sm text-gray-600">
            SmartAPD menyediakan onsite training untuk mandor dan safety officer. Hubungi kami untuk penjadwalan demo onsite atau audit kesiapan APD di lokasi Anda.
          </p>
        </section>
      </div>
    </div>
  );
}
