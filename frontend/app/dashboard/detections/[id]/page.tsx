"use client";

import EvidenceViewer from "@/components/EvidenceViewer";

export default function DetectionDetailPage({ params }: { params: { id: string } }) {
    // Mock data fetching based on ID - in real app would use useEffect + API
    // Using ID to generate unique-ish mock data or fetched data
    const detectionId = parseInt(params.id);

    // Example "Original" image from our mock data or real backend
    // Since we don't have a real list of IDs handy without fetching, passing a placeholder or consistent URL
    const imageUrl = `/images/demo/detection_${(detectionId % 3) + 1}.jpg`;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Detection Details #{params.id}</h1>
                <p className="text-slate-500">Review evidence and manage data privacy.</p>
            </div>

            <EvidenceViewer
                detectionId={detectionId}
                initialImageUrl="http://localhost:8000/screenshots/no_helmet_2025-12-25_09-28-44.jpg" // Example real path from previous logs or dynamic
                bbox={[100, 100, 300, 400]}
            />

            {/* Fallback note if image 404s in demo */}
            <p className="text-xs text-slate-400 italic">
                * Static demo image path used for verification. In production, this loads dynamic `/api/v1/images/{id}`
            </p>
        </div>
    );
}
