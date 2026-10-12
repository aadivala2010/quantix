/**
 * Achievements. Derived from state on the fly, so there is nothing extra to
 * store and old saves earn whatever they already qualify for.
 */

import { COURSES, LESSONS_PER_SKILL } from './courses.ts';
import type { State } from './store.ts';

export type Badge = {
  id: string;
  title: string;
  detail: string;
  /** An Icon name, or 'flame' / 'bolt' for the custom glyphs. */
  icon: string;
  color: string;
  earned: (s: State) => boolean;
};

const mastered = (s: State) => Object.values(s.progress).filter((n) => n >= LESSONS_PER_SKILL).length;
const unitsDone = (s: State) =>
  Object.values(COURSES)
    .flatMap((c) => c.units)
    .filter((u) => u.skills.every((sk) => (s.progress[sk.id] ?? 0) >= LESSONS_PER_SKILL)).length;

export const BADGES: Badge[] = [
  { id: 'first', title: 'First steps', detail: 'Finish a lesson', icon: 'star', color: '#34c759', earned: (s) => s.totalLessons >= 1 },
  { id: 'streak3', title: 'On fire', detail: '3-day streak', icon: 'flame', color: '#ff9500', earned: (s) => s.best >= 3 },
  { id: 'streak7', title: 'Week strong', detail: '7-day streak', icon: 'flame', color: '#ff3b30', earned: (s) => s.best >= 7 },
  { id: 'streak30', title: 'Unstoppable', detail: '30-day streak', icon: 'flame', color: '#ff2d55', earned: (s) => s.best >= 30 },
  { id: 'crown1', title: 'Crowned', detail: 'Master a skill', icon: 'crown', color: '#ffb800', earned: (s) => mastered(s) >= 1 },
  { id: 'crown10', title: 'Royalty', detail: 'Master 10 skills', icon: 'crown', color: '#af52de', earned: (s) => mastered(s) >= 10 },
  { id: 'unit', title: 'Unit cleared', detail: 'Finish a whole unit', icon: 'trophy', color: '#5856d6', earned: (s) => unitsDone(s) >= 1 },
  { id: 'xp100', title: 'Century', detail: 'Earn 100 XP', icon: 'bolt', color: '#30b0c7', earned: (s) => s.xp >= 100 },
  { id: 'xp1000', title: 'Mathlete', detail: 'Earn 1,000 XP', icon: 'bolt', color: '#007aff', earned: (s) => s.xp >= 1000 },
  { id: 'lessons50', title: 'Dedicated', detail: 'Finish 50 lessons', icon: 'book', color: '#248a3d', earned: (s) => s.totalLessons >= 50 },
];

export const earnedIds = (s: State) => BADGES.filter((b) => b.earned(s)).map((b) => b.id);
