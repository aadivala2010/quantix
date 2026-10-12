import { cx } from '../lib/ui';

export type Tab = 'learn' | 'practice' | 'profile';

const ICONS: Record<Tab, React.ReactNode> = {
  learn: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M12 3.2 2.6 11a1 1 0 0 0 .65 1.76H5V20a1 1 0 0 0 1 1h3.5v-5.2h5V21H18a1 1 0 0 0 1-1v-7.24h1.75A1 1 0 0 0 21.4 11Z" />
    </svg>
  ),
  practice: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M4 9h2v6H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Zm14 0h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2Zm-11-2h3v10H7a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm10 0a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3V7ZM11 11h2v2h-2Z" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 1.8c-3.9 0-7.2 2.2-7.2 4.9V21h14.4v-2.3c0-2.7-3.3-4.9-7.2-4.9Z" />
    </svg>
  ),
};

const LABELS: Record<Tab, string> = { learn: 'Learn', practice: 'Practice', profile: 'Profile' };
const TABS = Object.keys(LABELS) as Tab[];

/** Floating glass tab bar; a lens slides under the active tab. */
export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const i = TABS.indexOf(tab);
  return (
    <nav className="pb-safe pointer-events-none absolute inset-x-0 bottom-0 z-20 px-6">
      <div className="glass pointer-events-auto relative flex rounded-full p-1.5">
        <span
          aria-hidden="true"
          className="absolute top-1.5 bottom-1.5 left-1.5 rounded-full bg-swan transition-transform duration-500 ease-[var(--ease-spring)]"
          style={{ width: `calc((100% - 0.75rem) / ${TABS.length})`, transform: `translateX(${i * 100}%)` }}
        />
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => onChange(t)}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'press relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5',
                active ? 'text-macaw' : 'text-wolf',
              )}
            >
              {ICONS[t]}
              <span className="text-[0.66rem] font-semibold">{LABELS[t]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
