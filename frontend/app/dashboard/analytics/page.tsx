"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, Download, FileSpreadsheet, File, FileText, Loader2, CheckCircle } from "lucide-react";
import { api, Stats } from "@/services/api";
import jsPDF from "jspdf";

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState<"charts" | "reports">("charts");
    const [dateRange, setDateRange] = useState("7d");
    const [reportType, setReportType] = useState("daily");
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
    const [stats, setStats] = useState<Stats>({
        compliance: 82.5,
        totalDetections: 1247,
        violationsToday: 89,
        workersActive: 4
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getDetectionStats();
                setStats({
                    compliance: data?.compliance ?? 82.5,
                    totalDetections: data?.totalDetections ?? 0,
                    violationsToday: data?.violationsToday ?? 0,
                    workersActive: data?.workersActive ?? 4
                });
            } catch (error) {
                console.error('Gagal mengambil data:', error);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    // Data tren mingguan
    const weeklyData = [
        { day: "Senin", value: 65 },
        { day: "Selasa", value: 78 },
        { day: "Rabu", value: 82 },
        { day: "Kamis", value: 88 },
        { day: "Jumat", value: 75 },
        { day: "Sabtu", value: 92 },
        { day: "Minggu", value: Math.round(stats.compliance) },
    ];

    // Data zona
    const zoneData = [
        { zone: "A", name: "Gudang Utama", value: 96, status: "Baik" },
        { zone: "B", name: "Area Assembly", value: 78, status: "Waspada" },
        { zone: "C", name: "Welding Bay", value: 92, status: "Baik" },
        { zone: "D", name: "Loading Dock", value: 65, status: "Kritis" },
    ];

    // Data jenis pelanggaran
    const violationTypes = [
        { type: "Tanpa Helm", count: 45, percent: 51, severity: "Tinggi" },
        { type: "Tanpa Rompi", count: 28, percent: 32, severity: "Sedang" },
        { type: "Tanpa Sarung Tangan", count: 12, percent: 14, severity: "Sedang" },
        { type: "Tanpa Sepatu Safety", count: 4, percent: 4, severity: "Rendah" },
    ];

    // RIWAYAT PELANGGARAN - Data konkret dengan waktu dan lokasi
    const violationHistory = [
        { id: 1, waktu: "19/12/2024 06:15", zona: "TITIK D", lokasi: "Loading Dock", jenis: "Tanpa Helm", pekerja: "Pekerja #127", status: "Belum Ditangani" },
        { id: 2, waktu: "19/12/2024 05:48", zona: "TITIK B", lokasi: "Area Assembly", jenis: "Tanpa Rompi", pekerja: "Pekerja #089", status: "Ditangani" },
        { id: 3, waktu: "19/12/2024 05:32", zona: "TITIK C", lokasi: "Welding Bay", jenis: "Tanpa Sarung Tangan", pekerja: "Pekerja #156", status: "Ditangani" },
        { id: 4, waktu: "18/12/2024 16:45", zona: "TITIK A", lokasi: "Gudang Utama", jenis: "Tanpa Helm", pekerja: "Pekerja #203", status: "Ditangani" },
        { id: 5, waktu: "18/12/2024 14:22", zona: "TITIK D", lokasi: "Loading Dock", jenis: "Tanpa Sepatu Safety", pekerja: "Pekerja #078", status: "Ditangani" },
        { id: 6, waktu: "18/12/2024 11:10", zona: "TITIK B", lokasi: "Area Assembly", jenis: "Tanpa Helm", pekerja: "Pekerja #145", status: "Ditangani" },
        { id: 7, waktu: "17/12/2024 15:55", zona: "TITIK C", lokasi: "Welding Bay", jenis: "Tanpa Rompi", pekerja: "Pekerja #067", status: "Ditangani" },
        { id: 8, waktu: "17/12/2024 09:30", zona: "TITIK A", lokasi: "Gudang Utama", jenis: "Tanpa Sarung Tangan", pekerja: "Pekerja #234", status: "Ditangani" },
    ];

    const today = new Date();
    const judulLaporan = reportType === 'daily' ? 'LAPORAN HARIAN' :
        reportType === 'weekly' ? 'LAPORAN MINGGUAN' : 'LAPORAN BULANAN';
    const tanggalStr = today.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Generate CSV
    const generateCSV = () => {
        const lines = [
            'SMARTAPD - SISTEM MONITORING KESELAMATAN KERJA (K3)',
            'Sistem Deteksi APD Berbasis Kecerdasan Buatan',
            '',
            `${judulLaporan}`,
            `Tanggal: ${tanggalStr}`,
            `Dibuat: ${today.toLocaleString('id-ID')}`,
            '',
            '=== RINGKASAN STATISTIK ===',
            'Metrik,Nilai,Perubahan',
            `Tingkat Kepatuhan APD,${stats.compliance.toFixed(1)}%,+5.2%`,
            `Total Deteksi AI,${stats.totalDetections.toLocaleString()},+127`,
            `Pelanggaran Hari Ini,${stats.violationsToday},-23`,
            `Kamera Aktif,4/4,100%`,
            '',
            '=== RIWAYAT PELANGGARAN ===',
            'No,Waktu,Zona,Lokasi,Jenis Pelanggaran,Pekerja,Status',
            ...violationHistory.map((v, i) => `${i + 1},${v.waktu},${v.zona},${v.lokasi},${v.jenis},${v.pekerja},${v.status}`),
            '',
            '=== DISTRIBUSI JENIS PELANGGARAN ===',
            'Jenis Pelanggaran,Jumlah,Persentase,Tingkat',
            ...violationTypes.map(v => `${v.type},${v.count},${v.percent}%,${v.severity}`),
            `TOTAL,${violationTypes.reduce((a, b) => a + b.count, 0)},100%,-`,
            '',
            '=== PERFORMA PER ZONA ===',
            'Zona,Nama Lokasi,Tingkat Kepatuhan,Status',
            ...zoneData.map(z => `TITIK ${z.zone},${z.name},${z.value}%,${z.status}`),
            '',
            '© 2024 SmartAPD - Tim YAVEION',
        ];
        return lines.join('\n');
    };

    // Generate Excel
    const generateExcel = () => {
        return `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8">
<style>
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #000; padding: 8px; }
    th { background: #f97316; color: white; font-weight: bold; }
    .header { font-size: 18px; font-weight: bold; text-align: center; background: #0f172a; color: white; }
    .section { font-weight: bold; background: #f1f5f9; }
    .good { background: #dcfce7; }
    .warning { background: #fef3c7; }
    .danger { background: #fee2e2; }
</style>
</head>
<body>
<table>
    <tr><td colspan="6" class="header">🛡️ SMARTAPD - ${judulLaporan}</td></tr>
    <tr><td colspan="6">${tanggalStr}</td></tr>
    <tr><td colspan="6"></td></tr>
    
    <tr><td colspan="6" class="section">📊 RINGKASAN STATISTIK</td></tr>
    <tr><th>Metrik</th><th>Nilai</th><th>Perubahan</th><th colspan="3">Status</th></tr>
    <tr><td>Tingkat Kepatuhan APD</td><td>${stats.compliance.toFixed(1)}%</td><td>+5.2%</td><td colspan="3" class="good">Baik</td></tr>
    <tr><td>Total Deteksi AI</td><td>${stats.totalDetections.toLocaleString()}</td><td>+127</td><td colspan="3" class="good">Aktif</td></tr>
    <tr><td>Pelanggaran Hari Ini</td><td>${stats.violationsToday}</td><td>-23</td><td colspan="3" class="warning">Dipantau</td></tr>
    <tr><td>Kamera Aktif</td><td>4/4</td><td>100%</td><td colspan="3" class="good">Online</td></tr>
    <tr><td colspan="6"></td></tr>
    
    <tr><td colspan="6" class="section">📋 RIWAYAT PELANGGARAN</td></tr>
    <tr><th>No</th><th>Waktu</th><th>Zona</th><th>Lokasi</th><th>Jenis Pelanggaran</th><th>Status</th></tr>
    ${violationHistory.map((v, i) => `<tr><td>${i + 1}</td><td>${v.waktu}</td><td>${v.zona}</td><td>${v.lokasi}</td><td>${v.jenis}</td><td class="${v.status === 'Belum Ditangani' ? 'danger' : 'good'}">${v.status}</td></tr>`).join('')}
    <tr><td colspan="6"></td></tr>
    
    <tr><td colspan="6" class="section">⚠️ DISTRIBUSI JENIS PELANGGARAN</td></tr>
    <tr><th>Jenis</th><th>Jumlah</th><th>Persentase</th><th colspan="3">Tingkat</th></tr>
    ${violationTypes.map(v => `<tr><td>${v.type}</td><td>${v.count}</td><td>${v.percent}%</td><td colspan="3" class="${v.severity === 'Tinggi' ? 'danger' : 'warning'}">${v.severity}</td></tr>`).join('')}
    <tr><td colspan="6"></td></tr>
    
    <tr><td colspan="6" class="section">📍 PERFORMA PER ZONA</td></tr>
    <tr><th>Zona</th><th>Lokasi</th><th>Kepatuhan</th><th colspan="3">Status</th></tr>
    ${zoneData.map(z => `<tr><td>TITIK ${z.zone}</td><td>${z.name}</td><td>${z.value}%</td><td colspan="3" class="${z.value >= 90 ? 'good' : z.value >= 70 ? 'warning' : 'danger'}">${z.status}</td></tr>`).join('')}
    
    <tr><td colspan="6">© 2024 SmartAPD - Dibuat: ${today.toLocaleString('id-ID')}</td></tr>
</table>
</body></html>`;
    };

    // Generate PDF dengan jsPDF - LANGSUNG DOWNLOAD
    const generatePDF = async () => {
        console.log("=== GENERATING NEW PDF v2 ===");
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 15;

        // Load logo image as base64
        const loadLogo = (): Promise<string | null> => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/jpeg'));
                    } else {
                        resolve(null);
                    }
                };
                img.onerror = () => resolve(null);
                img.src = '/images/logo.jpg';
            });
        };

        const logoBase64 = await loadLogo();

        // ===== HEADER =====
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 32, 'F');

        // Logo - Embed actual image or fallback to styled box
        if (logoBase64) {
            doc.addImage(logoBase64, 'JPEG', 12, 6, 20, 20);
        } else {
            // Fallback: styled box
            doc.setFillColor(249, 115, 22);
            doc.roundedRect(12, 6, 20, 20, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("APD", 22, 18, { align: "center" });
        }

        // Nama brand
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("SMART", 38, 15);
        doc.setTextColor(249, 115, 22);
        doc.text("APD", 70, 15);

        // Tagline
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Sistem Deteksi APD Berbasis AI", 38, 23);

        // Judul laporan
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(judulLaporan, pageWidth - 12, 14, { align: "right" });
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(tanggalStr, pageWidth - 12, 22, { align: "right" });

        y = 42;

        // ===== STATISTIK =====
        doc.setTextColor(0, 0, 0);
        const boxWidth = 45;
        const statsData = [
            { label: "KEPATUHAN", value: `${stats.compliance.toFixed(1)}%`, trend: "+5.2%", good: true },
            { label: "TOTAL DETEKSI", value: stats.totalDetections.toLocaleString(), trend: "+127", good: true },
            { label: "PELANGGARAN", value: stats.violationsToday.toString(), trend: "-23", good: false },
            { label: "KAMERA", value: "4/4", trend: "100%", good: true },
        ];

        statsData.forEach((stat, i) => {
            const x = 12 + (i * (boxWidth + 2));
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(x, y, boxWidth, 24, 2, 2, 'FD');

            doc.setFontSize(6);
            doc.setTextColor(100, 116, 139);
            doc.text(stat.label, x + boxWidth / 2, y + 6, { align: "center" });

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text(stat.value, x + boxWidth / 2, y + 15, { align: "center" });

            doc.setFontSize(6);
            doc.setTextColor(stat.good ? 22 : 220, stat.good ? 163 : 38, stat.good ? 74 : 38);
            doc.text(stat.trend, x + boxWidth / 2, y + 21, { align: "center" });
        });

        y += 32;

        // ===== RIWAYAT PELANGGARAN (TABEL UTAMA) =====
        doc.setFillColor(241, 245, 249);
        doc.rect(12, y, pageWidth - 24, 7, 'F');
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("[1] RIWAYAT PELANGGARAN TERBARU", 15, y + 5);
        y += 10;

        // Header tabel
        doc.setFillColor(249, 115, 22);
        doc.rect(12, y, pageWidth - 24, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.text("No", 15, y + 4);
        doc.text("Waktu", 25, y + 4);
        doc.text("Zona", 58, y + 4);
        doc.text("Lokasi", 78, y + 4);
        doc.text("Jenis Pelanggaran", 110, y + 4);
        doc.text("Status", 160, y + 4);
        y += 7;

        // Isi tabel riwayat (maksimal 6 baris)
        violationHistory.slice(0, 6).forEach((v, i) => {
            const bgColor = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
            doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
            doc.rect(12, y, pageWidth - 24, 6, 'F');

            doc.setTextColor(15, 23, 42);
            doc.setFontSize(6);
            doc.setFont("helvetica", "normal");
            doc.text((i + 1).toString(), 15, y + 4);
            doc.text(v.waktu, 25, y + 4);
            doc.setFont("helvetica", "bold");
            doc.text(v.zona, 58, y + 4);
            doc.setFont("helvetica", "normal");
            doc.text(v.lokasi, 78, y + 4);
            doc.text(v.jenis, 110, y + 4);

            // Status dengan warna
            if (v.status === "Belum Ditangani") {
                doc.setTextColor(220, 38, 38);
            } else {
                doc.setTextColor(22, 163, 74);
            }
            doc.text(v.status, 160, y + 4);
            y += 6;
        });

        y += 6;

        // ===== DISTRIBUSI PELANGGARAN =====
        doc.setFillColor(241, 245, 249);
        doc.rect(12, y, pageWidth - 24, 7, 'F');
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("[2] DISTRIBUSI JENIS PELANGGARAN", 15, y + 5);
        y += 10;

        // Header tabel
        doc.setFillColor(249, 115, 22);
        doc.rect(12, y, pageWidth - 24, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.text("Jenis Pelanggaran", 15, y + 4);
        doc.text("Jumlah", 80, y + 4);
        doc.text("Persentase", 110, y + 4);
        doc.text("Tingkat Risiko", 145, y + 4);
        doc.text("Tindakan", 175, y + 4);
        y += 7;

        violationTypes.forEach((v, i) => {
            const bgColor = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
            doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
            doc.rect(12, y, pageWidth - 24, 6, 'F');

            doc.setTextColor(15, 23, 42);
            doc.setFontSize(6);
            doc.setFont("helvetica", "bold");
            doc.text(v.type, 15, y + 4);
            doc.setFont("helvetica", "normal");
            doc.text(v.count.toString(), 80, y + 4);
            doc.text(`${v.percent}%`, 110, y + 4);

            if (v.severity === "Tinggi") {
                doc.setTextColor(220, 38, 38);
            } else if (v.severity === "Sedang") {
                doc.setTextColor(217, 119, 6);
            } else {
                doc.setTextColor(22, 163, 74);
            }
            doc.text(v.severity, 145, y + 4);

            doc.setTextColor(100, 116, 139);
            doc.text(v.severity === "Tinggi" ? "Prioritas" : "Pantau", 175, y + 4);
            y += 6;
        });

        // Total
        doc.setFillColor(241, 245, 249);
        doc.rect(12, y, pageWidth - 24, 6, 'F');
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("TOTAL", 15, y + 4);
        doc.text(violationTypes.reduce((a, b) => a + b.count, 0).toString(), 80, y + 4);
        doc.text("100%", 110, y + 4);
        y += 12;

        // ===== PERFORMA ZONA =====
        doc.setFillColor(241, 245, 249);
        doc.rect(12, y, pageWidth - 24, 7, 'F');
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("[3] PERFORMA KEPATUHAN PER ZONA", 15, y + 5);
        y += 12;

        // Kotak zona
        const zoneBoxWidth = 44;
        zoneData.forEach((z, i) => {
            const x = 12 + (i * (zoneBoxWidth + 2));

            if (z.value >= 90) {
                doc.setFillColor(240, 253, 244);
                doc.setDrawColor(134, 239, 172);
            } else if (z.value >= 70) {
                doc.setFillColor(254, 252, 232);
                doc.setDrawColor(252, 211, 77);
            } else {
                doc.setFillColor(254, 242, 242);
                doc.setDrawColor(252, 165, 165);
            }
            doc.roundedRect(x, y, zoneBoxWidth, 22, 2, 2, 'FD');

            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text(`TITIK ${z.zone}`, x + zoneBoxWidth / 2, y + 6, { align: "center" });

            doc.setFontSize(12);
            if (z.value >= 90) {
                doc.setTextColor(22, 163, 74);
            } else if (z.value >= 70) {
                doc.setTextColor(217, 119, 6);
            } else {
                doc.setTextColor(220, 38, 38);
            }
            doc.text(`${z.value}%`, x + zoneBoxWidth / 2, y + 14, { align: "center" });

            doc.setFontSize(5);
            doc.setTextColor(100, 116, 139);
            doc.text(z.name, x + zoneBoxWidth / 2, y + 19, { align: "center" });
        });

        y += 30;

        // ===== TREN MINGGUAN =====
        doc.setFillColor(241, 245, 249);
        doc.rect(12, y, pageWidth - 24, 7, 'F');
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("[4] TREN KEPATUHAN MINGGUAN", 15, y + 5);
        y += 10;

        doc.setFillColor(249, 115, 22);
        doc.rect(12, y, pageWidth - 24, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(5);
        doc.text("Hari", 20, y + 3.5);
        doc.text("Kepatuhan", 55, y + 3.5);
        doc.text("Status", 90, y + 3.5);
        doc.text("Keterangan", 130, y + 3.5);
        y += 6;

        weeklyData.forEach((w, i) => {
            const bgColor = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
            doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
            doc.rect(12, y, pageWidth - 24, 5, 'F');

            doc.setTextColor(15, 23, 42);
            doc.setFontSize(5);
            doc.setFont("helvetica", "bold");
            doc.text(w.day, 20, y + 3.5);
            doc.setFont("helvetica", "normal");
            doc.text(`${w.value}%`, 55, y + 3.5);

            if (w.value >= 90) {
                doc.setTextColor(22, 163, 74);
                doc.text("Baik", 90, y + 3.5);
            } else if (w.value >= 70) {
                doc.setTextColor(217, 119, 6);
                doc.text("Cukup", 90, y + 3.5);
            } else {
                doc.setTextColor(220, 38, 38);
                doc.text("Kritis", 90, y + 3.5);
            }

            doc.setTextColor(100, 116, 139);
            doc.text(w.value >= 90 ? "Target tercapai" : "Perlu ditingkatkan", 130, y + 3.5);
            y += 5;
        });

        y += 8;

        // ===== FOOTER =====
        doc.setFillColor(248, 250, 252);
        doc.rect(12, y, pageWidth - 24, 12, 'F');
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("© 2024 SmartAPD - Tim YAVEION", pageWidth / 2, y + 5, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Sistem Monitoring Keselamatan Kerja | Dibuat: ${today.toLocaleString('id-ID')}`, pageWidth / 2, y + 9, { align: "center" });

        // Simpan PDF
        const filename = `SmartAPD-${judulLaporan.replace(' ', '-')}-${today.toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    };

    // Handler download
    const handleDownload = async (format: "csv" | "excel" | "pdf") => {
        setIsGenerating(true);
        setDownloadSuccess(null);

        try {
            const filename = `SmartAPD-${judulLaporan.replace(' ', '-')}-${today.toISOString().split('T')[0]}`;

            if (format === "csv") {
                const csvContent = generateCSV();
                const blob = new Blob(['\ufeff' + csvContent], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${filename}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setDownloadSuccess("CSV");
            } else if (format === "excel") {
                const excelContent = generateExcel();
                const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${filename}.xls`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setDownloadSuccess("Excel");
            } else if (format === "pdf") {
                await generatePDF();
                setDownloadSuccess("PDF");
            }
        } catch (error) {
            console.error('Gagal download:', error);
        } finally {
            setIsGenerating(false);
            setTimeout(() => setDownloadSuccess(null), 3000);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="text-orange-500 w-5 h-5 md:w-6 md:h-6" />
                        Analisis & Laporan
                    </h1>
                    <p className="text-sm text-slate-500">Statistik dan ekspor laporan</p>
                </div>

                {/* Tab Toggle */}
                <div className="flex bg-slate-100 rounded-xl p-1 w-fit">
                    <button
                        onClick={() => setActiveTab("charts")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "charts" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                    >
                        📊 Grafik
                    </button>
                    <button
                        onClick={() => setActiveTab("reports")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "reports" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                    >
                        📄 Ekspor
                    </button>
                </div>
            </div>

            {/* Kartu Statistik */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Kepatuhan", value: `${stats.compliance.toFixed(1)}%`, trend: "+5.2%", up: true },
                    { label: "Total Deteksi", value: stats.totalDetections.toLocaleString(), trend: "+127", up: true },
                    { label: "Pelanggaran", value: stats.violationsToday.toString(), trend: "-23", up: false },
                    { label: "Kamera Aktif", value: "4/4", trend: "100%", up: true },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 shadow-sm">
                        <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
                        <div className="flex items-end justify-between mt-1">
                            <span className="text-lg md:text-2xl font-bold text-slate-900">{stat.value}</span>
                            <span className={`text-[10px] md:text-xs font-medium flex items-center gap-0.5 ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                                {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {activeTab === "charts" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Grafik Tren */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Tren Kepatuhan Mingguan</h3>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="text-xs md:text-sm px-2 py-1 bg-slate-100 rounded-lg border-0"
                            >
                                <option value="7d">7 Hari</option>
                                <option value="30d">30 Hari</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            {weeklyData.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 w-12">{item.day.slice(0, 3)}</span>
                                    <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${item.value >= 90 ? 'bg-emerald-500' : item.value >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 w-10 text-right">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Jenis Pelanggaran */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Jenis Pelanggaran</h3>
                        <div className="space-y-4">
                            {violationTypes.map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-700">{item.type}</span>
                                        <span className="font-medium text-slate-900">{item.count} <span className="text-slate-400">({item.percent}%)</span></span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${item.severity === 'Tinggi' ? 'bg-red-500' : item.severity === 'Sedang' ? 'bg-amber-500' : 'bg-blue-400'}`} style={{ width: `${item.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Total Pelanggaran</span>
                                <span className="font-bold text-slate-900">{stats.violationsToday}</span>
                            </div>
                        </div>
                    </div>

                    {/* Performa Zona */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Performa per Zona</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {zoneData.map((z, i) => (
                                <div key={i} className={`p-3 md:p-4 rounded-xl border-2 ${z.value >= 90 ? "border-emerald-200 bg-emerald-50" : z.value >= 70 ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-slate-800">TITIK {z.zone}</span>
                                        <span className={`text-lg font-bold ${z.value >= 90 ? "text-emerald-600" : z.value >= 70 ? "text-amber-600" : "text-red-600"}`}>{z.value}%</span>
                                    </div>
                                    <p className="text-xs text-slate-500">{z.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* TAMPILAN EKSPOR */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Ekspor Laporan</h3>

                        {/* Tipe Laporan */}
                        <div className="mb-4">
                            <label className="text-sm text-slate-600 mb-2 block">Periode</label>
                            <div className="grid grid-cols-3 gap-2">
                                {["daily", "weekly", "monthly"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setReportType(type)}
                                        className={`py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${reportType === type ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600"}`}
                                    >
                                        {type === "daily" ? "Harian" : type === "weekly" ? "Mingguan" : "Bulanan"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tombol Download */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => handleDownload("csv")}
                                disabled={isGenerating}
                                className="flex flex-col items-center gap-1 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <FileSpreadsheet size={24} />}
                                <span className="text-sm font-medium">CSV</span>
                            </button>
                            <button
                                onClick={() => handleDownload("excel")}
                                disabled={isGenerating}
                                className="flex flex-col items-center gap-1 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <FileSpreadsheet size={24} />}
                                <span className="text-sm font-medium">Excel</span>
                            </button>
                            <button
                                onClick={() => handleDownload("pdf")}
                                disabled={isGenerating}
                                className="flex flex-col items-center gap-1 p-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <File size={24} />}
                                <span className="text-sm font-medium">PDF</span>
                            </button>
                        </div>

                        {/* Pesan Sukses */}
                        {downloadSuccess && (
                            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700">
                                <CheckCircle size={18} />
                                <span className="text-sm font-medium">{downloadSuccess} berhasil diunduh!</span>
                            </div>
                        )}

                        {/* Info */}
                        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-sm text-slate-600">
                            <p>📊 <strong>CSV:</strong> Langsung download, bisa dibuka di Excel</p>
                            <p>📗 <strong>Excel:</strong> Tabel lengkap dengan warna dan format</p>
                            <p>📄 <strong>PDF:</strong> Laporan profesional langsung download</p>
                        </div>
                    </div>

                    {/* Riwayat */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Riwayat Unduhan</h3>
                        <div className="space-y-2">
                            {[
                                { name: "Harian - 19 Des", size: "245 KB", type: "PDF" },
                                { name: "Harian - 18 Des", size: "120 KB", type: "Excel" },
                                { name: "Mingguan - M51", size: "89 KB", type: "CSV" },
                            ].map((r, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-orange-500" />
                                        <div>
                                            <span className="text-sm text-slate-700 block">{r.name}</span>
                                            <span className="text-xs text-slate-400">{r.type}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500">{r.size}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
