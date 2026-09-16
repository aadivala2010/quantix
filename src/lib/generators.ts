/**
 * Procedural question generators.
 * Every skill in the app points at one generator id here. A generator returns a
 * fresh question each call, so lessons never repeat and there is no content file
 * to hand-author. The one exception is satBank.ts: hand-written SAT-style
 * items, exposed here as `bank.<key>` generators that pick a random item.
 */

import { SAT_BANK } from './satBank.ts';

export type Question = {
  /** Small grey line above the question, e.g. "Solve for x". */
  instruction: string;
  /** The question itself. Rendered big. */
  prompt: string;
  answer: string;
  /** Present => multiple choice. Absent => typed input. */
  choices?: string[];
};

export type Gen = () => Question;

/* ---------------------------------------------------------------- helpers */

const R = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const P = <T>(a: readonly T[]): T => a[R(0, a.length - 1)];
const shuffle = <T>(a: T[]): T[] =>
  a
    .map((v) => [Math.random(), v] as [number, T])
    .sort((x, y) => x[0] - y[0])
    .map((v) => v[1]);
const gcd = (a: number, b: number): number => (b ? gcd(b, Math.abs(a % b)) : Math.abs(a));
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
  // Variable exponents. Without these, "5ˣ = 3125" renders as "5x = 3125",
  // which is a different (and wrong) question.
  x: 'ˣ', t: 'ᵗ', n: 'ⁿ',
};
const sup = (n: number | string) =>
  String(n)
    .split('')
    .map((c) => SUP[c] ?? c)
    .join('');

const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
};
/** Sequence indices: a₁₀, not a¹⁰ (which would mean a to the tenth). */
const sub = (n: number | string) =>
  String(n)
    .split('')
    .map((c) => SUB[c] ?? c)
    .join('');

/** Display a number with a real minus sign rather than a hyphen. */
const neg = (n: number) => String(n).replace('-', '−');

/** Raise a rendered expression to a power, hiding a pointless exponent of 1. */
const pow = (base: string, e: number) => (e === 1 ? base : `${base}${sup(e)}`);

/** "3x", "x", "−x" — a coefficient against a variable. */
const coef = (c: number, v: string) => (c === 1 ? v : c === -1 ? `−${v}` : `${neg(c)}${v}`);

/** "(x − 3)" / "x" when the shift is zero. Used by vertex and circle forms. */
const shifted = (v: number, letter = 'x') =>
  v === 0 ? letter : `(${letter} ${v > 0 ? '−' : '+'} ${Math.abs(v)})`;

/** a + bi, with signs and 1i handled properly. */
const complex = (re: number, im: number) => {
  if (im === 0) return neg(re);
  const mag = Math.abs(im) === 1 ? 'i' : `${Math.abs(im)}i`;
  if (re === 0) return im < 0 ? `−${mag}` : mag;
  return `${neg(re)} ${im < 0 ? '−' : '+'} ${mag}`;
};

/** Reduced fraction as a display string. */
const fr = (n: number, d: number) => {
  const g = gcd(n, d) || 1;
  let num = n / g;
  let den = d / g;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  return den === 1 ? `${num}` : `${num}/${den}`;
};

/** A single polynomial term: term(3, 2) => "3x²", term(1, 1) => "x". */
const term = (c: number, e: number) => {
  if (c === 0) return '0';
  if (e === 0) return neg(c);
  const cs = c === 1 ? '' : c === -1 ? '−' : neg(c);
  return e === 1 ? `${cs}x` : `${cs}x${sup(e)}`;
};

/** Signed term for building expressions: "3x² − 4x + 5". */
const signed = (c: number, e: number) => (c < 0 ? ` − ${term(-c, e)}` : ` + ${term(c, e)}`);

/** "ax + b", hiding zero/one coefficients so we never print "1x" or "0 + 3". */
const linear = (a: number, b: number) => {
  if (a === 0) return neg(b);
  return b === 0 ? term(a, 1) : `${term(a, 1)}${signed(b, 0)}`;
};

const quad = (a: number, b: number, c: number) =>
  `${term(a, 2)}${b ? signed(b, 1) : ''}${c ? signed(c, 0) : ''}`;

/** Plausible wrong answers for a numeric answer. */
function autoDistractors(a: number): number[] {
  const step = Math.max(1, Math.round(Math.abs(a) * 0.1));
  const raw = [a + 1, a - 1, a + 2, a - 2, a + step + 1, a - step - 1, a + 10, a - 10, -a, a * 2];
  const cleaned = raw
    .map((x) => round(x, 4))
    .filter((x) => x !== a && (a < 0 || x >= 0));
  return shuffle([...new Set(cleaned)]);
}

/** Leading hyphen -> real minus, so "−8" in a prompt matches "−8" in the options. */
const dash = (s: string) => s.replace(/^-(?=[\d.])/, '−');

/** Multiple choice with explicit distractors. */
function mc(instruction: string, prompt: string, answer: string | number, distractors: (string | number)[]): Question {
  const a = dash(String(answer));
  const d = [...new Set(distractors.map((x) => dash(String(x))))].filter((x) => x !== a).slice(0, 3);
  return { instruction, prompt, answer: a, choices: shuffle([a, ...d]) };
}

/** Multiple choice off a numeric answer, distractors invented for you. */
const numMC = (instruction: string, prompt: string, answer: number): Question =>
  mc(instruction, prompt, answer, autoDistractors(answer));

/** Typed-answer question. */
const typed = (instruction: string, prompt: string, answer: string | number): Question => ({
  instruction,
  prompt,
  answer: String(answer),
});

const NAMES = ['Maya', 'Leo', 'Priya', 'Jamal', 'Sofia', 'Noah', 'Amara', 'Diego', 'Ivy', 'Omar'];

/* ------------------------------------------------------------- elementary */

const elementary: Record<string, Gen> = {
  count: () => {
    const n = R(3, 9);
    const e = P(['🍎', '⭐', '🐟', '🎈', '🍪', '🐝', '🍓', '🐢']);
    return numMC('How many do you see?', e.repeat(n), n);
  },

  seqNext: () => {
    const s = R(1, 40);
    const step = P([1, 2, 5, 10]);
    return numMC('What number comes next?', `${s}, ${s + step}, ${s + 2 * step}, ?`, s + 3 * step);
  },

  compare: () => {
    const a = R(1, 99);
    const b = P([a, R(1, 99), R(1, 99)]);
    return mc('Which sign makes this true?', `${a}  ⬜  ${b}`, a > b ? '>' : a < b ? '<' : '=', ['>', '<', '=']);
  },

  placeValue: () => {
    const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
    const i = R(0, 2);
    const n = digits.join('');
    return numMC(`What is the value of the ${digits[i]} in ${n}?`, n, digits[i] * 10 ** (2 - i));
  },

  add10: () => {
    const a = R(1, 5);
    const b = R(1, 5);
    return numMC('Add', `${a} + ${b}`, a + b);
  },

  add20: () => {
    const a = R(4, 12);
    const b = R(3, 9);
    return numMC('Add', `${a} + ${b}`, a + b);
  },

  add2d: () => {
    const a = R(11, 89);
    const b = R(11, 89);
    return numMC('Add', `${a} + ${b}`, a + b);
  },

  add3d: () => {
    const a = R(120, 899);
    const b = R(120, 899);
    return typed('Add', `${a} + ${b}`, a + b);
  },

  sub10: () => {
    const a = R(3, 10);
    const b = R(1, a);
    return numMC('Subtract', `${a} − ${b}`, a - b);
  },

  sub20: () => {
    const a = R(10, 20);
    const b = R(2, 9);
    return numMC('Subtract', `${a} − ${b}`, a - b);
  },

  sub2d: () => {
    const a = R(30, 99);
    const b = R(11, a - 1);
    return numMC('Subtract', `${a} − ${b}`, a - b);
  },

  sub3d: () => {
    const a = R(300, 999);
    const b = R(110, a - 1);
    return typed('Subtract', `${a} − ${b}`, a - b);
  },

  mult5: () => {
    const a = R(0, 5);
    const b = R(0, 10);
    return numMC('Multiply', `${a} × ${b}`, a * b);
  },

  mult12: () => {
    const a = R(6, 12);
    const b = R(2, 12);
    return numMC('Multiply', `${a} × ${b}`, a * b);
  },

  mult2d1d: () => {
    const a = R(12, 99);
    const b = R(3, 9);
    return typed('Multiply', `${a} × ${b}`, a * b);
  },

  divFacts: () => {
    const b = R(2, 10);
    const q = R(2, 10);
    return numMC('Divide', `${b * q} ÷ ${b}`, q);
  },

  divRem: () => {
    const b = R(3, 9);
    const q = R(3, 9);
    const r = R(1, b - 1);
    return mc('Divide with a remainder', `${b * q + r} ÷ ${b}`, `${q} R${r}`, [
      `${q + 1} R${r}`,
      `${q - 1} R${r}`,
      `${q} R${b - r}`,
    ]);
  },

  fracEquiv: () => {
    const d = P([2, 3, 4, 5, 6]);
    const n = R(1, d - 1);
    const k = R(2, 4);
    return mc(`Which fraction is equal to ${fr(n, d)}?`, `${fr(n, d)}  =  ?`, `${n * k}/${d * k}`, [
      `${n * k}/${d * k + 1}`,
      `${n + k}/${d + k}`,
      `${n * k + 1}/${d * k}`,
    ]);
  },

  fracAdd: () => {
    const d = P([4, 5, 6, 8, 10]);
    const a = R(1, d - 2);
    const b = R(1, d - a - 1);
    // Distractors must not merely be the answer left unreduced — (a+b)/d is the
    // same number as the reduced answer, so it would mark a right answer wrong.
    return mc('Add the fractions', `${a}/${d} + ${b}/${d}`, fr(a + b, d), [
      `${a + b}/${d * 2}`,
      fr(a + b + 1, d),
      fr(Math.abs(a - b), d),
    ]);
  },

  fracCompare: () => {
    const d1 = P([2, 3, 4, 6]);
    const d2 = P([3, 5, 8, 12]);
    const n1 = R(1, d1 - 1);
    const n2 = R(1, d2 - 1);
    const v1 = n1 / d1;
    const v2 = n2 / d2;
    return mc(
      'Which sign makes this true?',
      `${n1}/${d1}  ⬜  ${n2}/${d2}`,
      v1 > v2 ? '>' : v1 < v2 ? '<' : '=',
      ['>', '<', '='],
    );
  },

  decAdd: () => {
    const a = round(R(10, 900) / 10, 1);
    const b = round(R(10, 900) / 10, 1);
    return typed('Add the decimals', `${a.toFixed(1)} + ${b.toFixed(1)}`, round(a + b, 1));
  },

  money: () => {
    const paid = P([10, 20, 50]);
    const cost = round(R(100, paid * 100 - 100) / 100, 2);
    const name = P(NAMES);
    return mc(
      'Word problem',
      `${name} pays with $${paid} for something that costs $${cost.toFixed(2)}. How much change?`,
      `$${round(paid - cost, 2).toFixed(2)}`,
      [
        `$${round(paid - cost + 1, 2).toFixed(2)}`,
        `$${round(paid - cost - 0.1, 2).toFixed(2)}`,
        `$${round(paid + cost, 2).toFixed(2)}`,
      ],
    );
  },

  roundTo: () => {
    const n = R(120, 9899);
    const place = P([10, 100, 1000]);
    const word = place === 10 ? 'ten' : place === 100 ? 'hundred' : 'thousand';
    return numMC(`Round to the nearest ${word}`, `${n}`, Math.round(n / place) * place);
  },

  clock: () => {
    const h = R(1, 11);
    const m = P([0, 15, 30, 45]);
    const add = P([15, 30, 45, 60, 90]);
    const t = h * 60 + m + add;
    const H = Math.floor(t / 60) % 12 || 12;
    const M = t % 60;
    return typed(
      'Word problem',
      `It is ${h}:${String(m).padStart(2, '0')}. What time will it be in ${add} minutes?`,
      `${H}:${String(M).padStart(2, '0')}`,
    );
  },

  perimeter: () => {
    const w = R(3, 20);
    const h = R(3, 20);
    return numMC('Find the perimeter', `A rectangle is ${w} cm by ${h} cm.`, 2 * (w + h));
  },

  areaRect: () => {
    const w = R(3, 20);
    const h = R(3, 20);
    return numMC('Find the area (cm²)', `A rectangle is ${w} cm by ${h} cm.`, w * h);
  },
};

/* ----------------------------------------------------------- middle school */

const middle: Record<string, Gen> = {
  ratioSimplify: () => {
    const k = R(2, 9);
    const a = R(2, 9);
    const b = R(2, 9);
    return mc('Simplify the ratio', `${a * k} : ${b * k}`, `${a / gcd(a, b)} : ${b / gcd(a, b)}`, [
      `${a} : ${b * 2}`,
      `${a * k} : ${b}`,
      `${b / gcd(a, b)} : ${a / gcd(a, b)}`,
    ]);
  },

  unitRate: () => {
    const n = P([3, 4, 5, 6, 8]);
    const rate = R(2, 15);
    const item = P(['apples', 'notebooks', 'miles', 'liters']);
    return numMC('Find the unit rate', `${n * rate} ${item} in ${n} hours. How many per hour?`, rate);
  },

  proportion: () => {
    const a = R(2, 9);
    const b = R(2, 9);
    const k = R(2, 8);
    return numMC('Solve the proportion', `${a}/${b} = x/${b * k}`, a * k);
  },

  percentOf: () => {
    const p = P([5, 10, 15, 20, 25, 40, 50, 75]);
    const n = P([20, 40, 60, 80, 120, 200, 400]);
    return numMC('Find the percent', `What is ${p}% of ${n}?`, round((p * n) / 100));
  },

  percentChange: () => {
    const start = P([20, 40, 50, 80, 200]);
    const pct = P([10, 20, 25, 50]);
    const up = Math.random() < 0.5;
    const end = up ? start + (start * pct) / 100 : start - (start * pct) / 100;
    return numMC(
      'Find the percent change',
      `A price goes from $${start} to $${end}. What is the percent ${up ? 'increase' : 'decrease'}?`,
      pct,
    );
  },

  discount: () => {
    const price = P([25, 40, 60, 80, 120]);
    const off = P([10, 20, 25, 30, 50]);
    return numMC('Find the sale price', `A $${price} item is ${off}% off. What is the new price?`, round(price * (1 - off / 100)));
  },

  intAddSub: () => {
    const a = R(-15, 15);
    const b = R(-15, 15);
    return numMC('Add the integers', `(${neg(a)}) + (${neg(b)})`, a + b);
  },

  intMulDiv: () => {
    const a = R(-12, 12) || 3;
    const b = R(-12, 12) || -4;
    return numMC('Multiply the integers', `(${neg(a)}) × (${neg(b)})`, a * b);
  },

  pemdas: () => {
    const a = R(2, 9);
    const b = R(2, 9);
    const c = R(2, 6);
    const d = R(2, 5);
    return numMC('Order of operations', `${a} + ${b} × ${c} − ${d}`, a + b * c - d);
  },

  evalExpr: () => {
    const a = R(2, 9);
    const b = R(-9, 9);
    const x = R(-6, 8);
    return numMC('Evaluate the expression', `${linear(a, b)}   when x = ${x}`, a * x + b);
  },

  oneStep: () => {
    const x = R(-9, 12);
    const b = R(2, 15);
    const op = P(['+', '−', '×']);
    const prompt = op === '+' ? `x + ${b} = ${x + b}` : op === '−' ? `x − ${b} = ${x - b}` : `${b}x = ${b * x}`;
    return numMC('Solve for x', prompt, x);
  },

  twoStep: () => {
    const x = R(-8, 10);
    const a = R(2, 9);
    const b = R(-12, 12) || 5;
    return numMC('Solve for x', `${linear(a, b)} = ${a * x + b}`, x);
  },

  distribute: () => {
    const a = R(2, 8);
    const b = R(2, 9);
    const c = R(-9, 9) || 3;
    return mc('Expand', `${a}(${linear(b, c)})`, linear(a * b, a * c), [
      linear(a * b, c),
      linear(b, a * c),
      linear(a * b, a * c + a),
    ]);
  },

  combineTerms: () => {
    const a = R(2, 9);
    const b = R(2, 9);
    const c = R(-9, -1);
    const d = R(1, 9);
    return mc('Simplify', `${term(a, 1)}${signed(c, 0)}${signed(b, 1)}${signed(d, 0)}`, linear(a + b, c + d), [
      linear(a + b, c - d),
      linear(a - b, c + d),
      linear(a + b + c + d, 0),
    ]);
  },

  inequality1: () => {
    const a = R(2, 8);
    const b = R(1, 15);
    const x = R(-6, 9);
    return mc('Solve the inequality', `${linear(a, b)} > ${a * x + b}`, `x > ${x}`, [
      `x < ${x}`,
      `x > ${x + a}`,
      `x ≥ ${x}`,
    ]);
  },

  slopeFromPoints: () => {
    const x1 = R(-6, 6);
    const y1 = R(-6, 6);
    const dx = P([1, 2, 3, 4]);
    const m = R(-4, 4) || 2;
    return mc('Find the slope', `Through (${x1}, ${y1}) and (${x1 + dx}, ${y1 + m * dx})`, `${m}`, [
      `${-m}`,
      fr(dx, m * dx || 1),
      `${m + 1}`,
    ]);
  },

  lineEval: () => {
    const m = R(-6, 6) || 3;
    const b = R(-9, 9);
    const x = R(-5, 6);
    return numMC('Find y', `y = ${linear(m, b)}   when x = ${x}`, m * x + b);
  },

  xIntercept: () => {
    const m = P([2, 3, 4, 5]);
    const x = R(-6, 6);
    return mc('Find the x-intercept', `y = ${linear(m, -m * x)}`, `(${x}, 0)`, [
      `(0, ${x})`,
      `(${-x}, 0)`,
      `(${x + 1}, 0)`,
    ]);
  },

  pythag: () => {
    const [a, b, c] = P([
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
      [9, 12, 15],
      [7, 24, 25],
    ]);
    return Math.random() < 0.6
      ? numMC('Find the hypotenuse', `Legs of ${a} and ${b}.`, c)
      : numMC('Find the missing leg', `Hypotenuse ${c}, one leg ${a}.`, b);
  },

  angleRules: () => {
    const kind = P(['complementary', 'supplementary', 'vertical']);
    const a = R(20, kind === 'complementary' ? 70 : 160);
    const ans = kind === 'complementary' ? 90 - a : kind === 'supplementary' ? 180 - a : a;
    return numMC('Find the missing angle (degrees)', `Two ${kind} angles. One measures ${a}°.`, ans);
  },

  volumePrism: () => {
    const l = R(2, 12);
    const w = R(2, 12);
    const h = R(2, 12);
    return numMC('Find the volume (cm³)', `A box is ${l} × ${w} × ${h} cm.`, l * w * h);
  },

  circleAreaCirc: () => {
    const r = R(2, 12);
    return Math.random() < 0.5
      ? mc('Find the area (leave in π)', `Circle with radius ${r}.`, `${r * r}π`, [`${2 * r}π`, `${r}π`, `${r * r * 2}π`])
      : mc('Find the circumference (leave in π)', `Circle with radius ${r}.`, `${2 * r}π`, [
          `${r * r}π`,
          `${r}π`,
          `${4 * r}π`,
        ]);
  },

  meanMedianMode: () => {
    const set = shuffle([R(1, 9), R(1, 9), R(1, 9), R(1, 9), R(1, 9)]);
    const kind = P(['mean', 'median']);
    const sorted = [...set].sort((a, b) => a - b);
    const ans = kind === 'mean' ? round(set.reduce((s, v) => s + v, 0) / set.length, 2) : sorted[2];
    return numMC(`Find the ${kind}`, set.join(', '), ans);
  },

  simpleProb: () => {
    const red = R(2, 8);
    const blue = R(2, 8);
    const green = R(1, 5);
    const total = red + blue + green;
    const pick = P([
      ['red', red],
      ['blue', blue],
      ['green', green],
    ] as [string, number][]);
    return mc(
      'Find the probability',
      `A bag has ${red} red, ${blue} blue and ${green} green marbles. P(${pick[0]})?`,
      fr(pick[1], total),
      [fr(total - pick[1], total), fr(pick[1], total - pick[1]), `${pick[1]}/${total + 1}`],
    );
  },

  expRules: () => {
    const a = R(2, 6);
    const b = R(2, 6);
    const kind = P(['mul', 'div', 'pow']);
    if (kind === 'mul') return mc('Simplify', `x${sup(a)} · x${sup(b)}`, `x${sup(a + b)}`, [`x${sup(a * b)}`, `x${sup(a - b)}`, `2x${sup(a + b)}`]);
    if (kind === 'div')
      return mc('Simplify', `x${sup(a + b)} ÷ x${sup(b)}`, `x${sup(a)}`, [`x${sup(a + 2 * b)}`, `x${sup(b)}`, `x${sup(a * b)}`]);
    return mc('Simplify', `(x${sup(a)})${sup(b)}`, `x${sup(a * b)}`, [`x${sup(a + b)}`, `x${sup(a ** b)}`, `${b}x${sup(a)}`]);
  },

  sciNotation: () => {
    const d = R(1, 9);
    const rest = R(10, 99);
    const e = R(3, 7);
    const full = Number(`${d}${rest}`) * 10 ** (e - 2);
    return mc('Write in scientific notation', full.toLocaleString('en-US'), `${d}.${rest} × 10${sup(e)}`, [
      `${d}.${rest} × 10${sup(e + 1)}`,
      `${d}${rest} × 10${sup(e)}`,
      `${d}.${rest} × 10${sup(e - 1)}`,
    ]);
  },

  perfectSqrt: () => {
    const n = R(2, 20);
    return numMC('Find the square root', `√${n * n}`, n);
  },
};

/* ---------------------------------------------------------------- algebra 1 */

const algebra1: Record<string, Gen> = {
  multiStepEq: () => {
    const x = R(-7, 9);
    const a = R(3, 9);
    const c = R(1, a - 1);
    const b = R(-9, 9);
    const d = (a - c) * x + b;
    return numMC('Solve for x', `${linear(a, b)} = ${linear(c, d)}`, x);
  },

  inequalityFlip: () => {
    const a = R(2, 8);
    const x = R(-6, 8);
    const b = R(-9, 9);
    return mc('Solve the inequality', `${linear(-a, b)} < ${-a * x + b}`, `x > ${x}`, [
      `x < ${x}`,
      `x > ${-x}`,
      `x ≥ ${x}`,
    ]);
  },

  system2: () => {
    const x = R(-5, 6);
    const y = R(-5, 6);
    const a = R(1, 4);
    const b = R(1, 4);
    const c = R(1, 4);
    const d = -R(1, 4);
    return mc(
      'Solve the system',
      `${coef(a, 'x')} + ${coef(b, 'y')} = ${neg(a * x + b * y)}\n` +
        `${coef(c, 'x')} − ${coef(Math.abs(d), 'y')} = ${neg(c * x + d * y)}`,
      `(${neg(x)}, ${neg(y)})`,
      [`(${neg(y)}, ${neg(x)})`, `(${neg(x + 2)}, ${neg(y + 1)})`, `(${neg(-x)}, ${neg(y)})`],
    );
  },

  foil: () => {
    const a = R(1, 5);
    const b = R(-8, 8) || 3;
    const c = R(1, 5);
    const d = R(-8, 8) || -2;
    return mc('Multiply the binomials', `(${linear(a, b)})(${linear(c, d)})`, quad(a * c, a * d + b * c, b * d), [
      quad(a * c, b * d, a * d + b * c),
      quad(a * c, a * d + b * c, b * d + 1),
      quad(a + c, a * d + b * c, b * d),
    ]);
  },

  factorTrinomial: () => {
    const r1 = R(-8, 8) || 2;
    // r2 = −r1 would make the "sign-flipped" distractor the same factorization.
    let r2 = R(-8, 8) || -3;
    while (r2 === -r1) r2 = R(-8, 8) || -3;
    return mc('Factor completely', quad(1, -(r1 + r2), r1 * r2), `(${linear(1, -r1)})(${linear(1, -r2)})`, [
      `(${linear(1, r1)})(${linear(1, r2)})`,
      `(${linear(1, -r1)})(${linear(1, r2)})`,
      `(${linear(1, -r1 - 1)})(${linear(1, -r2)})`,
    ]);
  },

  solveQuadFactor: () => {
    const r1 = R(-7, 7) || 3;
    const r2 = R(-7, 7) || -4;
    return mc('Solve for x', `${quad(1, -(r1 + r2), r1 * r2)} = 0`, `x = ${Math.min(r1, r2)} or x = ${Math.max(r1, r2)}`, [
      `x = ${Math.min(-r1, -r2)} or x = ${Math.max(-r1, -r2)}`,
      `x = ${Math.min(r1, r2)} or x = ${Math.max(r1, r2) + 1}`,
      `x = ${r1 * r2}`,
    ]);
  },

  discriminant: () => {
    const a = R(1, 4);
    const b = R(-9, 9);
    const c = R(-6, 6);
    const d = b * b - 4 * a * c;
    return mc(
      'How many real solutions?',
      `${quad(a, b, c)} = 0`,
      d > 0 ? 'Two real solutions' : d === 0 ? 'One real solution' : 'No real solutions',
      ['Two real solutions', 'One real solution', 'No real solutions'],
    );
  },

  quadFormula: () => {
    // Built from integer roots so the answer stays clean.
    const r1 = R(-6, 6);
    const r2 = R(-6, 6);
    const a = P([1, 1, 2]);
    return mc(
      'Solve using any method',
      `${quad(a, -a * (r1 + r2), a * r1 * r2)} = 0`,
      r1 === r2 ? `x = ${r1}` : `x = ${Math.min(r1, r2)}, ${Math.max(r1, r2)}`,
      [
        r1 === r2 ? `x = ${-r1}` : `x = ${Math.min(-r1, -r2)}, ${Math.max(-r1, -r2)}`,
        `x = ${r1 + r2}`,
        `x = ${r1 * r2}`,
      ],
    );
  },

  funcEval: () => {
    const a = R(1, 4);
    const b = R(-6, 6);
    const c = R(-9, 9);
    const x = R(-4, 5);
    return numMC('Evaluate the function', `f(x) = ${quad(a, b, c)}\n\nFind f(${x})`, a * x * x + b * x + c);
  },

  slopeIntercept: () => {
    const m = R(-4, 4) || 2;
    const b = R(-8, 8);
    const x1 = R(-5, 5);
    const x2 = x1 + R(1, 4);
    return mc(
      'Write the equation of the line',
      `Through (${x1}, ${m * x1 + b}) and (${x2}, ${m * x2 + b})`,
      `y = ${linear(m, b)}`,
      [`y = ${linear(-m, b)}`, `y = ${linear(m, -b)}`, `y = ${linear(b, m)}`],
    );
  },

  simplifyRadical: () => {
    const out = P([2, 3, 4, 5, 6]);
    const inn = P([2, 3, 5, 6, 7, 10]);
    return mc('Simplify the radical', `√${out * out * inn}`, `${out}√${inn}`, [
      `${inn}√${out}`,
      `${out * inn}`,
      `${out * 2}√${inn}`,
    ]);
  },

  absValueEq: () => {
    const a = R(1, 9);
    const b = R(2, 12);
    return mc('Solve for x', `|x + ${a}| = ${b}`, `x = ${neg(-a - b)} or x = ${neg(-a + b)}`, [
      `x = ${neg(a - b)} or x = ${neg(a + b)}`,
      `x = ${neg(b - a)}`,
      `x = ${neg(-a - b)}`,
    ]);
  },
};

/* ---------------------------------------------------------------- algebra 2 */

const algebra2: Record<string, Gen> = {
  complexArith: () => {
    const a = R(-6, 6);
    const b = R(-6, 6) || 2;
    const c = R(-6, 6);
    const d = R(-6, 6) || 3;
    const op = P(['+', '×']);
    if (op === '+')
      return mc('Simplify', `(${complex(a, b)}) + (${complex(c, d)})`, complex(a + c, b + d), [
        complex(a + c, b * d),
        complex(a + b, c + d),
        complex(a - c, b - d),
      ]);
    return mc('Simplify', `(${complex(a, b)})(${complex(c, d)})`, complex(a * c - b * d, a * d + b * c), [
      complex(a * c + b * d, a * d + b * c),
      complex(a * c, b * d),
      complex(a * c - b * d, a * d - b * c),
    ]);
  },

  iPower: () => {
    const n = R(4, 40);
    const vals = ['1', 'i', '−1', '−i'];
    return mc('Simplify', `i${sup(n)}`, vals[n % 4], vals);
  },

  vertexForm: () => {
    const a = P([1, 1, 2, -1]);
    const h = R(-5, 5);
    const k = R(-8, 8);
    const lead = a === 1 ? '' : a === -1 ? '−' : `${a}`;
    return mc(
      'Find the vertex',
      `y = ${lead}${shifted(h)}² ${k < 0 ? '−' : '+'} ${Math.abs(k)}`,
      `(${neg(h)}, ${neg(k)})`,
      [`(${neg(-h)}, ${neg(k)})`, `(${neg(h)}, ${neg(-k)})`, `(${neg(k)}, ${neg(h)})`],
    );
  },

  remainderTheorem: () => {
    const a = R(1, 3);
    const b = R(-6, 6);
    const c = R(-9, 9);
    const k = R(-4, 4) || 2;
    return numMC(
      'Use the remainder theorem',
      `What is the remainder when ${quad(a, b, c)} is divided by (x ${k > 0 ? '−' : '+'} ${Math.abs(k)})?`,
      a * k * k + b * k + c,
    );
  },

  rationalSimplify: () => {
    const r = R(-7, 7) || 3;
    const s = R(-7, 7) || -2;
    return mc('Simplify', `(${quad(1, -(r + s), r * s)}) / (${linear(1, -r)})`, linear(1, -s), [
      linear(1, s),
      linear(1, -r),
      linear(1, -r - s),
    ]);
  },

  logEval: () => {
    const b = P([2, 3, 4, 5, 10]);
    const e = R(2, 4);
    return numMC('Evaluate the logarithm', `log_${b}(${b ** e})`, e);
  },

  logProps: () => {
    const a = R(2, 9);
    const b = R(2, 9);
    return mc('Condense into one logarithm', `log(${a}) + log(${b})`, `log(${a * b})`, [
      `log(${a + b})`,
      `log(${a}/${b})`,
      `${a}log(${b})`,
    ]);
  },

  expEquation: () => {
    const b = P([2, 3, 5]);
    const x = R(2, 5);
    return numMC('Solve for x', `${b}${sup('x')} = ${b ** x}`, x);
  },

  arithSeq: () => {
    const a1 = R(-8, 12);
    const d = R(2, 9) * P([1, -1]);
    const n = R(6, 20);
    return numMC('Find the nth term', `a₁ = ${neg(a1)},  d = ${neg(d)}\n\nFind a${sub(n)}`, a1 + (n - 1) * d);
  },

  geoSeq: () => {
    const a1 = R(1, 6);
    const r = P([2, 3, -2]);
    const n = R(4, 7);
    return numMC('Find the nth term', `a₁ = ${a1},  r = ${neg(r)}\n\nFind a${sub(n)}`, a1 * r ** (n - 1));
  },

  compose: () => {
    const a = R(1, 5);
    const b = R(-6, 6);
    const c = R(1, 5);
    const d = R(-6, 6);
    const x = R(-4, 5);
    return numMC(
      'Find the composition',
      `f(x) = ${linear(a, b)},  g(x) = ${linear(c, d)}\n\nFind f(g(${x}))`,
      a * (c * x + d) + b,
    );
  },

  inverseFn: () => {
    const m = P([2, 3, 4, 5]);
    // b = 0 would make "(x − 0)/m" and "(x + 0)/m" both correct.
    const b = R(-8, 8) || 5;
    return mc('Find the inverse', `f(x) = ${linear(m, b)}`, `f⁻¹(x) = (x ${b < 0 ? '+' : '−'} ${Math.abs(b)})/${m}`, [
      `f⁻¹(x) = ${linear(m, -b)}`,
      `f⁻¹(x) = (x ${b < 0 ? '−' : '+'} ${Math.abs(b)})/${m}`,
      `f⁻¹(x) = ${m}(x ${b < 0 ? '+' : '−'} ${Math.abs(b)})`,
    ]);
  },
};

/* ----------------------------------------------------------------- geometry */

const geometry: Record<string, Gen> = {
  triangleAngles: () => {
    const a = R(20, 100);
    const b = R(20, 170 - a);
    return numMC('Find the third angle (degrees)', `A triangle has angles ${a}° and ${b}°.`, 180 - a - b);
  },

  parallelLines: () => {
    const a = R(30, 150);
    const kind = P(['corresponding', 'alternate interior', 'co-interior (same-side)']);
    const ans = kind.startsWith('co-') ? 180 - a : a;
    return numMC(
      'Find the angle (degrees)',
      `Two parallel lines are cut by a transversal. One angle is ${a}°. Find its ${kind} angle.`,
      ans,
    );
  },

  specialRight: () => {
    const leg = R(2, 12);
    return Math.random() < 0.5
      ? mc('45–45–90 triangle', `Each leg is ${leg}. Find the hypotenuse.`, `${leg}√2`, [`${leg}√3`, `${leg * 2}`, `${leg}/√2`])
      : mc('30–60–90 triangle', `The short leg is ${leg}. Find the long leg.`, `${leg}√3`, [
          `${leg}√2`,
          `${leg * 2}`,
          `${leg * 3}`,
        ]);
  },

  similarTriangles: () => {
    const k = R(2, 5);
    const a = R(2, 9);
    const b = R(3, 12);
    return numMC(
      'Similar triangles — find the missing side',
      `△ABC ~ △DEF.  AB = ${a}, DE = ${a * k}, BC = ${b}. Find EF.`,
      b * k,
    );
  },

  areaFigures: () => {
    const kind = P(['triangle', 'trapezoid', 'parallelogram']);
    if (kind === 'triangle') {
      const b = R(2, 20) * 2;
      const h = R(2, 15);
      return numMC('Find the area', `Triangle with base ${b} and height ${h}.`, (b * h) / 2);
    }
    if (kind === 'parallelogram') {
      const b = R(2, 20);
      const h = R(2, 15);
      return numMC('Find the area', `Parallelogram with base ${b} and height ${h}.`, b * h);
    }
    const b1 = R(2, 12);
    const b2 = R(2, 12);
    const h = R(2, 10) * 2;
    return numMC('Find the area', `Trapezoid with bases ${b1} and ${b2}, height ${h}.`, ((b1 + b2) * h) / 2);
  },

  circleArcSector: () => {
    const r = R(2, 12);
    const deg = P([30, 45, 60, 90, 120, 180]);
    return Math.random() < 0.5
      ? mc('Find the arc length (leave in π)', `Radius ${r}, central angle ${deg}°.`, `${fr(deg * 2 * r, 360)}π`, [
          `${fr(deg * r * r, 360)}π`,
          `${2 * r}π`,
          `${fr(deg * r, 360)}π`,
        ])
      : mc('Find the sector area (leave in π)', `Radius ${r}, central angle ${deg}°.`, `${fr(deg * r * r, 360)}π`, [
          `${fr(deg * 2 * r, 360)}π`,
          `${r * r}π`,
          `${fr(deg * r, 360)}π`,
        ]);
  },

  inscribedAngle: () => {
    const arc = R(10, 88) * 2;
    return numMC(
      'Find the inscribed angle (degrees)',
      `An inscribed angle intercepts an arc of ${arc}°.`,
      arc / 2,
    );
  },

  volumeSolids: () => {
    const kind = P(['cylinder', 'cone', 'sphere', 'prism']);
    const r = R(2, 9);
    const h = R(3, 12);
    if (kind === 'cylinder')
      return mc('Find the volume (leave in π)', `Cylinder, radius ${r}, height ${h}.`, `${r * r * h}π`, [
        `${2 * r * h}π`,
        `${r * h}π`,
        `${fr(r * r * h, 3)}π`,
      ]);
    if (kind === 'cone')
      return mc('Find the volume (leave in π)', `Cone, radius ${r}, height ${h * 3}.`, `${r * r * h}π`, [
        `${r * r * h * 3}π`,
        `${r * h}π`,
        `${fr(4 * r ** 3, 3)}π`,
      ]);
    if (kind === 'sphere')
      return mc('Find the volume (leave in π)', `Sphere, radius ${r}.`, `${fr(4 * r ** 3, 3)}π`, [
        `${fr(3 * r ** 3, 4)}π`,
        `${4 * r * r}π`,
        `${r ** 3}π`,
      ]);
    const l = R(2, 10);
    const w = R(2, 10);
    return numMC('Find the volume', `Rectangular prism ${l} × ${w} × ${h}.`, l * w * h);
  },

  surfaceArea: () => {
    const l = R(2, 10);
    const w = R(2, 10);
    const h = R(2, 10);
    return numMC('Find the surface area', `Rectangular prism ${l} × ${w} × ${h}.`, 2 * (l * w + l * h + w * h));
  },

  distanceMidpoint: () => {
    const [a, b, c] = P([
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
    ]);
    const x1 = R(-6, 6);
    const y1 = R(-6, 6);
    return Math.random() < 0.5
      ? numMC('Find the distance', `Between (${x1}, ${y1}) and (${x1 + a}, ${y1 + b})`, c)
      : mc(
          'Find the midpoint',
          `Between (${x1}, ${y1}) and (${x1 + 2 * a}, ${y1 + 2 * b})`,
          `(${x1 + a}, ${y1 + b})`,
          [`(${x1 + b}, ${y1 + a})`, `(${a}, ${b})`, `(${x1 + 2 * a}, ${y1 + 2 * b})`],
        );
  },

  transformations: () => {
    const x = R(-8, 8) || 3;
    const y = R(-8, 8) || -4;
    const kind = P(['reflect over the x-axis', 'reflect over the y-axis', 'reflect over y = x', 'rotate 180° about the origin']);
    const ans =
      kind === 'reflect over the x-axis'
        ? `(${x}, ${-y})`
        : kind === 'reflect over the y-axis'
          ? `(${-x}, ${y})`
          : kind === 'reflect over y = x'
            ? `(${y}, ${x})`
            : `(${-x}, ${-y})`;
    return mc(`Transform the point: ${kind}`, `(${x}, ${y})`, ans, [
      `(${-x}, ${-y})`,
      `(${y}, ${x})`,
      `(${x}, ${-y})`,
      `(${-x}, ${y})`,
    ]);
  },
};

/* --------------------------------------------------------------- precalculus */

const precalc: Record<string, Gen> = {
  degRad: () => {
    const deg = P([30, 45, 60, 90, 120, 135, 150, 180, 270, 360]);
    return mc('Convert to radians', `${deg}°`, `${fr(deg, 180)}π`, [
      `${fr(180, deg)}π`,
      `${fr(deg, 360)}π`,
      `${deg}π`,
    ]);
  },

  unitCircle: () => {
    const table: [string, string, string, string][] = [
      // angle, sin, cos, tan
      ['0', '0', '1', '0'],
      ['π/6', '1/2', '√3/2', '√3/3'],
      ['π/4', '√2/2', '√2/2', '1'],
      ['π/3', '√3/2', '1/2', '√3'],
      ['π/2', '1', '0', 'Undefined'],
      ['π', '0', '−1', '0'],
    ];
    const row = P(table);
    const fnIdx = R(1, 3);
    const fn = ['', 'sin', 'cos', 'tan'][fnIdx];
    const all = [...new Set(table.map((r) => r[fnIdx]))];
    return mc('Evaluate', `${fn}(${row[0]})`, row[fnIdx], shuffle(all));
  },

  trigIdentity: () => {
    const pairs: [string, string][] = [
      ['sin²θ + cos²θ', '1'],
      ['1 + tan²θ', 'sec²θ'],
      ['1 + cot²θ', 'csc²θ'],
      ['sin(2θ)', '2sinθcosθ'],
      ['tanθ · cosθ', 'sinθ'],
      ['1/sinθ', 'cscθ'],
    ];
    const [q, a] = P(pairs);
    return mc('Simplify using an identity', q, a, shuffle(pairs.map((p) => p[1])));
  },

  lawOfSinesCosines: () => {
    if (Math.random() < 0.5) {
      const A = R(30, 70);
      const B = R(30, 70);
      return numMC(
        'Law of Sines — find the third angle first',
        `In △ABC, A = ${A}°, B = ${B}°. Find C (degrees).`,
        180 - A - B,
      );
    }
    const [a, b, c] = P([
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
    ]);
    return numMC('Law of Cosines with C = 90°', `a = ${a}, b = ${b}, C = 90°. Find c.`, c);
  },

  geoSeries: () => {
    const a1 = R(1, 8);
    const r = P([2, 3]);
    const n = R(3, 6);
    return numMC(
      'Find the sum of the first n terms',
      `a₁ = ${a1},  r = ${r},  n = ${n}`,
      (a1 * (r ** n - 1)) / (r - 1),
    );
  },

  vectors: () => {
    const a = R(-8, 8);
    const b = R(-8, 8);
    const c = R(-8, 8);
    const d = R(-8, 8);
    return Math.random() < 0.5
      ? numMC('Find the dot product', `⟨${a}, ${b}⟩ · ⟨${c}, ${d}⟩`, a * c + b * d)
      : (() => {
          const [x, y, m] = P([
            [3, 4, 5],
            [6, 8, 10],
            [5, 12, 13],
          ]);
          return numMC('Find the magnitude', `‖⟨${x}, ${y}⟩‖`, m);
        })();
  },

  matrixDet: () => {
    const a = R(-6, 6);
    const b = R(-6, 6);
    const c = R(-6, 6);
    const d = R(-6, 6);
    return numMC('Find the determinant', `| ${a}  ${b} |\n| ${c}  ${d} |`, a * d - b * c);
  },

  asymptotes: () => {
    const r = R(-6, 6) || 3;
    const k = R(1, 6);
    return mc('Find the vertical asymptote', `f(x) = ${k} / (x ${r > 0 ? '−' : '+'} ${Math.abs(r)})`, `x = ${r}`, [
      `x = ${-r}`,
      `y = ${r}`,
      `x = ${k}`,
    ]);
  },

  limitIntro: () => {
    const a = R(1, 6);
    const b = R(-6, 6);
    const c = R(-5, 5);
    return numMC('Evaluate the limit', `lim(x→${c})  ${quad(a, b, 0)}`, a * c * c + b * c);
  },

  logSolve: () => {
    const b = P([2, 3, 5, 10]);
    const e = R(2, 4);
    return numMC('Solve for x', `log base ${b} of x = ${e}`, b ** e);
  },
};

/* ----------------------------------------------------------------- calculus */

const calculus: Record<string, Gen> = {
  limitFactor: () => {
    const a = R(1, 8);
    return numMC('Evaluate the limit', `lim(x→${a})  (x² − ${a * a}) / (x − ${a})`, 2 * a);
  },

  limitInfinity: () => {
    const a = R(2, 9);
    const b = R(2, 9);
    return mc(
      'Evaluate the limit',
      `lim(x→∞)  (${a}x² + 5x) / (${b}x² − 3)`,
      fr(a, b),
      [fr(b, a), '0', '∞'],
    );
  },

  derivPower: () => {
    const a = R(2, 9);
    const n = R(2, 6);
    const b = R(1, 9);
    return mc("Find f′(x)", `f(x) = ${term(a, n)} ${signed(b, 1).trim()}`, `${term(a * n, n - 1)} + ${b}`, [
      `${term(a * n, n)} + ${b}`,
      `${term(a, n - 1)} + ${b}`,
      `${term(a * n, n - 1)} + ${b}x`,
    ]);
  },

  derivProduct: () => {
    const a = R(1, 5);
    const b = R(1, 6);
    const c = R(1, 5);
    const d = R(1, 6);
    // d/dx [(ax+b)(cx+d)] = 2acx + ad + bc
    return mc('Use the product rule', `f(x) = (${linear(a, b)})(${linear(c, d)})`, linear(2 * a * c, a * d + b * c), [
      linear(a * c, a * d + b * c),
      `${a * c}`,
      linear(2 * a * c, b * d),
    ]);
  },

  derivChain: () => {
    const a = R(2, 6);
    const b = R(1, 8);
    const n = R(2, 5);
    const inner = `(${linear(a, b)})`;
    return mc('Use the chain rule', `f(x) = ${pow(inner, n)}`, `${n * a}${pow(inner, n - 1)}`, [
      `${n}${pow(inner, n - 1)}`,
      `${n * a}${pow(inner, n)}`,
      `${a}${pow(inner, n - 1)}`,
    ]);
  },

  derivTrig: () => {
    const pairs: [string, string][] = [
      ['sin(x)', 'cos(x)'],
      ['cos(x)', '−sin(x)'],
      ['tan(x)', 'sec²(x)'],
      ['e^x', 'e^x'],
      ['ln(x)', '1/x'],
    ];
    const [f, d] = P(pairs);
    return mc("Find f′(x)", `f(x) = ${f}`, d, shuffle(pairs.map((p) => p[1])));
  },

  tangentLine: () => {
    const a = R(1, 4);
    const c = R(-5, 5);
    const x0 = R(-3, 4);
    const slope = 2 * a * x0;
    const y0 = a * x0 * x0 + c;
    return mc(
      'Find the tangent line',
      `f(x) = ${quad(a, 0, c)}  at x = ${x0}`,
      `y = ${linear(slope, y0 - slope * x0)}`,
      [`y = ${linear(slope, y0)}`, `y = ${linear(y0, slope)}`, `y = ${linear(slope + 1, y0 - slope * x0)}`],
    );
  },

  criticalPoints: () => {
    const a = P([1, 2, 3]);
    const r = R(-5, 5);
    // f(x) = a x² − 2ar x + c  => f′ = 2a(x − r)
    const c = R(-8, 8);
    return numMC(
      'Find the critical value of x',
      `f(x) = ${quad(a, -2 * a * r, c)}`,
      r,
    );
  },

  integralPower: () => {
    const n = R(1, 5);
    const a = (n + 1) * R(1, 4);
    return mc('Integrate', `∫ ${term(a, n)} dx`, `${term(a / (n + 1), n + 1)} + C`, [
      `${term(a * (n + 1), n + 1)} + C`,
      `${term(a / (n + 1), n)} + C`,
      `${term(a * n, n - 1)} + C`,
    ]);
  },

  definiteIntegral: () => {
    const n = P([1, 2, 3]);
    const b = R(2, 4);
    const a = n + 1;
    // ∫₀ᵇ a xⁿ dx = b^(n+1)
    return numMC('Evaluate the definite integral', `∫ from 0 to ${b} of ${term(a, n)} dx`, b ** (n + 1));
  },

  uSub: () => {
    const a = R(2, 5);
    const b = R(1, 7);
    const n = R(2, 4);
    const inner = `(${linear(a, b)})`;
    return mc('Integrate by substitution', `∫ ${a}${pow(inner, n - 1)} dx`, `${pow(inner, n)}/${n} + C`, [
      `${pow(inner, n)} + C`,
      `${a}${pow(inner, n)}/${n} + C`,
      `${pow(inner, n - 1)}/${n} + C`,
    ]);
  },

  ftc: () => {
    const a = R(2, 6);
    const lo = R(1, 3);
    const hi = lo + R(1, 3);
    // ∫ 2a x dx = a x² ; evaluated hi..lo
    return numMC(
      'Evaluate using the Fundamental Theorem',
      `∫ from ${lo} to ${hi} of ${term(2 * a, 1)} dx`,
      a * hi * hi - a * lo * lo,
    );
  },
};

/* --------------------------------------------------------------- statistics */

const statistics: Record<string, Gen> = {
  centerSpread: () => {
    const set = shuffle([R(2, 20), R(2, 20), R(2, 20), R(2, 20), R(2, 20)]);
    const kind = P(['mean', 'median', 'range']);
    const sorted = [...set].sort((a, b) => a - b);
    const ans =
      kind === 'mean'
        ? round(set.reduce((s, v) => s + v, 0) / 5, 2)
        : kind === 'median'
          ? sorted[2]
          : sorted[4] - sorted[0];
    return numMC(`Find the ${kind}`, set.join(', '), ans);
  },

  zScore: () => {
    const mean = P([50, 60, 100, 200]);
    const sd = P([5, 10, 20]);
    const z = P([-2, -1, 1, 2, 3]);
    return numMC('Find the z-score', `x = ${mean + z * sd},  μ = ${mean},  σ = ${sd}`, z);
  },

  probRules: () => {
    const kind = P(['and', 'or']);
    const a = P([2, 3, 4, 5]);
    const b = P([2, 3, 4, 5]);
    return kind === 'and'
      ? mc(
          'Independent events',
          `P(A) = 1/${a},  P(B) = 1/${b}.  Find P(A and B).`,
          fr(1, a * b),
          [fr(2, a + b), fr(1, a + b), fr(a + b, a * b)],
        )
      : mc(
          'Mutually exclusive events',
          `P(A) = 1/${a},  P(B) = 1/${b}.  Find P(A or B).`,
          fr(a + b, a * b),
          [fr(1, a * b), fr(1, a + b), fr(a * b, a + b)],
        );
  },

  permComb: () => {
    const n = R(5, 9);
    const r = R(2, 4);
    const perm = Array.from({ length: r }, (_, i) => n - i).reduce((s, v) => s * v, 1);
    const comb = perm / Array.from({ length: r }, (_, i) => i + 1).reduce((s, v) => s * v, 1);
    return Math.random() < 0.5
      ? numMC('Permutations', `How many ways to arrange ${r} of ${n} items (order matters)?`, perm)
      : numMC('Combinations', `How many ways to choose ${r} of ${n} items (order does not matter)?`, comb);
  },

  binomial: () => {
    const n = R(3, 6);
    const k = R(1, n - 1);
    const comb =
      Array.from({ length: k }, (_, i) => n - i).reduce((s, v) => s * v, 1) /
      Array.from({ length: k }, (_, i) => i + 1).reduce((s, v) => s * v, 1);
    return numMC(
      'Binomial coefficient',
      `A coin is flipped ${n} times. How many outcomes have exactly ${k} head${k === 1 ? '' : 's'}?`,
      comb,
    );
  },

  empiricalRule: () => {
    const mean = P([50, 100, 500]);
    const sd = P([5, 10, 25]);
    const k = P([1, 2, 3]);
    const pct = k === 1 ? 68 : k === 2 ? 95 : 99.7;
    return mc(
      'Use the 68–95–99.7 rule',
      `μ = ${mean}, σ = ${sd}. What percent of data lies between ${mean - k * sd} and ${mean + k * sd}?`,
      `${pct}%`,
      ['68%', '95%', '99.7%', '50%'],
    );
  },

  expectedValue: () => {
    const win = R(2, 20);
    const lose = R(1, 10);
    const p = P([2, 3, 4, 5]);
    const ev = round(win / p - (lose * (p - 1)) / p, 2);
    return numMC(
      'Find the expected value',
      `You win $${win} with probability 1/${p}, otherwise you lose $${lose}.`,
      ev,
    );
  },

  correlation: () => {
    const r = P([-0.92, -0.45, 0.05, 0.48, 0.89]);
    const desc =
      Math.abs(r) < 0.2
        ? 'No correlation'
        : r > 0.7
          ? 'Strong positive'
          : r > 0
            ? 'Weak positive'
            : r < -0.7
              ? 'Strong negative'
              : 'Weak negative';
    return mc('Describe the correlation', `r = ${r}`, desc, [
      'Strong positive',
      'Weak positive',
      'Strong negative',
      'Weak negative',
      'No correlation',
    ]);
  },

  samplingBias: () => {
    const cases: [string, string][] = [
      ['Surveying only people leaving a gym about exercise habits', 'Selection bias'],
      ['Asking "Do you agree that taxes are far too high?"', 'Wording bias'],
      ['Only 4% of mailed surveys are returned', 'Non-response bias'],
      ['Every 10th student on a full roster is surveyed', 'No major bias'],
    ];
    const [q, a] = P(cases);
    return mc('Identify the sampling issue', q, a, cases.map((c) => c[1]));
  },

  marginError: () => {
    const sd = P([10, 20, 30]);
    const n = P([25, 100, 400]);
    const se = round(sd / Math.sqrt(n), 2);
    return numMC('Find the standard error', `σ = ${sd},  n = ${n}`, se);
  },
};

/* ------------------------------------------------------------------ SAT prep */

const sat: Record<string, Gen> = {
  satLinearWord: () => {
    const name = P(NAMES);
    const start = R(20, 200);
    const rate = R(3, 25);
    return mc(
      'Which equation models the situation?',
      `${name} starts with $${start} and saves $${rate} per week. Which equation gives the total T after w weeks?`,
      `T = ${rate}w + ${start}`,
      [`T = ${start}w + ${rate}`, `T = ${rate}w − ${start}`, `T = ${start + rate}w`],
    );
  },

  satSolveLinear: () => {
    const x = R(-9, 12);
    const a = R(2, 9);
    const b = R(-15, 15);
    const c = R(1, a - 1);
    return numMC('Solve for x', `${linear(a, b)} = ${linear(c, (a - c) * x + b)}`, x);
  },

  satRateWord: () => {
    const speed = P([40, 45, 50, 55, 60, 65]);
    const hours = P([2, 3, 4, 5]);
    return numMC('Word problem', `A car travels at ${speed} mph for ${hours} hours. How far does it go?`, speed * hours);
  },

  satPercentWord: () => {
    const orig = P([40, 60, 80, 120, 250]);
    const up = P([10, 15, 20, 25]);
    const down = P([10, 20, 25]);
    return numMC(
      'Two successive changes',
      `A price of $${orig} increases ${up}%, then decreases ${down}%. What is the final price?`,
      round(orig * (1 + up / 100) * (1 - down / 100), 2),
    );
  },

  satTableData: () => {
    const a = R(10, 40);
    const b = R(10, 40);
    const c = R(10, 40);
    const d = R(10, 40);
    const total = a + b + c + d;
    return mc(
      'Two-way table',
      `           Yes    No\nGrade 9   ${a}     ${b}\nGrade 10  ${c}     ${d}\n\nWhat fraction of all students answered Yes?`,
      fr(a + c, total),
      [fr(a, total), fr(b + d, total), fr(a + c, a + b)],
    );
  },

  satScatter: () => {
    const m = R(2, 12);
    const b = R(5, 60);
    // All four options are phrased alike — the answer must not stand out.
    return mc(
      'Interpret the slope',
      `A line of best fit is y = ${m}x + ${b}. What does ${m} represent?`,
      'The predicted increase in y for each 1-unit increase in x',
      [
        'The predicted value of y when x = 0',
        'The predicted increase in x for each 1-unit increase in y',
        'The predicted value of y when x = 1',
      ],
    );
  },

  satExpGrowth: () => {
    const start = P([100, 200, 500, 1000]);
    const rate = P([5, 10, 20, 25]);
    return mc(
      'Which expression models growth?',
      `A population of ${start} grows ${rate}% per year. Population after t years?`,
      `${start}(1.${rate < 10 ? '0' + rate : rate})${sup('t')}`,
      [
        `${start}(0.${rate})${sup('t')}`,
        `${start} + ${rate}t`,
        `${start}(${rate})${sup('t')}`,
      ],
    );
  },

  satFunctionNotation: () => {
    const a = R(1, 4);
    const b = R(-8, 8);
    const c = R(-9, 9);
    const x = R(-4, 5);
    return numMC('Function notation', `f(x) = ${quad(a, b, c)}\n\nFind f(${x})`, a * x * x + b * x + c);
  },

  satTrig: () => {
    const [a, b, c] = P([
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
    ]);
    const fn = P(['sin', 'cos', 'tan']);
    const ans = fn === 'sin' ? fr(a, c) : fn === 'cos' ? fr(b, c) : fr(a, b);
    return mc(
      'SOH-CAH-TOA',
      `Right triangle: opposite = ${a}, adjacent = ${b}, hypotenuse = ${c}.\n\nFind ${fn}(θ).`,
      ans,
      [fr(b, c), fr(a, c), fr(a, b), fr(b, a)],
    );
  },

  satCircleEq: () => {
    const h = R(-6, 6);
    const k = R(-6, 6);
    const r = R(2, 9);
    return mc(
      'Circle equation',
      `${shifted(h)}² + ${shifted(k, 'y')}² = ${r * r}\n\nFind the center and radius.`,
      `Center (${neg(h)}, ${neg(k)}), r = ${r}`,
      [
        `Center (${neg(-h)}, ${neg(-k)}), r = ${r}`,
        `Center (${neg(h)}, ${neg(k)}), r = ${r * r}`,
        `Center (${neg(k)}, ${neg(h)}), r = ${r}`,
      ],
    );
  },

  satUnitConvert: () => {
    const kind = P([
      ['feet', 'inches', 12],
      ['yards', 'feet', 3],
      ['hours', 'minutes', 60],
      ['kilograms', 'grams', 1000],
    ] as [string, string, number][]);
    const n = R(3, 24);
    return numMC('Unit conversion', `${n} ${kind[0]} = ? ${kind[1]}`, n * kind[2]);
  },
};

/* ----------------------------------------------------------------- registry */

/**
 * Random parameters occasionally collapse two distractors into the same string
 * (x-intercept at 0, a vertex at the origin, a = b in an exponent rule). Rather
 * than hand-constrain every range, re-roll until the question has four distinct
 * options. Collisions are rare, so this almost never loops twice.
 */
const safe = (gen: Gen): Gen => {
  return () => {
    let q = gen();
    for (let i = 0; i < 30 && q.choices && new Set(q.choices).size < 4; i++) q = gen();
    return q;
  };
};

const bank: Record<string, Gen> = Object.fromEntries(
  Object.entries(SAT_BANK).map(([key, { instruction, items }]) => [
    `bank.${key}`,
    () => {
      const [prompt, answer, ...distractors] = P(items);
      return mc(instruction, prompt, answer, distractors);
    },
  ]),
);

export const GENERATORS: Record<string, Gen> = Object.fromEntries(
  Object.entries({
    ...elementary,
    ...middle,
    ...algebra1,
    ...algebra2,
    ...geometry,
    ...precalc,
    ...calculus,
    ...statistics,
    ...sat,
    ...bank,
  }).map(([id, gen]) => [id, safe(gen)]),
);

/** Answer checking. Forgiving about spaces, case and superscript notation. */
const SUP_BACK: Record<string, string> = Object.fromEntries(
  Object.entries(SUP).map(([k, v]) => [v, k === '-' ? '-' : `^${k}`]),
);

export function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, (m) => SUP_BACK[m] ?? m)
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, '')
    .replace(/\*/g, '')
    .replace(/^\+/, '')
    .replace(/\$/g, '');
}

export function isCorrect(given: string, answer: string): boolean {
  const a = normalize(given);
  const b = normalize(answer);
  if (!a) return false;
  if (a === b) return true;
  const na = Number(a);
  const nb = Number(b);
  return Number.isFinite(na) && Number.isFinite(nb) && Math.abs(na - nb) < 1e-6;
}

/** Draw `n` questions from a generator, avoiding back-to-back duplicates. */
export function drawQuestions(genIds: string[], n: number): Question[] {
  const out: Question[] = [];
  let guard = 0;
  // Index by attempt, not by count, so a small fixed bank that runs dry hands
  // the slot to the next generator instead of re-drawing its own duplicates.
  while (out.length < n && guard < n * 40) {
    const gen = GENERATORS[genIds[guard++ % genIds.length]];
    if (!gen) break;
    const q = gen();
    if (out.some((p) => p.prompt === q.prompt)) continue;
    out.push(q);
  }
  return out;
}
