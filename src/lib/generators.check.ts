/**
 * Self-check for the question bank. Run with: npm run check
 *
 * Catches the failure modes that actually bite: a generator whose answer isn't
 * among its own choices, duplicate/blank choices, an answer that fails its own
 * equality check, and skills in courses.ts pointing at generators that don't exist.
 */

import { GENERATORS, isCorrect } from './generators.ts';
import { COURSES, courseSkills } from './courses.ts';
import { SAT_BANK } from './satBank.ts';

const RUNS = 200;
/** Questions whose full option set is only three wide. */
const THREE_OPTION = new Set(['compare', 'fracCompare', 'discriminant']);
const failures: string[] = [];
const fail = (where: string, why: string) => failures.push(`${where}: ${why}`);

/**
 * Numeric value of an answer string, or null if it isn't a plain quantity.
 * Handles "12", "-3.5", "1/2", "5√2", "√3/2", "10π", "4/3π", "95%", "$18.66".
 * Used to catch distractors that are a different spelling of the right answer
 * ("5/10" offered as a wrong option when the answer is "1/2").
 */
function value(raw: string): number | null {
  let s = raw.trim().replace(/[−–—]/g, '-').replace(/\$/g, '').replace(/,/g, '');
  let mult = 1;
  if (s.endsWith('%')) {
    s = s.slice(0, -1);
    mult = 0.01;
  }
  if (s.includes('π')) {
    mult *= Math.PI;
    s = s.replace('π', '');
  }
  if (s === '') return mult;

  const root = s.match(/^(-?\d*\.?\d*)√(\d+)(?:\/(\d+))?$/);
  if (root) {
    const co = root[1] === '' ? 1 : root[1] === '-' ? -1 : Number(root[1]);
    return (mult * co * Math.sqrt(Number(root[2]))) / (root[3] ? Number(root[3]) : 1);
  }

  const frac = s.match(/^(-?\d+\.?\d*)\/(-?\d+\.?\d*)$/);
  if (frac) return (mult * Number(frac[1])) / Number(frac[2]);

  const n = Number(s);
  return s !== '' && Number.isFinite(n) ? mult * n : null;
}

for (const [id, gen] of Object.entries(GENERATORS)) {
  for (let i = 0; i < RUNS; i++) {
    let q;
    try {
      q = gen();
    } catch (e) {
      fail(id, `threw ${(e as Error).message}`);
      break;
    }

    if (!q.instruction.trim()) fail(id, 'empty instruction');
    if (!q.prompt.trim()) fail(id, 'empty prompt');
    if (!q.answer.trim()) fail(id, 'empty answer');
    if (q.answer.includes('undefined') || q.prompt.includes('undefined')) fail(id, `"undefined" leaked: ${q.prompt} => ${q.answer}`);
    if (q.answer === 'NaN' || q.prompt.includes('NaN')) fail(id, `NaN leaked: ${q.prompt} => ${q.answer}`);
    if (!isCorrect(q.answer, q.answer)) fail(id, `answer fails its own check: "${q.answer}"`);

    if (q.choices) {
      // Everything offers 4 options except the handful of questions whose whole
      // option set is naturally smaller (>, <, = and the like).
      const want = THREE_OPTION.has(id) ? 3 : 4;
      if (q.choices.length !== want)
        fail(id, `${q.choices.length} choices, want ${want}: ${q.choices.join(' | ')}`);
      if (new Set(q.choices).size !== q.choices.length) fail(id, `duplicate choices: ${q.choices.join(' | ')}`);
      if (!q.choices.includes(q.answer)) fail(id, `answer "${q.answer}" not in choices ${q.choices.join(' | ')}`);
      // A wrong choice that also passes the checker would mark a right answer wrong.
      const alsoCorrect = q.choices.filter((c) => c !== q.answer && isCorrect(c, q.answer));
      if (alsoCorrect.length) fail(id, `distractor equals answer: ${alsoCorrect.join(' | ')} vs ${q.answer}`);

      // Same, but by value rather than by text — "5/10" is not the string "1/2",
      // yet a student picking it would be right.
      const ans = value(q.answer);
      if (ans !== null) {
        const sameValue = q.choices.filter((c) => {
          if (c === q.answer) return false;
          const v = value(c);
          return v !== null && Math.abs(v - ans) < 1e-9;
        });
        if (sameValue.length) fail(id, `distractor has the answer's value: ${sameValue.join(' | ')} = ${q.answer}`);
      }
    }

    if (failures.length > 40) break;
  }
}

// Bank: a repeated prompt would trip drawQuestions' duplicate filter for nothing.
let bankSize = 0;
for (const [key, { items }] of Object.entries(SAT_BANK)) {
  bankSize += items.length;
  if (new Set(items.map((i) => i[0])).size !== items.length) fail(`bank.${key}`, 'duplicate prompt');
  for (const it of items) if (it.length !== 5) fail(`bank.${key}`, `${it.length - 2} distractors, want 3: ${it[0]}`);
}

// Curriculum wiring
const seen = new Set<string>();
for (const course of Object.values(COURSES)) {
  for (const skill of courseSkills(course)) {
    if (seen.has(skill.id)) fail(skill.id, 'duplicate skill id');
    seen.add(skill.id);
    for (const g of skill.gens) {
      if (!GENERATORS[g]) fail(skill.id, `unknown generator "${g}"`);
    }
  }
}

const genCount = Object.keys(GENERATORS).length;
const skillCount = seen.size;

if (failures.length) {
  console.error(`FAIL — ${failures.length} problem(s):\n` + failures.map((f) => '  • ' + f).join('\n'));
  process.exit(1);
}
console.log(`OK — ${genCount} generators × ${RUNS} runs, ${bankSize} bank items, ${skillCount} skills across ${Object.keys(COURSES).length} courses.`);
