/**
 * All persistent state. localStorage only — no accounts, no server.
 * Reactive via useSyncExternalStore so any component can read it.
 */

import { useSyncExternalStore } from 'react';
// Extension included so the Node-based self-check can resolve it too.
import { COURSES, LESSONS_PER_SKILL, courseSkills } from './courses.ts';

export type State = {
  /** skillId -> lessons completed (0..LESSONS_PER_SKILL) */
  progress: Record<string, number>;
  streak: number;
  /** Last day a lesson was finished, "YYYY-MM-DD". */
  lastDay: string | null;
  /** Every day a lesson was finished, for the calendar. */
  days: string[];
  totalLessons: number;
  /** Last course opened, so Learn reopens where you left off. */
  lastCourse: string | null;
};

const KEY = 'quantix.v1';

const EMPTY: State = {
  progress: {},
  streak: 0,
  lastDay: null,
  days: [],
  totalLessons: 0,
  lastCourse: null,
};

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<State>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

let state = load();
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private browsing / quota. In-memory state still works for this session.
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/**
 * `select` must return a stable value — a primitive, or an object already held
 * in state. Building a new array/object inside it re-renders forever.
 */
export const useStore = <T,>(select: (s: State) => T): T =>
  useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(EMPTY),
  );

export const getState = () => state;

/* ------------------------------------------------------------------- dates */

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

/** The streak as it should be *shown*: a missed day zeroes it out. */
export function currentStreak(s: State = state): number {
  if (!s.lastDay) return 0;
  const gap = dayDiff(s.lastDay, dayKey());
  return gap <= 1 ? s.streak : 0;
}

/** Streak after practising on `today`. Pure, so the date math is testable. */
export function nextStreak(lastDay: string | null, streak: number, today: string): number {
  if (lastDay === today) return streak;
  // Build yesterday from local date parts — Date.parse() would read the key as
  // UTC and land on the wrong day for anyone west of Greenwich.
  const [y, m, d] = today.split('-').map(Number);
  const yesterday = dayKey(new Date(y, m - 1, d - 1));
  return lastDay === yesterday ? streak + 1 : 1;
}

export const practicedToday = (s: State = state) => s.lastDay === dayKey();

/* ---------------------------------------------------------------- progress */

export const skillProgress = (skillId: string, s: State = state) => s.progress[skillId] ?? 0;
export const isSkillComplete = (skillId: string, s: State = state) =>
  skillProgress(skillId, s) >= LESSONS_PER_SKILL;

/** A skill unlocks when the one before it in the course is finished. */
export function isSkillUnlocked(skillId: string, s: State = state): boolean {
  const course = COURSES[skillId.split('.')[0]];
  if (!course) return false;
  const skills = courseSkills(course);
  const i = skills.findIndex((sk) => sk.id === skillId);
  if (i <= 0) return true;
  return isSkillComplete(skills[i - 1].id, s);
}

/** First unfinished skill in a course — where the "START" bubble sits. */
export function activeSkillId(courseId: string, s: State = state): string | undefined {
  const course = COURSES[courseId];
  if (!course) return undefined;
  const skills = courseSkills(course);
  return (skills.find((sk) => !isSkillComplete(sk.id, s)) ?? skills[skills.length - 1])?.id;
}

export function courseCompletion(courseId: string, s: State = state) {
  const skills = courseSkills(COURSES[courseId]);
  const done = skills.reduce((sum, sk) => sum + Math.min(skillProgress(sk.id, s), LESSONS_PER_SKILL), 0);
  return { done, total: skills.length * LESSONS_PER_SKILL, skills: skills.length };
}

/** Every skill the student has touched — the pool for mixed practice. */
export const startedSkillIds = (s: State = state) =>
  Object.keys(s.progress).filter((id) => s.progress[id] > 0);

/* ----------------------------------------------------------------- actions */

/** Shared by every "you did something today" action. */
function dayUpdate(): Partial<State> {
  const today = dayKey();
  return {
    streak: nextStreak(state.lastDay, state.streak, today),
    days: state.lastDay === today ? state.days : [...state.days, today].slice(-400),
    lastDay: today,
    totalLessons: state.totalLessons + 1,
  };
}

export function completeLesson(skillId: string) {
  set({
    ...dayUpdate(),
    progress: {
      ...state.progress,
      [skillId]: Math.min(skillProgress(skillId) + 1, LESSONS_PER_SKILL),
    },
  });
}

/** Practice sessions keep the streak alive but do not advance any skill. */
export const recordPractice = () => set(dayUpdate());

export const setLastCourse = (courseId: string) => set({ lastCourse: courseId });

export function resetAll() {
  state = EMPTY;
  localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}
