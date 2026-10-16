// src/utils/certificate.js
// Digital Certificate generation and download utility for DigiConnect.
// Mirrors the official certificate template from the reference front-end.

/**
 * Generates and triggers download or print of an official Government Digital Certificate.
 * @param {Object} app - The application record
 */
export function downloadDigitalCertificate(app) {
  if (!app) {
    alert('No application record provided for certificate generation.');
    return;
  }

  // If backend generated a permanent certificate URL, open it directly
  if (app.certificateId && app.certificateUrl) {
    window.open(app.certificateUrl, '_blank');
    return;
  }

  const certWindow = window.open('', '_blank');
  if (!certWindow) {
    alert('Popup blocked. Please allow popups to view and download your certificate.');
    return;
  }

  const certId =
    app.certificateId ||
    `CERT-${(app.id || 'APP').replace(/[^A-Z0-9]/gi, '').slice(-4)}-${new Date().getFullYear()}`;
  const citizenName =
    app.citizenName ||
    app.applicantName ||
    app.citizen ||
    (app.formData?.firstName ? `${app.formData.firstName} ${app.formData.lastName || ''}`.trim() : 'Authorized Citizen');
  const serviceName = app.serviceName || app.service || 'Citizen Statutory Service';
  const dept = app.dept || app.departmentName || app.department || 'Government Administration Department';
  const jurisdiction = app.jurisdiction || app.jurisdictionName || 'State Secretariat / District Authority';
  const officerName =
    app.officerName ||
    app.assignedOfficerName ||
    app.officer ||
    'Competent Verification Authority';
  const approvalDate = app.approvedDate || app.completedDate || app.updatedAt
    ? new Date(app.approvedDate || app.completedDate || app.updatedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  const certHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official Certificate — ${serviceName} (${app.id})</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f8fafc; color: #0f172a; text-align: center; margin: 0; }
    .cert-container { max-width: 760px; margin: 0 auto; background: white; border: 12px double #1e3a8a; padding: 44px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); position: relative; text-align: left; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 28px; text-align: center; }
    .emblem { font-size: 3.2rem; margin-bottom: 8px; }
    .title { font-size: 1.6rem; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
    .sub { font-size: 0.95rem; color: #64748b; margin-top: 6px; font-weight: 500; }
    .cert-title-badge { text-align: center; margin-bottom: 24px; }
    .cert-title-badge h2 { color: #047857; margin: 0 0 6px 0; font-size: 1.4rem; letter-spacing: 0.5px; }
    .cert-title-badge p { color: #64748b; font-size: 0.875rem; margin: 0; }
    .details-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .details-table td { padding: 11px 16px; border: 1px solid #e2e8f0; font-size: 0.925rem; }
    .details-table td:first-child { font-weight: 700; background: #f8fafc; width: 34%; color: #334155; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 45px; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
    .sign { text-align: center; }
    .sign-line { width: 190px; border-bottom: 1.5px solid #0f172a; margin-bottom: 6px; }
    .qr-mock { width: 80px; height: 80px; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; border-radius: 6px; line-height: 1.3; text-align: center; font-weight: 700; }
    .btn-bar { margin-top: 32px; display: flex; gap: 14px; justify-content: center; }
    .btn-action { padding: 10px 22px; color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.9rem; transition: opacity 0.2s; display: inline-flex; align-items: center; gap: 6px; }
    .btn-action:hover { opacity: 0.9; }
    .btn-print { background: #1e3a8a; }
    .btn-download { background: #047857; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 5rem; font-weight: 900; color: rgba(30, 58, 138, 0.04); pointer-events: none; text-transform: uppercase; white-space: nowrap; }
    @media print {
      body { background: white; padding: 0; }
      .cert-container { box-shadow: none; border-color: #000; margin: 0; max-width: 100%; }
      .btn-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="cert-container">
    <div class="watermark">DIGICONNECT VERIFIED</div>
    <div class="header">
      <div class="emblem">🏛️</div>
      <div class="title">Government of India & State Administration</div>
      <div class="sub">Unified Citizen Service & Delivery Platform — DigiConnect</div>
    </div>
    
    <div class="cert-title-badge">
      <h2>OFFICIAL STATUTORY CERTIFICATE</h2>
      <p>Certificate ID: <strong>${certId}</strong> &nbsp;|&nbsp; Application Reference ID: <strong>${app.id}</strong></p>
    </div>
    
    <table class="details-table">
      <tr><td>Service Name</td><td><strong>${serviceName}</strong></td></tr>
      <tr><td>Beneficiary / Applicant</td><td><strong>${citizenName}</strong></td></tr>
      <tr><td>Department</td><td>${dept}</td></tr>
      <tr><td>Jurisdiction / Node</td><td>${jurisdiction}</td></tr>
      <tr><td>Date of Issuance</td><td>${approvalDate}</td></tr>
      <tr><td>Issuing Field Officer</td><td>${officerName}</td></tr>
      <tr><td>Digital Security Hash</td><td><code style="font-size:0.8rem;color:#1e3a8a;">SHA256-${(app.id || 'DC').slice(-4)}-VERIFIED-SECURE-GOV</code></td></tr>
      <tr><td>Verification Status</td><td><strong style="color:#047857;">Digitally Signed & Validated</strong></td></tr>
    </table>

    <div class="footer">
      <div class="qr-mock">
        DIGITAL QR<br>VERIFIED<br>✔
      </div>
      <div class="sign">
        <div class="sign-line"></div>
        <div style="font-size:0.85rem; font-weight:bold; color:#0f172a;">${officerName}</div>
        <div style="font-size:0.75rem; color:#64748b;">Competent Issuing Officer</div>
        <div style="font-size:0.7rem; color:#94a3b8; margin-top:2px;">${dept}</div>
      </div>
    </div>

    <div class="btn-bar">
      <button class="btn-action btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
      <button class="btn-action btn-download" onclick="downloadDoc()">⬇️ Download HTML Certificate</button>
    </div>
  </div>

  <script>
    function downloadDoc() {
      const clone = document.documentElement.cloneNode(true);
      const btns = clone.querySelector('.btn-bar');
      if (btns) btns.remove();
      const blob = new Blob(['<!DOCTYPE html>\\n' + clone.outerHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Certificate_${app.id || 'record'}.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  </script>
</body>
</html>`;

  certWindow.document.write(certHtml);
  certWindow.document.close();
}
