import { useState } from 'react';
import { LESSONS_PER_SKILL } from '../lib/courses';
import { currentStreak, dayKey, practicedToday, resetAll, useStore } from '../lib/store';
import { cx } from '../lib/ui';
import { Bolt, Flame } from '../components/StreakPill';
import { Icon, IconTile } from '../components/Icon';
import { fx, isMuted, setMuted } from '../lib/fx';
import { BADGES, earnedIds } from '../lib/badges';
import { BadgeMedal } from '../components/BadgeMedal';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Last 5 weeks of activity, aligned so each column is a weekday. */
function calendarDays(): { key: string; blank: boolean }[] {
  const out: { key: string; blank: boolean }[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 34);
  for (let i = 0; i < start.getDay(); i++) out.push({ key: `blank${i}`, blank: true });
  for (let i = 0; i < 35; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({ key: dayKey(d), blank: false });
  }
  return out;
}

export function Profile() {
  const state = useStore((s) => s);
  const streak = useStore(currentStreak);
  const today = useStore(practicedToday);
  const [confirmReset, setConfirmReset] = useState(false);
  const [sound, setSound] = useState(!isMuted());

  const mastered = Object.values(state.progress).filter((n) => n >= LESSONS_PER_SKILL).length;
  const days = new Set(state.days);
  const todayKey = dayKey();
  const earned = earnedIds(state);

  return (
    <div className="accent relative isolate flex h-full flex-col" style={{ '--accent': '#ff9500' } as React.CSSProperties}>
      <div className="wash" />
      <div className="no-scrollbar pt-safe flex-1 overflow-y-auto px-5 pb-32">
        <h1 className="mt-1 mb-6 text-[2.125rem] leading-tight font-bold">Profile</h1>

        {/* streak hero */}
        <div className="glass flex items-center gap-4 overflow-hidden rounded-[28px] p-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-fox opacity-40 blur-xl" hidden={!today} />
            <Flame className="animate-float relative h-16 w-16" lit={today} />
          </div>
          <div className="min-w-0">
            <p className="text-[2.6rem] leading-none font-bold tabular-nums">{streak}</p>
            <p className="mt-1 font-semibold">
              day streak{state.best > streak && <span className="font-normal text-wolf"> · best {state.best}</span>}
            </p>
            <p className="text-[0.85rem] text-wolf">
              {today ? 'Done for today. See you tomorrow!' : 'Finish one lesson today to keep it alive.'}
            </p>
          </div>
        </div>

        {/* stats */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Tile label="Total XP" value={state.xp} icon={<Bolt className="h-6 w-6" />} />
          <Tile label="Lessons done" value={state.totalLessons} icon={<Icon name="book" className="h-6 w-6 text-macaw" strokeWidth={2.2} />} />
          <Tile label="Skills mastered" value={mastered} icon={<Icon name="crown" className="h-6 w-6 text-bee-dark" strokeWidth={2.2} />} />
          <Tile label="Days practiced" value={state.days.length} icon={<Icon name="clock" className="h-6 w-6 text-grass-dark" strokeWidth={2.2} />} />
        </div>

        {/* trophy case */}
        <p className="section-label mt-8">
          Badges · {earned.length} of {BADGES.length}
        </p>
        <div className="glass grid grid-cols-4 gap-x-2 gap-y-4 rounded-[26px] px-3 py-5">
          {BADGES.map((b) => {
            const has = earned.includes(b.id);
            return (
              <div key={b.id} className="flex flex-col items-center text-center">
                <BadgeMedal badge={b} earned={has} size={58} />
                <p className={cx('mt-1.5 text-[0.75rem] leading-tight font-semibold', !has && 'text-wolf')}>{b.title}</p>
                <p className="text-[0.65rem] leading-tight text-wolf">{b.detail}</p>
              </div>
            );
          })}
        </div>

        {/* calendar */}
        <p className="section-label mt-8">Last 5 weeks</p>
        <div className="glass rounded-[26px] p-4">
          <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[0.7rem] font-semibold text-wolf">
            {WEEKDAYS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays().map((d) =>
              d.blank ? (
                <span key={d.key} />
              ) : (
                <div
                  key={d.key}
                  title={d.key}
                  className={cx(
                    'aspect-square rounded-full',
                    days.has(d.key)
                      ? 'bg-gradient-to-b from-[#ffb340] to-fox shadow-[0_4px_10px_-4px_var(--color-fox)]'
                      : d.key === todayKey
                        ? 'shadow-[inset_0_0_0_2px_var(--color-macaw)]'
                        : 'bg-polar',
                  )}
                />
              ),
            )}
          </div>
        </div>

        {/* settings */}
        <p className="section-label mt-8">Settings</p>
        <div className="glass overflow-hidden rounded-[26px]">
          <button
            onClick={() => {
              const next = !sound;
              setSound(next);
              setMuted(!next);
              if (next) fx.tap();
            }}
            role="switch"
            aria-checked={sound}
            className="flex w-full items-center gap-3.5 py-2.5 pr-4 pl-4 text-left transition-colors active:bg-swan"
          >
            <IconTile name={sound ? 'volumeOn' : 'volumeOff'} color="#ff2d55" size={30} />
            <span className="flex-1">Sound effects</span>
            {/* iOS switch */}
            <span className={cx('relative h-[31px] w-[51px] rounded-full transition-colors duration-300', sound ? 'bg-grass' : 'bg-swan')}>
              <span
                className="absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)] transition-transform duration-300 ease-[var(--ease-spring)]"
                style={{ transform: sound ? 'translateX(20px)' : undefined }}
              />
            </span>
          </button>
          <button
            onClick={() => setConfirmReset(true)}
            className="flex w-full items-center gap-3.5 pl-4 text-left transition-colors active:bg-swan"
          >
            <IconTile name="refresh" color="#8e8e93" size={30} />
            <span className="flex-1 border-t border-swan py-3.5 text-cardinal">Reset all progress</span>
          </button>
        </div>
        <p className="mt-2 px-4 text-[0.8rem] text-wolf">Progress is stored on this device only.</p>
      </div>

      {confirmReset && (
        <div className="absolute inset-0 z-40 grid place-items-end bg-black/30 p-3 sm:place-items-center">
          <div className="glass glass-strong animate-slide-up w-full rounded-[34px] p-6 sm:max-w-sm" role="alertdialog" aria-label="Reset everything?">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-swan" />
            <h2 className="text-center text-[1.35rem] font-bold">Reset everything?</h2>
            <p className="mt-1.5 mb-6 text-center text-wolf">
              This clears your streak, XP and every skill you&apos;ve unlocked. It can&apos;t be undone.
            </p>
            <button
              className="btn btn-tint btn-red"
              onClick={() => {
                resetAll();
                setConfirmReset(false);
              }}
            >
              Reset
            </button>
            <button className="btn mt-2 text-macaw" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="glass rounded-[24px] p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[1.6rem] font-bold tabular-nums">{value}</span>
      </div>
      <p className="mt-0.5 text-[0.85rem] text-wolf">{label}</p>
    </div>
  );
}
