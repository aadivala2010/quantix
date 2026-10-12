import { currentStreak, practicedToday, useStore } from '../lib/store';
import { cx } from '../lib/ui';

export function Flame({
  className = 'h-5 w-5',
  lit = true,
  /** Set when the flame sits on a coloured background, where orange-on-orange vanishes. */
  onColor = false,
}: {
  className?: string;
  lit?: boolean;
  onColor?: boolean;
}) {
  const outer = onColor ? '#ffffff' : lit ? '#ff9500' : 'var(--color-hare)';
  const inner = onColor ? '#ffe3a3' : lit ? '#ffcc00' : 'transparent';
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2c.6 3.2-1.3 4.6-2.7 6C7.6 9.6 6 11.2 6 14a6 6 0 0 0 12 0c0-2.4-1-3.9-2.2-5.4-.6 1-1.4 1.6-2.3 1.9.7-2.1.3-5.4-1.5-8.5Z"
        fill={outer}
      />
      <path
        d="M12 12c.4 1.6-.6 2.3-1.2 3-.6.7-1.3 1.4-1.3 2.6a2.5 2.5 0 0 0 5 0c0-1.4-.9-2.3-1.6-3.2-.4-.6-.8-1.4-.9-2.4Z"
        fill={inner}
      />
    </svg>
  );
}

/** Filled lightning bolt — the XP symbol. */
export function Bolt({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M13.5 2 4.5 13.4h6.2L9.6 22l9.9-12.2h-6.4z" fill="#ffcc00" stroke="#ff9f0a" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/** Streak counter. Greys out until you finish a lesson today. */
export function StreakPill() {
  const streak = useStore(currentStreak);
  const today = useStore(practicedToday);
  return (
    <span
      className="flex items-center gap-1"
      title={today ? 'Practiced today' : 'Practice today to keep your streak'}
      aria-label={`${streak} day streak`}
    >
      <Flame lit={today} />
      <span className={cx('text-[0.95rem] font-semibold tabular-nums', today ? 'text-fox-dark' : 'text-wolf')}>{streak}</span>
    </span>
  );
}

/** Total XP. Ticks when it changes. */
export function XpPill() {
  const xp = useStore((s) => s.xp);
  return (
    <span className="flex items-center gap-1" title="Total XP" aria-label={`${xp} XP`}>
      <Bolt />
      <span key={xp} className="animate-tick text-[0.95rem] font-semibold text-eel tabular-nums">
        {xp}
      </span>
    </span>
  );
}

/** Navigation bar: leading content, trailing glass capsule of counters. */
export function StatsBar({ left }: { left?: React.ReactNode }) {
  return (
    <header className="pt-safe z-10 flex shrink-0 items-center gap-2 px-5 pb-2">
      <div className="min-w-0 flex-1">{left}</div>
      <div className="glass flex items-center gap-3 rounded-full px-3.5 py-1.5">
        <StreakPill />
        <span className="h-4 w-px bg-swan" />
        <XpPill />
      </div>
    </header>
  );
}
