import React, { useState } from 'react';

/**
 * Props:
 * - data: Array of { label, value, color, sublabel }
 * - height: number (default 260)
 * - formatValue: function (v) => formatted string
 * - barColor: string (default #2563eb)
 */
export default function BarChart({
  data = [],
  height = 260,
  formatValue = (v) => Number(v || 0).toLocaleString('en-IN'),
  barColor = 'var(--navy-600, #2563eb)',
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-400, #94a3b8)', fontSize: '0.875rem' }}>
        No data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Number(d.value) || 0), 1);
  const barWidth = Math.max(Math.min(600 / data.length - 8, 48), 20);
  const chartWidth = Math.max(data.length * (barWidth + 14) + 70, 480);

  // Y-axis grid lines (0%, 25%, 50%, 75%, 100%)
  const gridTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${chartWidth} ${height}`}
        style={{ minWidth: `${chartWidth}px`, display: 'block', overflow: 'visible' }}
      >
        {/* Horizontal grid lines */}
        {gridTicks.map((pct) => {
          const y = height - 42 - pct * (height - 65);
          const val = Math.round(pct * maxVal);
          return (
            <g key={pct}>
              <line
                x1="45"
                y1={y}
                x2={chartWidth - 20}
                y2={y}
                stroke="var(--slate-200, #e2e8f0)"
                strokeDasharray="3,3"
                strokeWidth="1"
              />
              <text
                x="40"
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

        {/* Bars */}
        {data.map((d, i) => {
          const val = Number(d.value) || 0;
          const barHeight = Math.max((val / maxVal) * (height - 65), 4);
          const x = 55 + i * (barWidth + 14);
          const y = height - 42 - barHeight;
          const color = d.color || barColor;
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={d.label + i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={color}
                opacity={hoveredIdx !== null && !isHovered ? 0.6 : 1}
                style={{ transition: 'all 0.2s ease' }}
              >
                <title>{`${d.label}: ${formatValue(val)}`}</title>
              </rect>

              {/* Top value label */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                fontSize="10"
                fontWeight="700"
                fill={isHovered ? 'var(--navy-900, #0f172a)' : 'var(--slate-700, #334155)'}
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {formatValue(val)}
              </text>

              {/* Bottom label */}
              <text
                x={x + barWidth / 2}
                y={height - 20}
                fontSize="10.5"
                fontWeight="600"
                fill="var(--slate-600, #475569)"
                textAnchor="middle"
                fontFamily="sans-serif"
                transform={data.length > 8 ? `rotate(-35, ${x + barWidth / 2}, ${height - 20})` : undefined}
              >
                {d.label.length > 10 && data.length > 6 ? `${d.label.slice(0, 8)}…` : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
