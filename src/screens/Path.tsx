import { useEffect, useRef, useState } from 'react';
import { COURSES, LESSON_XP, LESSONS_PER_SKILL, type Skill, type Unit } from '../lib/courses';
import { activeSkillId, isSkillComplete, isSkillUnlocked, skillProgress, useStore, type State } from '../lib/store';
import { cx, tilt } from '../lib/ui';
import { StatsBar } from '../components/StreakPill';
import { Icon } from '../components/Icon';
import { BackButton } from './Home';

/** Horizontal offsets that make the path snake down the screen. */
const SNAKE = [0, 44, 70, 44, 0, -44, -70, -44];

export function Path({
  courseId,
  onStart,
  onBack,
}: {
  courseId: string;
  onStart: (skill: Skill, unit: Unit, from?: Element | null) => void;
  onBack: () => void;
}) {
  const state = useStore((s) => s);
  const course = COURSES[courseId];
  const active = activeSkillId(courseId, state);
  const scroller = useRef<HTMLDivElement>(null);
  const [headerUnit, setHeaderUnit] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  // The unit card follows whichever unit you are scrolled into.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      // A unit is "current" once its divider passes the middle of the screen.
      const mid = el.getBoundingClientRect().top + el.clientHeight / 2;
      let current = 0;
      el.querySelectorAll<HTMLElement>('[data-unit]').forEach((m) => {
        if (m.getBoundingClientRect().top <= mid) current = Number(m.dataset.unit);
      });
      setHeaderUnit(current);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [courseId]);

  // Land on the active node rather than the top of a long course.
  useEffect(() => {
    const el = scroller.current;
    el?.querySelector('[data-active]')?.scrollIntoView({ block: 'center' });
    el?.dispatchEvent(new Event('scroll'));
  }, [courseId]);

  const unit = course.units[headerUnit];
  const unitDone = (u: Unit) => u.skills.filter((s) => isSkillComplete(s.id, state)).length;
  const frac = unitDone(unit) / unit.skills.length;
  let nodeIndex = 0;

  return (
    <div className="accent relative isolate flex h-full flex-col" style={{ '--accent': unit.color } as React.CSSProperties}>
      {/* the screen takes on the colour of the unit you are scrolled into */}
      <div className="wash" />
      <StatsBar
        left={
          <div className="flex items-center gap-2.5">
            <BackButton onClick={onBack} label="Back to courses" />
            <span className="truncate font-semibold">{course.title}</span>
          </div>
        }
      />

      {/* ---- unit card, floats over the path */}
      <div className="absolute inset-x-0 top-[3.9rem] z-10 px-4">
        <div
          className="glass glass-strong flex items-center gap-3 rounded-[24px] py-3 pr-3 pl-4"
          style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 16%, var(--glass-strong))' }}
        >
          <span className="h-9 w-1.5 shrink-0 rounded-full bg-(--accent) shadow-[0_0_10px_var(--accent)]" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.75rem] font-semibold tracking-wide text-(--accent) uppercase">
              {unit.title}
            </p>
            <p className="truncate text-[1.1rem] leading-tight font-bold">{unit.subtitle}</p>
          </div>
          <div className="relative grid h-11 w-11 shrink-0 place-items-center" aria-label={`${unitDone(unit)} of ${unit.skills.length} skills complete`}>
            <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden="true">
              <circle cx="22" cy="22" r="19" fill="none" stroke="var(--color-swan)" strokeWidth="4" />
              <circle
                cx="22" cy="22" r="19" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round"
                pathLength={1} strokeDasharray={`${frac} 1`} opacity={frac ? 1 : 0}
                className="transition-[stroke-dasharray] duration-700"
              />
            </svg>
            <span className="text-[0.72rem] font-semibold tabular-nums">
              {unitDone(unit)}/{unit.skills.length}
            </span>
          </div>
        </div>
      </div>

      {/* ---- the path */}
      <div ref={scroller} onClick={() => setOpenId(null)} className="no-scrollbar flex-1 overflow-y-auto pt-24 pb-36">
        {course.units.map((u, ui) => {
          const offsets = u.skills.map(() => SNAKE[nodeIndex++ % SNAKE.length]);
          const trophyOffset = SNAKE[nodeIndex++ % SNAKE.length];
          const done = unitDone(u) === u.skills.length;
          return (
            <section key={u.title} data-unit={ui} className="relative pt-10">
              {ui > 0 && (
                <div className="divider mx-6 mb-16">
                  <span className="max-w-[70%] truncate">
                    {u.title} · {u.subtitle}
                  </span>
                </div>
              )}

              <div className="flex flex-col items-center gap-6 px-4">
                {u.skills.map((skill, si) => (
                  <Node
                    key={skill.id}
                    skill={skill}
                    color={u.color}
                    offset={offsets[si]}
                    state={state}
                    isActive={skill.id === active}
                    open={openId === skill.id}
                    onToggle={() => setOpenId(openId === skill.id ? null : skill.id)}
                    delay={Math.min(si, 5) * 60}
                    onStart={(from) => {
                      setOpenId(null);
                      onStart(skill, u, from);
                    }}
                  />
                ))}
                <div style={{ transform: `translateX(${trophyOffset}px)` }} className="mt-2">
                  <div
                    className="orb pointer-events-none"
                    data-locked={done ? undefined : ''}
                    title={done ? 'Unit complete!' : 'Finish every skill to earn this trophy'}
                    style={{ '--tint': '#ffb800' } as React.CSSProperties}
                  >
                    <Icon name="trophy" className="relative h-8 w-8" strokeWidth={2.2} />
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Node({
  skill,
  color,
  offset,
  state,
  isActive,
  open,
  onToggle,
  delay,
  onStart,
}: {
  skill: Skill;
  color: string;
  offset: number;
  state: State;
  isActive: boolean;
  open: boolean;
  onToggle: () => void;
  delay: number;
  onStart: (from: Element | null) => void;
}) {
  const orb = useRef<HTMLButtonElement>(null);
  const done = skillProgress(skill.id, state);
  const unlocked = isSkillUnlocked(skill.id, state);
  const complete = isSkillComplete(skill.id, state);
  const live = isActive && unlocked && !complete;
  const pct = done / LESSONS_PER_SKILL;

  return (
    // Outer element owns the snake offset; inner one owns the entrance animation,
    // so the keyframes can't overwrite the horizontal position.
    <div className={cx('relative', open && 'z-20')} style={{ transform: `translateX(${offset}px)` }} data-active={live || undefined}>
      <div className="animate-rise relative flex flex-col items-center" style={{ animationDelay: `${delay}ms` }}>
        {live && !open && (
          <div className="animate-bob absolute -top-11 z-10">
            <div className="glass glass-strong rounded-full px-4 py-1.5 text-[0.9rem] font-semibold whitespace-nowrap" style={{ color }}>
              {done ? 'Continue' : 'Start'}
            </div>
          </div>
        )}

        <div className="relative grid h-[100px] w-[100px] place-items-center">
          {/* progress ring around the current node */}
          {live && (
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
              <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-swan)" strokeWidth="5" />
              <circle
                cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
                pathLength={1} strokeDasharray={`${pct} 1`} className="transition-[stroke-dasharray] duration-700"
                opacity={pct ? 1 : 0}
              />
            </svg>
          )}

          <button
            ref={orb}
            {...tilt}
            className="orb"
            data-locked={unlocked ? undefined : ''}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-expanded={open}
            aria-label={complete ? `${skill.title}, complete` : unlocked ? skill.title : `${skill.title}, locked`}
            style={{ '--tint': color } as React.CSSProperties}
          >
            <Icon
              name={complete ? 'check' : unlocked ? skill.icon : 'lock'}
              className="relative h-8 w-8 drop-shadow-[0_1px_1px_rgb(0_0_0/0.15)]"
              strokeWidth={complete ? 3 : 2.3}
            />
          </button>
        </div>

        {open && <Popover skill={skill} color={color} offset={offset} unlocked={unlocked} complete={complete} done={done} onStart={() => onStart(orb.current)} />}
      </div>
    </div>
  );
}

function Popover({
  skill, color, offset, unlocked, complete, done, onStart,
}: {
  skill: Skill; color: string; offset: number; unlocked: boolean; complete: boolean; done: number; onStart: () => void;
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="animate-pop glass glass-strong absolute top-full mt-3 w-[min(320px,calc(100vw-40px))] origin-top rounded-[26px] p-4"
      // Centre in the column, not under the snaked node.
      style={{ left: `calc(50% - ${offset}px)`, translate: '-50% 0' }}
      role="dialog"
      aria-label={skill.title}
    >
      <p className="text-[1.15rem] font-bold">{skill.title}</p>
      <p className="mt-0.5 mb-4 text-[0.95rem] text-wolf">
        {!unlocked
          ? 'Finish the skills above to unlock this one.'
          : complete
            ? 'Mastered. Review to keep it sharp.'
            : `Lesson ${done + 1} of ${LESSONS_PER_SKILL}`}
      </p>
      {unlocked ? (
        <button autoFocus className="btn btn-tint" style={{ '--tint': color } as React.CSSProperties} onClick={onStart}>
          {complete ? 'Review' : 'Start'}
          <span className="rounded-full bg-white/25 px-2 py-0.5 text-[0.8rem]">+{LESSON_XP} XP</span>
        </button>
      ) : (
        <button className="btn" disabled>
          <Icon name="lock" className="h-4 w-4" strokeWidth={2.4} /> Locked
        </button>
      )}
    </div>
  );
}
