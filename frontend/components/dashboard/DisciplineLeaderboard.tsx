"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, RefreshCw, ShieldCheck, Users, Award, TrendingUp } from "lucide-react";
import { api, type DisciplineRecord, type DisciplineStats } from "@/services/api";

type LeaderboardView = "top" | "low";

type FetchState = {
  loading: boolean;
  error: string | null;
  data: DisciplineStats | null;
};

const fallbackStats: DisciplineStats = {
  generated_at: new Date().toISOString(),
  summary: {
    total_workers: 8,
    average_compliance: 82.5,
  },
  leaderboard: [
    {
      worker: "Budi Santoso",
      detections: 120,
      violations: 4,
      complianceRate: 96.7,
      topViolations: ["Tidak Pakai Sarung Tangan"],
    },
    {
      worker: "Rina Dewi",
      detections: 98,
      violations: 6,
      complianceRate: 93.9,
      topViolations: ["Tidak Pakai Helm", "Tidak Pakai Rompi"],
    },
    {
      worker: "Agus Pratama",
      detections: 110,
      violations: 12,
      complianceRate: 89.1,
      topViolations: ["Tidak Pakai Face Shield"],
    },
    {
      worker: "Siti Lestari",
      detections: 87,
      violations: 18,
      complianceRate: 79.3,
      topViolations: ["Tidak Pakai Helm", "Tidak Pakai Sarung Tangan"],
    },
    {
      worker: "Rudi Hartono",
      detections: 95,
      violations: 22,
      complianceRate: 76.8,
      topViolations: ["Tidak Pakai Rompi"],
    },
  ],
};

const sortByCompliance = (records: DisciplineRecord[], asc = false) => {
  const sorted = [...records].sort((a, b) => a.complianceRate - b.complianceRate);
  return asc ? sorted : sorted.reverse();
};

const DisciplineLeaderboard = () => {
  const [{ loading, error, data }, setState] = useState<FetchState>({
    loading: true,
    error: null,
    data: null,
  });
  const [mode, setMode] = useState<LeaderboardView>("top");
  const [days, setDays] = useState(7);

  const leaderboard = useMemo(() => {
    const source = data?.leaderboard?.length ? data.leaderboard : fallbackStats.leaderboard;
    return mode === "top" ? sortByCompliance(source, false).slice(0, 5) : sortByCompliance(source, true).slice(0, 5);
  }, [data, mode]);

  const summary = data?.summary ?? fallbackStats.summary;
  const generatedAt = data?.generated_at ?? fallbackStats.generated_at;

  const fetchDiscipline = async (range = days) => {
    try {
      setState({ loading: true, error: null, data });
      const response = await api.getDiscipline(range);
      setState({ loading: false, error: null, data: response });
    } catch (err) {
      console.error("Gagal memuat analitik kedisiplinan:", err);
      setState({ loading: false, error: "Tidak dapat memuat data disiplin. Menampilkan data demo.", data: null });
    }
  };

  useEffect(() => {
    fetchDiscipline(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const modeLabel = mode === "top" ? "Top Performer" : "Perlu Perhatian";
  const toggleMode = () => setMode((prev) => (prev === "top" ? "low" : "top"));

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Trophy className="h-5 w-5 text-orange-500" /> Analitik Kedisiplinan & Leaderboard
          </h2>
          <p className="text-sm text-gray-600">
            Pantau pekerja paling taat maupun yang perlu pendampingan. Data otomatis dihitung dari deteksi APD.
          </p>
          <p className="text-xs text-gray-400">Data diperbarui: {new Date(generatedAt).toLocaleString("id-ID")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="text-gray-500">Rentang:</span>
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="bg-transparent text-gray-700 focus:outline-none"
            >
              <option value={3}>3 hari</option>
              <option value={7}>7 hari</option>
              <option value={14}>14 hari</option>
              <option value={30}>30 hari</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => fetchDiscipline(days)}
            className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 font-semibold text-orange-600 transition hover:bg-orange-100"
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
          </button>
          <button
            type="button"
            onClick={toggleMode}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            {mode === "top" ? <TrendingUp className="h-4 w-4 text-green-500" /> : <ShieldCheck className="h-4 w-4 text-red-500" />}
            {mode === "top" ? "Lihat yang perlu perhatian" : "Lihat performer terbaik"}
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      <div className="grid gap-6 px-6 py-5 md:grid-cols-[1.1fr_minmax(0,0.9fr)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">{modeLabel}</h3>
            <span className="text-xs font-semibold text-orange-600">Top {leaderboard.length}</span>
          </div>

          <ul className="space-y-3">
            {leaderboard.map((record, index) => {
              const position = `${index + 1}`.padStart(2, "0");
              const violationLabel = record.topViolations.length ? record.topViolations.join(", ") : "Tidak ada pelanggaran dominan";
              return (
                <li
                  key={`${record.worker}-${record.complianceRate}-${mode}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-orange-600 shadow-md">
                    {position}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{record.worker}</p>
                      {mode === "top" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-600">
                          <Award className="h-3 w-3" /> High Compliance
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                          <ShieldCheck className="h-3 w-3" /> Butuh Coaching
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{violationLabel}</p>
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    <p className="font-semibold text-gray-900">{record.complianceRate.toFixed(1)}%</p>
                    <p>
                      {record.violations} pelanggaran / {record.detections} deteksi
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800">Ringkasan Tim</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Total Pekerja Dimonitor</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{summary.total_workers}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Users className="h-4 w-4 text-orange-500" /> Tercatat dalam periode {days} hari
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Rata-rata Kepatuhan</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{summary.average_compliance.toFixed(1)}%</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="h-4 w-4 text-green-500" /> Kombinasi auto-detection APD
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-xs text-orange-700">
            <p className="font-semibold">Saran Tindak Lanjut</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Diskusikan program coaching dengan pekerja di papan bawah.</li>
              <li>Gunakan data ini sebagai bahan briefing pagi dan reward mingguan.</li>
              <li>Integrasikan leaderboard dengan modul gamifikasi pada fase berikutnya.</li>
            </ul>
          </div>
        </aside>
      </div>

      {loading && (
        <div className="border-t border-gray-100 px-6 py-3 text-right text-xs text-gray-400">
          Memuat analitik kedisiplinan...
        </div>
      )}
    </section>
  );
};

export default DisciplineLeaderboard;
