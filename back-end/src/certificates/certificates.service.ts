import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface CertificateMetadata {
  id: string;
  applicationId: string;
  citizenName: string;
  serviceName: string;
  jurisdictionPath: string;
  issueDate: string;
  issuingAuthority: string;
  downloadUrl: string;
  htmlPreviewUrl: string;
}

@Injectable()
export class CertificatesService {
  private certificatesDir = path.join(process.cwd(), 'uploads', 'certificates');

  constructor() {
    if (!fs.existsSync(this.certificatesDir)) {
      fs.mkdirSync(this.certificatesDir, { recursive: true });
    }
  }

  /**
   * Generate the official fake/demo PDF certificate per Section 45 of Master Prompt.
   */
  generateCertificate(params: {
    applicationId: string;
    citizenName: string;
    serviceName: string;
    jurisdictionPath: string;
    issuingAuthority?: string;
  }): CertificateMetadata {
    const certId = `CERT-${params.applicationId.replace(/[^A-Z0-9]/gi, '').slice(-4)}-${Date.now().toString().slice(-4)}`;
    const issueDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const authority = params.issuingAuthority || 'Competent Authority, DigiConnect Services';

    // Generate HTML Certificate template that renders with official seal and print-to-PDF styles
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Digital Service Certificate — ${certId}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      margin: 0;
      padding: 30px;
      background: #f8fafc;
      color: #0f172a;
    }
    .cert-frame {
      border: 8px double #1e3a8a;
      padding: 40px;
      background: #ffffff;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      position: relative;
      min-height: 780px;
      box-sizing: border-box;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 72px;
      font-weight: 900;
      color: rgba(30, 58, 138, 0.04);
      white-space: nowrap;
      pointer-events: none;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .emblem {
      width: 70px;
      height: 70px;
      margin: 0 auto 10px auto;
      border-radius: 50%;
      background: linear-gradient(135deg, #0284c7, #1e3a8a);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 32px;
      font-weight: bold;
    }
    .gov-title {
      font-size: 16px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #475569;
      margin: 0;
      font-weight: 700;
    }
    .portal-title {
      font-size: 28px;
      color: #0f172a;
      margin: 5px 0;
      font-weight: 900;
      letter-spacing: 1px;
    }
    .cert-type {
      font-size: 20px;
      color: #0369a1;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-top: 15px;
    }
    .cert-id-badge {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      padding: 6px 16px;
      border-radius: 20px;
      font-family: monospace;
      font-size: 14px;
      font-weight: bold;
      margin-top: 10px;
    }
    .content-body {
      margin: 35px 0;
      font-size: 16px;
      line-height: 1.8;
      color: #334155;
    }
    .highlight-name {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      text-decoration: underline;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
    }
    .details-table td {
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
    }
    .details-table td.label {
      background: #f1f5f9;
      font-weight: 700;
      color: #475569;
      width: 35%;
    }
    .details-table td.val {
      font-weight: 600;
      color: #0f172a;
    }
    .footer {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .seal-box {
      border: 2px dashed #0284c7;
      width: 130px;
      height: 130px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 11px;
      font-weight: bold;
      color: #0369a1;
      background: rgba(224, 242, 254, 0.3);
    }
    .sign-box {
      text-align: right;
    }
    .digital-seal {
      font-family: monospace;
      font-size: 12px;
      color: #059669;
      background: #ecfdf5;
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid #10b981;
      display: inline-block;
      margin-bottom: 8px;
    }
    .authority-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .disclaimer {
      margin-top: 40px;
      border-top: 1px solid #cbd5e1;
      padding-top: 12px;
      font-size: 11px;
      color: #64748b;
      text-align: center;
      font-style: italic;
    }
    .print-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #0284c7;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
    }
    @media print {
      .print-btn { display: none; }
      body { padding: 0; background: white; }
      .cert-frame { box-shadow: none; border-width: 4px; }
    }
  </style>
</head>
<body>
  <div class="cert-frame">
    <div class="watermark">DIGICONNECT DEMO</div>
    
    <div class="header">
      <div class="emblem">🏛️</div>
      <p class="gov-title">Government Services Portal</p>
      <h1 class="portal-title">DIGICONNECT</h1>
      <div class="cert-type">Digital Service Certificate</div>
      <div class="cert-id-badge">Certificate ID: ${certId}</div>
    </div>

    <div class="content-body">
      This is to officially certify that citizen <span class="highlight-name">${params.citizenName}</span> has completed the statutory verification process for the public service described below:

      <table class="details-table">
        <tr>
          <td class="label">Certificate ID</td>
          <td class="val">${certId}</td>
        </tr>
        <tr>
          <td class="label">Application Reference ID</td>
          <td class="val">${params.applicationId}</td>
        </tr>
        <tr>
          <td class="label">Beneficiary Name</td>
          <td class="val">${params.citizenName}</td>
        </tr>
        <tr>
          <td class="label">Government Service</td>
          <td class="val">${params.serviceName}</td>
        </tr>
        <tr>
          <td class="label">Jurisdiction Path</td>
          <td class="val">${params.jurisdictionPath}</td>
        </tr>
        <tr>
          <td class="label">Date of Issuance</td>
          <td class="val">${issueDate}</td>
        </tr>
        <tr>
          <td class="label">Verification Status</td>
          <td class="val" style="color: #059669;">✔ Formally Verified & Approved</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <div class="seal-box">
        <span>DIGICONNECT</span>
        <span style="font-size: 20px; margin: 4px 0;">★</span>
        <span>OFFICIAL SEAL<br>DEMO VERIFIED</span>
      </div>

      <div class="sign-box">
        <div class="digital-seal">✔ DIGITALLY SIGNED & VERIFIED</div>
        <div class="authority-title">${authority}</div>
        <div style="font-size: 12px; color: #64748b;">Issued via DigiConnect Redressal & Verification Engine</div>
      </div>
    </div>

    <div class="disclaimer">
      Notice: This is a demonstration certificate generated by the DigiConnect college project. It is intended solely for academic demonstration and simulation purposes.
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
</body>
</html>`;

    // Save HTML certificate file
    const filePath = path.join(this.certificatesDir, `${certId}.html`);
    fs.writeFileSync(filePath, htmlContent, 'utf8');

    const downloadUrl = `/uploads/certificates/${certId}.html`;

    return {
      id: certId,
      applicationId: params.applicationId,
      citizenName: params.citizenName,
      serviceName: params.serviceName,
      jurisdictionPath: params.jurisdictionPath,
      issueDate,
      issuingAuthority: authority,
      downloadUrl,
      htmlPreviewUrl: downloadUrl,
    };
  }

  getCertificateById(certId: string): string {
    const filePath = path.join(this.certificatesDir, `${certId}.html`);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Certificate '${certId}' not found.`);
    }
    return fs.readFileSync(filePath, 'utf8');
  }
}
