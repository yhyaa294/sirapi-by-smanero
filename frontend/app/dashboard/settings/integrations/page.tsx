"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Play, Webhook, Slack, List } from "lucide-react";

interface Integration {
    ID: number;
    type: string;
    name: string;
    config: string;
    enabled: boolean;
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [editing, setEditing] = useState<Partial<Integration> | null>(null);
    const [configJson, setConfigJson] = useState('{"url": "https://..."}');
    const [testingId, setTestingId] = useState<number | null>(null);

    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        const res = await fetch('http://localhost:8080/api/v1/integrations');
        const data = await res.json();
        if (data.success) setIntegrations(data.data);
    };

    const handleSave = async () => {
        if (!editing) return;

        try {
            // Validate JSON
            JSON.parse(configJson);

            const payload = { ...editing, config: configJson };
            const method = editing.ID ? 'PUT' : 'POST';
            const url = editing.ID
                ? `http://localhost:8080/api/v1/integrations/${editing.ID}`
                : `http://localhost:8080/api/v1/integrations`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                loadIntegrations();
                setEditing(null);
            } else {
                alert("Failed to save");
            }
        } catch (e) {
            alert("Invalid Configuration JSON");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this integration?")) return;
        await fetch(`http://localhost:8080/api/v1/integrations/${id}`, { method: 'DELETE' });
        loadIntegrations();
    };

    const handleTest = async (id: number) => {
        setTestingId(id);
        try {
            const res = await fetch(`http://localhost:8080/api/v1/integrations/test/${id}`, { method: 'POST' });
            const data = await res.json();
            alert(data.message || (data.success ? "Test Success" : "Test Failed"));
        } catch (e) {
            alert("Test Error");
        } finally {
            setTestingId(null);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
                    <p className="text-slate-500">Connect with external services (Webhook, Slack, Jira).</p>
                </div>
                <button
                    onClick={() => {
                        setEditing({ type: 'webhook', name: 'New Webhook', enabled: true });
                        setConfigJson('{"url": "https://..."}');
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors"
                >
                    <Plus size={18} /> Add Integration
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {integrations.map(int => (
                    <div key={int.ID} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${int.type === 'slack' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                {int.type === 'slack' ? <Slack size={24} /> : <Webhook size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{int.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="uppercase font-mono bg-slate-100 px-1.5 py-0.5 rounded">{int.type}</span>
                                    {int.enabled ? <span className="text-emerald-600 font-bold">Active</span> : <span className="text-slate-400">Disabled</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleTest(int.ID)}
                                disabled={testingId === int.ID}
                                className="px-3 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                            >
                                <Play size={16} className={testingId === int.ID ? "animate-spin" : ""} /> Test
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(int);
                                    setConfigJson(int.config);
                                }}
                                className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(int.ID)}
                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal / Form Overlay */}
            {editing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-xl font-bold mb-4">{editing.ID ? 'Edit Integration' : 'New Integration'}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                                <input
                                    className="w-full px-4 py-2 border rounded-xl text-sm"
                                    value={editing.name}
                                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-xl text-sm bg-white"
                                    value={editing.type}
                                    onChange={e => setEditing({ ...editing, type: e.target.value })}
                                >
                                    <option value="webhook">Webhook</option>
                                    <option value="slack">Slack</option>
                                    <option value="jira">Jira</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Configuration (JSON)</label>
                                <textarea
                                    className="w-full px-4 py-2 border rounded-xl text-sm font-mono h-32"
                                    value={configJson}
                                    onChange={e => setConfigJson(e.target.value)}
                                />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editing.enabled}
                                    onChange={e => setEditing({ ...editing, enabled: e.target.checked })}
                                    className="rounded border-slate-300 text-slate-900 focus:ring-0"
                                />
                                <span className="text-sm font-medium text-slate-700">Enable this integration</span>
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setEditing(null)}
                                className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 rounded-xl flex items-center gap-2"
                            >
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
