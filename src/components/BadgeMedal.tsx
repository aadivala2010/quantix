import type { Badge } from '../lib/badges';
import { tilt } from '../lib/ui';
import { Icon } from './Icon';
import { Bolt, Flame } from './StreakPill';

/** A badge as a glossy orb; frosted glass until it is earned. */
export function BadgeMedal({ badge, earned, size = 64 }: { badge: Badge; earned: boolean; size?: number }) {
  const glyph = { width: size * 0.48, height: size * 0.48 };
  return (
    <div
      {...tilt}
      className="orb"
      data-locked={earned ? undefined : ''}
      title={`${badge.title}: ${badge.detail}`}
      style={{ '--tint': badge.color, width: size, height: size } as React.CSSProperties}
    >
      {!earned ? (
        <Icon name="lock" className="relative" style={glyph} strokeWidth={2.2} />
      ) : badge.icon === 'flame' ? (
        <span className="relative" style={glyph}>
          <Flame className="h-full w-full" onColor />
        </span>
      ) : badge.icon === 'bolt' ? (
        <span className="relative" style={glyph}>
          <Bolt className="h-full w-full" />
        </span>
      ) : (
        <Icon name={badge.icon} className="relative" style={glyph} strokeWidth={2.2} />
      )}
    </div>
  );
}
