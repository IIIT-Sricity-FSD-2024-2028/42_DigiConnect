import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  // [State] Track if user has scrolled down to add shadow on navbar
  const [scrolled, setScrolled] = useState(false);

  // [Hooks / useEffect] Listen for window scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    // Cleanup: remove listener when component unmounts
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className="landing-nav"
      id="mainNav"
      style={scrolled ? { boxShadow: '0 4px 24px rgba(10,22,40,0.13)' } : {}}
    >
      {/* Brand Logo — navigates to home */}
      <Link to="/" className="nav-brand">
        <div className="nav-brand-icon">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
            />
          </svg>
        </div>
        <span className="nav-brand-text">DigiConnect</span>
      </Link>

      {/* [Lists] Nav links rendered from array using map() */}
      <div className="nav-links">
        {[
          { label: 'Features', href: '#features' },
          { label: 'Services', href: '#services' },
          { label: 'How It Works', href: '#how-it-works' },
          { label: 'Contact', href: '#contact' },
        ].map((link) => (
          <a key={link.label} href={link.href} className="nav-link">
            {link.label}
          </a>
        ))}
      </div>

      {/* Action buttons — navigate to login / register */}
      <div className="nav-actions">
        <Link to="/login" className="nav-login-btn">Sign In</Link>
        <Link to="/register" className="nav-register-btn">Register</Link>
      </div>
    </nav>
  );
}
