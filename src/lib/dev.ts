/**
 * Dev-only cheat console. Imported by main.tsx behind import.meta.env.DEV, so
 * it is tree-shaken out of production builds.
 *
 * Open the browser console and type `qx.help()`.
 */

import { COURSES, LEVELS, LESSONS_PER_SKILL, courseSkills } from './courses.ts';
import { dayKey, getState, resetAll, set } from './store.ts';

/** Every skill id under a course id, a level id, or "*" for the whole app. */
function skillsOf(id: string): string[] {
  if (id === '*') return Object.keys(COURSES).flatMap(skillsOf);
  const level = LEVELS.find((l) => l.id === id);
  if (level) return level.courses.flatMap(skillsOf);
  const course = COURSES[id];
  if (course) return courseSkills(course).map((s) => s.id);
  return COURSES[id.split('.')[0]] ? [id] : [];
}

/** Set progress on whatever `id` names. n omitted = finish it. */
function grant(id: string, n = LESSONS_PER_SKILL) {
  const ids = skillsOf(id);
  if (!ids.length) return `no course/level/skill "${id}" — try qx.list()`;
  const progress = { ...getState().progress };
  for (const s of ids) progress[s] = Math.max(0, Math.min(n, LESSONS_PER_SKILL));
  set({ progress });
  return `${ids.length} skill(s) set to ${progress[ids[0]]}/${LESSONS_PER_SKILL}`;
}

const qx = {
  /** Finish everything up to (not including) a skill, so it is unlocked next. */
  unlock(skillId: string) {
    const course = COURSES[skillId.split('.')[0]];
    if (!course) return `unknown skill "${skillId}" — try qx.list()`;
    const ids = courseSkills(course).map((s) => s.id);
    const i = ids.indexOf(skillId);
    if (i < 0) return `unknown skill "${skillId}" — try qx.list('${course.id}')`;
    const progress = { ...getState().progress };
    for (const s of ids.slice(0, i)) progress[s] = LESSONS_PER_SKILL;
    set({ progress });
    return `unlocked ${skillId} (${i} skill(s) filled in)`;
  },

  /** qx.pass('alg1') | qx.pass('high') | qx.pass('*') | qx.pass('alg1.linear') */
  pass: grant,

  /** Same target syntax, but clears progress instead. */
  clear: (id: string) => grant(id, 0),

  /** Fake a streak of n days ending today. */
  streak(n: number) {
    const days = Array.from({ length: n }, (_, i) =>
      dayKey(new Date(Date.now() - (n - 1 - i) * 86_400_000)),
    );
    set({ streak: n, lastDay: days[days.length - 1] ?? null, days });
    return `streak = ${n}`;
  },

  /** Ids you can pass to the other commands. qx.list('alg1') for its skills. */
  list(courseId?: string) {
    if (courseId) {
      const course = COURSES[courseId];
      if (!course) return `unknown course "${courseId}"`;
      return courseSkills(course).map((s) => `${s.id}  ${s.title}`);
    }
    return {
      levels: LEVELS.map((l) => `${l.id} -> ${l.courses.join(', ')}`),
      courses: Object.keys(COURSES),
    };
  },

  state: getState,
  reset: resetAll,

  help() {
    return [
      "qx.pass('high')        finish a level, course, or single skill ('*' = all)",
      "qx.clear('alg1')       same targets, wipes them back to 0",
      "qx.unlock('alg1.quad') finish everything before a skill so it opens next",
      'qx.streak(30)          fake a 30-day streak',
      "qx.list() / qx.list('alg1')   valid ids",
      'qx.state() / qx.reset()',
    ].join('\n');
  },
};

(window as unknown as { qx: typeof qx }).qx = qx;
console.log('%cqx dev tools loaded — qx.help()', 'color:#58CC02;font-weight:bold');
