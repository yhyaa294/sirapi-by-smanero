"use client";

import { motion } from "framer-motion";

export default function RiskHeatmap() {
    // Mock zones on a factory floor
    const zones = [
        { id: "A", name: "Welding", x: 10, y: 10, w: 30, h: 40, risk: "low" },
        { id: "B", name: "Assembly", x: 45, y: 10, w: 45, h: 25, risk: "medium" },
        { id: "C", name: "Logistics", x: 45, y: 40, w: 45, h: 50, risk: "high" },
        { id: "D", name: "Storage", x: 10, y: 55, w: 30, h: 35, risk: "safe" },
    ];

    const getColor = (risk: string) => {
        switch (risk) {
            case "high": return "fill-critical/20 stroke-critical";
            case "medium": return "fill-warning/20 stroke-warning";
            case "low": return "fill-info/20 stroke-info";
            default: return "fill-safe/20 stroke-safe";
        }
    };

    return (
        <div className="w-full h-full relative bg-surface-highlight border border-border rounded-sm p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-foreground text-sm tracking-widest uppercase">Factory Floor Risk Map</h3>
                <div className="flex gap-4 text-[10px] uppercase font-mono text-foreground-muted">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-safe"></div> Safe</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warning"></div> Warning</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-critical"></div> Critical</span>
                </div>
            </div>

            <div className="flex-1 relative border border-border/50 bg-[url('/blueprint-grid.png')] bg-cover">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {zones.map((zone) => (
                        <g key={zone.id} className="group cursor-pointer">
                            <motion.rect
                                x={zone.x}
                                y={zone.y}
                                width={zone.w}
                                height={zone.h}
                                className={`${getColor(zone.risk)} stroke-[0.5] transition-all duration-300 group-hover:fill-opacity-50`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            />
                            <text
                                x={zone.x + zone.w / 2}
                                y={zone.y + zone.h / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-white text-[3px] font-mono pointer-events-none opacity-70"
                            >
                                {zone.name}
                            </text>

                            {/* Risk Pulse Effect for High Risk */}
                            {zone.risk === 'high' && (
                                <motion.rect
                                    x={zone.x} y={zone.y} width={zone.w} height={zone.h}
                                    className="fill-transparent stroke-critical stroke-[0.5]"
                                    animate={{ opacity: [0, 1, 0], scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                />
                            )}
                        </g>
                    ))}
                </svg>
            </div>

            <div className="mt-4 p-3 bg-surface border border-border rounded-sm">
                <div className="text-[10px] font-mono text-foreground-dim mb-1">LIVE INSIGHT</div>
                <p className="text-xs text-foreground">
                    Detected <span className="text-critical font-bold">High Risk</span> in Logistics Zone due to 3 missing helmets in the last hour.
                </p>
            </div>
        </div>
    );
}
