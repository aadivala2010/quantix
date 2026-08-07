import { useMemo } from 'react';

const COLORS = ['#58cc02', '#1cb0f6', '#ffc800', '#ff9600', '#ce82ff', '#ff86d0'];

/**
 * Particle burst for the finish screen. Positions are computed once in JS and
 * handed to CSS as custom properties, so the animation itself runs entirely on
 * the compositor (transform + opacity only).
 */
export function Celebration({ count = 28, className = '' }: { count?: number; className?: string }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const distance = 90 + Math.random() * 130;
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          color: COLORS[i % COLORS.length],
          size: 7 + Math.random() * 8,
          delay: Math.random() * 0.18,
          spin: (Math.random() - 0.5) * 540,
          round: i % 3 === 0,
        };
      }),
    [count],
  );

  return (
    <div className={`pointer-events-none absolute inset-0 grid place-items-center ${className}`} aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          className="animate-burst absolute block"
          style={
            {
              width: b.size,
              height: b.size,
              background: b.color,
              borderRadius: b.round ? '999px' : '3px',
              animationDelay: `${b.delay}s`,
              '--bx': `${b.x}px`,
              '--by': `${b.y}px`,
              '--spin': `${b.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
