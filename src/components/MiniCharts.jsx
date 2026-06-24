// Lightweight, dependency-free chart visuals (inline SVG / CSS). These replace
// the original ECharts canvases so the React app ships nothing heavy.

export function AreaChart({ points = [30, 45, 38, 55, 48, 62, 58, 72, 66, 80, 74, 88], color = 'var(--primary)', id = 'area' }) {
  const w = 600;
  const h = 180;
  const step = w / (points.length - 1);
  const line = points.map((p, i) => `${i * step},${h - (p / 100) * h}`).join(' ');
  const area = `0,${h} ${line} ${w},${h}`;
  const gid = `grad-${id}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" />
    </svg>
  );
}

export function Bars({ data = [], color = 'var(--primary)' }) {
  const w = 600;
  const h = 180;
  const n = data.length;
  const bw = (w / n) * 0.6;
  const gap = (w / n) * 0.4;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      {data.map((v, i) => {
        const bh = (v / 100) * h;
        const c = Array.isArray(color) ? color[i % color.length] : color;
        return <rect key={i} x={i * (bw + gap) + gap / 2} y={h - bh} width={bw} height={bh} rx="3" fill={c} />;
      })}
    </svg>
  );
}

export function Donut({ segments, centerNum, centerSub, size = 150 }) {
  let acc = 0;
  const stops = segments
    .map((s) => {
      const start = acc;
      acc += s.pct;
      return `${s.color} ${start}% ${acc}%`;
    })
    .join(', ');
  return (
    <div className="donut-svg" style={{ width: size, height: size, position: 'relative' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `conic-gradient(${stops})`,
          WebkitMask: 'radial-gradient(circle, transparent 54%, #000 55%)',
          mask: 'radial-gradient(circle, transparent 54%, #000 55%)'
        }}
      />
      {(centerNum || centerSub) && (
        <div className="donut-center-label">
          {centerNum && <div className="num">{centerNum}</div>}
          {centerSub && <div className="sub">{centerSub}</div>}
        </div>
      )}
    </div>
  );
}

export function Gauge({ value = 50, label, color = 'var(--primary)' }) {
  const r = 80;
  const circ = Math.PI * r; // half-circle length
  const offset = circ * (1 - value / 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <svg viewBox="0 0 200 110" style={{ width: '100%', maxWidth: 240 }}>
        <path d="M10 100 A90 90 0 0 1 190 100" fill="none" stroke="var(--border-color-light)" strokeWidth="16" strokeLinecap="round" />
        <path
          d="M10 100 A90 90 0 0 1 190 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div style={{ marginTop: -28, textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>{value}%</div>
        {label && <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{label}</div>}
      </div>
    </div>
  );
}
