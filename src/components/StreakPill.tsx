import { currentStreak, practicedToday, useStore } from '../lib/store';
import { cx } from '../lib/ui';

export function Flame({
  className = 'h-6 w-6',
  lit = true,
  /** Set when the flame sits on a coloured background, where orange-on-orange vanishes. */
  onColor = false,
}: {
  className?: string;
  lit?: boolean;
  onColor?: boolean;
}) {
  const outer = onColor ? '#ffffff' : lit ? '#ff9600' : '#e5e5e5';
  const inner = onColor ? '#ffe9b0' : lit ? '#ffc800' : '#f0f0f0';
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

/** Streak counter. Greys out until you finish a lesson today. */
export function StreakPill({ onDark = false }: { onDark?: boolean }) {
  const streak = useStore(currentStreak);
  const today = useStore(practicedToday);

  return (
    <div
      className={cx(
        'flex shrink-0 items-center gap-1 rounded-xl px-2 py-1',
        onDark ? 'bg-black/15' : '',
      )}
      title={today ? 'Practiced today' : 'Practice today to keep your streak'}
    >
      <Flame lit={today} />
      <span
        className={cx('text-lg font-extrabold', onDark ? 'text-white' : today ? 'text-fox' : 'text-hare')}
      >
        {streak}
      </span>
    </div>
  );
}
