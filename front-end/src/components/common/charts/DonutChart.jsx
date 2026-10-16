// src/components/common/charts/DonutChart.jsx
// Lightweight, interactive SVG Donut / Pie Chart with legend
// React concepts: Components, Props, Math trigonometry for SVG paths, Hover highlighting

import React, { useState } from 'react';

export default function DonutChart({
  data = [],
  size = 220,
  holeSize = 52,
  centerLabel = 'Revenue',
  centerSub = 'Share',
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0) || 1;
  const center = size / 2;
  const radius = center - 16;

  let startAngle = 0;
  const slices = data.map((d, i) => {
    const val = Number(d.value) || 0;
    const sliceAngle = (val / total) * 360;
    const endAngle = startAngle + sliceAngle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const x3 = center + holeSize * Math.cos(endRad);
    const y3 = center + holeSize * Math.sin(endRad);
    const x4 = center + holeSize * Math.cos(startRad);
    const y4 = center + holeSize * Math.sin(startRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${holeSize} ${holeSize} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    startAngle = endAngle;
    const pct = ((val / total) * 100).toFixed(1);

    return {
      index: i,
      pathData,
      color: d.color || '#2563eb',
      label: d.label,
      val,
      pct,
    };
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        flexWrap: 'wrap',
      }}
    >
      {/* SVG Donut Circle */}
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((s) => {
            const isHovered = hoveredIdx === s.index;
            return (
              <path
                key={s.index}
                d={s.pathData}
                fill={s.color}
                opacity={hoveredIdx !== null && !isHovered ? 0.6 : 1}
                transform={isHovered ? `scale(1.03)` : undefined}
                style={{
                  transformOrigin: `${center}px ${center}px`,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredIdx(s.index)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <title>{`${s.label}: ${s.pct}%`}</title>
              </path>
            );
          })}
          {/* Inner cutout hole */}
          <circle cx={center} cy={center} r={holeSize} fill="#ffffff" />
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--slate-400, #94a3b8)', fontWeight: 700 }}>
            {centerLabel}
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--navy-900, #0f172a)' }}>
            {centerSub}
          </div>
        </div>
      </div>

      {/* Legend list */}
      <div style={{ flex: '1', minWidth: '180px', maxHeight: '220px', overflowY: 'auto' }}>
        {slices.map((s) => {
          const isHovered = hoveredIdx === s.index;
          return (
            <div
              key={s.index}
              onMouseEnter={() => setHoveredIdx(s.index)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                fontSize: '0.8125rem',
                padding: '4px 6px',
                borderRadius: '4px',
                background: isHovered ? 'var(--slate-50, #f8fafc)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    background: s.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: isHovered ? 'var(--navy-900, #0f172a)' : 'var(--slate-700, #334155)',
                    fontWeight: isHovered ? 700 : 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {s.label}
                </span>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--navy-900, #0f172a)', flexShrink: 0 }}>
                {s.pct}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
