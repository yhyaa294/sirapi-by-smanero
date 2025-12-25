import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

// Define Request Payload Interface
interface ReportPayload {
    Title: string;
    Unit: string;
    Period: string;
    GeneratedAt: string;
    SummaryText: string;
    StatusColor: string; // 'green', 'yellow', 'red'
    Recommendation: string;
    SafetyScore: number;
    TotalViolations: number;
    ViolationsIncrease: number;
    TotalDetections: number;
    ActiveCameras: number;
    TotalCameras: number;
    IncludeEvidence?: boolean;
    Violations: Array<{
        Time: string;
        Location: string;
        Type: string;
        Confidence: number;
        Status: string;
        EvidenceImage?: string; // Base64 or URL
    }>;
}

export async function POST(req: NextRequest) {
    try {
        const jsonBody = await req.json();
        const { preview, ...data } = jsonBody;

        // --- PRIVACY & REDACTION LOGIC ---
        if (data.IncludeEvidence && data.Options?.BlurFaces === 'auto' && data.Violations) {
            data.Violations = data.Violations.map((v: any) => {
                if (v.EvidenceImage && !v.EvidenceImage.endsWith('/blur')) {
                    // Append /blur endpoint processing
                    // AI Engine must handle this route: GET /screenshots/{filename}/blur
                    return { ...v, EvidenceImage: `${v.EvidenceImage}/blur` };
                }
                return v;
            });
        }

        // 1. Read Templates
        // Note: In production (Vercel), reading files like this might require path.join(process.cwd(), ...)
        // and ensuring files are included in the build.
        const templatePath = path.join(process.cwd(), 'public/reports/templates/smartapd_report.html');
        const cssPath = path.join(process.cwd(), 'public/reports/templates/smartapd_report.css');

        let htmlTemplate = '';
        let cssContent = '';

        try {
            htmlTemplate = fs.readFileSync(templatePath, 'utf8');
            cssContent = fs.readFileSync(cssPath, 'utf8');
        } catch (e) {
            console.error("Template reading failed:", e);
            return NextResponse.json({ error: "Report templates not found on server" }, { status: 500 });
        }

        // 2. Compile HTML with Handlebars
        // Dynamic Base URL for assets (images)
        const baseUrl = process.env.REPORT_BASE_URL || 'http://localhost:3000';
        const templateStr = htmlTemplate.replace(/http:\/\/localhost:3000/g, baseUrl);

        const template = handlebars.compile(templateStr);
        const html = template(data);

        // Inject CSS (Critical for Puppeteer rendering correctly without external requests)
        const finalHtml = html.replace('</head>', `<style>${cssContent}</style></head>`);

        // PREVIEW MODE
        if (preview) {
            return new NextResponse(finalHtml, {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
            });
        }

        // 3. Launch Puppeteer
        // Warning: This consumes significant memory. Verify hosting environment limits.
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set content and wait for network idle (images loaded)
        await page.setContent(finalHtml, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // 4. Generate PDF Buffer
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });

        await browser.close();

        // 5. Return PDF Response
        const filename = `SmartAPD_Report_${Date.now()}.pdf`;

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error("PDF Generation Error:", error);
        return NextResponse.json(
            { error: "Failed to generate report", details: String(error) },
            { status: 500 }
        );
    }
}
