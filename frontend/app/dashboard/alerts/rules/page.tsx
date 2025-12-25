"use client";

import RuleBuilder from "@/components/RuleBuilder";

export default function AlertRulesPage() {
    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Alert Rules Engine</h1>
                <p className="text-slate-500">Define logic for automated notifications and triage.</p>
            </div>

            <RuleBuilder />
        </div>
    );
}
