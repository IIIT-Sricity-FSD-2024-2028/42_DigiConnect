// ═══════════════════════════════════════════
// chart-renderer.js — Lightweight, beautiful SVG & Canvas Chart Engine
// Zero external dependencies, pure CSS & SVG/Canvas vector rendering
// ═══════════════════════════════════════════

/**
 * Render a responsive Bar Chart in a container
 * @param {HTMLElement} container 
 * @param {Array} data - [{ label, value, sublabel, color }]
 * @param {Object} options - { height, formatValue, yAxisLabel, barColor }
 */
export function renderBarChart(container, data, options = {}) {
  if (!container) return;
  const height = options.height || 260;
  const formatVal = options.formatValue || ((v) => v.toLocaleString());
  const maxVal = Math.max(...data.map(d => d.value), 1);

  if (data.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--slate-400);">No data available</div>`;
    return;
  }

  const barWidth = Math.max(Math.min(600 / data.length - 8, 48), 18);
  const chartWidth = Math.max(data.length * (barWidth + 12) + 60, container.clientWidth || 500);

  const barsSvg = data.map((d, i) => {
    const barHeight = Math.max((d.value / maxVal) * (height - 60), 4);
    const x = 50 + i * (barWidth + 12);
    const y = height - 40 - barHeight;
    const color = d.color || options.barColor || 'var(--navy-600)';

    return `
      <g class="chart-bar-group" data-label="${d.label}" data-value="${formatVal(d.value)}">
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}" style="transition:all 0.3s ease;cursor:pointer;" class="chart-bar">
          <title>${d.label}: ${formatVal(d.value)}</title>
        </rect>
        <text x="${x + barWidth / 2}" y="${y - 6}" font-size="10" font-weight="700" fill="var(--slate-700)" text-anchor="middle" class="bar-val-text">
          ${formatVal(d.value)}
        </text>
        <text x="${x + barWidth / 2}" y="${height - 20}" font-size="10.5" font-weight="600" fill="var(--slate-600)" text-anchor="middle" transform="rotate(${data.length > 8 ? -35 : 0}, ${x + barWidth / 2}, ${height - 20})">
          ${d.label.length > 10 && data.length > 6 ? d.label.slice(0, 8) + '…' : d.label}
        </text>
      </g>
    `;
  }).join('');

  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const y = height - 40 - (pct * (height - 60));
    const val = Math.round(pct * maxVal);
    return `
      <line x1="45" y1="${y}" x2="${chartWidth - 20}" y2="${y}" stroke="var(--slate-200)" stroke-dasharray="3,3" stroke-width="1"/>
      <text x="40" y="${y + 3}" font-size="9" fill="var(--slate-400)" text-anchor="end">${formatVal(val)}</text>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width:100%;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;">
      <svg width="100%" height="${height}" viewBox="0 0 ${chartWidth} ${height}" style="min-width:${chartWidth}px;display:block;">
        ${gridLines}
        ${barsSvg}
      </svg>
    </div>
  `;
}

/**
 * Render a Donut/Pie Chart with interactive segment highlighting and legend
 * @param {HTMLElement} container 
 * @param {Array} data - [{ label, value, color, pct }]
 * @param {Object} options - { size, holeSize, formatValue }
 */
export function renderDonutChart(container, data, options = {}) {
  if (!container) return;
  const size = options.size || 220;
  const center = size / 2;
  const radius = center - 20;
  const hole = options.holeSize !== undefined ? options.holeSize : 45;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let startAngle = 0;
  const slices = data.map((d, i) => {
    const sliceAngle = (d.value / total) * 360;
    const endAngle = startAngle + sliceAngle;
    
    // SVG path calculation for donut segment
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const x3 = center + hole * Math.cos(endRad);
    const y3 = center + hole * Math.sin(endRad);
    const x4 = center + hole * Math.cos(startRad);
    const y4 = center + hole * Math.sin(startRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${hole} ${hole} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    
    startAngle = endAngle;
    const pct = ((d.value / total) * 100).toFixed(1);

    return `
      <path d="${pathData}" fill="${d.color}" style="transition:all 0.2s ease;cursor:pointer;" class="donut-slice">
        <title>${d.label}: ${d.formattedValue || d.value} (${pct}%)</title>
      </path>
    `;
  }).join('');

  const legendHtml = data.map(d => {
    const pct = ((d.value / total) * 100).toFixed(1);
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:0.8125rem;padding:3px 0;">
        <div style="display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden;">
          <span style="width:10px;height:10px;border-radius:2px;background:${d.color};flex-shrink:0;"></span>
          <span style="color:var(--slate-700);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${d.label}</span>
        </div>
        <div style="font-weight:700;color:var(--navy-900);flex-shrink:0;">${pct}%</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;gap:20px;flex-wrap:wrap;">
      <div style="position:relative;width:${size}px;height:${size}px;flex-shrink:0;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          ${slices}
          <circle cx="${center}" cy="${center}" r="${hole}" fill="#ffffff"/>
        </svg>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;">
          <div style="font-size:0.65rem;text-transform:uppercase;color:var(--slate-400);font-weight:700;">Revenue</div>
          <div style="font-size:0.875rem;font-weight:800;color:var(--navy-900);">Share</div>
        </div>
      </div>
      <div style="flex:1;min-width:180px;max-height:220px;overflow-y:auto;padding-right:4px;">
        ${legendHtml}
      </div>
    </div>
  `;
}

/**
 * Render a Line / Area Trend Chart
 * @param {HTMLElement} container 
 * @param {Array} points - [{ label, value }]
 * @param {Object} options - { height, lineColor, fillColor, formatValue }
 */
export function renderTrendChart(container, points, options = {}) {
  if (!container || points.length === 0) return;
  const height = options.height || 220;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const width = Math.max(container.clientWidth || 460, 360);
  const chartH = height - paddingTop - paddingBottom;
  const chartW = width - paddingLeft - paddingRight;

  const maxVal = Math.max(...points.map(p => p.value), 1);
  const minVal = Math.min(...points.map(p => p.value), 0);
  const formatVal = options.formatValue || ((v) => v.toLocaleString());
  const lineColor = options.lineColor || 'var(--navy-600)';
  const fillColor = options.fillColor || 'rgba(30, 67, 126, 0.1)';

  // Calculate coordinates
  const coords = points.map((p, i) => {
    const x = paddingLeft + (i / (points.length - 1 || 1)) * chartW;
    const y = paddingTop + chartH - ((p.value - minVal) / (maxVal - minVal || 1)) * chartH;
    return { x, y, label: p.label, value: p.value };
  });

  const pathD = coords.reduce((acc, c, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`, '');
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${paddingTop + chartH} L ${coords[0].x} ${paddingTop + chartH} Z`;

  // Grid lines
  const gridLines = [0, 0.33, 0.66, 1].map(pct => {
    const y = paddingTop + chartH - pct * chartH;
    const val = Math.round(minVal + pct * (maxVal - minVal));
    return `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="var(--slate-200)" stroke-dasharray="3,3" stroke-width="1"/>
      <text x="${paddingLeft - 6}" y="${y + 3}" font-size="9" fill="var(--slate-400)" text-anchor="end">${formatVal(val)}</text>
    `;
  }).join('');

  // Points & Labels
  const dotsAndLabels = coords.map(c => `
    <g class="trend-point">
      <circle cx="${c.x}" cy="${c.y}" r="4" fill="#ffffff" stroke="${lineColor}" stroke-width="2.5" style="cursor:pointer;">
        <title>${c.label}: ${formatVal(c.value)}</title>
      </circle>
      <text x="${c.x}" y="${height - 12}" font-size="10" font-weight="600" fill="var(--slate-500)" text-anchor="middle">${c.label}</text>
    </g>
  `).join('');

  container.innerHTML = `
    <div style="width:100%;overflow-x:auto;">
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="display:block;">
        ${gridLines}
        <path d="${areaD}" fill="${fillColor}"/>
        <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        ${dotsAndLabels}
      </svg>
    </div>
  `;
}
