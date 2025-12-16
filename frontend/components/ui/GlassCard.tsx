"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "orange" | "emerald" | "red" | "blue" | "none";
  hover?: boolean;
  animate?: boolean;
}

export function GlassCard({ 
  children, 
  className = "", 
  glowColor = "none",
  hover = true,
  animate = true
}: GlassCardProps) {
  const glowClasses = {
    orange: "hover:shadow-glow-orange",
    emerald: "hover:shadow-glow-emerald",
    red: "hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    blue: "hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    none: "",
  };

  const baseClasses = `
    bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 
    rounded-2xl shadow-glass transition-all duration-300
    ${hover ? "hover:border-slate-600 hover:scale-[1.01]" : ""}
    ${glowClasses[glowColor]}
    ${className}
  `;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={baseClasses}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={baseClasses}>{children}</div>;
}