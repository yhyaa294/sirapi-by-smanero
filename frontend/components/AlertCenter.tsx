'use client';

import { type FC } from 'react';
import {
  AlertTriangle,
  BellRing,
  CheckCircle,
  Clock,
  Info,
  MapPin,
  X,
} from 'lucide-react';

export type AlertItem = {
  id: string;
  worker: string;
  violation: string;
  location?: string;
  time: string;
  severity: 'high' | 'medium' | 'low';
  timestamp?: string;
  seen?: boolean;
  source?: 'live' | 'history';
};

export type ConnectionState = 'connected' | 'connecting' | 'disconnected';
export type AlertCenterProps = {
  isOpen: boolean;
  alerts: AlertItem[];
  onClose: () => void;
  connectionState: ConnectionState;
  onMarkAllAsRead?: () => void;
};

const severityConfig: Record<
  AlertItem['severity'],
  { container: string; badge: string; icon: typeof AlertTriangle }
> = {
  high: {
    container: 'border-red-200 bg-red-50/80',
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertTriangle,
  },
  medium: {
    container: 'border-orange-200 bg-orange-50/80',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: Info,
  },
  low: {
    container: 'border-yellow-200 bg-yellow-50/80',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: CheckCircle,
  },
};

const connectionStyles: Record<
  ConnectionState,
  { label: string; className: string }
> = {
  connected: {
    label: 'Realtime Aktif',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  connecting: {
    label: 'Menghubungkan…',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse',
  },
  disconnected: {
    label: 'Terputus',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
};

const formatRelativeTime = (timestamp?: string): string | null => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (diff < 60000) return 'Baru saja';
  if (diff < 3600000) return `${minutes} menit lalu`;
  if (diff < 86400000) return `${hours} jam lalu`;
  return `${days} hari lalu`;
};

const AlertCenter: FC<AlertCenterProps> = ({
  isOpen,
  alerts,
  onClose,
  connectionState,
  onMarkAllAsRead,
}) => {
  if (!isOpen) {
    return null;
  }

  const unreadCount = alerts.filter((alert) => !alert.seen).length;
  const connection = connectionStyles[connectionState];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6 md:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Alert Center</h2>
            <p className="mt-1 text-sm text-slate-500">Monitor pelanggaran terbaru secara real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${connection.className}`}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-current" aria-hidden />
              {connection.label}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Tutup Alert Center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
              <BellRing className="h-5 w-5 text-orange-500" aria-hidden />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </span>
            <div>
              <p className="font-semibold text-slate-900">Notifikasi Pelanggaran</p>
              <p className="text-xs text-slate-500">
                {alerts.length === 0
                  ? 'Belum ada pelanggaran yang perlu diperhatikan.'
                  : 'Klik pelanggaran untuk detail penanganan.'}
              </p>
            </div>
          </div>
          {onMarkAllAsRead && alerts.length > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
            >
              Tandai sudah dibaca
            </button>
          )}
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-4 py-5">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 py-16 text-center text-slate-500">
              <CheckCircle className="mb-3 h-10 w-10 text-green-500" />
              <p className="text-sm font-semibold text-slate-600">Semua aman! Tidak ada pelanggaran aktif.</p>
              <p className="mt-1 text-xs text-slate-500">Tetap monitor untuk respon cepat jika terjadi pelanggaran.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {alerts.map((alert) => {
                const severity = severityConfig[alert.severity];
                const RelativeIcon = severity.icon;
                const relativeTime = formatRelativeTime(alert.timestamp);
                return (
                  <li
                    key={alert.id}
                    className={`relative rounded-2xl border px-5 py-4 transition-all ${severity.container} ${alert.seen ? 'shadow-sm' : 'shadow-lg ring-2 ring-orange-200/70'}`}
                  >
                    {!alert.seen && (
                      <span className="absolute -left-1 -top-1 inline-flex h-3 w-3 rounded-full bg-red-500" aria-hidden />
                    )}
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-md">
                        <RelativeIcon className="h-5 w-5 text-current" aria-hidden />
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${severity.badge}`}>
                            {alert.severity}
                          </span>
                          {alert.source === 'live' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-orange-700">
                              🔴 Live
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{alert.worker}</p>
                        <p className="text-xs font-medium text-red-600">{alert.violation}</p>
                        {alert.location && (
                          <p className="flex items-center gap-1 text-xs text-slate-600">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                            {alert.location}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          <span>{alert.time}</span>
                          {relativeTime && <span aria-hidden>•</span>}
                          {relativeTime && <span>{relativeTime}</span>}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCenter;
