"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, Server, Clock, AlertTriangle } from "lucide-react";

export default function StatsTicker() {
    const stats = [
        { label: "SYSTEM STATUS", value: "OPERATIONAL", color: "text-safe", icon: Server },
        { label: "ACTIVE CAMERAS", value: "8/8 ONLINE", color: "text-safe", icon: Activity },
        { label: "TODAY VIOLATIONS", value: "12 DETECTED", color: "text-warning", icon: AlertTriangle },
        { label: "COMPLIANCE RATE", value: "94.2%", color: "text-safe", icon: ShieldCheck },
        { label: "LAST INCIDENT", value: "2h 15m AGO", color: "text-foreground-muted", icon: Clock },
        { label: "SHIFT", value: "SHIFT 1 (07:00-15:00)", color: "text-info", icon: Clock },
    ];

    return (
        <div className="w-full bg-surface-highlight border-b border-border h-10 flex items-center overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface-highlight to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface-highlight to-transparent z-10"></div>

            <div className="flex whitespace-nowrap animate-stripe-flow hover:paused">
                <motion.div
                    className="flex gap-12 px-4"
                    animate={{ x: [0, -1000] }}
                    transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                >
                    {[...stats, ...stats, ...stats].map((stat, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <stat.icon className={`w-3 h-3 ${stat.color} opacity-80`} />
                            <div className="flex items-baseline gap-2">
                                <span className="label-text text-[9px] opacity-70">{stat.label}:</span>
                                <span className={`font-mono text-xs font-bold tracking-wide ${stat.color}`}>
                                    {stat.value}
                                </span>
                            </div>
                            <span className="text-border mx-2 text-[10px]">|</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
