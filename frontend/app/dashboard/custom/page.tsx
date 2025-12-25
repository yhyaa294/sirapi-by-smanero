"use client";

import { useState, useEffect } from "react";
import { Plus, Layout, Trash2, Save, Calendar, BarChart2, Map as MapIcon, Table } from "lucide-react";
import Link from "next/link";

interface Dashboard {
    ID: number;
    name: string;
    widgets: string; // JSON
}

export default function CustomDashboardsPage() {
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8080/api/v1/dashboards')
            .then(res => res.json())
            .then(data => {
                if (data.success) setDashboards(data.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Custom Dashboards</h1>
                    <p className="text-slate-500">Create and manage your personalized monitoring views.</p>
                </div>
                <Link href="/dashboard/custom/new">
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors">
                        <Plus size={18} /> New Dashboard
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dashboards.map(d => (
                    <div key={d.ID} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Layout size={24} />
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{d.name}</h3>
                        <p className="text-xs text-slate-500 mb-4">Last updated just now</p>

                        <div className="flex gap-2">
                            <Link href={`/dashboard/custom/${d.ID}`} className="w-full">
                                <button className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                                    Open
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {dashboards.length === 0 && !loading && (
                    <div className="col-span-3 py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                        <Layout size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No custom dashboards yet. Create one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
