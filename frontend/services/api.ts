export type Stats = {
  totalDetections: number;
  violations: number;
  complianceRate: number;
  compliantWorkers: number;
};

export type Violation = {
  id: number;
  worker: string;
  location: string;
  violation: string;
  time: string;
  status: 'resolved' | 'unresolved';
};

export type Camera = {
  id: number;
  name: string;
  location: string;
  status: 'online' | 'offline';
  violations: number;
  workers: number;
};

export type RiskShift = {
  shift: string;
  riskScore: number;
};

export type RiskArea = {
  location: string;
  camera: string;
  coordinates?: { lat?: number; lng?: number };
  totalViolations: number;
  recentViolations: number;
  riskScore: number;
  trend: string;
  topViolations: string[];
  shiftRisks: RiskShift[];
};

export type RiskMap = {
  generated_at: string;
  summary: {
    total_areas: number;
    highest_risk: {
      location: string | null;
      riskScore: number;
      trend: string;
    };
    average_risk: number;
  };
  areas: RiskArea[];
};

export type AlertAction = {
  id: number;
  alert_id: number;
  action: 'resolve' | 'escalate';
  level?: string;
  notes?: string;
  actor?: string;
  timestamp: string;
  auto?: boolean;
  evidence?: string;
};

export type DisciplineRecord = {
  worker: string;
  detections: number;
  violations: number;
  complianceRate: number;
  topViolations: string[];
};

export type DisciplineStats = {
  generated_at: string;
  summary: {
    total_workers: number;
    average_compliance: number;
  };
  leaderboard: DisciplineRecord[];
};

export type PulseSystemHealth = {
  cameras_online: number;
  cameras_total: number;
  sensors: { online: number; total: number };
};

export type Pulse = {
  generated_at: string;
  pulse_score: number;
  violations: { total_today: number; avg_per_day: number };
  avg_response_time_sec: number;
  lti_free_days: number;
  system_health: PulseSystemHealth;
  unresolved_high: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API Error ${res.status}`);
  return res.json();
}

export const api = {
  health: () => http<{ status: string }>(`/api/health`),
  getStats: () => http<Stats>(`/api/stats`),
  getViolations: (limit = 10) => http<Violation[]>(`/api/violations?limit=${limit}`),
  getCameras: () => http<Camera[]>(`/api/cameras`),
  getRiskMap: (days = 7) => http<RiskMap>(`/api/risk-map?days=${days}`),
  getAlertActions: () => http<AlertAction[]>(`/api/alerts/actions`),
  resolveAlert: (payload: { alert_id: number; notes?: string; actor?: string; evidence?: string }) =>
    http<AlertAction>(`/api/alerts/resolve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createAlertAction: (
    payload: {
      alert_id: number;
      action: 'escalate';
      level?: string;
      notes?: string;
      actor?: string;
      severity?: string;
      auto?: boolean;
      evidence?: string;
    },
  ) =>
    http<AlertAction>(`/api/alerts/actions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getDiscipline: (days = 7) => http<DisciplineStats>(`/api/discipline?days=${days}`),
  getPulse: (days = 7) => http<Pulse>(`/api/pulse?days=${days}`),
};
