/**
 * The icon set. One visual language: 24×24 grid, 2px round stroke, currentColor.
 *
 * Emoji were the biggest "this is a prototype" tell — they render differently on
 * every OS, can't be recoloured, and don't share a stroke weight. Everything
 * structural now comes from here.
 */

type Paths = { d?: string; extra?: React.ReactNode };

const I: Record<string, Paths> = {
  /* ---- arithmetic */
  plus: { d: 'M12 5v14M5 12h14' },
  minus: { d: 'M5 12h14' },
  times: { d: 'M6.5 6.5l11 11M17.5 6.5l-11 11' },
  divide: {
    d: 'M4 12h16',
    extra: (
      <>
        <circle cx="12" cy="6.5" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="12" cy="17.5" r="1.6" fill="currentColor" stroke="none" />
      </>
    ),
  },
  equals: { d: 'M4 9h16M4 15h16' },
  plusBox: { d: 'M4 4h16v16H4zM12 8v8M8 12h8' },
  minusBox: { d: 'M4 4h16v16H4zM8 12h8' },
  timesBox: { d: 'M4 4h16v16H4zM9 9l6 6M15 9l-6 6' },
  stack: { d: 'M4 6h16M4 12h16M4 18h10' },
  link: { d: 'M10 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 1 0-5.7-5.7L11.5 6M14 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 1 0 5.7 5.7l1.1-1.2' },
  compare: { d: 'M9 6l-5 6 5 6M15 6l5 6-5 6' },
  dots: {
    extra: (
      <>
        {[
          [7, 8],
          [12, 8],
          [17, 8],
          [9.5, 15.5],
          [14.5, 15.5],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.1" fill="currentColor" stroke="none" />
        ))}
      </>
    ),
  },
  stairs: { d: 'M3 19h4v-4h4v-4h4V7h5' },
  columns: { d: 'M3 20h18M7 20v-7M12 20V7M17 20v-4' },
  abacus: {
    d: 'M4 4v16M20 4v16M4 9.5h16M4 15h16',
    extra: (
      <>
        <circle cx="9" cy="9.5" r="2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="15" r="2" fill="currentColor" stroke="none" />
      </>
    ),
  },
  fraction: { d: 'M9 5h6M4 12h16M9 19h6' },
  pie: { d: 'M12 3a9 9 0 1 0 9 9h-9z', extra: <circle cx="12" cy="12" r="9" /> },
  coins: { d: 'M9 14a5 5 0 1 1 0-10 5 5 0 0 1 0 10z', extra: <circle cx="15" cy="15" r="5" /> },
  clock: { d: 'M12 7v5l3 2', extra: <circle cx="12" cy="12" r="9" /> },
  ruler: { d: 'M3 8h18v8H3zM7 8v3M11 8v4M15 8v3M19 8v4' },
  areaSquare: { d: 'M4 4h16v16H4zM4 13l9-9M4 20l16-16M13 20l7-7' },
  percent: {
    d: 'M6 18L18 6',
    extra: (
      <>
        <circle cx="7.5" cy="7.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </>
    ),
  },
  ratio: { d: 'M4 10h5v5H4zM13 5h7v14h-7z' },
  thermometer: { d: 'M12 4v10', extra: <circle cx="12" cy="17.5" r="3.2" /> },
  parens: { d: 'M9 3c-3 5-3 13 0 18M15 3c3 5 3 13 0 18' },
  braces: { d: 'M9 3c-2 0-2 3-2 4.5S6 12 4 12c2 0 3 3 3 4.5S7 21 9 21M15 3c2 0 2 3 2 4.5s1 4.5 3 4.5c-2 0-3 3-3 4.5s0 4.5-2 4.5' },

  /* ---- algebra */
  balance: { d: 'M12 4v16M8 20h8M4 8h16M5 8l-2 6h4zM19 8l-2 6h4z' },
  inequality: { d: 'M18 6L6 10.5 18 15M6 19h12' },
  slope: { d: 'M4 20h16V6zM4 20L20 6' },
  intercept: { d: 'M5 3v16h16M7 16l11-8' },
  functionF: { d: 'M5 20V9c0-2.5 1.5-4.5 4-4.5M3 12h7M13 12l7 8M20 12l-7 8' },
  sqrt: { d: 'M3 13l3.5 6L11 4h10' },
  exponent: { d: 'M4 18l8-9M12 18L4 9', extra: <circle cx="18.5" cy="7" r="2.4" fill="currentColor" stroke="none" /> },
  logCurve: { d: 'M4 20c9 0 8-15 16-16' },
  sigma: { d: 'M18 5H7l6 7-6 7h11' },
  sequence: { d: 'M4 12h3M10 12h3M16 12h4', extra: <circle cx="20" cy="12" r="0" /> },

  /* ---- geometry */
  triangle: { d: 'M12 4l9 16H3z' },
  circleShape: { extra: <circle cx="12" cy="12" r="8.5" /> },
  cube: { d: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5' },
  angle: { d: 'M4 20h16M4 20L17 5M11.5 20a9 9 0 0 0 1.6-4.6' },
  arc: { d: 'M4 19a9 9 0 0 1 16-5M4 19h4M20 14v4' },
  shapes: { d: 'M4 4h7v7H4zM17 20a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM13 4l4 6h-8z' },
  distance: { d: 'M5 19L19 5M4 17v3h3M17 4h3v3' },

  /* ---- data */
  chartBar: { d: 'M3 20h18M7 20v-6M12 20V8M17 20v-9' },
  scatter: {
    d: 'M4 4v16h16M5 17l14-9',
    extra: (
      <>
        {[
          [8, 15],
          [12, 13],
          [16, 9],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="currentColor" stroke="none" />
        ))}
      </>
    ),
  },
  bellCurve: { d: 'M3 19h18M3 19c5 0 4.5-12 9-12s4 12 9 12' },
  dice: {
    d: 'M4 4h16v16H4z',
    extra: (
      <>
        {[
          [8.5, 8.5],
          [15.5, 8.5],
          [12, 12],
          [8.5, 15.5],
          [15.5, 15.5],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="currentColor" stroke="none" />
        ))}
      </>
    ),
  },
  table: { d: 'M3 5h18v14H3zM3 10h18M9 10v9' },
  target: { d: '', extra: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ) },

  /* ---- calculus & trig */
  wave: { d: 'M3 12c3-8 6-8 9 0s6 8 9 0' },
  integral: { d: 'M9 20c0-9 0-16-2.2-16C5.8 4 5 5 5 6M15 4c0 9 0 16 2.2 16 1 0 1.8-1 1.8-2' },
  derivative: { d: 'M3 19c7 0 11-11 18-13M6 20l12-9' },
  limitArrow: { d: 'M3 12h11M11 8l4 4-4 4', extra: <circle cx="20" cy="12" r="2" fill="currentColor" stroke="none" /> },
  vector: { d: 'M4 20L20 4M20 4h-7M20 4v7' },
  matrix: {
    d: 'M8 4H5v16h3M16 4h3v16h-3',
    extra: (
      <>
        {[
          [10, 9],
          [14, 9],
          [10, 15],
          [14, 15],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="currentColor" stroke="none" />
        ))}
      </>
    ),
  },
  asymptote: { d: 'M14 3v18M4 19c8 0 9-7 9-7M16 5s1 7 4 7' },
  complex: { d: 'M12 3v18M3 12h18M16 8l-8 8', extra: <circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none" /> },

  /* ---- system / chrome */
  crown: { d: 'M3 8l3.5 3L12 4l5.5 7L21 8l-1.5 11h-15z' },
  lock: { d: 'M8 11V8a4 4 0 0 1 8 0v3M5.5 11h13v9.5h-13z' },
  check: { d: 'M4 12.5l5.5 5.5L20 6' },
  close: { d: 'M6 6l12 12M18 6L6 18' },
  chevronRight: { d: 'M9 5l7 7-7 7' },
  chevronLeft: { d: 'M15 5l-7 7 7 7' },
  home: { d: 'M4 11l8-7 8 7M6.5 9.5V20h11V9.5M10 20v-5h4v5' },
  dumbbell: { d: 'M3 10v4M6.5 7v10M17.5 7v10M21 10v4M6.5 12h11' },
  user: { d: 'M4.5 20v-1.5c0-2.8 3.4-4.5 7.5-4.5s7.5 1.7 7.5 4.5V20', extra: <circle cx="12" cy="8" r="4.2" /> },
  volumeOn: { d: 'M4 9.5h3.5L12 5v14l-4.5-4.5H4zM16 9.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10' },
  volumeOff: { d: 'M4 9.5h3.5L12 5v14l-4.5-4.5H4zM16 10l4 4M20 10l-4 4' },
  book: { d: 'M5 4.5h8a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3zM16 7.5h3V20' },
  star: { d: 'M12 3.5l2.6 6.3 6.9.5-5.2 4.4 1.6 6.6L12 17.8 6.1 21.3l1.6-6.6L2.5 10.3l6.9-.5z' },
  refresh: { d: 'M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5' },
};

export type IconName = keyof typeof I;

export function Icon({
  name,
  className = 'h-6 w-6',
  strokeWidth = 2,
  style,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  const icon = I[name] ?? I.star;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icon.d ? <path d={icon.d} /> : null}
      {icon.extra}
    </svg>
  );
}
