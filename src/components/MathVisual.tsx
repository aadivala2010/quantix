import type { Visual } from '../lib/generators';

/**
 * Diagrams for questions that read better as a picture. Plain SVG, coloured
 * with the lesson's --accent so each course draws in its own colour.
 */
export function MathVisual({ visual }: { visual: Visual }) {
  return (
    <div className="glass mt-4 rounded-[24px] px-4 py-3 text-wolf">
      {visual.kind === 'fractions' && <Fractions items={visual.items} />}
      {visual.kind === 'rect' && <Rect w={visual.w} h={visual.h} />}
      {visual.kind === 'triangle' && <Triangle {...visual} />}
      {visual.kind === 'clock' && <Clock h={visual.h} m={visual.m} />}
      {visual.kind === 'numberLine' && <NumberLine {...visual} />}
      {visual.kind === 'points' && <Points pts={visual.pts} />}
    </div>
  );
}

const A = 'var(--accent)';
const soft = 'color-mix(in srgb, var(--accent) 22%, transparent)';
const label = { fill: 'currentColor', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' } as const;
const svg = 'mx-auto block w-full max-w-[340px]';

function Fractions({ items }: { items: [number, number][] }) {
  const W = 250;
  return (
    <svg viewBox={`0 0 320 ${items.length * 44}`} className={svg} role="img" aria-label="Fraction bars">
      {items.map(([n, d], i) => (
        <g key={i} transform={`translate(0 ${i * 44 + 6})`}>
          <text x="22" y="20" textAnchor="middle" {...label} fontSize={15}>
            {n}/{d}
          </text>
          {Array.from({ length: d }, (_, k) => (
            <rect
              key={k}
              x={55 + (k * W) / d + 1.5}
              y="2"
              width={W / d - 3}
              height="28"
              rx="7"
              fill={k < n ? A : soft}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

function Rect({ w, h }: { w: number; h: number }) {
  const s = Math.min(230 / w, 110 / h);
  const rw = Math.max(w * s, 36);
  const rh = Math.max(h * s, 28);
  const x = (300 - rw) / 2;
  return (
    <svg viewBox={`0 0 300 ${rh + 46}`} className={svg} role="img" aria-label={`Rectangle ${w} by ${h} centimetres`}>
      <rect x={x} y="8" width={rw} height={rh} rx="6" fill={soft} stroke={A} strokeWidth="2.5" />
      <text x="150" y={rh + 32} textAnchor="middle" {...label}>
        {w} cm
      </text>
      <text x={x + rw + 8} y={8 + rh / 2 + 4} {...label}>
        {h} cm
      </text>
    </svg>
  );
}

function Triangle({ a, b, c, missing }: { a: number; b: number; c: number; missing: 'b' | 'c' }) {
  // a: vertical leg, b: horizontal leg, right angle bottom-left.
  const s = Math.min(200 / b, 120 / a);
  const W = b * s;
  const H = a * s;
  const x0 = (300 - W) / 2;
  const y0 = 10 + H;
  return (
    <svg viewBox={`0 0 300 ${H + 40}`} className={svg} role="img" aria-label="Right triangle">
      <path d={`M${x0} ${y0}V${y0 - H}L${x0 + W} ${y0}Z`} fill={soft} stroke={A} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={`M${x0} ${y0 - 12}h12v12`} fill="none" stroke={A} strokeWidth="1.5" />
      <text x={x0 - 8} y={y0 - H / 2 + 4} textAnchor="end" {...label}>
        {a}
      </text>
      <text x={x0 + W / 2} y={y0 + 20} textAnchor="middle" {...label} fill={missing === 'b' ? A : 'currentColor'}>
        {missing === 'b' ? '?' : b}
      </text>
      <text x={x0 + W / 2 + 10} y={y0 - H / 2 - 6} {...label} fill={missing === 'c' ? A : 'currentColor'}>
        {missing === 'c' ? '?' : c}
      </text>
    </svg>
  );
}

function Clock({ h, m }: { h: number; m: number }) {
  const hand = (deg: number, len: number) => {
    const r = ((deg - 90) * Math.PI) / 180;
    return { x2: 80 + Math.cos(r) * len, y2: 80 + Math.sin(r) * len };
  };
  return (
    <svg viewBox="0 0 160 160" className="mx-auto block w-36" role="img" aria-label={`Clock showing ${h}:${String(m).padStart(2, '0')}`}>
      <circle cx="80" cy="80" r="74" fill={soft} stroke={A} strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => {
        const p = hand(i * 30, 66);
        const q = hand(i * 30, i % 3 ? 61 : 56);
        return <line key={i} x1={q.x2} y1={q.y2} x2={p.x2} y2={p.y2} stroke="currentColor" strokeWidth={i % 3 ? 1.5 : 3} strokeLinecap="round" />;
      })}
      {[12, 3, 6, 9].map((n) => {
        const p = hand(n * 30, 44);
        return (
          <text key={n} x={p.x2} y={p.y2 + 5} textAnchor="middle" {...label} fontSize={15}>
            {n}
          </text>
        );
      })}
      <line x1="80" y1="80" {...hand((h % 12) * 30 + m / 2, 34)} stroke="var(--color-eel)" strokeWidth="6" strokeLinecap="round" />
      <line x1="80" y1="80" {...hand(m * 6, 56)} stroke={A} strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="80" r="5" fill={A} />
    </svg>
  );
}

function NumberLine({ from, to, mark }: { from: number; to: number; mark: number }) {
  const X = (v: number) => 30 + ((v - from) / (to - from)) * 260;
  return (
    <svg viewBox="0 0 320 78" className={svg} role="img" aria-label={`Number line from ${from} to ${to}`}>
      <line x1="20" y1="44" x2="300" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={30 + i * 26} x2={30 + i * 26} y1={i % 5 ? 39 : 34} y2={i % 5 ? 49 : 54} stroke="currentColor" strokeWidth={i % 5 ? 1.5 : 2.5} />
      ))}
      {[from, (from + to) / 2, to].map((v) => (
        <text key={v} x={X(v)} y="72" textAnchor="middle" {...label} fontSize={12}>
          {v}
        </text>
      ))}
      <circle cx={X(mark)} cy="44" r="7" fill={A} stroke="#fff" strokeWidth="2" />
      <text x={X(mark)} y="22" textAnchor="middle" {...label} fill={A} fontSize={14}>
        {mark}
      </text>
    </svg>
  );
}

function Points({ pts }: { pts: [number, number][] }) {
  const xs = [0, ...pts.map((p) => p[0])];
  const ys = [0, ...pts.map((p) => p[1])];
  const x0 = Math.min(...xs) - 1;
  const x1 = Math.max(...xs) + 1;
  const y0 = Math.min(...ys) - 1;
  const y1 = Math.max(...ys) + 1;
  const s = Math.min(280 / (x1 - x0), 190 / (y1 - y0), 26);
  const W = (x1 - x0) * s;
  const H = (y1 - y0) * s;
  const X = (x: number) => 10 + (x - x0) * s;
  const Y = (y: number) => 10 + (y1 - y) * s;
  const step = x1 - x0 > 24 || y1 - y0 > 24 ? 5 : 1;
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i).filter((v) => v % step === 0);
  return (
    <svg viewBox={`0 0 ${W + 20} ${H + 20}`} className={`${svg} max-h-56`} role="img" aria-label="Points on a coordinate grid">
      {range(x0, x1).map((x) => (
        <line key={`x${x}`} x1={X(x)} x2={X(x)} y1={Y(y0)} y2={Y(y1)} stroke="currentColor" strokeOpacity={x ? 0.15 : 0.7} strokeWidth={x ? 1 : 1.5} />
      ))}
      {range(y0, y1).map((y) => (
        <line key={`y${y}`} y1={Y(y)} y2={Y(y)} x1={X(x0)} x2={X(x1)} stroke="currentColor" strokeOpacity={y ? 0.15 : 0.7} strokeWidth={y ? 1 : 1.5} />
      ))}
      <line x1={X(pts[0][0])} y1={Y(pts[0][1])} x2={X(pts[1][0])} y2={Y(pts[1][1])} stroke={A} strokeWidth="2.5" strokeDasharray="6 5" />
      {pts.map(([x, y]) => (
        <g key={`${x},${y}`}>
          <circle cx={X(x)} cy={Y(y)} r="6" fill={A} stroke="#fff" strokeWidth="2" />
          <text x={X(x) + (x > (x0 + x1) / 2 ? -9 : 9)} y={Y(y) - 8} textAnchor={x > (x0 + x1) / 2 ? 'end' : 'start'} {...label} fontSize={12}>
            ({x}, {y})
          </text>
        </g>
      ))}
    </svg>
  );
}
