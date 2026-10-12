import { COURSES, findSkill } from '../lib/courses';
import { startedSkillIds, useStore } from '../lib/store';
import { StatsBar } from '../components/StreakPill';
import { Icon, IconTile } from '../components/Icon';

export type PracticeStart = { title: string; gens: string[]; color: string };

const BLUE = '#007aff';

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
      <StatsBar />
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-32">
        <h1 className="mt-1 mb-6 text-[2.125rem] leading-tight font-bold">Practice</h1>

        {skills.length === 0 ? (
          <div className="glass mt-6 flex flex-col items-center rounded-[28px] px-6 py-10 text-center">
            <div className="animate-float">
              <IconTile name="target" color={BLUE} size={72} />
            </div>
            <h2 className="mt-5 text-[1.25rem] font-bold">Nothing to review yet</h2>
            <p className="mt-1.5 max-w-xs text-wolf">Finish a lesson on the Learn tab and it will show up here for mixed practice.</p>
          </div>
        ) : (
          <>
            <button
              onClick={() => onStart({ title: 'Mixed review', gens: skills.flatMap((s) => s.skill.gens), color: BLUE })}
              className="btn-tint press relative w-full overflow-hidden rounded-[28px] p-5 text-left"
              style={{ '--tint': BLUE } as React.CSSProperties}
            >
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-white/20">
                  <Icon name="target" className="h-8 w-8" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[1.15rem] font-bold">Mixed review</p>
                  <p className="text-[0.9rem] opacity-85">
                    Questions from all {skills.length} skill{skills.length === 1 ? '' : 's'} you've started
                  </p>
                </div>
                <Icon name="chevronRight" className="h-5 w-5 shrink-0 opacity-70" strokeWidth={2.6} />
              </div>
            </button>

            <p className="section-label mt-8">By course</p>
            <div className="glass overflow-hidden rounded-[26px]">
              {[...byCourse].map(([courseId, list], i) => {
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
                    className="flex w-full items-center gap-3.5 pl-4 text-left transition-colors active:bg-swan"
                  >
                    <IconTile name={course.icon} color={course.color} />
                    <div className={`flex min-w-0 flex-1 items-center gap-2 py-3.5 pr-4 ${i ? 'border-t border-swan' : ''}`}>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{course.title}</p>
                        <p className="truncate text-[0.9rem] text-wolf">
                          {list.length} skill{list.length === 1 ? '' : 's'} started
                        </p>
                      </div>
                      <Icon name="chevronRight" className="h-4 w-4 shrink-0 text-hare" strokeWidth={2.6} />
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
