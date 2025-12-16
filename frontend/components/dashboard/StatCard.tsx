"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowUp, ArrowDown, LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  change?: number;
  changeType?: "increase" | "decrease";
  color?: "orange" | "red" | "green" | "blue";
  suffix?: string;
  prefix?: string;
  animate?: boolean;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  change,
  changeType,
  color = "orange",
  suffix = "",
  prefix = "",
  animate: shouldAnimate = true,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    if (shouldAnimate) {
      const controls = animate(motionValue, value, {
        duration: 1.5,
        ease: "easeOut",
      });

      const unsubscribe = rounded.on("change", (latest) => {
        setDisplayValue(latest);
      });

      return () => {
        controls.stop();
        unsubscribe();
      };
    } else {
      setDisplayValue(value);
    }
  }, [value, shouldAnimate, motionValue, rounded]);

  const colorClasses = {
    orange: {
      gradient: "from-orange-500/20 to-orange-600/5",
      border: "border-orange-500/30",
      icon: "text-orange-500",
      iconBg: "bg-orange-500/20",
    },
    red: {
      gradient: "from-red-500/20 to-red-600/5",
      border: "border-red-500/30",
      icon: "text-red-500",
      iconBg: "bg-red-500/20",
    },
    green: {
      gradient: "from-emerald-500/20 to-emerald-600/5",
      border: "border-emerald-500/30",
      icon: "text-emerald-500",
      iconBg: "bg-emerald-500/20",
    },
    blue: {
      gradient: "from-blue-500/20 to-blue-600/5",
      border: "border-blue-500/30",
      icon: "text-blue-500",
      iconBg: "bg-blue-500/20",
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`
        p-6 rounded-2xl bg-gradient-to-br backdrop-blur-sm border
        ${colors.gradient} ${colors.border}
        shadow-glass hover:shadow-xl transition-all duration-300
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 ${colors.iconBg} rounded-xl backdrop-blur-sm`}>
          <Icon size={20} className={colors.icon} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-xl font-bold text-white">{prefix}</span>}
          <span className="text-3xl font-black text-white">
            {displayValue.toLocaleString()}
          </span>
          {suffix && <span className="text-lg font-semibold text-slate-400">{suffix}</span>}
        </div>

        {change !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className={`
              flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg
              ${
                changeType === "increase"
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-red-400 bg-red-500/10"
              }
            `}
          >
            {changeType === "increase" ? (
              <ArrowUp size={14} />
            ) : (
              <ArrowDown size={14} />
            )}
            {Math.abs(change)}%
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}