import { useState } from 'react';
import { LESSONS_PER_SKILL } from '../lib/courses';
import { currentStreak, dayKey, practicedToday, resetAll, useStore } from '../lib/store';
import { cx } from '../lib/ui';
import { Flame } from '../components/StreakPill';
import { Icon } from '../components/Icon';
import { fx, isMuted, setMuted } from '../lib/fx';

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

  return (
    <div className="flex h-full flex-col">
      <header className="pt-safe px-5 pb-2">
        <h1 className="text-2xl font-extrabold">Profile</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* streak hero */}
        <div
          className="mt-4 flex items-center gap-4 rounded-2xl p-5 text-white"
          style={{ background: today ? '#ff9600' : '#afafaf', boxShadow: `0 5px 0 ${today ? '#e08600' : '#9a9a9a'}` }}
        >
          <Flame className="h-14 w-14 drop-shadow" onColor />
          <div>
            <p className="text-4xl leading-none font-extrabold">{streak}</p>
            <p className="mt-1 font-extrabold">day streak</p>
          </div>
        </div>
        <p className="mt-2 text-center text-sm font-bold text-wolf">
          {today ? 'Done for today — see you tomorrow!' : 'Finish one lesson today to keep it alive.'}
        </p>

        {/* stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Tile label="Lessons done" value={state.totalLessons} icon="book" color="#1cb0f6" />
          <Tile label="Skills mastered" value={mastered} icon="crown" color="#ffc800" />
        </div>

        {/* calendar */}
        <h2 className="mt-8 mb-3 text-lg font-extrabold">Last 5 weeks</h2>
        <div className="rounded-2xl border-2 border-swan p-4">
          <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[0.65rem] font-extrabold text-hare">
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
                    'aspect-square rounded-lg border-2',
                    days.has(d.key)
                      ? 'border-fox bg-fox'
                      : d.key === todayKey
                        ? 'border-hare border-dashed bg-white'
                        : 'border-transparent bg-polar',
                  )}
                />
              ),
            )}
          </div>
        </div>

        {/* settings */}
        <h2 className="mt-8 mb-3 text-lg font-extrabold">Settings</h2>
        <button
          onClick={() => {
            const next = !sound;
            setSound(next);
            setMuted(!next);
            if (next) fx.tap();
          }}
          role="switch"
          aria-checked={sound}
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-swan p-4 text-left transition-transform active:translate-y-[2px]"
        >
          <Icon name={sound ? 'volumeOn' : 'volumeOff'} className={cx('h-6 w-6', sound ? 'text-macaw' : 'text-hare')} strokeWidth={2.3} />
          <span className="flex-1 font-extrabold">Sound effects</span>
          <span
            className={cx(
              'relative h-7 w-12 rounded-full transition-colors',
              sound ? 'bg-grass' : 'bg-swan',
            )}
          >
            <span
              className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-200"
              style={{ left: sound ? '1.625rem' : '0.25rem' }}
            />
          </span>
        </button>

        {/* reset */}
        <button className="btn btn-white mt-4" onClick={() => setConfirmReset(true)}>
          Reset all progress
        </button>
        <p className="mt-2 text-center text-xs font-bold text-hare">
          Progress is stored on this device only.
        </p>
      </div>

      {confirmReset && (
        <div className="absolute inset-0 z-40 grid place-items-end bg-black/40 sm:place-items-center">
          <div className="animate-slide-up w-full rounded-t-3xl bg-white p-6 sm:max-w-sm sm:rounded-3xl">
            <h2 className="text-center text-xl font-extrabold">Reset everything?</h2>
            <p className="mt-2 mb-5 text-center font-bold text-wolf">
              This clears your streak and every skill you've unlocked. It can't be undone.
            </p>
            <button
              className="btn btn-red"
              onClick={() => {
                resetAll();
                setConfirmReset(false);
              }}
            >
              Yes, reset
            </button>
            <button className="btn btn-white mt-3" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="rounded-2xl border-2 border-swan p-4">
      <div className="flex items-center gap-2">
        <Icon name={icon} className="h-6 w-6" strokeWidth={2.3} style={{ color }} />
        <span className="text-2xl font-extrabold tabular-nums">{value}</span>
      </div>
      <p className="mt-1 text-sm font-bold text-wolf">{label}</p>
    </div>
  );
}
