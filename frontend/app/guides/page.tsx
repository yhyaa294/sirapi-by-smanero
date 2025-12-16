"use client";

import Link from "next/link";
import { BookOpen, FileText, Video, ArrowLeft } from "lucide-react";

const resources = [
  {
    title: "SOP Penggunaan APD",
    description: "Langkah-langkah wajib sebelum memasuki area kerja berisiko tinggi.",
    type: "Dokumen PDF",
    actionLabel: "Buka SOP"
  },
  {
    title: "Panduan Quick Response Mandor",
    description: "Checklist tindakan cepat saat mendeteksi pelanggaran APD.",
    type: "Slide Deck",
    actionLabel: "Lihat Slide"
  },
  {
    title: "Video Training SmartAPD™",
    description: "Tutorial 5 menit cara membaca dashboard dan menindaklanjuti pelanggaran.",
    type: "Video"
  }
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panduan & SOP</h1>
            <p className="text-sm opacity-90">Dokumentasi operasional SmartAPD™ untuk mandor dan manajemen</p>
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

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
          <header className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Materi Siap Pakai</h2>
              <p className="text-sm text-gray-600">Gunakan materi ini untuk briefing pagi dan onboarding pekerja baru</p>
            </div>
          </header>

          <div className="space-y-3">
            {resources.map((resource) => (
              <article key={resource.title} className="rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{resource.title}</h3>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                  <span className="text-xs text-gray-500">Format: {resource.type}</span>
                </div>
                <button className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700">
                  <FileText className="w-4 h-4" />
                  {resource.actionLabel ?? "Buka Materi"}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-green-500" />
            Roadmap Konten
          </h2>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Library video training segmented per jabatan</li>
            <li>• FAQ interaktif dan chatbot internal</li>
            <li>• Template presentasi untuk rapat safety mingguan</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
