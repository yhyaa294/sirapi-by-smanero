"use client";

interface StatusBadgeProps {
  status: "critical" | "warning" | "success" | "offline" | "info";
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const statusConfig = {
    critical: {
      bg: "bg-red-500/20",
      border: "border-red-500/30",
      text: "text-red-400",
      dot: "bg-red-500",
      pulse: true,
    },
    warning: {
      bg: "bg-yellow-500/20",
      border: "border-yellow-500/30",
      text: "text-yellow-400",
      dot: "bg-yellow-500",
      pulse: false,
    },
    success: {
      bg: "bg-emerald-500/20",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      dot: "bg-emerald-500",
      pulse: true,
    },
    offline: {
      bg: "bg-slate-500/20",
      border: "border-slate-500/30",
      text: "text-slate-400",
      dot: "bg-slate-500",
      pulse: false,
    },
    info: {
      bg: "bg-blue-500/20",
      border: "border-blue-500/30",
      text: "text-blue-400",
      dot: "bg-blue-500",
      pulse: false,
    },
  };

  const sizeConfig = {
    sm: {
      container: "px-2 py-1 text-xs",
      dot: "w-1.5 h-1.5",
    },
    md: {
      container: "px-3 py-1.5 text-sm",
      dot: "w-2 h-2",
    },
    lg: {
      container: "px-4 py-2 text-base",
      dot: "w-2.5 h-2.5",
    },
  };

  const config = statusConfig[status];
  const sizing = sizeConfig[size];

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border backdrop-blur-sm
        ${config.bg} ${config.border} ${config.text} ${sizing.container}
        font-medium
      `}
    >
      <div
        className={`
          ${sizing.dot} rounded-full ${config.dot}
          ${config.pulse ? "animate-pulse" : ""}
        `}
      />
      {label && <span>{label}</span>}
    </div>
  );
}