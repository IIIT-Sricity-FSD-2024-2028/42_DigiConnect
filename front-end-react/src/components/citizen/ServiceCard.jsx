// src/components/citizen/ServiceCard.jsx
// React concepts used: Components, Props (service, onSelect), Events (onClick), Callbacks (onSelect(service))

import React from 'react';

/**
 * ServiceCard — Displays a single government service with SLA, fee, and department.
 *
 * Props:
 *   service  {Object}   - Service object fetched from backend API
 *   onSelect {Function} - Callback invoked when citizen clicks the card or "Apply Now"
 */
export default function ServiceCard({ service, onSelect }) {
  const iconMap = {
    Certificate: 'cert',
    Welfare: 'welfare',
    Permission: 'permission',
    Correction: 'correction',
  };
  const typeClass = iconMap[service.cat] || 'cert';

  const feeAmount = Number(service.fee ?? service.totalFee ?? 0);
  const feeText = service.feeLabel || (feeAmount === 0 ? 'Free' : `₹${feeAmount}`);

  return (
    <div
      className="service-card"
      data-testid={`service-card-${service.id}`}
      data-service-id={service.id}
      data-cat={service.cat}
      onClick={() => onSelect(service)}
      style={{
        cursor: 'pointer',
        padding: 'var(--space-lg)',
        border: '2px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        transition: 'all 0.2s',
        background: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {/* Header: Service Icon, Name & Department */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
          <div className={`service-card-icon ${typeClass}`}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--navy-900)' }}>{service.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{service.dept}</div>
          </div>
        </div>

        {/* Description */}
        <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>
          {service.desc}
        </div>
      </div>

      {/* SLA & Fee footer + Action button */}
      <div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
          <span>SLA: <strong>{service.sla || 7} days</strong></span>
          <span>Fee: <strong>{feeText}</strong></span>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ width: '100%' }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(service);
          }}
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
