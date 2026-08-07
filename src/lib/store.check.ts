/**
 * Self-check for streak and unlock logic. Run with: npm run check
 *
 * The date maths is the easiest thing in this app to get quietly wrong, so it
 * gets a real test: continuing, breaking and same-day-repeat streaks.
 */

// store.ts reads localStorage as it loads, so stub it before importing.
const mem = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
};

const {
  completeLesson,
  currentStreak,
  dayKey,
  getState,
  isSkillUnlocked,
  nextStreak,
  resetAll,
  activeSkillId,
} = await import('./store.ts');

const failures: string[] = [];
const eq = (label: string, got: unknown, want: unknown) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) failures.push(`${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
};

const shift = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dayKey(d);
};

const TODAY = dayKey();

/* ---- pure streak maths */
eq('first ever lesson', nextStreak(null, 0, TODAY), 1);
eq('second lesson same day', nextStreak(TODAY, 4, TODAY), 4);
eq('practised yesterday', nextStreak(shift(-1), 4, TODAY), 5);
eq('missed a day', nextStreak(shift(-2), 9, TODAY), 1);
eq('missed a month', nextStreak(shift(-40), 30, TODAY), 1);

// Month and year boundaries must not break the "yesterday" calculation.
eq('across a month boundary', nextStreak('2026-02-28', 3, '2026-03-01'), 4);
eq('across a leap day', nextStreak('2024-02-29', 3, '2024-03-01'), 4);
eq('across a new year', nextStreak('2025-12-31', 7, '2026-01-01'), 8);

/* ---- displayed streak decays when you stop */
eq('shown streak, practised today', currentStreak({ ...getState(), lastDay: TODAY, streak: 6 }), 6);
eq('shown streak, practised yesterday', currentStreak({ ...getState(), lastDay: shift(-1), streak: 6 }), 6);
eq('shown streak, missed a day', currentStreak({ ...getState(), lastDay: shift(-2), streak: 6 }), 0);
eq('shown streak, never practised', currentStreak({ ...getState(), lastDay: null, streak: 0 }), 0);

/* ---- lessons advance skills and cap at mastery */
resetAll();
completeLesson('elem.count');
eq('one lesson done', getState().progress['elem.count'], 1);
eq('streak starts at 1', getState().streak, 1);
eq('lesson counted', getState().totalLessons, 1);
eq('day recorded once', getState().days, [TODAY]);

completeLesson('elem.count');
eq('same day keeps streak', getState().streak, 1);
eq('no duplicate day', getState().days, [TODAY]);

for (let i = 0; i < 5; i++) completeLesson('elem.count');
eq('progress caps at mastery', getState().progress['elem.count'], 4);

/* ---- unlocking follows the path order */
eq('first skill always open', isSkillUnlocked('elem.count'), true);
eq('next skill open after mastery', isSkillUnlocked('elem.seqNext'), true);
eq('later skill still locked', isSkillUnlocked('elem.compare'), false);
eq('active skill is the first unfinished', activeSkillId('elem'), 'elem.seqNext');

resetAll();
eq('reset clears progress', getState().progress, {});
eq('reset clears streak', getState().streak, 0);
eq('locked again after reset', isSkillUnlocked('elem.seqNext'), false);

if (failures.length) {
  console.error(`FAIL — ${failures.length} problem(s):\n` + failures.map((f) => '  • ' + f).join('\n'));
  process.exit(1);
}
console.log('OK — streak, progress and unlock logic.');
