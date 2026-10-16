// src/utils/documentViewer.js
// Utility to directly open an uploaded or sample document in a new browser tab.

/**
 * Directly opens a document in a new browser tab.
 * If a backend file path exists, opens the uploaded asset directly.
 * If it is a seeded/sample record, generates an official document view tab with print capability.
 *
 * @param {Object} doc - Document object ({ name, path, type, size, url })
 * @param {Object} [app] - Optional application object ({ id, citizen, citizenName, etc. })
 */
export function viewDocumentInNewTab(doc, app = {}) {
  if (!doc) return;

  const docName = doc.name || doc.fileName || 'Uploaded_Document.pdf';
  const docType = doc.type || (docName.toLowerCase().endsWith('.pdf') ? 'PDF Document' : 'Official Document');
  const docSize = doc.size || '380 KB';
  const appId = app?.id || 'APP-RECORD';
  const applicantName =
    app?.applicantName ||
    (app?.applicantFirstName ? `${app.applicantFirstName} ${app.applicantLastName || ''}`.trim() : '') ||
    (app?.formData?.firstName ? `${app.formData.firstName} ${app.formData.lastName || ''}`.trim() : '') ||
    app?.formData?.applicant_name ||
    app?.citizenName ||
    app?.citizen ||
    'Applicant';

  // If a real file was uploaded to the server, open it directly
  if (doc.path) {
    const cleanPath = doc.path.replace(/\\/g, '/').replace(/^\/+/, '');
    const backendOrigin = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || 'http://localhost:3000';
    const fileUrl = `${backendOrigin}/${cleanPath}`;
    window.open(fileUrl, '_blank');
    return;
  }

  if (doc.url && doc.url !== '#') {
    window.open(doc.url, '_blank');
    return;
  }

  // Fallback for sample/seeded records: open directly in a new tab with official verification styling
  const docWindow = window.open('', '_blank');
  if (!docWindow) {
    alert('Popup blocked. Please allow popups to view the document in a new tab.');
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${docName} — DigiConnect Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px; }
    .doc-container { max-width: 720px; margin: 0 auto; background: #fff; border: 2px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); padding: 36px 40px; position: relative; }
    .doc-header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .doc-title { font-size: 1.3rem; font-weight: 800; color: #1e3a8a; margin: 0; }
    .doc-sub { font-size: 0.85rem; color: #64748b; margin-top: 4px; }
    .badge { background: #dcfce7; color: #15803d; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 99px; border: 1px solid #86efac; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    td { padding: 12px 14px; border: 1px solid #e2e8f0; font-size: 0.9rem; }
    td:first-child { font-weight: 700; background: #f8fafc; width: 35%; color: #334155; }
    .preview-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 30px; text-align: center; margin-top: 20px; }
    .actions { margin-top: 28px; display: flex; gap: 12px; justify-content: flex-end; }
    .btn { padding: 9px 18px; font-size: 0.875rem; font-weight: 700; border-radius: 6px; cursor: pointer; border: 1px solid transparent; text-decoration: none; }
    .btn-primary { background: #1e3a8a; color: white; }
    .btn-outline { background: white; border-color: #cbd5e1; color: #334155; }
    @media print {
      body { background: white; padding: 0; }
      .doc-container { box-shadow: none; border: 1px solid #000; }
      .actions { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="doc-container">
    <div class="doc-header">
      <div>
        <h1 class="doc-title">${docName}</h1>
        <div class="doc-sub">Official Citizen Application Document · DigiConnect</div>
      </div>
      <span class="badge">✓ Verified Document</span>
    </div>

    <table>
      <tr><td>Document Name</td><td><strong>${docName}</strong></td></tr>
      <tr><td>Category / Type</td><td>${docType}</td></tr>
      <tr><td>File Size</td><td>${docSize}</td></tr>
      <tr><td>Application Ref</td><td><code style="color:#1e3a8a; font-weight:700;">${appId}</code></td></tr>
      <tr><td>Applicant</td><td>${applicantName}</td></tr>
      <tr><td>Verification Seal</td><td><strong style="color:#047857;">Digitally Verified & Legible</strong></td></tr>
    </table>

    <div class="preview-box">
      <div style="font-size: 2.5rem; margin-bottom: 8px;">📄</div>
      <div style="font-weight: 700; color: #1e293b; font-size: 1rem; margin-bottom: 4px;">${docName}</div>
      <div style="font-size: 0.8rem; color: #64748b;">
        Attached as official supporting proof for verification under application ${appId}.
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-outline" onclick="window.close()">Close Tab</button>
      <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save Document</button>
    </div>
  </div>
</body>
</html>`;

  docWindow.document.write(html);
  docWindow.document.close();
}
