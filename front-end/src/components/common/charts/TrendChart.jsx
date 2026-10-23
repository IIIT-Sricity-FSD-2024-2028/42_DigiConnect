import React, { useState } from 'react';

export default function TrendChart({
  points = [],
  height = 220,
  lineColor = 'var(--navy-600, #2563eb)',
  fillColor = 'rgba(37, 99, 235, 0.1)',
  formatValue = (v) => Number(v || 0).toLocaleString('en-IN'),
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!points || points.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-400, #94a3b8)', fontSize: '0.875rem' }}>
        No trend data available
      </div>
    );
  }

  const paddingLeft = 50;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 35;
  const width = Math.max(points.length * 60 + 80, 480);
  const chartH = height - paddingTop - paddingBottom;
  const chartW = width - paddingLeft - paddingRight;

  const vals = points.map((p) => Number(p.value) || 0);
  const maxVal = Math.max(...vals, 1);
  const minVal = Math.min(...vals, 0);

  const coords = points.map((p, i) => {
    const x = paddingLeft + (i / (points.length - 1 || 1)) * chartW;
    const y = paddingTop + chartH - (((Number(p.value) || 0) - minVal) / (maxVal - minVal || 1)) * chartH;
    return { x, y, label: p.label, value: Number(p.value) || 0 };
  });

  const pathD = coords.reduce((acc, c, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`, '');
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${paddingTop + chartH} L ${coords[0].x} ${paddingTop + chartH} Z`;

  const gridTicks = [0, 0.33, 0.66, 1];

  return (
    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ minWidth: `${width}px`, display: 'block' }}
      >
        {/* Horizontal Grid lines */}
        {gridTicks.map((pct) => {
          const y = paddingTop + chartH - pct * chartH;
          const val = Math.round(minVal + pct * (maxVal - minVal));
          return (
            <g key={pct}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="var(--slate-200, #e2e8f0)"
                strokeDasharray="3,3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                fontSize="9"
                fill="var(--slate-400, #94a3b8)"
                textAnchor="end"
                fontFamily="sans-serif"
              >
                {formatValue(val)}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        <path d={areaD} fill={fillColor} />

        {/* Trend Line */}
        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & Labels */}
        {coords.map((c, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g
              key={c.label + i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={c.x}
                cy={c.y}
                r={isHovered ? 6 : 4}
                fill="#ffffff"
                stroke={lineColor}
                strokeWidth={isHovered ? 3.5 : 2.5}
                style={{ transition: 'r 0.15s ease' }}
              >
                <title>{`${c.label}: ${formatValue(c.value)}`}</title>
              </circle>
              {isHovered && (
                <text
                  x={c.x}
                  y={c.y - 10}
                  fontSize="10"
                  fontWeight="700"
                  fill="var(--navy-900, #0f172a)"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {formatValue(c.value)}
                </text>
              )}
              <text
                x={c.x}
                y={height - 12}
                fontSize="10"
                fontWeight="600"
                fill="var(--slate-500, #64748b)"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {c.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
