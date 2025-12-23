export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                    <div>
                        <div className="h-6 w-48 bg-slate-200 rounded"></div>
                        <div className="h-4 w-32 bg-slate-100 rounded mt-1"></div>
                    </div>
                </div>
                <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
            </div>

            {/* Stats Row Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 bg-white/90 border border-slate-200 rounded-2xl p-6 h-32">
                    <div className="h-4 w-32 bg-slate-200 rounded mb-3"></div>
                    <div className="h-10 w-24 bg-slate-300 rounded"></div>
                </div>
                <div className="bg-white/90 border border-slate-200 rounded-2xl p-5 h-32">
                    <div className="h-8 w-8 bg-slate-200 rounded-xl mb-3"></div>
                    <div className="h-8 w-16 bg-slate-300 rounded"></div>
                </div>
                <div className="bg-white/90 border border-slate-200 rounded-2xl p-5 h-32">
                    <div className="h-8 w-8 bg-slate-200 rounded-xl mb-3"></div>
                    <div className="h-8 w-16 bg-slate-300 rounded"></div>
                </div>
            </div>

            {/* Camera Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700">
                        <div className="aspect-video bg-slate-800 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-slate-700"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alerts Skeleton */}
            <div className="bg-white/90 border border-slate-200 rounded-2xl p-5">
                <div className="h-5 w-40 bg-slate-200 rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                            <div className="flex-1">
                                <div className="h-4 w-32 bg-slate-200 rounded mb-1"></div>
                                <div className="h-3 w-48 bg-slate-100 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
