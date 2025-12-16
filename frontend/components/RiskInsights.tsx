"use client";

import { type FC, useMemo } from "react";
import { AlertTriangle, Flame, MapPin, RefreshCcw, Shield, TrendingUp } from "lucide-react";
import type { RiskMap, RiskArea } from "@/services/api";

type RiskInsightsProps = {
  riskMap: RiskMap | null;
  isLoading: boolean;
  error?: string | null;
  onReload?: () => void;
};

const riskGradient = (score: number) => {
  if (score >= 85) return "bg-gradient-to-br from-red-600 to-red-500 text-white";
  if (score >= 65) return "bg-gradient-to-br from-orange-500 to-orange-400 text-white";
  if (score >= 45) return "bg-gradient-to-br from-yellow-400 to-orange-300 text-slate-900";
  return "bg-gradient-to-br from-green-400 to-green-500 text-slate-900";
};

const RiskInsights: FC<RiskInsightsProps> = ({ riskMap, isLoading, error, onReload }) => {
  const areas: RiskArea[] = riskMap?.areas ?? [];
  const generatedAt = useMemo(() => {
    if (!riskMap?.generated_at) return null;
    const date = new Date(riskMap.generated_at);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("id-ID", { hour12: false });
  }, [riskMap?.generated_at]);

  return (
    <section className="bg-white rounded-2xl shadow-md border border-gray-100">
      <header className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> Prediksi Risiko & Heatmap
          </h2>
          <p className="text-sm text-gray-600">Analisis area berisiko tinggi berdasarkan histori pelanggaran</p>
        </div>
        <div className="flex items-center gap-3">
          {generatedAt && (
            <span className="text-xs text-gray-500">Update: {generatedAt}</span>
          )}
          {onReload && (
            <button
              type="button"
              onClick={onReload}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
              disabled={isLoading}
            >
              <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Muat ulang
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500">
          <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
          Memuat analitik risiko...
        </div>
      ) : (
        <div className="px-6 py-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <Shield className="w-4 h-4 text-orange-500" /> Total Area Dipantau
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">{riskMap?.summary.total_areas ?? areas.length}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Area Risiko Tertinggi
              </div>
              <p className="mt-2 text-xl font-semibold text-gray-900">
                {riskMap?.summary.highest_risk.location ?? "-"}
              </p>
              <p className="text-sm text-red-600 font-medium">
                Skor {riskMap?.summary.highest_risk.riskScore ?? "-"} ({riskMap?.summary.highest_risk.trend ?? "-"})
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <TrendingUp className="w-4 h-4 text-green-500" /> Rata-rata Skor Risiko
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">{riskMap?.summary.average_risk ?? "-"}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {areas.map((area) => (
              <article
                key={`${area.camera}-${area.location}`}
                className={`rounded-2xl p-5 shadow-sm ring-1 ring-black/5 ${riskGradient(area.riskScore)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{area.location}</h3>
                    <p className="text-xs opacity-80 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {area.camera}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold">
                    Skor {area.riskScore}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-medium">
                  <div className="rounded-lg bg-white/20 px-3 py-2">
                    <p className="opacity-80">Total Pelanggaran</p>
                    <p className="text-base font-bold">{area.totalViolations}</p>
                  </div>
                  <div className="rounded-lg bg-white/20 px-3 py-2">
                    <p className="opacity-80">7 Hari Terakhir</p>
                    <p className="text-base font-bold">{area.recentViolations}</p>
                  </div>
                </div>

                {area.topViolations?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold opacity-90">Top Pelanggaran</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      {area.topViolations.map((violation) => (
                        <span key={violation} className="rounded-full bg-white/25 px-3 py-1">
                          {violation}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {area.shiftRisks?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold opacity-90">Risiko per Shift</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                      {area.shiftRisks.map((shift) => (
                        <span key={shift.shift} className="rounded-lg bg-white/20 px-2 py-1 text-center font-semibold">
                          {shift.shift}
                          <br />
                          {shift.riskScore}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}

            {areas.length === 0 && (
              <div className="lg:col-span-3 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                Belum ada data risiko. Jalankan backend atau kumpulkan data pelanggaran terlebih dahulu.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default RiskInsights;
