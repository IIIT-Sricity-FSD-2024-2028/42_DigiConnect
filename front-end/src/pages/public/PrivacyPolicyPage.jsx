import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function PrivacyPolicyPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [hash]);

  return (
    <div data-page="landing" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg, #f8fafc)' }}>
      <Navbar />

      {/* Hero Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--navy-900, #0a1628) 0%, var(--navy-800, #13243d) 100%)',
          color: '#ffffff',
          padding: '120px 24px 60px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--navy-200, #bae6fd)',
              marginBottom: '16px',
            }}
          >
            🛡️ Digital Personal Data Protection (DPDP) Act Compliance
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, "Cinzel", serif)',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '16px',
              color: '#ffffff',
            }}
          >
            Citizen Privacy Policy &amp; Data Charter
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--navy-200, #94a3b8)',
              maxWidth: '760px',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            How the DigiConnect Platform collects, encrypts, protects, and audits your personal data, Aadhaar authentication credentials, revenue documents, and digital service records.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginTop: '24px',
              fontSize: '0.85rem',
              color: '#94a3b8',
              flexWrap: 'wrap',
            }}
          >
            <span><strong>Fiduciary:</strong> Ministry of Electronics &amp; Federated State IT Departments</span>
            <span><strong>Data Encryption:</strong> AES-256 at Rest &amp; TLS 1.3 in Transit</span>
            <span><strong>Effective Date:</strong> 1st January 2026</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main style={{ flex: 1, padding: '48px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>

          {/* Quick Navigation Panel */}
          <aside style={{ alignSelf: 'start', position: 'sticky', top: '100px' }}>
            <div
              className="card"
              style={{
                background: '#ffffff',
                border: '1px solid var(--slate-200, #e2e8f0)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', margin: '0 0 16px 0' }}>
                Privacy Charter
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'data-collection', label: '1. Data We Collect' },
                  { id: 'aadhaar-security', label: '2. Aadhaar Vault & Masking' },
                  { id: 'purpose-limitation', label: '3. Purpose of Processing' },
                  { id: 'data-sharing', label: '4. Inter-Departmental Sharing' },
                  { id: 'audit-logging', label: '5. Immutable Audit Trails' },
                  { id: 'citizen-rights', label: '6. Citizen Data Rights' },
                  { id: 'data-officer', label: '7. Data Protection Officer' },
                ].map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      style={{
                        color: 'var(--navy-600, #2563eb)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        display: 'block',
                        padding: '4px 0',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.target.style.color = 'var(--navy-800, #1e40af)')}
                      onMouseLeave={(e) => (e.target.style.color = 'var(--navy-600, #2563eb)')}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--slate-100, #f1f5f9)' }}>
                <Link
                  to="/terms"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    color: 'var(--navy-700, #1d4ed8)',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  📜 View Terms of Service →
                </Link>
              </div>
            </div>
          </aside>

          {/* Legal Text Content */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Section 1 */}
            <article id="data-collection" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                1. What Personal Information We Collect
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '14px' }}>
                Under the mandate of delivering statutory citizen services, DigiConnect collects the following categories of data:
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                <li><strong>Identity Data:</strong> Full legal name, gender, date of birth, and masked Aadhaar reference identifier.</li>
                <li><strong>Contact Data:</strong> Verified mobile number and email address for dispatching status notifications.</li>
                <li><strong>Jurisdiction &amp; Address:</strong> State, district, revenue sub-division, mandal/taluk, village/ward, and PIN code.</li>
                <li><strong>Statutory Verification Documents:</strong> Land deeds, community affidavits, income proofs, and applicant photographs uploaded for officer inspection.</li>
              </ul>
            </article>

            {/* Section 2 */}
            <article id="aadhaar-security" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                2. Aadhaar Vault &amp; Masking Standards
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '14px' }}>
                In strict adherence to UIDAI regulations and Supreme Court mandates:
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                <li>Raw 12-digit Aadhaar numbers are <strong>never stored in plain text</strong> on the platform.</li>
                <li>Aadhaar numbers are stored in a dedicated, FIPS 140-2 Level 3 compliant <em>Aadhaar Data Vault</em> and tokenized into an internal reference ID.</li>
                <li>All public and officer dashboard displays strictly show masked representations showing only the final 4 digits (e.g. <code>•••• •••• 2318</code>).</li>
                <li>Biometric data is neither requested nor stored anywhere in the platform architecture.</li>
              </ul>
            </article>

            {/* Section 3 */}
            <article id="purpose-limitation" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                3. Purpose Limitation &amp; Lawful Processing
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '14px' }}>
                Your data is collected solely for fulfilling government service requests, including:
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                <li>Field officer verification of applicant eligibility for statutory certificates.</li>
                <li>Direct disbursement of welfare subsidies into beneficiary bank accounts.</li>
                <li>Real-time SMS and email alerts informing you of stage progression and approval deadlines.</li>
                <li>Investigation of citizen complaints by designated Grievance Redressal Officers.</li>
              </ul>
            </article>

            {/* Section 4 */}
            <article id="data-sharing" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                4. Inter-Departmental Sharing &amp; Third Parties
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '14px' }}>
                DigiConnect <strong>does not sell, lease, or monetize</strong> citizen information under any circumstances. Data sharing occurs strictly between:
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                <li>State Revenue, Social Welfare, Municipal, and Commercial Tax departments processing your specific applications.</li>
                <li>National Payment Corporation of India (NPCI) and State Treasury Gateways for electronic fee collection and instant receipt reconciliation.</li>
                <li>Authorized law enforcement agencies solely pursuant to a lawful court order or warrant.</li>
              </ul>
            </article>

            {/* Section 5 */}
            <article id="audit-logging" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                5. Immutable Audit Trails &amp; Access Controls
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '14px' }}>
                Every administrative interaction with citizen data is recorded in the central immutable audit log:
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                <li>Timestamped records capture the exact officer ID, designation, and reason whenever an application document is viewed.</li>
                <li>Role-Based Access Control (RBAC) ensures officers cannot view records outside their assigned jurisdiction or departmental scope.</li>
                <li>Audit trails are retained for statutory retention periods mandated by State Public Records Acts.</li>
              </ul>
            </article>

            {/* Section 6 */}
            <article id="citizen-rights" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                6. Your Rights Under the DPDP Act 2023
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '14px' }}>
                As a citizen (Data Principal), you possess guaranteed statutory rights:
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                <li><strong>Right to Summary:</strong> View all active and archived applications, issued certificates, and grievances linked to your profile.</li>
                <li><strong>Right to Correction:</strong> Update non-statutory contact credentials (phone, email, alternate address) via your citizen profile page at any time.</li>
                <li><strong>Right to Grievance Redressal:</strong> File a privacy complaint directly with the State Data Protection Officer if you suspect unauthorized record inspection.</li>
              </ul>
            </article>

            {/* Section 7 */}
            <article id="data-officer" className="card" style={{ background: 'linear-gradient(135deg, var(--navy-50, #f0f9ff) 0%, #ffffff 100%)', border: '1px solid var(--navy-200, #bae6fd)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                7. Data Protection Officer (DPO) Contact
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '20px' }}>
                For data privacy inquiries, consent revocations, or data fiduciary audit disclosures:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Chief Data Protection Officer</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy-800)', marginTop: '4px' }}>Directorate of e-Governance</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>National Informatics Center &amp; State IT Secretariats</div>
                </div>

                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Privacy &amp; Data Grievance Desk</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy-800)', marginTop: '4px' }}>privacy@digiconnect.gov.in</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>Statutory grievance response SLA: 48 Hours</div>
                </div>

                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Toll-Free Helpline</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-800)', marginTop: '4px' }}>1800-425-0042</div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>Toll-free across all network operators</div>
                </div>
              </div>
            </article>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
