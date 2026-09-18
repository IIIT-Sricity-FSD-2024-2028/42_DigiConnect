import React from 'react';
import { Link } from 'react-router-dom';

const FOOTER_COLUMNS = [
  {
    title: 'Services',
    links: [
      { label: 'Apply for Certificate', to: '/login' },
      { label: 'Welfare Schemes', to: '/login' },
      { label: 'Permissions', to: '/login' },
      { label: 'Record Correction', to: '/login' },
      { label: 'Grievance Filing', to: '/login' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', to: '#' },
      { label: 'Track Application', to: '#' },
      { label: 'Contact Us', to: '#' },
      { label: 'Find Service Center', to: '#' },
    ],
  },
  {
    title: 'Quick Links',
    links: [
      { label: 'Citizen Login', to: '/login' },
      { label: 'New Registration', to: '/register' },
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="landing-footer" id="contact">
      <div className="footer-grid">

        {/* Brand column */}
        <div>
          <Link
            to="/"
            className="nav-brand"
            style={{ marginBottom: 'var(--space-md)', display: 'inline-flex' }}
          >
            <div className="nav-brand-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
            </div>
            <span className="nav-brand-text">DigiConnect</span>
          </Link>
          <p className="footer-brand-desc">
            Unified Citizen Service Delivery Platform — bringing government closer to citizens through digital transformation.
          </p>
        </div>

        {/* [Lists] Render each column and its links using map() */}
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="footer-col-title">{col.title}</div>
            {col.links.map((link) => (
              <Link key={link.label} to={link.to} className="footer-link">
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© 2025 DigiConnect – Digital Governance &amp; E-Services. All rights reserved.</span>
        <span>Helpline: 1800-XXX-XXXX | Available 24/7</span>
      </div>
    </footer>
  );
}
