import { cx } from '../lib/ui';

export type Tab = 'learn' | 'practice' | 'profile';

const ICONS: Record<Tab, React.ReactNode> = {
  learn: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
      <path d="M12 3.2 2.6 11a1 1 0 0 0 .65 1.76H5V20a1 1 0 0 0 1 1h3.5v-5.2h5V21H18a1 1 0 0 0 1-1v-7.24h1.75A1 1 0 0 0 21.4 11Z" />
    </svg>
  ),
  practice: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
      <path d="M4 9h2v6H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Zm14 0h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2Zm-11-2h3v10H7a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm10 0a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3V7ZM11 11h2v2h-2Z" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
      <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 1.8c-3.9 0-7.2 2.2-7.2 4.9V21h14.4v-2.3c0-2.7-3.3-4.9-7.2-4.9Z" />
    </svg>
  ),
};

const LABELS: Record<Tab, string> = { learn: 'Learn', practice: 'Practice', profile: 'Profile' };

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="pb-safe sticky bottom-0 z-20 flex border-t-2 border-swan bg-white px-2 pt-2">
      {(Object.keys(LABELS) as Tab[]).map((t) => {
        const active = tab === t;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            aria-current={active ? 'page' : undefined}
            className={cx(
              'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 transition-colors',
              active ? 'bg-[#ddf4ff] text-macaw' : 'text-hare active:bg-polar',
            )}
          >
            {ICONS[t]}
            <span className="text-[0.65rem] font-extrabold tracking-wide uppercase">{LABELS[t]}</span>
          </button>
        );
      })}
    </nav>
  );
}
