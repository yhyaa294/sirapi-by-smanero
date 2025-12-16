"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type RiskMap, type Violation } from "@/services/api";
import { AlertTriangle, Camera, MapPin, X } from "lucide-react";

export default function RiskMapInteractive() {
  const [risk, setRisk] = useState<RiskMap | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeArea, setActiveArea] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const [r, v] = await Promise.all([api.getRiskMap(7), api.getViolations(30)]);
        setRisk(r);
        setViolations(v);
      } catch (err) {
        console.error("Gagal memuat Risk Map:", err);
        setError("Tidak dapat memuat Risk Map. Menampilkan data demo jika tersedia.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const areas = risk?.areas ?? [];

  const groupedAlerts = useMemo(() => {
    const map: Record<string, Violation[]> = {};
    for (const v of violations) {
      const key = (v.location || "").toLowerCase();
      if (!map[key]) map[key] = [];
      map[key].push(v);
    }
    return map;
  }, [violations]);

  const colorForScore = (score: number) => {
    if (score >= 75) return "bg-red-100 border-red-200 text-red-700";
    if (score >= 40) return "bg-yellow-100 border-yellow-200 text-yellow-700";
    return "bg-green-100 border-green-200 text-green-700";
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Live Interactive Risk Map</h2>
        <span className="text-xs text-slate-500">{risk?.generated_at ? new Date(risk.generated_at).toLocaleString("id-ID") : "-"}</span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">{error}</div>
      )}

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">Memuat peta risiko...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => {
            const key = (area.location || "").toLowerCase();
            const recent = (groupedAlerts[key] || []).slice(0, 3);
            const col = colorForScore(area.riskScore);
            const isActive = activeArea === area.location;
            return (
              <div key={area.location} className={`relative rounded-xl border p-4 ${col}`}>
                <button
                  type="button"
                  onClick={() => setActiveArea(isActive ? null : area.location)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-current" />
                      <p className="text-sm font-semibold">{area.location}</p>
                    </div>
                    <div className="text-xs">Risk Score <span className="font-semibold">{area.riskScore}</span></div>
                  </div>
                  <div className="mt-1 text-xs">Camera: <span className="font-semibold">{area.camera}</span> • Trend: {area.trend}</div>
                  <div className="mt-2 text-xs">Top: {area.topViolations.slice(0, 2).join(", ")}</div>
                </button>

                {isActive && (
                  <div className="absolute inset-x-2 top-2 z-10 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <MapPin className="h-4 w-4 text-orange-500" /> {area.location}
                      </div>
                      <button type="button" onClick={() => setActiveArea(null)} aria-label="Tutup" className="text-slate-500 hover:text-slate-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mb-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2"><Camera className="h-3.5 w-3.5 text-purple-600" /> {area.camera}</div>
                      <div>Risk Score: <span className="font-semibold">{area.riskScore}</span> • Trend: {area.trend}</div>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                      <div className="mb-1 text-xs font-semibold text-slate-700">Alert Terakhir</div>
                      {recent.length === 0 ? (
                        <p className="text-xs text-slate-500">Tidak ada alert terbaru di area ini.</p>
                      ) : (
                        <ul className="space-y-1 text-xs">
                          {recent.map((v) => (
                            <li key={v.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                                <span className="font-semibold text-red-700">{v.violation}</span>
                              </div>
                              <span className="text-slate-500">{v.time}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
