import { useState } from 'react';
import { BottomNav, type Tab } from './components/BottomNav';
import { COURSES, LEVELS, SAT_LEVEL, type Level, type Skill, type Unit } from './lib/courses';
import { getState, setLastCourse } from './lib/store';
import { CoursePicker, Home } from './screens/Home';
import { Lesson } from './screens/Lesson';
import { Path } from './screens/Path';
import { Practice, type PracticeStart } from './screens/Practice';
import { Profile } from './screens/Profile';
import { transition } from './lib/ui';

type LessonConfig = { title: string; gens: string[]; skillId?: string; color: string };

const levelOf = (courseId: string): Level | null =>
  [...LEVELS, SAT_LEVEL].find((l) => l.courses.includes(courseId)) ?? null;

export default function App() {
  const [tab, setTab] = useState<Tab>('learn');
  // Reopen wherever the student left off.
  const [courseId, setCourseId] = useState<string | null>(() => {
    const last = getState().lastCourse;
    return last && COURSES[last] ? last : null;
  });
  const [level, setLevel] = useState<Level | null>(() => {
    const last = getState().lastCourse;
    return last && COURSES[last] ? levelOf(last) : null;
  });
  const [lesson, setLesson] = useState<LessonConfig | null>(null);

  function openCourse(id: string) {
    setCourseId(id);
    setLastCourse(id);
  }

  function pickLevel(l: Level) {
    setLevel(l);
    if (l.courses.length === 1) openCourse(l.courses[0]);
  }

  function backFromPath() {
    setCourseId(null);
    if (!level || level.courses.length <= 1) setLevel(null);
  }

  // Lessons open and close as View Transitions: a path node morphs into the
  // lesson (see Path's `onStart`), everything else cross-fades.
  function startSkill(skill: Skill, unit: Unit, from?: Element | null) {
    transition(() => setLesson({ title: skill.title, gens: skill.gens, skillId: skill.id, color: unit.color }), from);
  }

  const startPractice = (p: PracticeStart) => transition(() => setLesson(p));

  function openFromHome(id: string) {
    setLevel(levelOf(id));
    openCourse(id);
  }

  return (
    // `relative` makes this the positioning context for the lesson overlay and
    // modals, so they stay inside the phone-width shell on desktop.
    // On wider screens the app floats as a spatial window over the wallpaper.
    <>
      <div className="aurora" aria-hidden="true" />
      <div className="relative mx-auto flex h-[100dvh] max-w-[480px] flex-col overflow-hidden sm:my-[3dvh] sm:h-[94dvh] sm:rounded-[44px] sm:bg-white/25 sm:shadow-[0_30px_80px_-20px_rgb(20_30_80/0.35),inset_0_0_0_1px_rgb(255_255_255/0.5)] dark:sm:bg-white/5 dark:sm:shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8),inset_0_0_0_1px_rgb(255_255_255/0.12)]">
        <main className="min-h-0 flex-1">
          {tab === 'learn' &&
            (courseId ? (
              <Path courseId={courseId} onStart={startSkill} onBack={backFromPath} />
            ) : level ? (
              <CoursePicker level={level} onPick={openCourse} onBack={() => setLevel(null)} />
            ) : (
              <Home onPick={pickLevel} onOpenCourse={openFromHome} onStart={startSkill} />
            ))}
          {tab === 'practice' && <Practice onStart={startPractice} />}
          {tab === 'profile' && <Profile />}
        </main>

        <BottomNav tab={tab} onChange={setTab} />

        {lesson && (
          <Lesson
            key={lesson.title + (lesson.skillId ?? '')}
            gens={lesson.gens}
            skillId={lesson.skillId}
            color={lesson.color}
            onExit={() => transition(() => setLesson(null))}
          />
        )}
      </div>
    </>
  );
}
