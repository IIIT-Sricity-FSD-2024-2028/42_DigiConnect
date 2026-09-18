import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
const ACTOR_PORTALS = [
  {
    emoji: '🏛️',
    label: 'Central Government (Main Admin)',
    color: '#1e40af',
    bg: '#eff6ff',
    border: '#bfdbfe',
    btnColor: '#2563eb',
    desc: 'Creates and manages State Governments (strictly 1 State Admin per State). Analyzes national state-wise revenue.',
    btnLabel: 'Open Central Admin Portal →',
    to: '/central-admin/dashboard',
  },
  {
    emoji: '🏢',
    label: 'State Government (State Admin)',
    color: '#166534',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    btnColor: '#16a34a',
    desc: 'Manages Dynamic Jurisdiction Tree (Rural & Urban Adjacency List), creates State Departments, appoints Department Heads, and configures Grievance Cells.',
    btnLabel: 'Open State Admin Portal →',
    to: '/state-admin/dashboard',
  },
  {
    emoji: '👔',
    label: 'Department Head',
    color: '#6b21a8',
    bg: '#faf5ff',
    border: '#e9d5ff',
    btnColor: '#9333ea',
    desc: 'Defines role designations (not officer levels), builds dynamic services (custom fields, proofs, fees), sets workflow routing, and onboards field officers.',
    btnLabel: 'Open Department Head Portal →',
    to: '/department-head/dashboard',
  },
  {
    emoji: '👮',
    label: 'Department Field Officers',
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    btnColor: '#ea580c',
    desc: 'Bound to exact jurisdiction nodes. Reviews citizen applications and executes the exact 3 actions: Approve, Reject, or Raise Query.',
    btnLabel: 'Open Officer Review Queue →',
    to: '/officer/dashboard',
  },
  {
    emoji: '👥',
    label: 'Citizen Services Portal',
    color: '#0369a1',
    bg: '#f0f9ff',
    border: '#bae6fd',
    btnColor: '#0284c7',
    desc: '5-step dynamic application wizard, dynamic Rural/Urban jurisdiction selector, document uploads, mock payment, tracking, and one-click rejection appeals.',
    btnLabel: 'Open Citizen Dashboard →',
    to: '/citizen/dashboard',
  },
  {
    emoji: '⚖️',
    label: 'Department Grievance Cell',
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
    btnColor: '#dc2626',
    desc: 'Inspects original application context, and resolves appeals using: Uphold Rejection, Direct Re-verification, or Overrule & Issue Certificate.',
    btnLabel: 'Open Grievance Cell →',
    to: '/grievance/dashboard',
  },
];

// Feature cards (from index.html lines 307-382)
const FEATURES = [
  {
    iconBg: 'var(--navy-100)',
    iconStroke: 'var(--navy-600)',
    title: 'Secure & Verified',
    desc: 'Multi-layer authentication and document verification ensure every transaction is secure and tamper-proof.',
    path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    iconBg: 'var(--amber-100)',
    iconStroke: 'var(--amber-600)',
    title: 'Real-Time Tracking',
    desc: 'Track your application status at every step of the workflow with live updates and SMS/email notifications.',
    path: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  },
  {
    iconBg: 'var(--green-100)',
    iconStroke: '#166534',
    title: 'SLA Monitoring',
    desc: 'Every service has a defined SLA. Overdue cases are automatically escalated to supervisors, ensuring accountability.',
    path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    iconBg: 'var(--purple-100)',
    iconStroke: '#6b21a8',
    title: 'Grievance Redressal',
    desc: 'Raise complaints directly on the platform. Our dedicated grievance officers investigate and resolve issues promptly.',
    path: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  },
  {
    iconBg: 'var(--orange-100)',
    iconStroke: '#9a3412',
    title: 'Multi-Role Access',
    desc: 'Role-specific dashboards for citizens, officers, supervisors, and grievance officers with fine-grained permissions.',
    path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    iconBg: 'var(--navy-100)',
    iconStroke: 'var(--navy-600)',
    title: 'Integrated Payments',
    desc: 'Pay service fees online through a secure payment gateway. Receipts are generated instantly and stored for reference.',
    path: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
];

// Service tiles (from index.html lines 393-488)
const SERVICES = [
  { name: 'Certificates', desc: 'Income, Caste, Residence, Birth, Death certificates', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { name: 'Welfare & Subsidies', desc: 'Welfare schemes, scholarships, and subsidy applications', path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Permissions', desc: 'Event permits, vendor licenses, and authorization services', path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { name: 'Record Correction', desc: 'Update and correct your official government records', path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { name: 'Grievance Filing', desc: 'Submit and track complaints about service quality', path: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { name: 'Appointments', desc: 'Schedule in-person appointments at government offices', path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { name: 'Status Tracking', desc: 'Real-time application progress with audit trail', path: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { name: 'Service Centers', desc: 'Assisted services via CSC / MeeSeva facilitators', path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
];

// How-It-Works steps (from index.html lines 500-522)
const HOW_STEPS = [
  { num: '1', title: 'Register & Login', desc: 'Create your citizen account with Aadhaar-based identity verification.' },
  { num: '2', title: 'Choose & Apply', desc: 'Select the service, fill the form, upload documents, and pay the fee online.' },
  { num: '3', title: 'Track Progress', desc: 'Receive real-time notifications as your application moves through review stages.' },
  { num: '4', title: 'Download', desc: 'Once approved, download your certificate or document directly from the portal.' },
];

// ── Main Landing Page ─────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div data-page="landing">

      {/* [Component] Navbar */}
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="hero" id="home">
        <div className="hero-grid"></div>
        <div className="hero-blob hero-blob-1"></div>
        <div className="hero-blob hero-blob-2"></div>

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 4.42 3.58 8 8 8 4.42 0 8-3.58 8-8 0-4.42-3.58-8-8-8zm3.25 11.25l-4.5-2.25V5h.75v3.62l4.12 2.06-.37.57z" />
              </svg>
              Digital Governance Platform
            </div>

            <h1 className="hero-title">
              Government Services,<br />
              <span className="highlight">Simplified</span> For You
            </h1>

            <p className="hero-subtitle">
              Access certificates, welfare schemes, permissions, and more — all from a single unified digital platform. No queues. No paperwork. Full transparency.
            </p>

            <div className="hero-actions">
              {/* [Events] Router Links using React Router */}
              <Link to="/register" className="hero-cta-primary">
                Get Started
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/login" className="hero-cta-secondary">
                Track Application
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Hero Stats */}
            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">50+</div>
                <div className="hero-stat-label">Services Online</div>
              </div>
              <div className="hero-stat-divider"></div>
              <div>
                <div className="hero-stat-value">24/7</div>
                <div className="hero-stat-label">Availability</div>
              </div>
              <div className="hero-stat-divider"></div>
              <div>
                <div className="hero-stat-value">&lt;5 Days</div>
                <div className="hero-stat-label">Avg Processing</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Mock Card */}
          <div className="hero-visual">
            <div className="hero-card-mock">
              <div className="hero-card-mock-header">
                <div className="mock-dot red"></div>
                <div className="mock-dot yellow"></div>
                <div className="mock-dot green"></div>
                <span style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginLeft: '8px' }}></span>
              </div>

              <div style={{ marginBottom: '12px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                Recent Applications
              </div>

              {/* [Lists] Mock application rows using map() */}
              {[
                { bg: '#1e437e', stroke: '#a0bcec', badgeBg: '#dcfce7', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', w: '100%' },
                { bg: '#166534', stroke: '#86efac', badgeBg: '#fef3c7', path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', w: '70%' },
                { bg: '#6b21a8', stroke: '#d8b4fe', badgeBg: '#dbeafe', path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', w: '50%' },
              ].map((row, i) => (
                <div key={i} className="mock-app-row">
                  <div className="mock-app-icon" style={{ background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" fill="none" stroke={row.stroke} strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={row.path} />
                    </svg>
                  </div>
                  <div className="mock-app-info">
                    <div className="mock-app-name" style={{ width: row.w }}></div>
                    <div className="mock-app-sub"></div>
                  </div>
                  <div className="mock-badge" style={{ background: row.badgeBg, borderRadius: '10px' }}></div>
                </div>
              ))}

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', fontWeight: 600 }}>SLA Compliance</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '78%' }}></div>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>78% of applications within SLA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 Actor Portals Section ── */}
      <section style={{ background: '#f8fafc', padding: 'var(--space-3xl) 0', borderBottom: '1px solid var(--slate-200)' }}>
        <div className="features-container">
          <p className="section-eyebrow" style={{ color: 'var(--navy-600)' }}>Master Prompt Architecture</p>
          <h2 className="section-heading">Federated Government Portals (The 6 Actors)</h2>
          <p className="section-desc">Access role-specific governance environments with dynamic tree jurisdiction hierarchies and configurable service workflows.</p>

          {/* [Lists] 6 actor cards rendered with map() */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', marginTop: 'var(--space-2xl)' }}>
            {ACTOR_PORTALS.map((portal) => (
              <div
                key={portal.label}
                className="card"
                style={{ border: `1px solid ${portal.border}`, transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div className="card-header" style={{ background: portal.bg }}>
                  <span style={{ fontWeight: 800, color: portal.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {portal.emoji} {portal.label}
                  </span>
                </div>
                <div className="card-body">
                  <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6, marginBottom: 'var(--space-md)' }}>
                    {portal.desc}
                  </p>
                  {/* [Events] Navigate to portal dashboard on click */}
                  <Link
                    to={portal.to}
                    className="btn btn-sm"
                    style={{ background: portal.btnColor, color: '#fff', fontWeight: 700 }}
                  >
                    {portal.btnLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="features" id="features">
        <div className="features-container">
          <p className="section-eyebrow">Why DigiConnect</p>
          <h2 className="section-heading">Built for Citizens, Managed by Government</h2>
          <p className="section-desc">A comprehensive platform that bridges the gap between citizens and government, making service delivery transparent, fast, and accessible.</p>

          {/* [Lists] Feature cards with map() */}
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{ background: f.iconBg }}>
                  <svg width="26" height="26" fill="none" stroke={f.iconStroke} strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.path} />
                  </svg>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <section className="services-section" id="services">
        <div className="features-container">
          <p className="section-eyebrow" style={{ color: 'var(--navy-400)' }}>What We Offer</p>
          <h2 className="section-heading" style={{ color: '#fff' }}>All Government Services in One Place</h2>

          {/* [Lists] Service tiles with map() */}
          <div className="services-grid">
            {SERVICES.map((s) => (
              <Link key={s.name} to="/login" className="service-tile">
                <div className="service-tile-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.path} />
                  </svg>
                </div>
                <div className="service-tile-name">{s.name}</div>
                <div className="service-tile-desc">{s.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="steps-section" id="how-it-works">
        <div className="features-container">
          <p className="section-eyebrow">How It Works</p>
          <h2 className="section-heading">Get Your Service in 4 Simple Steps</h2>

          {/* [Lists] Steps with map() */}
          <div className="steps-grid">
            {HOW_STEPS.map((step) => (
              <div key={step.num} className="step-item">
                <div className="step-num">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy-800) 0%, var(--navy-600) 100%)', padding: 'var(--space-3xl) 0' }}>
        <div className="features-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#fff', marginBottom: 'var(--space-md)' }}>
            Ready to Access Government Services?
          </h2>
          <p style={{ color: 'var(--navy-200)', fontSize: '0.9375rem', marginBottom: 'var(--space-2xl)' }}>
            Join thousands of citizens using DigiConnect every day for faster, transparent service delivery.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="hero-cta-primary">Create Account</Link>
            <Link to="/login" className="hero-cta-secondary">Sign In to Portal</Link>
          </div>
        </div>
      </section>

      {/* [Component] Footer */}
      <Footer />
    </div>
  );
}
