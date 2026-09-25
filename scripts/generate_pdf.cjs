const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { marked } = require('../frontend/node_modules/marked');

const mdPath = path.resolve(__dirname, '../docs/MySivi_Ad_Intelligence_Report.md');
const pdfPath = path.resolve(__dirname, '../docs/MySivi_Ad_Intelligence_Report.pdf');
const htmlTempPath = path.resolve(__dirname, '../docs/report_temp.html');

const mdContent = fs.readFileSync(mdPath, 'utf-8');

// Parse Markdown into HTML
const parsedHtml = marked.parse(mdContent);

// Build complete HTML with printable styling
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MySivi Ad Intelligence Platform — Technical Methodology & Executive Report</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 11.5pt;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 18pt;
      color: #1e1b4b;
      border-bottom: 2.5px solid #4f46e5;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    h2 {
      font-size: 14pt;
      color: #312e81;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 12pt;
      color: #4338ca;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    p, ul, ol {
      margin-top: 6px;
      margin-bottom: 8px;
    }
    li {
      margin-bottom: 4px;
    }
    strong {
      color: #0f172a;
    }
    blockquote {
      margin: 10px 0;
      padding: 8px 14px;
      border-left: 3.5px solid #6366f1;
      background-color: #f8fafc;
      color: #334155;
      font-style: italic;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 9px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 600;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 10px 12px;
      border-radius: 5px;
      font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 8.5pt;
      line-height: 1.35;
      overflow-x: auto;
      page-break-inside: avoid;
      white-space: pre;
    }
    code {
      font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 9.5pt;
      background-color: #f1f5f9;
      padding: 1px 4px;
      border-radius: 3px;
      color: #0f172a;
    }
    pre code {
      background: none;
      padding: 0;
      color: inherit;
      font-size: inherit;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 16px 0;
    }
    a {
      color: #4f46e5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  ${parsedHtml}
</body>
</html>`;

fs.writeFileSync(htmlTempPath, fullHtml, 'utf-8');

// Find Chrome or Edge executable
const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let browserPath = null;
for (const cand of chromeCandidates) {
  if (fs.existsSync(cand)) {
    browserPath = cand;
    break;
  }
}

if (!browserPath) {
  console.error('Error: No Chrome or Edge executable found to render PDF.');
  process.exit(1);
}

console.log('Using browser:', browserPath);
const fileUrl = 'file:///' + htmlTempPath.replace(/\\/g, '/');

const chromeCmd = `"${browserPath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${fileUrl}"`;

try {
  execSync(chromeCmd, { stdio: 'inherit' });
  console.log('PDF generated at:', pdfPath);
} catch (e) {
  console.error('Error generating PDF:', e);
  process.exit(1);
} finally {
  if (fs.existsSync(htmlTempPath)) {
    fs.unlinkSync(htmlTempPath);
  }
}

// Inspect PDF output
if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  const pdfBuffer = fs.readFileSync(pdfPath);
  
  // Count pages via PDF trailer / object scan
  const pageMatches = pdfBuffer.toString('binary').match(/\/Type\s*\/Page[^s]/g);
  const pageCount = pageMatches ? pageMatches.length : 'unknown';

  console.log('--- PDF Verification Summary ---');
  console.log('File:', pdfPath);
  console.log('Size:', (stats.size / 1024).toFixed(1) + ' KB (' + stats.size + ' bytes)');
  console.log('Page Count:', pageCount);
} else {
  console.error('Error: Output PDF was not created.');
  process.exit(1);
}
