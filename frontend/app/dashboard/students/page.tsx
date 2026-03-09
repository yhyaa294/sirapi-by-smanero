"use client";

import { useState } from "react";
import { Plus, ChevronRight, Users, FileX } from "lucide-react";
import Link from "next/link";

// Data Type
interface Student {
    id: string;
    name: string;
    nisn: string;
    class: string;
    photoUrl: string;
    disciplineScore: number;
    status: "Lengkap" | "Tanpa Dasi" | "Terlambat";
}

// Empty Data - Ready for backend integration
const STUDENTS_DATA: Student[] = [];

export default function StudentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClass, setSelectedClass] = useState("");

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Link href="/dashboard" className="hover:text-slate-700 transition-colors">Dashboard</Link>
                        <ChevronRight size={14} />
                        <span className="font-semibold text-primary">Data Siswa</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Data Siswa</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2.5 glass-card text-slate-600 rounded-xl text-sm font-bold shadow-sm">
                        Total: <span className="text-primary">{STUDENTS_DATA.length}</span> Siswa
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5">
                        <Plus size={18} />
                        Tambah Siswa
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="glass-card p-5">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Cari Nama Siswa atau NISN..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-5 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none placeholder:text-slate-400 bg-white/50"
                        />
                    </div>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white/50 text-slate-600 outline-none"
                    >
                        <option value="">Semua Kelas</option>
                    </select>
                </div>
            </div>

            {/* Empty State */}
            {STUDENTS_DATA.length === 0 ? (
                <div className="glass-card p-16 text-center shadow-soft relative overflow-hidden">
                    {/* Decorative Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>

                    <div className="w-24 h-24 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/10 relative z-10">
                        <Users size={48} className="text-primary/60" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-wide relative z-10">Belum Ada Data Siswa</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-md mx-auto mb-8 leading-relaxed relative z-10">
                        Sistem memerlukan data siswa untuk pelacakan pelanggaran. Silakan tambahkan siswa baru atau import dari file Excel.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:-translate-y-0.5">
                            <Plus size={18} />
                            Tambah Manual
                        </button>
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-slate-50 transition-all border border-slate-200 shadow-sm hover:shadow-md">
                            <FileX size={18} />
                            Import Excel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Table would go here when data exists */}
                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200/50">
                                <tr>
                                    <th className="px-6 py-4 text-left font-bold">Siswa</th>
                                    <th className="px-6 py-4 text-left font-bold">Kelas</th>
                                    <th className="px-6 py-4 text-left font-bold">Skor Disiplin</th>
                                    <th className="px-6 py-4 text-left font-bold">Status Hari Ini</th>
                                    <th className="px-6 py-4 text-right font-bold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {STUDENTS_DATA.map((student) => (
                                    <tr key={student.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shadow-inner">
                                                    <span className="text-primary font-bold text-sm">
                                                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 group-hover:text-primary transition-colors">{student.name}</p>
                                                    <p className="text-xs font-medium text-slate-400 mt-0.5">{student.nisn}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-600">{student.class}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${student.disciplineScore >= 80 ? 'bg-safe/10 text-safe' :
                                                student.disciplineScore >= 60 ? 'bg-warning/10 text-warning' :
                                                    'bg-critical/10 text-critical'
                                                }`}>
                                                {student.disciplineScore}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold flex items-center gap-1.5 ${student.status === 'Lengkap' ? 'text-safe' :
                                                student.status === 'Tanpa Dasi' ? 'text-warning' :
                                                    'text-critical'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${student.status === 'Lengkap' ? 'bg-safe' :
                                                    student.status === 'Tanpa Dasi' ? 'bg-warning' :
                                                        'bg-critical'
                                                    }`}></div>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-primary hover:text-white transition-all">
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
