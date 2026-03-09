"use client";

// Skeleton Loading Components for SiRapi
// Provides instant visual feedback while content loads

interface SkeletonProps {
    className?: string;
}

// Basic skeleton block
export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded-lg ${className}`}
            style={{ animation: "shimmer 1.5s infinite" }}
        />
    );
}

// Skeleton for stat cards
export function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
        </div>
    );
}

// Skeleton for camera cards
export function CameraCardSkeleton() {
    return (
        <div className="bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800">
            <div className="relative aspect-video">
                <Skeleton className="absolute inset-0 bg-slate-800" />
            </div>
            <div className="p-3 bg-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 bg-slate-700" />
                    <Skeleton className="h-5 w-16 rounded-full bg-slate-700" />
                </div>
                <Skeleton className="h-3 w-32 bg-slate-800" />
            </div>
        </div>
    );
}

// Skeleton for alert items
export function AlertSkeleton() {
    return (
        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="w-6 h-6 rounded" />
        </div>
    );
}

// Skeleton for full dashboard
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>

            {/* Camera Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CameraCardSkeleton />
                <CameraCardSkeleton />
                <CameraCardSkeleton />
                <CameraCardSkeleton />
            </div>
        </div>
    );
}

// Skeleton for table rows
export function TableRowSkeleton() {
    return (
        <tr className="border-b border-slate-100">
            <td className="p-4"><Skeleton className="h-4 w-20" /></td>
            <td className="p-4"><Skeleton className="h-4 w-24" /></td>
            <td className="p-4"><Skeleton className="h-4 w-32" /></td>
            <td className="p-4"><Skeleton className="h-4 w-16" /></td>
            <td className="p-4"><Skeleton className="h-8 w-20 rounded-lg" /></td>
        </tr>
    );
}

// Page loading wrapper
export function PageLoading({ message = "Memuat..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="relative">
                {/* Spinning loader */}
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-orange-500 animate-spin" />
            </div>
            <p className="text-sm text-slate-500 font-medium animate-pulse">{message}</p>
        </div>
    );
}

// Inline button loading spinner
export function ButtonSpinner({ size = 16 }: { size?: number }) {
    return (
        <svg
            className="animate-spin"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <circle cx="12" cy="12" r="10" className="opacity-25" />
            <path
                d="M4 12a8 8 0 018-8"
                className="opacity-75"
            />
        </svg>
    );
}

// CSS for shimmer animation (add to globals.css or use inline)
export const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;
