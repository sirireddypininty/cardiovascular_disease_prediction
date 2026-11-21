export function getReportHtml(record) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>AI ECG Analysis Report - ${record.id}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        @media print {
          .action-bar { display: none !important; }
          body { padding: 0 !important; margin: 0 !important; }
        }
        body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0F172A;
          background: #FFFFFF;
          margin: 0;
          padding: 24px;
          line-height: 1.5;
        }
        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #0F172A;
          color: #FFFFFF;
          padding: 12px 24px;
          margin: -24px -24px 24px -24px;
          border-bottom: 2px solid #059669;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .action-btn {
          background: #059669;
          color: #FFFFFF;
          border: none;
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .action-btn:hover {
          background: #047857;
          transform: translateY(-1px);
        }
        .action-btn-secondary {
          background: rgba(255,255,255,0.1);
          color: #E2E8F0;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .action-btn-secondary:hover {
          background: rgba(255,255,255,0.2);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #059669;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        .brand {
          font-size: 22px;
          font-weight: 800;
          color: #0F172A;
        }
        .brand span { color: #059669; }
        .doc-title {
          font-size: 14px;
          font-weight: 700;
          color: #059669;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          padding: 14px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 13px;
        }
        .meta-item strong { color: #475569; }
        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #0F172A;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 6px;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          font-family: monospace;
        }
        .badge-passed { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
        .badge-failed { background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; }

        .result-box {
          background: ${record.predictionCode === 'NP' ? '#ECFDF5' : record.predictionCode === 'AH' ? '#F0FDF4' : record.predictionCode === 'H.MI' ? '#FFFBEB' : '#FEF2F2'};
          border: 1px solid ${record.predictionCode === 'NP' ? '#A7F3D0' : record.predictionCode === 'AH' ? '#BBF7D0' : record.predictionCode === 'H.MI' ? '#FDE68A' : '#FCA5A5'};
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .pred-class {
          font-size: 24px;
          font-weight: 800;
          color: #0F172A;
          margin: 4px 0;
        }
        .prob-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 13px;
        }
        .prob-table th, .prob-table td {
          border: 1px solid #E2E8F0;
          padding: 8px 12px;
          text-align: left;
        }
        .prob-table th { background: #F8FAFC; color: #475569; }

        .disclaimer {
          margin-top: 30px;
          padding: 12px 16px;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 8px;
          font-size: 11px;
          color: #92400E;
        }
        .ecg-img-container {
          text-align: center;
          margin: 15px 0;
        }
        .ecg-img-container img {
          max-width: 100%;
          max-height: 250px;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
        }
      </style>
    </head>
    <body>
      <div class="action-bar">
        <div style="font-size: 14px; font-weight: 700; display: flex; items-center: center; gap: 8px;">
          <span>📄 DeepECG AI Analysis Report</span>
          <span style="font-size: 11px; opacity: 0.7; font-family: monospace;">(${record.id})</span>
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="window.print()" class="action-btn">
            🖨️ Download PDF / Save Report
          </button>
          <button onclick="downloadReportDoc()" class="action-btn action-btn-secondary">
            💾 Download HTML File
          </button>
        </div>
      </div>

      <div class="header">
        <div class="brand">Deep<span>ECG</span> / Cardio</div>
        <div class="doc-title">AI ECG Analysis Report</div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>Analysis ID:</strong> ${record.id}</div>
        <div class="meta-item"><strong>Date & Time:</strong> ${record.timestamp}</div>
        <div class="meta-item"><strong>Source File:</strong> ${record.fileName}</div>
        <div class="meta-item"><strong>File Size:</strong> ${(record.fileSize / 1024).toFixed(1)} KB</div>
      </div>

      <div class="section-title">1. ECG Image Quality Assessment</div>
      <p style="font-size: 13px;">
        Quality Status: 
        <span class="badge ${record.qualityPassed ? 'badge-passed' : 'badge-failed'}">
          ${record.qualityPassed ? 'PASSED' : 'QUALITY ISSUE DETECTED'}
        </span>
      </p>
      <p style="font-size: 12px; color: #64748B;">${record.qualityMessage}</p>

      ${record.previewUrl ? `
        <div class="ecg-img-container">
          <img src="${record.previewUrl}" alt="ECG Input Image" />
          <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">Uploaded ECG Input Image Preview</div>
        </div>
      ` : ''}

      <div class="section-title">2. Preprocessing & Data Pipeline Summary</div>
      <ul style="font-size: 12px; color: #475569; padding-left: 20px;">
        <li>ROI Crop Detection: Stripped patient header (top 16.3%) & machine footer metadata (bottom 11.3%)</li>
        <li>Noise Reduction: 3×3 Gaussian Blur smoothing</li>
        <li>Contrast Enhancement: CLAHE (clipLimit=2.0, grid=(8,8))</li>
        <li>Tensor Normalization: Resized to 224×224×3 RGB format, range [0.0, 1.0]</li>
      </ul>

      <div class="section-title">3. Model Prediction Result</div>
      <div class="result-box">
        <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;">
          Deep Learning Classification
        </div>
        <div class="pred-class">${record.predictionName} (${record.predictionCode})</div>
        <div style="font-size: 13px; font-weight: 600; color: #475569;">
          Model Confidence: <strong>${record.confidence.toFixed(1)}%</strong>
        </div>
      </div>

      <div class="section-title">4. Categorical Probability Distribution (4 Classes)</div>
      <table class="prob-table">
        <thead>
          <tr>
            <th>Class Code</th>
            <th>Category Description</th>
            <th>Probability (%)</th>
          </tr>
        </thead>
        <tbody>
          ${record.probabilities.map(p => `
            <tr>
              <td><strong>${p.code}</strong></td>
              <td>${p.name}</td>
              <td><strong>${p.probability.toFixed(1)}%</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="disclaimer">
        <strong>RESEARCH & EDUCATIONAL USE DISCLAIMER:</strong><br/>
        This document provides AI-assisted ECG image analysis generated by the DeepECG research project.
        It is intended strictly for research and educational review, and is NOT a definitive medical diagnosis or a substitute for professional clinical evaluation by a licensed healthcare practitioner.
      </div>

      <script>
        function downloadReportDoc() {
          const htmlContent = '<!DOCTYPE html>' + document.documentElement.outerHTML;
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '${record.id}_ECG_Report.html';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      </script>
    </body>
    </html>
  `;
}

export function viewReport(record) {
  const reportWindow = window.open('', '_blank');
  if (!reportWindow) {
    alert('Please allow popups to view the AI ECG Analysis Report.');
    return;
  }
  reportWindow.document.write(getReportHtml(record));
  reportWindow.document.close();
}

export function generatePdfReport(record) {
  viewReport(record);
}

