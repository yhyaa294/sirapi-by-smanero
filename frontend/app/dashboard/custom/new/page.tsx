"use client";

import { useState } from 'react';
import { Save, Plus, BarChart2, Map, Layout, Trash, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewDashboardPage() {
    const router = useRouter();
    const [name, setName] = useState('New Dashboard');
    const [widgets, setWidgets] = useState<any[]>([]);

    const addWidget = (type: string) => {
        setWidgets([...widgets, { type, id: Date.now(), w: 6, h: 4 }]);
    };

    const handleSave = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/v1/dashboards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    widgets: JSON.stringify(widgets),
                    is_shared: false
                })
            });
            if (res.ok) {
                router.push('/dashboard/custom');
            }
        } catch (e) {
            alert("Failed to save");
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none transition-colors"
                />
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Calendar size={18} /> Schedule Report
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                        <Save size={18} /> Save Dashboard
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex gap-6 flex-1">
                {/* Toolbox */}
                <div className="w-64 space-y-4">
                    <p className="text-xs font-bold text-slate-500 uppercase">Add Widgets</p>
                    <button
                        onClick={() => addWidget('chart')}
                        className="w-full p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-indigo-500 hover:shadow-md transition-all text-left"
                    >
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BarChart2 size={20} /></div>
                        <div>
                            <span className="font-bold text-sm block">Chart</span>
                            <span className="text-xs text-slate-400">Time-series data</span>
                        </div>
                    </button>
                    <button
                        onClick={() => addWidget('map')}
                        className="w-full p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-emerald-500 hover:shadow-md transition-all text-left"
                    >
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Map size={20} /></div>
                        <div>
                            <span className="font-bold text-sm block">Map</span>
                            <span className="text-xs text-slate-400">Heatmap view</span>
                        </div>
                    </button>
                    {/* More widgets... */}
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 p-8 min-h-[600px] relative">
                    {widgets.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">
                            <div className="text-center">
                                <Layout size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Drag and drop widgets here (Simulator)</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        {widgets.map(w => (
                            <div key={w.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[200px] relative group">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setWidgets(widgets.filter(x => x.id !== w.id))} className="text-red-400 hover:bg-red-50 p-1 rounded">
                                        <Trash size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-center h-full text-slate-300 font-bold text-xl uppercase tracking-widest">
                                    {w.type} Widget Placeholder
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
