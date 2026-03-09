"use client";

import { Eye, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface Student {
    id: string;
    name: string;
    nisn: string;
    class: string;
    photoUrl: string;
    disciplineScore: number;
    status: "Lengkap" | "Tanpa Dasi" | "Terlambat";
}

interface StudentsTableProps {
    data: Student[];
}

export default function StudentsTable({ data }: StudentsTableProps) {

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-emerald-600";
        if (score >= 70) return "text-amber-600";
        return "text-rose-600 font-bold";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Lengkap":
                return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200"><CheckCircle size={14} /> Lengkap</span>;
            case "Tanpa Dasi":
                return <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700 border border-yellow-200"><AlertTriangle size={14} /> Tanpa Dasi</span>;
            case "Terlambat":
                return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200"><Clock size={14} /> Terlambat</span>;
            default:
                return null;
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Siswa
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Kelas
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Skor Disiplin
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Status Hari Ini
                            </th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {data.map((student) => (
                            <tr
                                key={student.id}
                                className={`hover:bg-slate-50 transition-colors ${student.disciplineScore < 70 ? 'bg-rose-50/10' : ''}`}
                            >
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 relative overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                                            {/* Avatar Placeholder */}
                                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xs">
                                                {student.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="font-bold text-slate-900">{student.name}</div>
                                            <div className="text-xs text-slate-500 font-mono">{student.nisn}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className="text-sm font-medium text-slate-700">
                                        {student.class}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${student.disciplineScore >= 90 ? 'bg-emerald-500' : student.disciplineScore >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                style={{ width: `${student.disciplineScore}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-bold ${getScoreColor(student.disciplineScore)}`}>
                                            {student.disciplineScore}
                                        </span>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {getStatusBadge(student.status)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all text-xs font-bold shadow-sm">
                                        <Eye size={14} />
                                        Lihat Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
