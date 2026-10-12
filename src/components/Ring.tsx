/** Activity-style progress ring. `value` is 0..1; past 1 it just stays closed. */
export function Ring({
  value,
  color,
  size = 64,
  stroke = 9,
  children,
  className = '',
}: {
  value: number;
  color: string;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  const r = 50 - (stroke / size) * 50;
  const w = (stroke / size) * 100;
  const v = Math.min(Math.max(value, 0), 1);
  return (
    <div className={`relative grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeOpacity={0.2} strokeWidth={w} />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round"
          pathLength={1} strokeDasharray={`${v} 1`} opacity={v ? 1 : 0}
          className="transition-[stroke-dasharray] duration-1000 ease-[var(--ease-glide)]"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      {children}
    </div>
  );
}
