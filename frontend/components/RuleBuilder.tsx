"use client";

import { useState } from 'react';
import { Play, Save, Plus, Trash2, Zap } from 'lucide-react';

interface AlertRule {
    ID?: number;
    name: string;
    condition: string;
    threshold: number;
    window_minutes: number;
    channels: string[];
    enabled: boolean;
}

export default function RuleBuilder() {
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [currentRule, setCurrentRule] = useState<AlertRule>({
        name: "",
        condition: "confidence_gt",
        threshold: 80,
        window_minutes: 5,
        channels: ["telegram"],
        enabled: true
    });
    const [simulateResult, setSimulateResult] = useState<any>(null);

    const handleSave = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/v1/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentRule)
            });
            if (res.ok) {
                alert("Rule saved!");
                // Reload rules (mock)
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSimulate = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/v1/rules/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rule: currentRule,
                    sample: {
                        confidence: 0.95,
                        violation_type: "no_helmet"
                    }
                })
            });
            const data = await res.json();
            setSimulateResult(data);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Zap className="text-orange-500" /> Rule Configuration
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rule Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-xl text-sm"
                            value={currentRule.name}
                            onChange={e => setCurrentRule({ ...currentRule, name: e.target.value })}
                            placeholder="e.g. Critical Helmet Violation"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Condition</label>
                            <select
                                className="w-full px-4 py-2 border rounded-xl text-sm bg-white"
                                value={currentRule.condition}
                                onChange={e => setCurrentRule({ ...currentRule, condition: e.target.value })}
                            >
                                <option value="confidence_gt">Confidence &gt;</option>
                                <option value="count_gt">Count &gt; (in window)</option>
                                <option value="violation_type">Specific Violation</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Threshold / Value</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 border rounded-xl text-sm"
                                value={currentRule.threshold}
                                onChange={e => setCurrentRule({ ...currentRule, threshold: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Window (Minutes)</label>
                        <input
                            type="range" min="1" max="60"
                            className="w-full accent-orange-500"
                            value={currentRule.window_minutes}
                            onChange={e => setCurrentRule({ ...currentRule, window_minutes: parseInt(e.target.value) })}
                        />
                        <div className="text-right text-xs text-slate-500">{currentRule.window_minutes} mins</div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={handleSimulate}
                            className="flex-1 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Play size={16} /> Test / Simulate
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <Save size={16} /> Save Rule
                        </button>
                    </div>
                </div>
            </div>

            {/* Simulation Result */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Simulation Result</h3>
                <div className="bg-white p-4 rounded-xl border border-slate-200 min-h-[200px] font-mono text-sm">
                    {!simulateResult ? (
                        <span className="text-slate-400">Run a simulation to see logic evaluation...</span>
                    ) : (
                        <div className="space-y-2">
                            <div className={`flex items-center gap-2 font-bold ${simulateResult.triggered ? 'text-red-500' : 'text-emerald-500'}`}>
                                {simulateResult.triggered ? <AlertTriangle size={16} /> : <Check size={16} />}
                                {simulateResult.triggered ? 'TRIGGERED' : 'PASSED (NO ALERT)'}
                            </div>
                            <div className="text-slate-600">
                                Reason: {simulateResult.reason}
                            </div>
                            <div className="text-xs text-slate-400 mt-4 border-t pt-2">
                                Sample Input: Confidence 95%, No Helmet
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
