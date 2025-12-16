"use client";

import Link from "next/link";
import { ClipboardCheck, CheckCircle2, AlertTriangle, ArrowLeft, FilePlus2 } from "lucide-react";

const checklistTemplates = [
  {
    title: "Pemeriksaan APD Mandor",
    items: ["Helmet & Pelindung Kepala", "Rompi Reflektif", "Sepatu Safety", "Sarung Tangan"],
    frequency: "Setiap shift"
  },
  {
    title: "Inspeksi Area Kerja",
    items: ["Kondisi lantai", "Rambu peringatan", "Pencahayaan", "Alat pemadam"],
    frequency: "Harian"
  }
];

export default function ChecklistsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Checklist Lapangan</h1>
            <p className="text-sm opacity-90">Pantau kepatuhan APD dan kondisi area sebelum pekerjaan dimulai</p>
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
            <ClipboardCheck className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Template Checklist</h2>
              <p className="text-sm text-gray-600">Gunakan template berikut atau duplikasi sesuai kebutuhan proyek</p>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            {checklistTemplates.map((template) => (
              <article key={template.title} className="rounded-xl border border-gray-200 p-4 space-y-3">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {template.title}
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  {template.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500">Frekuensi: {template.frequency}</p>
                <button className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700">
                  <FilePlus2 className="w-4 h-4" />
                  Duplikasi ke Shift
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Rencana Upgrade
          </h2>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Integrasi dengan laporan pelanggaran untuk checklist otomatis</li>
            <li>• Export ke PDF dan share via WhatsApp</li>
            <li>• Tanda tangan digital mandor & safety officer</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
