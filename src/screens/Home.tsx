import { COURSES, DAILY_GOAL, LESSONS_PER_SKILL, LEVELS, SAT_LEVEL, findSkill, type Level, type Skill, type Unit } from '../lib/courses';
import {
  activeSkillId,
  courseCompletion,
  currentStreak,
  dayKey,
  practicedToday,
  skillProgress,
  useStore,
  xpToday,
} from '../lib/store';
import { tilt } from '../lib/ui';
import { Bolt, Flame, StatsBar } from '../components/StreakPill';
import { Icon, IconTile } from '../components/Icon';
import { Ring } from '../components/Ring';

const percentOf = (level: Level, state: Parameters<typeof courseCompletion>[1]) => {
  const totals = level.courses.map((id) => courseCompletion(id, state));
  const done = totals.reduce((s, t) => s + t.done, 0);
  const total = totals.reduce((s, t) => s + t.total, 0);
  return total ? Math.round((done / total) * 100) : 0;
};

/** Today dashboard + level picker — the app's front door. */
export function Home({
  onPick,
  onOpenCourse,
  onStart,
}: {
  onPick: (level: Level) => void;
  onOpenCourse: (courseId: string) => void;
  onStart: (skill: Skill, unit: Unit, from?: Element | null) => void;
}) {
  const state = useStore((s) => s);
  const last = state.lastCourse && COURSES[state.lastCourse] ? COURSES[state.lastCourse] : null;
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="accent relative isolate flex h-full flex-col" style={{ '--accent': last?.color ?? '#007aff' } as React.CSSProperties}>
      <div className="wash" />
      <StatsBar />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-32">
        <p className="mt-1 text-[0.8rem] font-semibold tracking-wide text-wolf uppercase">{date}</p>
        <h1 className="mb-5 text-[2.125rem] leading-tight font-bold">Today</h1>

        {last ? (
          <ContinueCard courseId={last.id} onOpen={() => onOpenCourse(last.id)} onStart={onStart} />
        ) : (
          <div className="glass animate-rise flex items-center gap-4 rounded-[28px] p-5">
            <div className="animate-float">
              <IconTile name="star" color="#007aff" size={56} />
            </div>
            <div>
              <p className="text-[1.15rem] font-bold">Welcome to Quantix</p>
              <p className="text-[0.92rem] text-wolf">Pick a level below to start your first lesson.</p>
            </div>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <GoalCard />
          <WeekCard />
        </div>

        <p className="section-label mt-8">Levels</p>
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

/** Big tinted hero: jump straight back into the next lesson. */
function ContinueCard({
  courseId,
  onOpen,
  onStart,
}: {
  courseId: string;
  onOpen: () => void;
  onStart: (skill: Skill, unit: Unit, from?: Element | null) => void;
}) {
  const state = useStore((s) => s);
  const course = COURSES[courseId];
  const found = findSkill(activeSkillId(courseId, state) ?? '');
  const { done, total } = courseCompletion(courseId, state);
  if (!found) return null;
  const { skill, unit } = found;
  const started = skillProgress(skill.id, state);
  const lesson = Math.min(started + 1, LESSONS_PER_SKILL);

  return (
    <div
      {...tilt}
      className="tilt animate-rise relative overflow-hidden rounded-[30px] p-5 text-white"
      style={{
        background: `radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, ${unit.color} 55%, white), transparent 60%), linear-gradient(150deg, ${unit.color}, color-mix(in srgb, ${unit.color} 70%, black))`,
        boxShadow: `0 20px 40px -18px ${unit.color}, inset 0 1px 0 rgb(255 255 255 / 0.4)`,
      }}
    >
      {/* oversized glyph for depth */}
      <Icon name={skill.icon} className="absolute -right-6 -bottom-8 h-44 w-44 opacity-15" strokeWidth={1.6} />
      <div className="relative flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.78rem] font-semibold tracking-wide uppercase opacity-80">
            {course.title} · {unit.title}
          </p>
          <p className="mt-1 text-[1.6rem] leading-tight font-bold">{skill.title}</p>
          <p className="mt-0.5 text-[0.92rem] opacity-85">
            Lesson {lesson} of {LESSONS_PER_SKILL}
          </p>
        </div>
        <Ring value={done / total} color="#fff" size={58} stroke={7}>
          <span className="text-[0.75rem] font-bold tabular-nums">{Math.round((done / total) * 100)}%</span>
        </Ring>
      </div>
      <div className="relative mt-5 flex gap-2">
        <button
          onClick={(e) => onStart(skill, unit, e.currentTarget.closest('.tilt'))}
          className="btn h-11! flex-1 bg-white text-[1rem]! shadow-[0_6px_16px_-6px_rgb(0_0_0/0.3)]"
          style={{ color: unit.color }}
        >
          {started ? 'Continue' : 'Start'}
        </button>
        <button onClick={onOpen} className="btn h-11! w-auto! bg-white/20 px-5! text-[1rem]! text-white">
          Path
        </button>
      </div>
    </div>
  );
}

/** Daily XP goal, as an Activity ring. */
function GoalCard() {
  const today = useStore(xpToday);
  const met = today >= DAILY_GOAL;
  return (
    <div className="glass animate-rise flex flex-col items-center rounded-[26px] p-4 text-center" style={{ animationDelay: '60ms' }}>
      <Ring value={today / DAILY_GOAL} color="#ff9f0a" size={76} stroke={10}>
        {met ? <Icon name="check" className="h-7 w-7 text-fox" strokeWidth={3} /> : <Bolt className="h-7 w-7" />}
      </Ring>
      <p className="mt-2.5 text-[0.95rem] font-semibold">{met ? 'Goal met' : 'Daily goal'}</p>
      <p className="text-[0.82rem] text-wolf tabular-nums">
        {Math.min(today, DAILY_GOAL)} / {DAILY_GOAL} XP
      </p>
    </div>
  );
}

/** Streak count plus the last seven days. */
function WeekCard() {
  const streak = useStore(currentStreak);
  const lit = useStore(practicedToday);
  const daysList = useStore((s) => s.days);
  const days = new Set(daysList);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return { key: dayKey(d), label: d.toLocaleDateString(undefined, { weekday: 'narrow' }) };
  });
  return (
    <div className="glass animate-rise flex flex-col items-center rounded-[26px] p-4 text-center" style={{ animationDelay: '120ms' }}>
      <div className="relative grid h-[76px] place-items-center">
        {lit && <div className="absolute inset-2 rounded-full bg-fox opacity-35 blur-xl" />}
        <Flame className="animate-float relative h-14 w-14" lit={lit} />
      </div>
      <p className="mt-2.5 text-[0.95rem] font-semibold tabular-nums">
        {streak} day{streak === 1 ? '' : 's'}
      </p>
      <div className="mt-1 flex gap-1" aria-label="Last seven days">
        {week.map((d) => (
          <span key={d.key} title={d.key} className="flex flex-col items-center gap-0.5">
            <span className={`h-2 w-2 rounded-full ${days.has(d.key) ? 'bg-fox' : 'bg-swan'}`} />
            <span className="text-[0.6rem] text-hare">{d.label}</span>
          </span>
        ))}
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
    <div className="accent relative isolate flex h-full flex-col" style={{ '--accent': level.color } as React.CSSProperties}>
      <div className="wash" />
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
                {...tilt}
                className="glass press tilt animate-rise flex flex-col items-start gap-2 rounded-[26px] p-4 text-left"
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
