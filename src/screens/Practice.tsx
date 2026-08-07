import { COURSES, findSkill } from '../lib/courses';
import { startedSkillIds, useStore } from '../lib/store';
import { darken } from '../lib/ui';
import { StreakPill } from '../components/StreakPill';
import { Mascot } from '../components/Mascot';
import { Icon } from '../components/Icon';

export type PracticeStart = { title: string; gens: string[]; color: string };

/** Mixed review over everything the student has already started. */
export function Practice({ onStart }: { onStart: (p: PracticeStart) => void }) {
  // Select the whole state (a stable reference) and derive during render — a
  // selector that builds a new array would loop useSyncExternalStore forever.
  const state = useStore((s) => s);
  const skills = startedSkillIds(state)
    .map(findSkill)
    .filter((x): x is NonNullable<typeof x> => !!x);

  // Group the started skills by course so you can drill one subject at a time.
  const byCourse = new Map<string, typeof skills>();
  for (const s of skills) {
    const list = byCourse.get(s.course.id) ?? [];
    list.push(s);
    byCourse.set(s.course.id, list);
  }

  return (
    <div className="flex h-full flex-col">
      <header className="pt-safe flex items-center justify-between px-5 pb-2">
        <h1 className="text-2xl font-extrabold">Practice</h1>
        <StreakPill />
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {skills.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <Mascot size={110} color="#1cb0f6" />
            <h2 className="mt-5 text-xl font-extrabold">Nothing to review yet</h2>
            <p className="mt-2 max-w-xs font-bold text-wolf">
              Finish a lesson on the Learn tab and it will show up here for mixed practice.
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={() =>
                onStart({
                  title: 'Mixed review',
                  gens: skills.flatMap((s) => s.skill.gens),
                  color: '#1cb0f6',
                })
              }
              className="mt-4 w-full rounded-2xl p-5 text-left text-white transition-transform active:translate-y-[3px]"
              style={{ background: '#1cb0f6', boxShadow: '0 5px 0 #1899d6' }}
            >
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20">
                  <Icon name="target" className="h-8 w-8" strokeWidth={2.2} />
                </span>
                <div>
                  <p className="text-lg font-extrabold">Mixed review</p>
                  <p className="text-sm font-bold opacity-90">
                    Questions from all {skills.length} skills you've started
                  </p>
                </div>
              </div>
            </button>

            <p className="mt-7 mb-3 text-sm font-extrabold tracking-wide text-wolf uppercase">By course</p>

            <div className="flex flex-col gap-3">
              {[...byCourse].map(([courseId, list]) => {
                const course = COURSES[courseId];
                return (
                  <button
                    key={courseId}
                    onClick={() =>
                      onStart({
                        title: `${course.title} review`,
                        gens: list.flatMap((s) => s.skill.gens),
                        color: course.color,
                      })
                    }
                    className="flex items-center gap-4 rounded-2xl border-2 border-swan bg-white p-4 text-left transition-transform active:translate-y-[2px]"
                    style={{ boxShadow: '0 4px 0 var(--color-swan)' }}
                  >
                    <div
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl"
                      style={{ background: course.color, boxShadow: `0 3px 0 ${darken(course.color)}` }}
                    >
                      <Icon name={course.icon} className="h-6 w-6 text-white" strokeWidth={2.3} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-extrabold text-eel">{course.title}</p>
                      <p className="truncate text-sm font-bold text-wolf">
                        {list.length} skill{list.length === 1 ? '' : 's'} started
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
