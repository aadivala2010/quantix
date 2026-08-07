import { COURSES, LEVELS, SAT_LEVEL, type Level } from '../lib/courses';
import { courseCompletion, useStore } from '../lib/store';
import { darken } from '../lib/ui';
import { StreakPill } from '../components/StreakPill';
import { Mascot } from '../components/Mascot';
import { Icon } from '../components/Icon';

/** Level picker — the app's front door. */
export function Home({ onPick }: { onPick: (level: Level) => void }) {
  const state = useStore((s) => s);

  const percent = (level: Level) => {
    const totals = level.courses.map((id) => courseCompletion(id, state));
    const done = totals.reduce((s, t) => s + t.done, 0);
    const total = totals.reduce((s, t) => s + t.total, 0);
    return total ? Math.round((done / total) * 100) : 0;
  };

  return (
    <div className="flex h-full flex-col">
      <header className="pt-safe flex items-center justify-between px-5 pb-2">
        <div className="flex items-center gap-2">
          <Mascot size={38} />
          <h1 className="text-2xl font-extrabold tracking-tight text-grass">Quantix</h1>
        </div>
        <StreakPill />
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <h2 className="mt-4 mb-1 text-xl font-extrabold">Choose your level</h2>
        <p className="mb-5 font-bold text-wolf">Pick where you are — you can switch any time.</p>

        <div className="flex flex-col gap-3">
          {LEVELS.map((level) => (
            <LevelCard key={level.id} level={level} percent={percent(level)} onPick={() => onPick(level)} />
          ))}
        </div>

        <div className="divider my-7">
          <span>Test prep</span>
        </div>

        <LevelCard level={SAT_LEVEL} percent={percent(SAT_LEVEL)} onPick={() => onPick(SAT_LEVEL)} />
      </div>
    </div>
  );
}

function LevelCard({ level, percent, onPick }: { level: Level; percent: number; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="flex w-full items-center gap-4 rounded-2xl border-2 border-swan bg-white p-4 text-left transition-transform active:translate-y-[2px]"
      style={{ boxShadow: '0 4px 0 var(--color-swan)' }}
    >
      <div
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
        style={{ background: level.color, boxShadow: `0 3px 0 ${darken(level.color)}` }}
      >
        <Icon name={level.icon} className="h-7 w-7 text-white" strokeWidth={2.3} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-extrabold text-eel">{level.title}</p>
        <p className="truncate text-sm font-bold text-wolf">{level.subtitle}</p>
        {percent > 0 && (
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-swan">
            <div className="h-full rounded-full" style={{ width: `${percent}%`, background: level.color }} />
          </div>
        )}
      </div>
      <Icon name="chevronRight" className="h-5 w-5 shrink-0 text-hare" strokeWidth={3} />
    </button>
  );
}

/** Course picker — only High School has more than one course. */
export function CoursePicker({
  level,
  onPick,
  onBack,
}: {
  level: Level;
  onPick: (courseId: string) => void;
  onBack: () => void;
}) {
  const state = useStore((s) => s);

  return (
    <div className="flex h-full flex-col">
      <header className="pt-safe flex items-center gap-2 px-4 pb-2">
        <button onClick={onBack} aria-label="Back" className="p-1 text-hare active:scale-90">
          <Icon name="chevronLeft" className="h-6 w-6" strokeWidth={3} />
        </button>
        <h1 className="flex-1 text-lg font-extrabold">{level.title}</h1>
        <StreakPill />
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <h2 className="mt-3 mb-1 text-xl font-extrabold">Choose a course</h2>
        <p className="mb-5 font-bold text-wolf">Each course has its own path and progress.</p>

        <div className="grid grid-cols-2 gap-3">
          {level.courses.map((id) => {
            const course = COURSES[id];
            const { done, total } = courseCompletion(id, state);
            const pct = Math.round((done / total) * 100);
            return (
              <button
                key={id}
                onClick={() => onPick(id)}
                className="flex flex-col items-start gap-2 rounded-2xl border-2 border-swan bg-white p-3 text-left transition-transform active:translate-y-[2px]"
                style={{ boxShadow: '0 4px 0 var(--color-swan)' }}
              >
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl text-xl"
                  style={{ background: course.color, boxShadow: `0 3px 0 ${darken(course.color)}` }}
                >
                  <Icon name={course.icon} className="h-6 w-6 text-white" strokeWidth={2.3} />
                </div>
                <p className="text-[0.95rem] leading-tight font-extrabold text-eel">{course.title}</p>
                <p className="text-xs leading-tight font-bold text-wolf">{course.subtitle}</p>
                <div className="mt-auto h-2 w-full overflow-hidden rounded-full bg-swan">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: course.color }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
