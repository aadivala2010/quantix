import { COURSES, LEVELS, SAT_LEVEL, type Level } from '../lib/courses';
import { courseCompletion, useStore } from '../lib/store';
import { StatsBar } from '../components/StreakPill';
import { Icon, IconTile } from '../components/Icon';

const percentOf = (level: Level, state: Parameters<typeof courseCompletion>[1]) => {
  const totals = level.courses.map((id) => courseCompletion(id, state));
  const done = totals.reduce((s, t) => s + t.done, 0);
  const total = totals.reduce((s, t) => s + t.total, 0);
  return total ? Math.round((done / total) * 100) : 0;
};

/** Level picker — the app's front door. */
export function Home({ onPick }: { onPick: (level: Level) => void }) {
  const state = useStore((s) => s);

  return (
    <div className="flex h-full flex-col">
      <StatsBar />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-32">
        <h1 className="mt-1 text-[2.125rem] leading-tight font-bold">Quantix</h1>
        <p className="mb-6 text-wolf">Choose where you are. Switch any time.</p>

        <p className="section-label">Levels</p>
        <div className="glass overflow-hidden rounded-[26px]">
          {LEVELS.map((level, i) => (
            <LevelRow key={level.id} level={level} percent={percentOf(level, state)} first={i === 0} onPick={() => onPick(level)} />
          ))}
        </div>

        <p className="section-label mt-7">Test prep</p>
        <div className="glass overflow-hidden rounded-[26px]">
          <LevelRow level={SAT_LEVEL} percent={percentOf(SAT_LEVEL, state)} first onPick={() => onPick(SAT_LEVEL)} />
        </div>
      </div>
    </div>
  );
}

function LevelRow({ level, percent, first, onPick }: { level: Level; percent: number; first: boolean; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="flex w-full items-center gap-3.5 pl-4 text-left transition-colors active:bg-swan"
    >
      <IconTile name={level.icon} color={level.color} />
      {/* Hairline separators start at the text, like iOS lists. */}
      <div className={`flex min-w-0 flex-1 items-center gap-2 py-3.5 pr-4 ${first ? '' : 'border-t border-swan'}`}>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{level.title}</p>
          <p className="truncate text-[0.9rem] text-wolf">
            {level.subtitle}
            {percent > 0 && ` · ${percent}%`}
          </p>
          {percent > 0 && (
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-swan">
              <div className="h-full rounded-full" style={{ width: `${percent}%`, background: level.color }} />
            </div>
          )}
        </div>
        <Icon name="chevronRight" className="h-4 w-4 shrink-0 text-hare" strokeWidth={2.6} />
      </div>
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
      <StatsBar left={<BackButton onClick={onBack} />} />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-32">
        <h1 className="mt-1 text-[2.125rem] leading-tight font-bold">{level.title}</h1>
        <p className="mb-6 text-wolf">Each course has its own path and progress.</p>

        <div className="grid grid-cols-2 gap-3">
          {level.courses.map((id, i) => {
            const course = COURSES[id];
            const { done, total } = courseCompletion(id, state);
            const pct = Math.round((done / total) * 100);
            return (
              <button
                key={id}
                onClick={() => onPick(id)}
                className="glass press animate-rise flex flex-col items-start gap-2 rounded-[26px] p-4 text-left"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <IconTile name={course.icon} color={course.color} size={48} />
                <p className="mt-1 leading-tight font-semibold">{course.title}</p>
                <p className="text-[0.8rem] leading-tight text-wolf">{course.subtitle}</p>
                <div className="mt-auto flex w-full items-center gap-2 pt-1">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-swan">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: course.color }} />
                  </div>
                  <span className="text-[0.7rem] font-medium text-wolf tabular-nums">{pct}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Round glass back button. */
export function BackButton({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="glass press grid h-10 w-10 place-items-center rounded-full text-eel">
      <Icon name="chevronLeft" className="h-5 w-5" strokeWidth={2.6} />
    </button>
  );
}
