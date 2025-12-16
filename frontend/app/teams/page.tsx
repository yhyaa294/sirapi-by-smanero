"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarDays, Users, ClipboardList, ArrowLeft } from "lucide-react";

const mockTeams = [
  {
    name: "Tim Mandor A",
    supervisor: "Budi Santoso",
    shift: "Pagi (07:00 - 15:00)",
    members: 12,
    area: "Workshop A"
  },
  {
    name: "Tim Mandor B",
    supervisor: "Siti Lestari",
    shift: "Siang (15:00 - 23:00)",
    members: 10,
    area: "Gudang Material"
  },
  {
    name: "Tim Mandor C",
    supervisor: "Rahmat Hidayat",
    shift: "Malam (23:00 - 07:00)",
    members: 8,
    area: "Assembly Line"
  }
];

export default function TeamsPage() {
  const totalWorkers = useMemo(() => mockTeams.reduce((acc, team) => acc + team.members, 0), []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tim & Shift Mandor</h1>
            <p className="text-sm opacity-90">Pantau penugasan mandor dan distribusi pekerja antar shift</p>
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
        <section className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <CalendarDays className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Shift</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">3</p>
            <p className="text-xs text-gray-500 mt-2">Shift pagi, siang, dan malam dengan mandor berbeda.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Pekerja</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalWorkers}</p>
            <p className="text-xs text-gray-500 mt-2">Data referensi dari pembagian shift manual (bisa dihubungkan ke API HR).</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Checklist Harian</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">3</p>
            <p className="text-xs text-gray-500 mt-2">Checklist APD, housekeeping, dan briefing disiapkan per shift.</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <header className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Detail Tim</h2>
          </header>
          <div className="divide-y divide-gray-100">
            {mockTeams.map((team) => (
              <article key={team.name} className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-600">Mandor: {team.supervisor}</p>
                  <p className="text-sm text-gray-600">Area: {team.area}</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-700">
                  <span className="font-semibold">Shift: {team.shift}</span>
                  <span>{team.members} pekerja</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
