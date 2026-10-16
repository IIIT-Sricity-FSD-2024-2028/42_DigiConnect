import React from 'react';

/**
 * StatCard component
 * Props:
 * - title (string): Label of the metric (e.g., "Total Applications")
 * - value (number|string): Value to display
 * - subtitle (string): Extra caption/help text
 * - variant (string): 'accent' (amber), 'success' (green), 'danger' (red), or '' (blue/navy)
 * - icon (ReactNode): SVG icon element
 * - iconColor (string): CSS class for icon background/tint: 'blue', 'green', 'amber', 'purple'
 */
export default function StatCard({
  title,
  value,
  subtitle,
  variant = '',
  icon,
  iconColor = 'blue',
}) {
  return (
    <div className={`stat-card ${variant}`.trim()}>
      <div className="stat-card-inner">
        <div>
          <div className="stat-label">{title}</div>
          <div className="stat-value">{value}</div>
        </div>
        {icon && (
          <div className={`stat-icon ${iconColor}`}>
            {icon}
          </div>
        )}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
