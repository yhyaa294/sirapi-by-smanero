"use client";

import { useState, useEffect } from "react";
import { X, Download, FileText, Loader2, Eye, ShieldAlert } from "lucide-react";

import { Detection } from "@/services/api";

interface ReportExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data?: {
        stats: any;
        detections: Detection[];
        reportType: 'daily' | 'weekly' | 'monthly';
    };
}

export default function ReportExportModal({ isOpen, onClose, data }: ReportExportModalProps) {
    const [loading, setLoading] = useState(false);
    const [previewHtml, setPreviewHtml] = useState("");
    const [config, setConfig] = useState({
        template: "standard",
        includeEvidence: true,
        blurFaces: "auto"
    });

    const getPayload = () => {
        const reportType = data?.reportType || 'daily';
        const typeLabels: Record<string, string> = { daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan' };
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        // Transform Detections
        const rawViolations = (data?.detections || []).filter(d => d.is_violation);

        // Map to Report Format
        const violations = rawViolations.slice(0, 50).map(d => ({
            Time: new Date(d.detected_at || d.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            Location: d.location || `Pos ${d.camera_id}`,
            Type: d.violation_type?.replace('no_', 'No ') || 'Unknown',
            Confidence: Math.round(d.confidence * 100),
            Status: "Open",
            // Priority: Real Image URL (if stored) -> AI Engine Construct -> Placeholder
            EvidenceImage: d.image_url
                ? d.image_url
                : d.screenshot_path
                    ? `http://localhost:8000/screenshots/${d.screenshot_path}`
                    : "https://via.placeholder.com/150?text=No+Image"
        }));

        const stats = data?.stats || { compliance: 0, totalDetections: 0, violationsToday: 0 };
        const score = stats.compliance || 0;

        return {
            Title: `Laporan ${typeLabels[reportType]} Kepatuhan Seragam`,
            Unit: "SiRapi Main Facility",
            Period: reportType === 'daily' ? dateStr : `Periode: ${dateStr}`,
            GeneratedAt: now.toLocaleString('id-ID'),
            SummaryText: `Tingkat kepatuhan seragam periode ini adalah ${score.toFixed(1)}%. Sistem mendeteksi total ${stats.totalDetections} aktivitas dengan ${stats.violationsToday} insiden pelanggaran.`,
            StatusColor: score >= 90 ? "green" : score >= 75 ? "yellow" : "red",
            Recommendation: score >= 90
                ? "Kinerja sangat baik. Pertahankan kedisiplinan penggunaan seragam."
                : score >= 75
                    ? "Tingkatkan pengawasan di area rawan pelanggaran."
                    : "PERHATIAN: Kepatuhan rendah. Lakukan pembinaan dan inspeksi segera.",
            SafetyScore: Math.round(score),
            TotalViolations: stats.violationsToday,
            ViolationsIncrease: 0, // Placeholder
            TotalDetections: stats.totalDetections,
            ActiveCameras: stats.workersActive || 4,
            TotalCameras: 6,
            IncludeEvidence: config.includeEvidence,
            Options: {
                BlurFaces: config.blurFaces
            },
            Violations: violations
        };
    };

    useEffect(() => {
        if (isOpen) {
            updatePreview();
        }
    }, [isOpen, config]);

    const updatePreview = async () => {
        setLoading(true);
        try {
            const payload = { ...getPayload(), preview: true };
            const res = await fetch('/api/reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const html = await res.text();
            setPreviewHtml(html);
        } catch (e) {
            console.error(e);
            setPreviewHtml("<div class='p-4 text-red-500'>Failed to load preview</div>");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        setLoading(true);
        try {
            const payload = { ...getPayload(), preview: false };
            const res = await fetch('/api/reports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SiRapi_Report_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            alert("Download failed");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="text-orange-500" /> Export Report
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Config */}
                    <div className="w-80 border-r p-6 bg-slate-50 overflow-y-auto space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Template Style</label>
                            <select
                                value={config.template}
                                onChange={e => setConfig({ ...config, template: e.target.value })}
                                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                            >
                                <option value="standard">Standard (A4 Landscape)</option>
                                <option value="simple">Simple Summary</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Content Options</label>

                            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl mb-3">
                                <span className="text-sm font-medium">Include Evidence</span>
                                <input
                                    type="checkbox"
                                    checked={config.includeEvidence}
                                    onChange={e => setConfig({ ...config, includeEvidence: e.target.checked })}
                                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                />
                            </div>

                            {config.includeEvidence && (
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-400">Privacy & Redaction</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setConfig({ ...config, blurFaces: 'none' })}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg border ${config.blurFaces === 'none' ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-white border-slate-200 text-slate-600'}`}
                                        >
                                            No Blur
                                        </button>
                                        <button
                                            onClick={() => setConfig({ ...config, blurFaces: 'auto' })}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg border ${config.blurFaces === 'auto' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                                        >
                                            <ShieldAlert size={12} className="inline mr-1" /> Auto Blur
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t">
                            <button
                                onClick={handleDownload}
                                disabled={loading}
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading && !previewHtml ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 bg-slate-200 p-8 overflow-y-auto flex justify-center relative">
                        {/* A4 Paper Simulation */}
                        <div className="bg-white shadow-xl w-[297mm] min-h-[210mm] transition-all transform origin-top scale-75 lg:scale-90 xl:scale-100">
                            {previewHtml ? (
                                <div
                                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Loader2 className="animate-spin mb-2" size={32} />
                                    Loading Preview...
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                                <div className="bg-white px-4 py-2 rounded-full shadow-lg font-medium text-slate-600 flex items-center gap-2">
                                    <Loader2 className="animate-spin text-orange-500" size={18} /> Generating Preview...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
