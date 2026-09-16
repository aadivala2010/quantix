/**
 * The curriculum: levels → courses → units → skills.
 * A skill points at one or more generator ids from generators.ts.
 */

export type Skill = {
  /** Globally unique, used as the progress key. */
  id: string;
  title: string;
  icon: string;
  gens: string[];
};

export type Unit = {
  title: string;
  subtitle: string;
  color: string;
  skills: Skill[];
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  units: Unit[];
};

/** Lessons needed to finish a skill (crown-equivalent). */
export const LESSONS_PER_SKILL = 4;
/** Questions in one lesson. */
export const QUESTIONS_PER_LESSON = 8;

const C = {
  green: '#58CC02',
  blue: '#1CB0F6',
  purple: '#CE82FF',
  orange: '#FF9600',
  red: '#FF4B4B',
  teal: '#00CD9C',
  yellow: '#FFC800',
  pink: '#FF86D0',
} as const;

/** Terse skill builder. The icon is a name from components/Icon.tsx. */
const unit = (
  courseId: string,
  title: string,
  subtitle: string,
  color: string,
  skills: [gen: string, title: string, icon: string, extraGens?: string[]][],
): Unit => ({
  title,
  subtitle,
  color,
  skills: skills.map(([gen, t, icon, extra]) => ({
    id: `${courseId}.${gen}`,
    title: t,
    icon,
    gens: [gen, ...(extra ?? [])],
  })),
});

/* -------------------------------------------------------------- elementary */

const elementary: Course = {
  id: 'elem',
  title: 'Elementary',
  subtitle: 'Grades K–5',
  icon: 'dots',
  color: C.green,
  units: [
    unit('elem', 'Unit 1', 'Numbers & counting', C.green, [
      ['count', 'Counting', 'dots'],
      ['seqNext', 'Number Patterns', 'stairs'],
      ['compare', 'Comparing Numbers', 'balance'],
      ['placeValue', 'Place Value', 'columns'],
    ]),
    unit('elem', 'Unit 2', 'Addition', C.blue, [
      ['add10', 'Adding to 10', 'plus'],
      ['add20', 'Adding to 20', 'plusBox'],
      ['add2d', 'Two-Digit Addition', 'stack'],
      ['add3d', 'Three-Digit Addition', 'abacus'],
    ]),
    unit('elem', 'Unit 3', 'Subtraction', C.purple, [
      ['sub10', 'Subtracting to 10', 'minus'],
      ['sub20', 'Subtracting to 20', 'target'],
      ['sub2d', 'Two-Digit Subtraction', 'stack'],
      ['sub3d', 'Three-Digit Subtraction', 'minusBox'],
    ]),
    unit('elem', 'Unit 4', 'Multiplication', C.orange, [
      ['mult5', 'Times Tables 0–5', 'times'],
      ['mult12', 'Times Tables 6–12', 'star'],
      ['mult2d1d', 'Two-Digit Multiplying', 'columns'],
    ]),
    unit('elem', 'Unit 5', 'Division', C.red, [
      ['divFacts', 'Division Facts', 'divide'],
      ['divRem', 'Remainders', 'arc'],
    ]),
    unit('elem', 'Unit 6', 'Fractions', C.teal, [
      ['fracEquiv', 'Equal Fractions', 'pie'],
      ['fracAdd', 'Adding Fractions', 'fraction'],
      ['fracCompare', 'Comparing Fractions', 'compare'],
    ]),
    unit('elem', 'Unit 7', 'Decimals & money', C.yellow, [
      ['decAdd', 'Adding Decimals', 'plusBox'],
      ['roundTo', 'Rounding', 'target'],
      ['money', 'Money & Change', 'coins'],
    ]),
    unit('elem', 'Unit 8', 'Measurement', C.pink, [
      ['clock', 'Telling Time', 'clock'],
      ['perimeter', 'Perimeter', 'ruler'],
      ['areaRect', 'Area', 'areaSquare'],
    ]),
  ],
};

/* ------------------------------------------------------------ middle school */

const middle: Course = {
  id: 'mid',
  title: 'Middle School',
  subtitle: 'Grades 6–8',
  icon: 'stairs',
  color: C.blue,
  units: [
    unit('mid', 'Unit 1', 'Ratios & proportions', C.green, [
      ['ratioSimplify', 'Ratios', 'link'],
      ['unitRate', 'Unit Rates', 'target'],
      ['proportion', 'Proportions', 'balance'],
    ]),
    unit('mid', 'Unit 2', 'Percents', C.blue, [
      ['percentOf', 'Percent of a Number', 'percent'],
      ['percentChange', 'Percent Change', 'derivative'],
      ['discount', 'Discounts & Sales', 'coins'],
    ]),
    unit('mid', 'Unit 3', 'Integers & operations', C.purple, [
      ['intAddSub', 'Negative Numbers', 'thermometer'],
      ['intMulDiv', 'Multiplying Integers', 'times'],
      ['pemdas', 'Order of Operations', 'parens'],
    ]),
    unit('mid', 'Unit 4', 'Expressions & equations', C.orange, [
      ['evalExpr', 'Evaluating Expressions', 'parens'],
      ['combineTerms', 'Combining Like Terms', 'stack'],
      ['distribute', 'Distributive Property', 'cube'],
      ['oneStep', 'One-Step Equations', 'equals'],
      ['twoStep', 'Two-Step Equations', 'balance'],
      ['inequality1', 'Inequalities', 'inequality'],
    ]),
    unit('mid', 'Unit 5', 'Linear relationships', C.red, [
      ['slopeFromPoints', 'Slope', 'angle'],
      ['lineEval', 'Slope-Intercept Form', 'chartBar'],
      ['xIntercept', 'Intercepts', 'times'],
    ]),
    unit('mid', 'Unit 6', 'Exponents & roots', C.teal, [
      ['expRules', 'Exponent Rules', 'triangle'],
      ['perfectSqrt', 'Square Roots', 'sqrt'],
      ['sciNotation', 'Scientific Notation', 'times'],
    ]),
    unit('mid', 'Unit 7', 'Geometry', C.yellow, [
      ['angleRules', 'Angle Pairs', 'angle'],
      ['pythag', 'Pythagorean Theorem', 'ruler'],
      ['circleAreaCirc', 'Circles', 'circleShape'],
      ['volumePrism', 'Volume', 'cube'],
    ]),
    unit('mid', 'Unit 8', 'Data & probability', C.pink, [
      ['meanMedianMode', 'Mean & Median', 'chartBar'],
      ['simpleProb', 'Probability', 'dice'],
    ]),
  ],
};

/* ------------------------------------------------------------- high school */

const algebra1: Course = {
  id: 'alg1',
  title: 'Algebra 1',
  subtitle: 'Equations & functions',
  icon: 'angle',
  color: C.green,
  units: [
    unit('alg1', 'Unit 1', 'Solving equations', C.green, [
      ['twoStep', 'Two-Step Equations', 'balance'],
      ['multiStepEq', 'Variables Both Sides', 'refresh'],
      ['absValueEq', 'Absolute Value', 'distance'],
    ]),
    unit('alg1', 'Unit 2', 'Inequalities & systems', C.blue, [
      ['inequality1', 'Inequalities', 'inequality'],
      ['inequalityFlip', 'Flipping the Sign', 'refresh'],
      ['system2', 'Systems of Equations', 'matrix'],
    ]),
    unit('alg1', 'Unit 3', 'Linear functions', C.purple, [
      ['slopeFromPoints', 'Slope', 'derivative'],
      ['slopeIntercept', 'Writing Equations', 'intercept'],
      ['funcEval', 'Function Notation', 'functionF'],
    ]),
    unit('alg1', 'Unit 4', 'Exponents & polynomials', C.orange, [
      ['expRules', 'Exponent Rules', 'triangle'],
      ['foil', 'Multiplying Binomials', 'times'],
      ['simplifyRadical', 'Simplifying Radicals', 'sqrt'],
    ]),
    unit('alg1', 'Unit 5', 'Quadratics', C.red, [
      ['factorTrinomial', 'Factoring', 'parens'],
      ['solveQuadFactor', 'Solving by Factoring', 'target'],
      ['quadFormula', 'The Quadratic Formula', 'star'],
      ['discriminant', 'The Discriminant', 'compare'],
    ]),
  ],
};

const algebra2: Course = {
  id: 'alg2',
  title: 'Algebra 2',
  subtitle: 'Advanced functions',
  icon: 'abacus',
  color: C.purple,
  units: [
    unit('alg2', 'Unit 1', 'Quadratics & complex numbers', C.green, [
      ['vertexForm', 'Vertex Form', 'arc'],
      ['discriminant', 'The Discriminant', 'compare'],
      ['complexArith', 'Complex Numbers', 'complex'],
      ['iPower', 'Powers of i', 'refresh'],
    ]),
    unit('alg2', 'Unit 2', 'Polynomials & rationals', C.blue, [
      ['remainderTheorem', 'Remainder Theorem', 'divide'],
      ['rationalSimplify', 'Rational Expressions', 'divide'],
    ]),
    unit('alg2', 'Unit 3', 'Exponentials & logarithms', C.orange, [
      ['logEval', 'Evaluating Logs', 'stack'],
      ['logProps', 'Log Properties', 'link'],
      ['expEquation', 'Exponential Equations', 'derivative'],
    ]),
    unit('alg2', 'Unit 4', 'Sequences', C.teal, [
      ['arithSeq', 'Arithmetic Sequences', 'plus'],
      ['geoSeq', 'Geometric Sequences', 'times'],
    ]),
    unit('alg2', 'Unit 5', 'Function operations', C.pink, [
      ['compose', 'Composite Functions', 'link'],
      ['inverseFn', 'Inverse Functions', 'refresh'],
    ]),
  ],
};

const geometryCourse: Course = {
  id: 'geo',
  title: 'Geometry',
  subtitle: 'Shapes & proofs',
  icon: 'ruler',
  color: C.orange,
  units: [
    unit('geo', 'Unit 1', 'Angles & lines', C.green, [
      ['angleRules', 'Angle Pairs', 'angle'],
      ['parallelLines', 'Parallel Lines', 'equals'],
      ['triangleAngles', 'Triangle Angle Sum', 'triangle'],
    ]),
    unit('geo', 'Unit 2', 'Right triangles', C.blue, [
      ['pythag', 'Pythagorean Theorem', 'ruler'],
      ['specialRight', 'Special Right Triangles', 'star'],
      ['similarTriangles', 'Similar Triangles', 'compare'],
    ]),
    unit('geo', 'Unit 3', 'Area & perimeter', C.purple, [
      ['areaFigures', 'Areas of Figures', 'areaSquare'],
      ['circleAreaCirc', 'Circles', 'circleShape'],
      ['circleArcSector', 'Arcs & Sectors', 'arc'],
      ['inscribedAngle', 'Inscribed Angles', 'target'],
    ]),
    unit('geo', 'Unit 4', 'Solids', C.orange, [
      ['volumeSolids', 'Volume', 'cube'],
      ['surfaceArea', 'Surface Area', 'shapes'],
    ]),
    unit('geo', 'Unit 5', 'Coordinate geometry', C.red, [
      ['distanceMidpoint', 'Distance & Midpoint', 'distance'],
      ['transformations', 'Transformations', 'refresh'],
    ]),
  ],
};

const precalculus: Course = {
  id: 'pre',
  title: 'Precalculus',
  subtitle: 'Trig & analysis',
  icon: 'wave',
  color: C.teal,
  units: [
    unit('pre', 'Unit 1', 'Trigonometry', C.green, [
      ['degRad', 'Degrees & Radians', 'refresh'],
      ['unitCircle', 'The Unit Circle', 'circleShape'],
      ['trigIdentity', 'Trig Identities', 'wave'],
      ['lawOfSinesCosines', 'Laws of Sines & Cosines', 'angle'],
    ]),
    unit('pre', 'Unit 2', 'Functions', C.blue, [
      ['asymptotes', 'Asymptotes', 'asymptote'],
      ['logSolve', 'Logarithmic Equations', 'stack'],
      ['compose', 'Composite Functions', 'link'],
      ['inverseFn', 'Inverse Functions', 'refresh'],
    ]),
    unit('pre', 'Unit 3', 'Sequences & series', C.purple, [
      ['arithSeq', 'Arithmetic Sequences', 'plus'],
      ['geoSeries', 'Geometric Series', 'sigma'],
    ]),
    unit('pre', 'Unit 4', 'Vectors & matrices', C.orange, [
      ['vectors', 'Vectors', 'vector'],
      ['matrixDet', 'Determinants', 'ruler'],
    ]),
    unit('pre', 'Unit 5', 'Toward calculus', C.red, [['limitIntro', 'Intro to Limits', 'target']]),
  ],
};

const calculusCourse: Course = {
  id: 'calc',
  title: 'Calculus',
  subtitle: 'Limits & change',
  icon: 'integral',
  color: C.red,
  units: [
    unit('calc', 'Unit 1', 'Limits', C.green, [
      ['limitIntro', 'Evaluating Limits', 'target'],
      ['limitFactor', 'Limits by Factoring', 'parens'],
      ['limitInfinity', 'Limits at Infinity', 'asymptote'],
    ]),
    unit('calc', 'Unit 2', 'Derivatives', C.blue, [
      ['derivPower', 'The Power Rule', 'target'],
      ['derivProduct', 'The Product Rule', 'times'],
      ['derivChain', 'The Chain Rule', 'link'],
      ['derivTrig', 'Trig & Exponential', 'wave'],
    ]),
    unit('calc', 'Unit 3', 'Applications', C.purple, [
      ['tangentLine', 'Tangent Lines', 'derivative'],
      ['criticalPoints', 'Critical Points', 'arc'],
    ]),
    unit('calc', 'Unit 4', 'Integrals', C.orange, [
      ['integralPower', 'Antiderivatives', 'integral'],
      ['definiteIntegral', 'Definite Integrals', 'chartBar'],
      ['uSub', 'U-Substitution', 'parens'],
      ['ftc', 'Fundamental Theorem', 'star'],
    ]),
  ],
};

const statsCourse: Course = {
  id: 'stat',
  title: 'Statistics',
  subtitle: 'Data & probability',
  icon: 'chartBar',
  color: C.yellow,
  units: [
    unit('stat', 'Unit 1', 'Describing data', C.green, [
      ['centerSpread', 'Center & Spread', 'chartBar'],
      ['zScore', 'Z-Scores', 'ruler'],
      ['correlation', 'Correlation', 'derivative'],
    ]),
    unit('stat', 'Unit 2', 'Probability', C.blue, [
      ['simpleProb', 'Basic Probability', 'dice'],
      ['probRules', 'Probability Rules', 'link'],
      ['expectedValue', 'Expected Value', 'coins'],
    ]),
    unit('stat', 'Unit 3', 'Counting', C.purple, [
      ['permComb', 'Permutations & Combinations', 'stairs'],
      ['binomial', 'Binomial Counting', 'coins'],
    ]),
    unit('stat', 'Unit 4', 'Inference', C.orange, [
      ['empiricalRule', 'The Normal Curve', 'bellCurve'],
      ['marginError', 'Standard Error', 'target'],
      ['samplingBias', 'Sampling & Bias', 'compare'],
    ]),
  ],
};

/* ---------------------------------------------------------------- SAT prep */

const satCourse: Course = {
  id: 'sat',
  title: 'SAT Prep',
  subtitle: 'Digital SAT math',
  icon: 'star',
  color: '#8B5CF6',
  units: [
    unit('sat', 'Unit 1', 'Algebra', C.green, [
      ['satSolveLinear', 'Linear Equations', 'equals'],
      ['satLinearWord', 'Modeling with Linear', 'book'],
      ['system2', 'Systems', 'matrix'],
      ['inequalityFlip', 'Inequalities', 'inequality'],
    ]),
    unit('sat', 'Unit 2', 'Problem solving & data', C.blue, [
      ['satPercentWord', 'Percents', 'percent'],
      ['satRateWord', 'Rates & Proportions', 'target', ['proportion']],
      ['satUnitConvert', 'Unit Conversion', 'ruler'],
      ['satTableData', 'Two-Way Tables', 'table'],
      ['satScatter', 'Scatterplots', 'derivative'],
      ['centerSpread', 'Statistics', 'chartBar'],
    ]),
    unit('sat', 'Unit 3', 'Advanced math', C.purple, [
      ['satFunctionNotation', 'Function Notation', 'functionF'],
      ['quadFormula', 'Quadratics', 'star'],
      ['factorTrinomial', 'Factoring', 'parens'],
      ['expRules', 'Exponents', 'triangle'],
      ['satExpGrowth', 'Exponential Growth', 'derivative'],
      ['rationalSimplify', 'Rational Expressions', 'divide'],
    ]),
    unit('sat', 'Unit 4', 'Geometry & trig', C.orange, [
      ['pythag', 'Right Triangles', 'angle'],
      ['satTrig', 'SOH-CAH-TOA', 'wave'],
      ['satCircleEq', 'Circles', 'circleShape'],
      ['volumeSolids', 'Volume', 'cube'],
      ['complexArith', 'Complex Numbers', 'complex'],
    ]),
  ],
};

// Every SAT skill also draws from the hand-written bank (satBank.ts), round-robin
// with its procedural generator. The check script fails on any skill the bank lacks.
for (const u of satCourse.units) for (const s of u.skills) s.gens.push(`bank.${s.gens[0]}`);

/* ------------------------------------------------------------------ export */

export const COURSES: Record<string, Course> = Object.fromEntries(
  [elementary, middle, algebra1, algebra2, geometryCourse, precalculus, calculusCourse, statsCourse, satCourse].map(
    (c) => [c.id, c],
  ),
);

export type Level = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  /** Single course => go straight to the path. Many => show a picker. */
  courses: string[];
};

export const LEVELS: Level[] = [
  { id: 'elementary', title: 'Elementary', subtitle: 'Grades K–5', icon: 'dots', color: C.green, courses: ['elem'] },
  { id: 'middle', title: 'Middle School', subtitle: 'Grades 6–8', icon: 'stairs', color: C.blue, courses: ['mid'] },
  {
    id: 'high',
    title: 'High School',
    subtitle: 'Grades 9–12',
    icon: 'functionF',
    color: C.orange,
    courses: ['alg1', 'geo', 'alg2', 'pre', 'calc', 'stat'],
  },
];

export const SAT_LEVEL: Level = {
  id: 'sat',
  title: 'SAT Prep',
  subtitle: 'Digital SAT math',
  icon: 'star',
  color: '#8B5CF6',
  courses: ['sat'],
};

/** Flat ordered skill list for a course — the path order. */
export const courseSkills = (course: Course): Skill[] => course.units.flatMap((u) => u.skills);

export const findSkill = (skillId: string): { course: Course; unit: Unit; skill: Skill } | undefined => {
  const courseId = skillId.split('.')[0];
  const course = COURSES[courseId];
  if (!course) return undefined;
  for (const u of course.units) {
    const skill = u.skills.find((s) => s.id === skillId);
    if (skill) return { course, unit: u, skill };
  }
  return undefined;
};
