import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function TermsOfServicePage() {
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
            📜 Statutory Governance & Service Level Agreements
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
            Terms of Service &amp; Conditions
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
            Official conditions governing access, identity authentication, service application processing, statutory delivery timelines (SLAs), and citizen rights under the DigiConnect Unified Citizen Service Delivery Platform.
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
            <span><strong>Version:</strong> 2.4 (Statutory Gazette Edition)</span>
            <span><strong>Last Updated:</strong> 1st January 2026</span>
            <span><strong>Jurisdiction:</strong> Republic of India (Federated States)</span>
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
                Table of Contents
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'definitions', label: '1. Definitions & Framework' },
                  { id: 'eligibility', label: '2. Citizen Eligibility & Aadhaar' },
                  { id: 'service-processing', label: '3. Application Submission & Verification' },
                  { id: 'sla-guarantees', label: '4. Statutory SLA Guarantees' },
                  { id: 'fees-refunds', label: '5. Fees, Payments & Receipts' },
                  { id: 'grievance-appellate', label: '6. Grievance & Appellate Rights' },
                  { id: 'prohibited-conduct', label: '7. Prohibited Misuse & Penalties' },
                  { id: 'support', label: '8. Support & Citizen Helplines' },
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
                  to="/privacy"
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
                  🔒 View Privacy Policy →
                </Link>
              </div>
            </div>
          </aside>

          {/* Legal Text Content */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Section 1 */}
            <article id="definitions" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                1. Legislative Framework &amp; Definitions
              </h2>
              <p style={{ color: 'var(--slate-700, #334155)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '16px' }}>
                The <strong>DigiConnect Unified Citizen Service Delivery Platform (UCSDP)</strong> is established under the Information Technology Act 2000, Electronic Service Delivery Rules, and the relevant State Right to Public Services Legislation.
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                <li><strong>"Citizen"</strong> means any lawful resident or legal entity applying for government certificates, permissions, or welfare benefits.</li>
                <li><strong>"Designated Verification Officer"</strong> refers to the competent gazetted or field officer (e.g. Village Revenue Officer, Revenue Inspector, Tahsildar) mandated to inspect records.</li>
                <li><strong>"Statutory SLA"</strong> denotes the mandatory maximum turnaround period within which an application must be approved, queried, or rejected with stated cause.</li>
              </ul>
            </article>

            {/* Section 2 */}
            <article id="eligibility" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                2. Citizen Eligibility &amp; Aadhaar Verification
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '14px' }}>
                Registration on DigiConnect is authenticated through Aadhaar-based OTP verification in compliance with Section 7 of the Aadhaar Act. You agree that:
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                <li>All profile details, dates of birth, and identity credentials provided represent your genuine statutory persona.</li>
                <li>You shall preserve the secrecy of your login password, 2FA codes, and OTPs. Government officers will never ask for your password.</li>
                <li>Your selected jurisdiction (State, District, Mandal/Taluk, Village/Ward) will serve as the administrative routing boundary for service applications.</li>
              </ul>
            </article>

            {/* Section 3 */}
            <article id="service-processing" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                3. Application Submission &amp; Verification Workflow
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '14px' }}>
                When an application is submitted through the platform:
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                <li>Applications enter the automated Workload Balancer and are assigned to the eligible field officer in your jurisdiction.</li>
                <li><strong>Clarification Queries:</strong> If uploaded documentation requires correction, the officer may raise a formal Query. The workflow is paused, and the citizen has 3 to 7 working days to furnish required documents before expiration.</li>
                <li><strong>Digital Certificates:</strong> Approved certificates feature tamper-evident cryptographic QR codes and can be verified across all government and banking institutions.</li>
              </ul>
            </article>

            {/* Section 4 */}
            <article id="sla-guarantees" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                4. Statutory SLA Guarantees &amp; Auto-Escalation
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '14px' }}>
                The Right to Public Services Act guarantees timely delivery:
              </p>
              <div style={{ background: 'var(--slate-50, #f8fafc)', border: '1px solid var(--slate-200)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 700 }}>Income / Community Certificates</span>
                    <p style={{ margin: '4px 0 0', fontWeight: 800, color: 'var(--navy-900)' }}>5 to 7 Working Days</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 700 }}>Residence &amp; Nativity</span>
                    <p style={{ margin: '4px 0 0', fontWeight: 800, color: 'var(--navy-900)' }}>3 to 5 Working Days</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 700 }}>Commercial &amp; Trade Permits</span>
                    <p style={{ margin: '4px 0 0', fontWeight: 800, color: 'var(--navy-900)' }}>10 to 14 Working Days</p>
                  </div>
                </div>
              </div>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem', margin: 0 }}>
                If an officer exceeds the SLA timeframe, the case is automatically escalated to the Department Head with a formal delay audit tag.
              </p>
            </article>

            {/* Section 5 */}
            <article id="fees-refunds" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                5. Statutory Fees, Payments &amp; Receipts
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '14px' }}>
                Service fees consist of department statutory processing fees and platform convenience charges:
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                <li>All payments generate an immutable digital treasury transaction receipt with an instant UTR reference.</li>
                <li>Payments are non-refundable once an application has commenced official field verification by the assigned officer.</li>
              </ul>
            </article>

            {/* Section 6 */}
            <article id="grievance-appellate" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                6. Grievance Redressal &amp; Appellate Authorities
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '14px' }}>
                Citizens hold an unalienable right to appeal against wrongful rejection, procedural delay, or officer misconduct:
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                <li><strong>First Appeal:</strong> Can be raised directly on the platform within 30 days of application rejection.</li>
                <li><strong>Second Appeal / Appellate Authority:</strong> Unresolved cases escalate to the State Department Grievance Redressal Cell.</li>
                <li><strong>Resolution SLA:</strong> All citizen grievances must be resolved within 14 calendar days.</li>
              </ul>
            </article>

            {/* Section 7 */}
            <article id="prohibited-conduct" className="card" style={{ background: '#ffffff', border: '1px solid var(--slate-200)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                7. Prohibited Misuse &amp; Penalties
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '14px' }}>
                Submission of forged certificates, tampered revenue deeds, impersonation, or unauthorized access attempts will lead to:
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                <li>Immediate permanent suspension of the citizen portal account.</li>
                <li>Criminal prosecution under Sections 465, 468, and 471 of the Indian Penal Code / Bharatiya Nyaya Sanhita.</li>
                <li>Forensic IP logging and reporting to the State Cyber Crime Cell.</li>
              </ul>
            </article>

            {/* Section 8: Support & Helpline */}
            <article id="support" className="card" style={{ background: 'linear-gradient(135deg, var(--navy-50, #f0f9ff) 0%, #ffffff 100%)', border: '1px solid var(--navy-200, #bae6fd)', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)', marginBottom: '12px' }}>
                8. Citizen Helplines &amp; Support Contact
              </h2>
              <p style={{ color: 'var(--slate-700)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '20px' }}>
                For operational queries, technical assistance, or SLA escalation support, our multi-lingual citizen support cell is available round the clock:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Toll-Free Citizen Helpline</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-800)', marginTop: '4px' }}>1800-425-0042</div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>✓ 24/7 Available (All Indian Languages)</div>
                </div>

                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Direct Support Email</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy-800)', marginTop: '4px' }}>support@digiconnect.gov.in</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>Average response: &lt; 2 business hours</div>
                </div>

                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Physical Service Points</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)', marginTop: '4px' }}>State CSC &amp; MeeSeva Centers</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>Operating Mon–Sat, 09:00 AM – 06:00 PM</div>
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
