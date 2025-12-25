const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

async function generateReport() {
    try {
        console.log('Starting PDF Generation...');

        // Paths
        const templatePath = path.join(__dirname, '../public/reports/templates/smartapd_report.html');
        // CSS is linked relatively in HTML, but Puppeteer needs help sometimes with local files if not serving via HTTP.
        // For robustness in this script, we'll read CSS and inject it.
        const cssPath = path.join(__dirname, '../public/reports/templates/smartapd_report.css');
        const dataPath = path.join(__dirname, '../public/reports/sample_payload.json');
        const outputPath = path.join(__dirname, '../public/reports/SmartAPD_Report_Sample.pdf');

        // Read files
        const htmlTemplate = fs.readFileSync(templatePath, 'utf8');
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // Handle Base URL for CI/Local
        // If REPORT_BASE_URL is not set, we use the local file system path for public assets to ensure images load
        const baseUrl = process.env.REPORT_BASE_URL || 'file://' + path.join(__dirname, '../public').replace(/\\/g, '/');
        const templateStr = htmlTemplate.replace(/http:\/\/localhost:3000/g, baseUrl);

        // Compile Template
        const template = handlebars.compile(templateStr);
        const html = template(data);

        // Function to inject CSS into HTML head
        const finalHtml = html.replace('</head>', `<style>${cssContent}</style></head>`);

        // Launch Browser
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Check if dev server is running (optional check, but we fallback to file injection)
        // We set content directly.
        await page.setContent(finalHtml, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Generate PDF
        await page.pdf({
            path: outputPath,
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            }
        });

        await browser.close();
        console.log(`PDF Generated successfully: ${outputPath}`);

    } catch (e) {
        console.error('PDF Generation Failed:', e);
        process.exit(1);
    }
}

generateReport();
