export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(251,146,60,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,146,60,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      {/* Glowing Orb Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-orange-500/20 via-transparent to-emerald-500/20 blur-3xl"></div>

      {/* Spinner Container */}
      <div className="relative z-10">
        {/* Outer Ring */}
        <div className="w-24 h-24 rounded-full border-4 border-slate-800 relative">
          {/* Spinning Arc - Orange */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin"></div>

          {/* Spinning Arc - Emerald (slower, opposite) */}
          <div
            className="absolute inset-2 rounded-full border-4 border-transparent border-b-emerald-500"
            style={{
              animation: 'spin 1.5s linear infinite reverse'
            }}
          ></div>

          {/* Center Dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-emerald-500 animate-pulse shadow-lg shadow-orange-500/50"></div>
          </div>
        </div>

        {/* Pulsing Rings */}
        <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-ping"></div>
      </div>

      {/* Loading Text */}
      <div className="mt-8 text-center z-10">
        <p className="text-lg font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-emerald-400 animate-pulse tracking-widest">
          SYSTEM INITIALIZING...
        </p>
        <p className="mt-2 text-xs text-slate-500 font-mono">
          SmartAPD Command Center
        </p>
      </div>

      {/* Loading Bar - Using Tailwind animate-pulse as fallback */}
      <div className="mt-6 w-48 h-1 bg-slate-800 rounded-full overflow-hidden z-10">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full"
          style={{
            animation: 'loadingBar 1.5s ease-in-out infinite'
          }}
        ></div>
      </div>

      {/* Inline keyframes using a regular style tag (works in Server Components) */}
      <style dangerouslySetInnerHTML={{
        __html: `
                    @keyframes loadingBar {
                        0% { width: 0%; margin-left: 0%; }
                        50% { width: 60%; margin-left: 20%; }
                        100% { width: 0%; margin-left: 100%; }
                    }
                `
      }} />
    </div>
  );
}
