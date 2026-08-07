import { useEffect, useRef, useState } from 'react';
import { COURSES, LESSONS_PER_SKILL, type Skill, type Unit } from '../lib/courses';
import { activeSkillId, isSkillComplete, isSkillUnlocked, skillProgress, useStore } from '../lib/store';
import { cx, darken } from '../lib/ui';
import { StreakPill } from '../components/StreakPill';
import { Icon } from '../components/Icon';

/** Horizontal offsets that make the path snake down the screen. */
const SNAKE = [0, 46, 72, 46, 0, -46, -72, -46];

export function Path({
  courseId,
  onStart,
  onBack,
}: {
  courseId: string;
  onStart: (skill: Skill, unit: Unit) => void;
  onBack: () => void;
}) {
  const state = useStore((s) => s);
  const course = COURSES[courseId];
  const active = activeSkillId(courseId, state);
  const scroller = useRef<HTMLDivElement>(null);
  const [headerUnit, setHeaderUnit] = useState(0);

  // The sticky header takes on the colour of whichever unit you are scrolled into.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const marks = el.querySelectorAll<HTMLElement>('[data-unit]');
      let current = 0;
      marks.forEach((m) => {
        if (m.getBoundingClientRect().top <= 120) current = Number(m.dataset.unit);
      });
      setHeaderUnit(current);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [courseId]);

  const unit = course.units[headerUnit];
  let nodeIndex = 0;

  return (
    <div className="flex h-full flex-col">
      {/* ---- sticky unit header */}
      <header
        className="pt-safe z-10 shrink-0 px-4 pb-3 text-white transition-colors duration-300"
        style={{ background: unit.color }}
      >
        <div className="flex items-center gap-2">
          <button onClick={onBack} aria-label="Back to courses" className="-ml-1 p-1 active:scale-90">
            <Icon name="chevronLeft" className="h-6 w-6" strokeWidth={3} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold opacity-90">{course.title}</p>
            <p className="truncate text-lg font-extrabold">
              {unit.title} · {unit.subtitle}
            </p>
          </div>
          <StreakPill onDark />
        </div>
      </header>

      {/* ---- the path */}
      <div ref={scroller} className="flex-1 overflow-y-auto pb-10">
        {course.units.map((u, ui) => (
          <section key={u.title}>
            <div data-unit={ui} className="px-4 pt-6 pb-2">
              <div className="divider">
                <span className="whitespace-nowrap">
                  {u.title} · {u.subtitle}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 px-4 pt-2">
              {u.skills.map((skill, si) => {
                const offset = SNAKE[nodeIndex++ % SNAKE.length];
                const done = skillProgress(skill.id, state);
                const unlocked = isSkillUnlocked(skill.id, state);
                const complete = isSkillComplete(skill.id, state);
                return (
                  <Node
                    key={skill.id}
                    skill={skill}
                    color={u.color}
                    offset={offset}
                    done={done}
                    unlocked={unlocked}
                    complete={complete}
                    isActive={skill.id === active}
                    delay={Math.min(si, 5) * 55}
                    onStart={() => onStart(skill, u)}
                  />
                );
              })}
            </div>
          </section>
        ))}

        <p className="mt-10 px-8 text-center text-sm font-bold text-hare">
          {course.units.length} units · finish a skill to unlock the next
        </p>
      </div>
    </div>
  );
}

function Node({
  skill,
  color,
  offset,
  done,
  unlocked,
  complete,
  isActive,
  delay,
  onStart,
}: {
  skill: Skill;
  color: string;
  offset: number;
  done: number;
  unlocked: boolean;
  complete: boolean;
  isActive: boolean;
  delay: number;
  onStart: () => void;
}) {
  const [nudge, setNudge] = useState(false);
  const face = complete ? '#ffc800' : unlocked ? color : '#e5e5e5';
  const pct = (done / LESSONS_PER_SKILL) * 100;
  const live = isActive && unlocked && !complete;

  return (
    // Outer element owns the snake offset; inner one owns the entrance animation,
    // so the keyframes can't overwrite the horizontal position.
    <div style={{ transform: `translateX(${offset}px)` }}>
      <div className="animate-rise flex flex-col items-center" style={{ animationDelay: `${delay}ms` }}>
      {live && (
        <div className="animate-drop-in relative mb-1.5 rounded-xl border-2 border-swan bg-white px-3 py-1 text-xs font-extrabold tracking-wide uppercase" style={{ color }}>
          Start
          <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-swan bg-white" />
        </div>
      )}

      <div className={cx('relative grid h-[88px] w-[88px] place-items-center', live && 'animate-breathe')}>
        {/* progress ring */}
        {done > 0 && !complete && (
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: `conic-gradient(#ffc800 ${pct}%, #e5e5e5 0)` }}
          />
        )}
        {done > 0 && !complete && <div className="absolute inset-[6px] rounded-full bg-white" />}

        <button
          className={cx('node relative', nudge && 'animate-shake')}
          disabled={!unlocked}
          onClick={() => {
            if (!unlocked) {
              setNudge(true);
              setTimeout(() => setNudge(false), 400);
              return;
            }
            onStart();
          }}
          aria-label={
            complete ? `${skill.title}, complete` : unlocked ? `Start ${skill.title}` : `${skill.title}, locked`
          }
          style={{
            background: face,
            boxShadow: `0 5px 0 ${darken(face, unlocked ? 0.8 : 0.88)}`,
            color: unlocked ? '#fff' : '#b4b4b4',
          }}
        >
          <Icon
            name={complete ? 'crown' : unlocked ? skill.icon : 'lock'}
            className="h-8 w-8"
            strokeWidth={2.3}
          />
        </button>
      </div>

      <p
        className={cx(
          'mt-1.5 max-w-[130px] text-center text-[0.78rem] leading-tight font-extrabold',
          unlocked ? 'text-eel' : 'text-hare',
        )}
      >
        {skill.title}
      </p>
      {unlocked && !complete && (
        <p className="text-[0.68rem] font-bold text-hare tabular-nums">
          {done}/{LESSONS_PER_SKILL}
        </p>
      )}
      </div>
    </div>
  );
}
