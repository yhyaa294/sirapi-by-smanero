"use client";

/* eslint-disable @next/next/no-img-element */

import { type CSSProperties, useMemo, useState } from "react";

type RiskLevel = "low" | "medium" | "high" | "critical";

export type RiskZone = {
  id: string;
  name: string;
  workers: number;
  violations: number;
  riskLevel: RiskLevel;
  coordinates: Array<{ x: number; y: number }>; // Normalized (0-100) polygon points
};

type InteractiveRiskMapProps = {
  zones: RiskZone[];
  floorplanUrl?: string;
  onZoneSelect?: (zone: RiskZone) => void;
};

const DEFAULT_FLOORPLAN =
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=60";

const riskPalette: Record<RiskLevel, { fill: string; stroke: string }> = {
  low: { fill: "rgba(34,197,94,0.35)", stroke: "rgba(22,163,74,0.9)" },
  medium: { fill: "rgba(250,204,21,0.35)", stroke: "rgba(217,119,6,0.9)" },
  high: { fill: "rgba(248,113,113,0.35)", stroke: "rgba(220,38,38,0.9)" },
  critical: { fill: "rgba(190,24,93,0.4)", stroke: "rgba(190,24,93,1)" },
};

const polygonPoints = (coordinates: RiskZone["coordinates"]) =>
  coordinates.map((point) => `${point.x},${point.y}`).join(" ");

const centroid = (coordinates: RiskZone["coordinates"]) => {
  if (!coordinates.length) return { x: 50, y: 50 };
  const sum = coordinates.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  );
  return { x: sum.x / coordinates.length, y: sum.y / coordinates.length };
};

export default function InteractiveRiskMap({ zones, floorplanUrl = DEFAULT_FLOORPLAN, onZoneSelect }: InteractiveRiskMapProps) {
  const [hoveredZone, setHoveredZone] = useState<RiskZone | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const selectedZone = useMemo(() => zones.find((zone) => zone.id === selectedZoneId) ?? null, [zones, selectedZoneId]);

  const tooltipStyle: CSSProperties | undefined = hoveredZone
    ? {
        left: `${centroid(hoveredZone.coordinates).x}%`,
        top: `${centroid(hoveredZone.coordinates).y}%`,
      }
    : undefined;

  return (
    <section className="h-full flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
      <header className="flex flex-col gap-1 border-b border-slate-800 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Live Site Risk Map</h2>
          <p className="text-sm text-slate-400">Real-time zone monitoring & heatmap</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs uppercase tracking-wide text-slate-400">Live Feed</span>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden rounded-b-2xl bg-slate-950">
        <img src={floorplanUrl} alt="Factory Floor Plan" className="h-full w-full object-cover opacity-40" />

        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
          {zones.map((zone) => {
            const palette = riskPalette[zone.riskLevel];
            const isSelected = selectedZoneId === zone.id;
            return (
              <polygon
                key={zone.id}
                points={polygonPoints(zone.coordinates)}
                style={{ fill: palette.fill, stroke: palette.stroke, strokeWidth: isSelected ? 0.8 : 0.5 }}
                className="pointer-events-auto cursor-pointer transition-all duration-300 hover:opacity-100 hover:stroke-[1px]"
                onMouseEnter={() => setHoveredZone(zone)}
                onMouseLeave={() => setHoveredZone((current) => (current?.id === zone.id ? null : current))}
                onClick={() => {
                  setSelectedZoneId(zone.id);
                  onZoneSelect?.(zone);
                }}
              />
            );
          })}
        </svg>

        {hoveredZone && tooltipStyle && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-700 bg-slate-800/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm"
            style={tooltipStyle}
          >
            <p className="font-bold text-slate-100">{hoveredZone.name}</p>
            <div className="mt-1 flex items-center gap-2 text-slate-400">
               <span>👥 {hoveredZone.workers}</span>
               <span className="text-rose-400">⚠️ {hoveredZone.violations}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const badgeClass = (risk: RiskLevel) => {
  switch (risk) {
    case "low":
      return "bg-emerald-100 text-emerald-700";
    case "medium":
      return "bg-amber-100 text-amber-700";
    case "high":
      return "bg-rose-100 text-rose-700";
    case "critical":
      return "bg-fuchsia-100 text-fuchsia-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};
