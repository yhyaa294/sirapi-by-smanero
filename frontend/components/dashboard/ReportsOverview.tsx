"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  CalendarRange,
  CheckCircle2,
  RefreshCw,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { api } from "@/services/api";

type KPI = {
  label: string;
  value: string | number;
  trend: string;
  description: string;
};

type ReportSummary = {
  id: string;
  title: string;
  period: string;
  generatedAt: string;
  highlights: string[];
  status: "ready" | "processing";
};

const fallbackStats = {
  totalDetections: 45,
  violations: 12,
  complianceRate: 73.3,
  compliantWorkers: 33,
};

const fallbackViolations = [
  { id: 1, violation: "Tidak Pakai Helm" },
  { id: 2, violation: "Tidak Pakai Rompi" },
  { id: 3, violation: "Tidak Pakai Sarung Tangan" },
];

const ReportsOverview = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const [stats, violations] = await Promise.all([
        api.getStats().catch(() => fallbackStats),
        api.getViolations(20).catch(() => fallbackViolations as any),
      ]);

      populateKpis(stats);
      populateReports(stats, violations);
    } catch (error) {
      console.error("Gagal memuat data laporan:", error);
      setErrorMessage("Tidak dapat terhubung ke server. Menampilkan data demo.");
      populateKpis(fallbackStats);
      populateReports(fallbackStats, fallbackViolations as any);
    } finally {
      setLoading(false);
    }
  };

  const populateKpis = (stats: any) => {
    setKpis([
      {
        label: "Total Deteksi",
        value: stats.totalDetections ?? 0,
        trend: "+8% dibanding minggu lalu",
        description: "Jumlah total deteksi APD selama periode laporan",
      },
      {
        label: "Total Pelanggaran",
        value: stats.violations ?? 0,
        trend: "-12% pelanggaran berulang",
        description: "Akumulasi pelanggaran yang terdeteksi",
      },
      {
        label: "Rata-rata Kepatuhan",
        value: `${stats.complianceRate ?? 0}%`,
        trend: "+5% peningkatan kepatuhan",
        description: "Persentase pekerja yang konsisten menggunakan APD",
      },
    ]);
  };

  const populateReports = (stats: any, violations: any[]) => {
    const highlightViolations = (violations || []).slice(0, 3).map((v) => v.violation);
    setReports([
      {
        id: "weekly",
        title: "Laporan Mingguan",
        period: "7 Hari Terakhir",
        generatedAt: new Date().toLocaleString("id-ID"),
        highlights: [
          `Top Pelanggaran: ${highlightViolations[0] ?? "Tidak ada data"}`,
          `${stats.violations ?? 0} pelanggaran, ${stats.compliantWorkers ?? 0} pekerja patuh`,
          "Rekomendasi otomatis disertakan pada lampiran",
        ],
        status: "ready",
      },
      {
        id: "monthly",
        title: "Laporan Bulanan",
        period: "30 Hari Terakhir",
        generatedAt: "Sedang diproses (estimasi 5 menit)",
        highlights: [
          "Breakdown pelanggaran per lokasi & shift",
          "Analisis pekerja dengan pelanggaran berulang",
          "Tren kepatuhan mingguan",
        ],
        status: "processing",
      },
    ]);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" /> Laporan & Analytics
          </h2>
          <p className="text-sm text-gray-600">
            Unduh, kirim, dan jadwalkan laporan otomatis untuk tim manajemen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/mobile"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" /> Mobile Dashboard
          </Link>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh Data
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <header className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-orange-50 p-3 text-orange-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{kpi.label}</h3>
                <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </header>
            <p className="text-sm font-semibold text-green-600">{kpi.trend}</p>
            <p className="text-xs text-gray-600 leading-relaxed">{kpi.description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report) => (
          <article key={report.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-100 to-green-100 px-5 py-4">
              <FileText className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                <p className="text-xs text-gray-600">Periode: {report.period}</p>
              </div>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarRange className="h-4 w-4" />
                {report.generatedAt}
              </div>

              <ul className="space-y-2 text-sm text-gray-700">
                {report.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                    report.status === "ready"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {report.status === "ready" ? "Siap Diunduh" : "Sedang Diproses"}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/api/reports/generate?report_type=${report.id}`}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      report.status === "ready"
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    aria-disabled={report.status !== "ready"}
                  >
                    <Download className="h-4 w-4" /> Unduh PDF
                  </Link>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                  >
                    <Mail className="h-4 w-4" /> Kirim Email
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ReportsOverview;
