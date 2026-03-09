"use client";

import { Search, Filter, Download, Printer } from "lucide-react";

export default function StudentsToolbar() {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">

            {/* Search Bar */}
            <div className="relative w-full md:w-96">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                    type="text"
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="Cari Nama Siswa atau NISN..."
                />
            </div>

            {/* Filters & Actions */}
            <div className="flex w-full md:w-auto items-center gap-3">

                {/* Filter Dropdown */}
                <div className="relative">
                    <select className="appearance-none w-full md:w-40 rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-50 transition-all">
                        <option value="">Semua Kelas</option>
                        <option value="X">Kelas X</option>
                        <option value="XI">Kelas XI</option>
                        <option value="XII">Kelas XII</option>
                    </select>
                    <Filter className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3 ml-1">
                    <button className="p-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all" title="Export Excel">
                        <Download size={20} />
                    </button>
                    <button className="p-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all" title="Print PDF">
                        <Printer size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
