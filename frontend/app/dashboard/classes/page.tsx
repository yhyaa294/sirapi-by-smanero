import { Building2 } from "lucide-react";

export default function ClassesPage() {
    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-4">Kelas & Pelanggaran</h1>

            <div className="glass-card p-16 text-center shadow-soft relative overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>

                <div className="w-24 h-24 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/10 relative z-10">
                    <Building2 size={48} className="text-primary/60" />
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-wide relative z-10">Manajemen Kelas</h3>
                <p className="text-sm font-medium text-slate-500 max-w-md mx-auto mb-8 leading-relaxed relative z-10">
                    Halaman Manajemen Kelas sedang dalam tahap pengembangan. Fitur ini akan segera tersedia pada pembaruan berikutnya.
                </p>
            </div>
        </div>
    );
}
