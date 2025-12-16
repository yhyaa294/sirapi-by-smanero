"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  Info,
  MapPin,
  Paperclip,
  Search,
  Send,
  Timer,
  Trash2,
  User,
} from "lucide-react";
import { api, type Violation as ApiViolation, type AlertAction } from "@/services/api";

type WorkflowAlert = ApiViolation & {
  severity: "high" | "medium" | "low";
};

type FilterSeverity = "all" | "high" | "medium" | "low";

type FilterStatus = "all" | "resolved" | "unresolved";

type EvidencePayload = {
  data: string;
  name?: string;
};

const deriveSeverity = (violation: string): WorkflowAlert["severity"] => {
  const value = violation.toLowerCase();
  if (value.includes("helm") || value.includes("helmet")) return "high";
  if (value.includes("rompi") || value.includes("vest") || value.includes("goggle")) return "medium";
  return "low";
};

const AUTO_ESCALATION_CONFIG: Record<WorkflowAlert["severity"], { seconds: number | null; label: string }> = {
  high: { seconds: 180, label: "3 menit" },
  medium: { seconds: 300, label: "5 menit" },
  low: { seconds: null, label: "Tidak aktif" },
};

const formatDateTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("id-ID", { hour12: false });
};

const formatCountdown = (value?: number) => {
  if (value === undefined || value === null) return "-";
  if (value <= 0) return "Menunggu eskalasi";
  const minutes = Math.floor(value / 60);
  const seconds = Math.max(0, value % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const AlertsWorkflow = () => {
  const [alerts, setAlerts] = useState<WorkflowAlert[]>([]);
  const [actions, setActions] = useState<AlertAction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [severity, setSeverity] = useState<FilterSeverity>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [escalationNotes, setEscalationNotes] = useState<Record<number, string>>({});
  const [resolutionNotes, setResolutionNotes] = useState<Record<number, string>>({});
  const [escalationEvidence, setEscalationEvidence] = useState<Record<number, EvidencePayload | undefined>>({});
  const [resolutionEvidence, setResolutionEvidence] = useState<Record<number, EvidencePayload | undefined>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [countdowns, setCountdowns] = useState<Record<number, number>>({});
  const [autoTriggered, setAutoTriggered] = useState<number[]>([]);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const violations = await api.getViolations(50);
      const mapped = violations.map((v) => ({
        ...v,
        severity: deriveSeverity(v.violation),
      }));
      setAlerts(mapped);
    } catch (err) {
      console.error("Gagal memuat alert:", err);
      setError("Tidak dapat memuat data alert. Coba refresh atau jalankan backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActions = useCallback(async () => {
    try {
      const data = await api.getAlertActions();
      setActions(data);
    } catch (err) {
      console.error("Gagal memuat riwayat tindakan:", err);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchActions();
  }, [fetchAlerts, fetchActions]);

  const triggerAutoEscalation = useCallback(
    async (alert: WorkflowAlert) => {
      setAutoTriggered((prev) => (prev.includes(alert.id) ? prev : [...prev, alert.id]));
      try {
        await api.createAlertAction({
          alert_id: alert.id,
          action: "escalate",
          level: "HSE Manager",
          notes: `Auto-escalation: tidak ada respon dalam ${AUTO_ESCALATION_CONFIG[alert.severity].label}.`,
          actor: "System",
          severity: alert.severity,
          auto: true,
        });
        await fetchActions();
        await fetchAlerts();
      } catch (err) {
        console.error("Auto-escalation gagal:", err);
      }
    },
    [fetchActions, fetchAlerts],
  );

  useEffect(() => {
    if (alerts.length === 0) {
      setSelectedId(null);
      setCountdowns({});
      return;
    }

    const timer = window.setInterval(() => {
      const triggeredSet = new Set(autoTriggered);
      const nextCountdowns: Record<number, number> = {};
      const readyToEscalate: WorkflowAlert[] = [];

      alerts.forEach((alert) => {
        if (alert.status === "resolved") return;
        const config = AUTO_ESCALATION_CONFIG[alert.severity];
        if (!config.seconds) return;
        const parsed = new Date(alert.time);
        if (Number.isNaN(parsed.getTime())) return;
        const elapsed = (Date.now() - parsed.getTime()) / 1000;
        const remaining = Math.ceil(config.seconds - elapsed);
        nextCountdowns[alert.id] = remaining <= 0 ? 0 : remaining;
        if (remaining <= 0 && !triggeredSet.has(alert.id)) {
          readyToEscalate.push(alert);
        }
      });

      setCountdowns(nextCountdowns);
      if (readyToEscalate.length > 0) {
        readyToEscalate.forEach((alert) => {
          triggerAutoEscalation(alert);
        });
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [alerts, autoTriggered, triggerAutoEscalation]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchSeverity = severity === "all" || alert.severity === severity;
      const matchStatus = statusFilter === "all" || alert.status === statusFilter;
      const matchSearch =
        searchTerm.trim() === "" ||
        alert.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.violation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSeverity && matchStatus && matchSearch;
    });
  }, [alerts, severity, statusFilter, searchTerm]);

  useEffect(() => {
    if (filteredAlerts.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredAlerts.some((alert) => alert.id === selectedId)) {
      setSelectedId(filteredAlerts[0].id);
    }
  }, [filteredAlerts, selectedId]);

  const handleResolve = async (alert: WorkflowAlert) => {
    setPendingId(alert.id);
    try {
      await api.resolveAlert({
        alert_id: alert.id,
        actor: "Mandor",
        notes: resolutionNotes[alert.id],
        evidence: resolutionEvidence[alert.id]?.data,
      });
      await fetchAlerts();
      await fetchActions();
      setResolutionEvidence((prev) => ({ ...prev, [alert.id]: undefined }));
    } catch (err) {
      console.error("Gagal resolve alert:", err);
      setError("Resolve alert gagal. Periksa server API.");
    } finally {
      setPendingId(null);
    }
  };

  const handleEscalate = async (alert: WorkflowAlert) => {
    setPendingId(alert.id);
    try {
      const note = escalationNotes[alert.id];
      await api.createAlertAction({
        alert_id: alert.id,
        action: "escalate",
        level: alert.severity === "high" ? "HSE Manager" : "Supervisor",
        notes: note,
        actor: "Mandor",
        severity: alert.severity,
        evidence: escalationEvidence[alert.id]?.data,
      });
      await fetchActions();
      setEscalationNotes((prev) => ({ ...prev, [alert.id]: "" }));
      setEscalationEvidence((prev) => ({ ...prev, [alert.id]: undefined }));
    } catch (err) {
      console.error("Gagal eskalasi alert:", err);
      setError("Eskalasi alert gagal. Periksa server API.");
    } finally {
      setPendingId(null);
    }
  };

  const actionsByAlert = useMemo(() => {
    const map: Record<number, AlertAction[]> = {};
    for (const item of actions) {
      if (!map[item.alert_id]) map[item.alert_id] = [];
      map[item.alert_id].push(item);
    }
    Object.keys(map).forEach((key) => {
      map[Number(key)] = [...map[Number(key)]].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
    });
    return map;
  }, [actions]);

  const handleEvidenceUpload = (alertId: number, file: File | null, type: "resolve" | "escalate") => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const payload: EvidencePayload = {
        data: typeof reader.result === "string" ? reader.result : "",
        name: file.name,
      };
      if (!payload.data) return;
      if (type === "resolve") {
        setResolutionEvidence((prev) => ({ ...prev, [alertId]: payload }));
      } else {
        setEscalationEvidence((prev) => ({ ...prev, [alertId]: payload }));
      }
    };
    reader.readAsDataURL(file);
  };

  const selectedAlert = filteredAlerts.find((alert) => alert.id === selectedId) ?? null;
  const selectedTimeline = selectedAlert ? actionsByAlert[selectedAlert.id] ?? [] : [];
  const countdownValue = selectedAlert ? countdowns[selectedAlert.id] : undefined;
  const autoConfig = selectedAlert ? AUTO_ESCALATION_CONFIG[selectedAlert.severity] : undefined;
  const autoActive = Boolean(selectedAlert && autoConfig?.seconds && selectedAlert.status === "unresolved");

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Alert Center & Workflow
            </h2>
            <p className="text-sm text-gray-600">
              Monitor status pelanggaran, lengkapi bukti, dan eskalasi otomatis ketika mandor tidak merespons.
            </p>
          </div>
          <div className="flex gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500"></span> High
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-orange-500"></span> Medium
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-yellow-400"></span> Low
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari pekerja / lokasi"
              className="w-full rounded-lg border border-gray-300 px-10 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value as FilterSeverity)}
              aria-label="Filter severity alert"
              className="w-full bg-transparent focus:outline-none"
            >
              <option value="all">Semua Severity</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as FilterStatus)}
              aria-label="Filter status alert"
              className="w-full bg-transparent focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="unresolved">Belum Ditangani</option>
              <option value="resolved">Selesai</option>
            </select>
          </div>
          <div className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600">
            Total alert: <strong>{alerts.length}</strong> &bull; High:
            <strong> {alerts.filter((a) => a.severity === "high").length}</strong>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_minmax(0,1fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
              Memuat daftar pelanggaran...
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-500">
              <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" />
              Semua pelanggaran sudah ditangani.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAlerts.map((alert) => {
                const thisCountdown = countdowns[alert.id];
                const config = AUTO_ESCALATION_CONFIG[alert.severity];
                return (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => setSelectedId(alert.id)}
                    className={`flex w-full flex-col gap-3 px-6 py-5 text-left transition hover:bg-orange-50/40 ${
                      selectedId === alert.id ? "bg-orange-50/60" : "bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                      <span
                        className={`rounded-full border px-3 py-1 ${
                          alert.severity === "high"
                            ? "border-red-200 bg-red-100 text-red-700"
                            : alert.severity === "medium"
                            ? "border-orange-200 bg-orange-100 text-orange-700"
                            : "border-yellow-200 bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 ${
                          alert.status === "resolved"
                            ? "border-green-200 bg-green-100 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {alert.status.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(alert.time)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" /> {alert.worker}
                      </div>
                      <div className="text-sm font-semibold text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> {alert.violation}
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> {alert.location}
                      </div>
                    </div>
                    {config.seconds && alert.status === "unresolved" && (
                      <div className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-600">
                        <div className="flex items-center gap-2">
                          <Timer className="h-3.5 w-3.5" />
                          Auto escalation ({config.label})
                        </div>
                        <span className="font-semibold">{formatCountdown(thisCountdown)}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {selectedAlert ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Detail Alert</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedAlert.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedAlert.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <Info className="mt-[3px] h-4 w-4 text-orange-500" />
                  Pastikan catatan lengkap dan bukti terupload sebelum melakukan resolve atau eskalasi.
                </p>
              </div>

              <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-2 font-semibold text-gray-900">
                    <User className="h-4 w-4 text-gray-500" /> {selectedAlert.worker}
                  </span>
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" /> {selectedAlert.violation}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {selectedAlert.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDateTime(selectedAlert.time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Severity: {selectedAlert.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-sm text-orange-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-2">
                    <Timer className="h-4 w-4" /> Auto Escalation Countdown
                  </span>
                  <span className="font-semibold">{autoActive ? formatCountdown(countdownValue) : "Tidak aktif"}</span>
                </div>
                {autoActive ? (
                  <p className="mt-2 text-xs text-orange-600">
                    Akan dinaikkan ke level {selectedAlert.severity === "high" ? "HSE Manager" : "Supervisor"} secara otomatis bila tidak direspon dalam {autoConfig?.label}.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-orange-600">Auto-escalation hanya aktif untuk severity medium/high yang belum diselesaikan.</p>
                )}
              </div>

              {selectedTimeline.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">Riwayat Tindakan</h4>
                  <ul className="space-y-3 text-xs text-gray-600">
                    {selectedTimeline.map((item) => (
                      <li key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2 font-semibold text-gray-800">
                            {item.action.toUpperCase()} {item.level ? `• ${item.level}` : ""}
                            {item.auto && (
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
                                AUTO
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-500">
                            {formatDateTime(item.timestamp)} {item.actor ? `oleh ${item.actor}` : ""}
                          </span>
                          {item.notes && <span className="italic text-gray-500">&quot;{item.notes}&quot;</span>}
                          {item.evidence && (
                            <a
                              href={item.evidence}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" /> Lihat bukti
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                {selectedAlert.status === "unresolved" && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-green-700">Tandai Selesai</h4>
                      <span className="text-[11px] text-green-700">Resolusi cepat bersama bukti lapangan</span>
                    </div>
                    <textarea
                      value={resolutionNotes[selectedAlert.id] ?? ""}
                      onChange={(event) =>
                        setResolutionNotes((prev) => ({ ...prev, [selectedAlert.id]: event.target.value }))
                      }
                      placeholder="Catatan penyelesaian (opsional)"
                      className="h-20 w-full rounded-lg border border-green-200 bg-white p-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex items-center justify-between rounded-lg border border-green-100 bg-white px-3 py-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-green-500" />
                        {resolutionEvidence[selectedAlert.id]?.name || "Upload bukti foto/video"}
                      </div>
                      <div className="flex items-center gap-2">
                        {resolutionEvidence[selectedAlert.id] && (
                          <button
                            type="button"
                            onClick={() => setResolutionEvidence((prev) => ({ ...prev, [selectedAlert.id]: undefined }))}
                            className="text-red-500 hover:text-red-600"
                            aria-label="Hapus bukti"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <label className="cursor-pointer rounded-md bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600">
                          Pilih File
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,video/*,application/pdf"
                            onChange={(event) =>
                              handleEvidenceUpload(
                                selectedAlert.id,
                                event.target.files?.[0] ?? null,
                                "resolve",
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={() => handleResolve(selectedAlert)}
                      disabled={pendingId === selectedAlert.id}
                      className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                    >
                      <CheckCircle className="mr-2 inline h-4 w-4" /> Tandai Selesai
                    </button>
                  </div>
                )}

                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-orange-700">Eskalasi Manual</h4>
                    <span className="text-[11px] text-orange-700">Tentukan alasan & bukti pendukung</span>
                  </div>
                  <textarea
                    value={escalationNotes[selectedAlert.id] ?? ""}
                    onChange={(event) =>
                      setEscalationNotes((prev) => ({ ...prev, [selectedAlert.id]: event.target.value }))
                    }
                    placeholder="Catatan / reason eskalasi"
                    className="h-20 w-full rounded-lg border border-orange-200 bg-white p-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex items-center justify-between rounded-lg border border-orange-100 bg-white px-3 py-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-orange-500" />
                      {escalationEvidence[selectedAlert.id]?.name || "Upload bukti pendukung"}
                    </div>
                    <div className="flex items-center gap-2">
                      {escalationEvidence[selectedAlert.id] && (
                        <button
                          type="button"
                          onClick={() => setEscalationEvidence((prev) => ({ ...prev, [selectedAlert.id]: undefined }))}
                          className="text-red-500 hover:text-red-600"
                          aria-label="Hapus bukti"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <label className="cursor-pointer rounded-md bg-orange-500 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-600">
                        Pilih File
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,video/*,application/pdf"
                          onChange={(event) =>
                            handleEvidenceUpload(
                              selectedAlert.id,
                              event.target.files?.[0] ?? null,
                              "escalate",
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEscalate(selectedAlert)}
                    disabled={pendingId === selectedAlert.id}
                    className="w-full rounded-lg border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:border-orange-200 disabled:text-orange-300"
                  >
                    <Send className="mr-2 inline h-4 w-4" /> Eskalasi Alert
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-gray-500">
              <Info className="h-6 w-6 text-gray-400" />
              Pilih salah satu alert di sisi kiri untuk melihat detail dan menindaklanjuti.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
};

export default AlertsWorkflow;
