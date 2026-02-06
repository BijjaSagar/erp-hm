const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('Starting PDF generation...');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    const htmlPath = path.join(__dirname, 'HM_ERP_USER_GUIDE.html');
    const pdfPath = path.join(__dirname, 'HM_ERP_Complete_User_Guide.pdf');

    console.log('Loading HTML file:', htmlPath);
    await page.goto(`file://${htmlPath}`, {
        waitUntil: 'networkidle0'
    });

    console.log('Generating PDF...');
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
        }
    });

    await browser.close();

    console.log('✅ PDF created successfully:', pdfPath);
})();
