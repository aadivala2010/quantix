import { useEffect, useMemo, useRef, useState } from 'react';
import { drawQuestions, isCorrect, type Question } from '../lib/generators';
import { DAILY_GOAL, LESSON_XP, LESSONS_PER_SKILL, QUESTIONS_PER_LESSON } from '../lib/courses';
import {
  completeLesson,
  currentStreak,
  getState,
  isSkillComplete,
  recordPractice,
  skillProgress,
  useStore,
  xpToday,
} from '../lib/store';
import { BADGES, earnedIds, type Badge } from '../lib/badges';
import { Ring } from '../components/Ring';
import { BadgeMedal } from '../components/BadgeMedal';
import { MathVisual } from '../components/MathVisual';
import { fx } from '../lib/fx';
import { Celebration } from '../components/Celebration';
import { Icon } from '../components/Icon';
import { Bolt, Flame } from '../components/StreakPill';
import { cx, useCountUp } from '../lib/ui';

type Props = {
  gens: string[];
  /** Omitted for mixed practice — practice keeps the streak but unlocks nothing. */
  skillId?: string;
  color: string;
  onExit: () => void;
};

type Result = 'correct' | 'wrong';

export function Lesson({ gens, skillId, color, onExit }: Props) {
  const [queue, setQueue] = useState<Question[]>(() => drawQuestions(gens, QUESTIONS_PER_LESSON));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [entry, setEntry] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  const [finished, setFinished] = useState(false);
  const [crowned, setCrowned] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [combo, setCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [goalFrom, setGoalFrom] = useState(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [startedAt] = useState(() => Date.now());
  const [seconds, setSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const question = queue[index];
  const answered = result !== null;
  const given = question?.choices ? (picked ?? '') : entry;
  const canCheck = given.trim().length > 0;
  const progress = Math.min(correct / QUESTIONS_PER_LESSON, 1);

  function check() {
    if (!canCheck || answered) return;
    const ok = isCorrect(given, question.answer);
    setResult(ok ? 'correct' : 'wrong');
    setAsked((a) => a + 1);
    if (ok) {
      setCorrect((c) => c + 1);
      setCombo((c) => c + 1);
      fx.correct();
    } else {
      // Missed questions come back at the end of the queue, like Duolingo.
      setQueue((q) => [...q, question]);
      setCombo(0);
      fx.wrong();
    }
  }

  function next() {
    if (index + 1 >= queue.length) {
      // A lesson that fills the last crown slot gets the bigger payoff.
      const earnedCrown = !!skillId && !isSkillComplete(skillId) && skillProgress(skillId) + 1 >= LESSONS_PER_SKILL;
      // Flawless lessons earn a bonus, like Duolingo's "perfect lesson".
      const earned = LESSON_XP + (asked === correct ? 5 : 0);
      const had = earnedIds(getState());
      setGoalFrom(xpToday());
      if (skillId) completeLesson(skillId, earned);
      else recordPractice(earned);
      setNewBadges(BADGES.filter((b) => b.earned(getState()) && !had.includes(b.id)));
      setXp(earned);
      setSeconds(Math.round((Date.now() - startedAt) / 1000));
      setCrowned(earnedCrown);
      setFinished(true);
      (earnedCrown ? fx.crown : fx.complete)();
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setEntry('');
    setResult(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  // Number keys pick a choice, like Duolingo on desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const choice = question?.choices?.[Number(e.key) - 1];
      if (!choice || answered || finished) return;
      setPicked(choice);
      fx.tap();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [question, answered, finished]);

  if (finished) {
    return (
      <Complete
        correct={correct}
        asked={asked}
        xp={xp}
        goalFrom={goalFrom}
        badges={newBadges}
        seconds={seconds}
        color={color}
        crowned={crowned}
        onDone={onExit}
      />
    );
  }

  if (!question) {
    return (
      <div className="wallpaper absolute inset-0 z-30 grid place-items-center p-8 text-center text-wolf">
        This skill has no questions yet.
        <button className="btn btn-tint btn-blue mt-4" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  const longPrompt = question.prompt.length > 46 || question.prompt.includes('\n');
  const numeric = /^-?[\d.]+$/.test(question.answer);

  return (
    <div
      className="wallpaper absolute inset-0 z-30 flex flex-col"
      style={{ '--accent': color, viewTransitionName: 'lesson' } as React.CSSProperties}
    >
      <div className="wash" />
      {/* ---- header: quit + progress */}
      <header className="pt-safe flex items-center gap-3 px-5 pb-2">
        <button
          onClick={() => (asked > 0 ? setConfirmQuit(true) : onExit())}
          aria-label="Quit lesson"
          className="glass press grid h-10 w-10 shrink-0 place-items-center rounded-full text-wolf"
        >
          <Icon name="close" className="h-4 w-4" strokeWidth={3} />
        </button>
        <div className="glass relative h-3 flex-1 rounded-full p-[3px]">
          {combo >= 2 && answered && (
            <span key={combo} className="animate-combo absolute -top-7 left-0 flex items-center gap-1 text-[0.8rem] font-semibold whitespace-nowrap text-fox-dark">
              <Flame className="h-4 w-4" /> {combo} in a row
            </span>
          )}
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-spring)]"
            style={{
              width: `${Math.max(progress * 100, 3)}%`,
              background: 'linear-gradient(90deg, var(--color-mask), var(--color-grass))',
              boxShadow: '0 0 10px -1px var(--color-grass)',
            }}
          />
        </div>
      </header>

      {/* ---- question */}
      <main key={index} className="animate-rise no-scrollbar flex-1 overflow-y-auto px-5 pt-4 pb-4">
        <p className="text-[0.95rem] font-medium text-wolf">{question.instruction}</p>
        {question.visual && <MathVisual visual={question.visual} />}

        {longPrompt ? (
          <div className="glass mt-4 rounded-[24px] p-5">
            <p className="text-[1.1rem] leading-relaxed font-medium whitespace-pre-line">{question.prompt}</p>
          </div>
        ) : (
          <p
            className={cx(
              'no-select mt-8 mb-4 text-center leading-tight font-bold tracking-tight text-balance whitespace-pre-line',
              question.prompt.length > 16 ? 'text-[1.85rem]' : 'text-[2.6rem]',
            )}
          >
            {/* Keep "(x, y)" pairs on one line. */}
            {question.prompt.replace(/\(([^()\n]*?), ([^()\n]*?)\)/g, '($1, $2)')}
          </p>
        )}

        {question.choices ? (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {question.choices.map((choice, ci) => (
              <button
                key={choice}
                disabled={answered}
                onClick={() => {
                  setPicked(choice);
                  fx.tap();
                }}
                data-state={
                  answered && choice === question.answer
                    ? 'correct'
                    : answered && choice === picked
                      ? 'wrong'
                      : picked === choice
                        ? 'selected'
                        : undefined
                }
                className="choice glass"
              >
                <kbd className="absolute top-2.5 left-2.5 hidden h-5 w-5 place-items-center rounded-md bg-swan font-display text-[0.65rem] font-semibold text-wolf sm:grid">
                  {ci + 1}
                </kbd>
                {choice}
              </button>
            ))}
          </div>
        ) : (
          <form
            className="mt-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (answered) next();
              else check();
            }}
          >
            <input
              ref={inputRef}
              value={entry}
              autoFocus
              disabled={answered}
              onChange={(e) => setEntry(e.target.value)}
              inputMode={numeric ? 'decimal' : 'text'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Your answer"
              aria-label="Your answer"
              className={cx(
                'answer-input glass',
                result === 'wrong' && 'animate-shake text-cardinal-dark shadow-[inset_0_0_0_2px_var(--color-cardinal)]!',
                result === 'correct' && 'text-grass-dark shadow-[inset_0_0_0_2px_var(--color-grass)]!',
              )}
            />
          </form>
        )}
      </main>

      {/* ---- footer: check / feedback sheet */}
      <footer
        className={cx('pb-safe px-5 pt-4', answered && 'glass glass-strong animate-slide-up rounded-t-[32px] pt-5')}
        style={
          answered
            ? { backgroundColor: `color-mix(in srgb, var(--color-${result === 'correct' ? 'grass' : 'cardinal'}) 14%, var(--glass-strong))` }
            : undefined
        }
      >
        {answered && (
          <div className="mb-4 flex items-center gap-3" role="status">
            <div
              className={cx(
                'animate-pop grid h-11 w-11 shrink-0 place-items-center rounded-full text-white',
                result === 'correct' ? 'bg-grass' : 'bg-cardinal',
              )}
            >
              <Icon name={result === 'correct' ? 'check' : 'close'} className="h-6 w-6" strokeWidth={3.2} />
            </div>
            <div className="min-w-0">
              <p className={cx('text-[1.35rem] font-bold', result === 'correct' ? 'text-grass-dark' : 'text-cardinal-dark')}>
                {result === 'correct' ? praise() : 'Not quite'}
              </p>
              {result === 'wrong' && (
                <p className="truncate text-[0.95rem] text-wolf">
                  Answer: <span className="font-semibold text-eel">{question.answer}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {answered ? (
          <button className={cx('btn btn-tint', result === 'correct' ? 'btn-green' : 'btn-red')} onClick={next} autoFocus>
            Continue
          </button>
        ) : (
          <button className={cx('btn', canCheck && 'btn-tint btn-blue')} disabled={!canCheck} onClick={check}>
            Check
          </button>
        )}
      </footer>

      {confirmQuit && (
        <div className="absolute inset-0 z-40 grid place-items-end bg-black/30 p-3 sm:place-items-center">
          <div className="glass glass-strong animate-slide-up w-full rounded-[34px] p-6 sm:max-w-sm" role="alertdialog" aria-label="Quit lesson?">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-swan" />
            <h2 className="text-center text-[1.35rem] font-bold">Quit this lesson?</h2>
            <p className="mt-1.5 mb-6 text-center text-wolf">Your progress in this lesson won&apos;t be saved.</p>
            <button className="btn btn-tint btn-blue" onClick={() => setConfirmQuit(false)}>
              Keep learning
            </button>
            <button className="btn mt-2 text-cardinal" onClick={onExit}>
              Quit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const PRAISE = ['Nice!', 'Great job!', 'Correct!', 'Awesome!', 'You got it!', 'Excellent!'];
const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

/* --------------------------------------------------------- finish screen */

function Complete({
  correct,
  asked,
  xp,
  goalFrom,
  badges,
  seconds,
  color,
  crowned,
  onDone,
}: {
  correct: number;
  asked: number;
  xp: number;
  /** Today's XP before this lesson, so the goal ring visibly closes. */
  goalFrom: number;
  badges: Badge[];
  seconds: number;
  color: string;
  crowned: boolean;
  onDone: () => void;
}) {
  const streak = useStore(currentStreak);
  const accuracy = useMemo(() => (asked ? Math.round((correct / asked) * 100) : 100), [correct, asked]);
  const tint = crowned ? '#ffb800' : color;
  const shownXp = useCountUp(xp, { delay: 450 });
  const shownAcc = useCountUp(accuracy, { delay: 540 });
  const goal = useCountUp(goalFrom + xp, { from: goalFrom, delay: 900, ms: 1200 });
  const goalMet = goal >= DAILY_GOAL;

  return (
    <div className="wallpaper absolute inset-0 z-30 flex flex-col" style={{ '--accent': tint } as React.CSSProperties}>
      <div className="wash" />
      <div className="no-scrollbar relative flex flex-1 flex-col items-center overflow-y-auto px-6 pt-[8dvh] text-center">
        <Celebration count={crowned ? 40 : 26} className="-mt-[40%]" />

        <div className="animate-pop relative">
          {/* coloured glow the orb floats above */}
          <div className="absolute -inset-8 -z-10 rounded-full opacity-50 blur-3xl" style={{ background: tint }} />
          <div className="animate-float">
            <div className="orb h-[120px]! w-[120px]!" style={{ '--tint': tint } as React.CSSProperties}>
              <Icon name={crowned ? 'crown' : 'check'} className="relative h-14 w-14" strokeWidth={crowned ? 2 : 2.6} />
            </div>
          </div>
        </div>

        <h1 className="mt-7 text-[2rem] font-bold">{crowned ? 'Skill mastered' : 'Lesson complete'}</h1>
        <p className="mt-1 text-wolf">{crowned ? 'You earned the crown for this skill.' : 'Nice work. See you tomorrow.'}</p>

        <div className="mt-7 grid w-full max-w-sm grid-cols-3 gap-2.5">
          <Stat label="XP earned" value={`+${shownXp}`} icon="bolt" tint="var(--color-bee-dark)" delay={0} />
          <Stat label={accuracy === 100 ? 'Perfect' : 'Accuracy'} value={`${shownAcc}%`} icon="target" tint="var(--color-grass-dark)" delay={90} />
          <Stat label="Time" value={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`} icon="timer" tint="var(--color-macaw)" delay={180} />
        </div>

        {/* daily goal ring + streak flame */}
        <div className="glass animate-rise mt-3 flex w-full max-w-sm items-center gap-4 rounded-[24px] p-4 text-left" style={{ animationDelay: '600ms' }}>
          <Ring value={goal / DAILY_GOAL} color="#ff9f0a" size={56} stroke={8}>
            {goalMet ? <Icon name="check" className="animate-pop h-5 w-5 text-fox" strokeWidth={3} /> : <Bolt className="h-5 w-5" />}
          </Ring>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{goalMet ? 'Daily goal met!' : 'Daily goal'}</p>
            <p className="text-[0.85rem] text-wolf tabular-nums">
              {Math.min(goal, DAILY_GOAL)} / {DAILY_GOAL} XP today
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Flame className="animate-grow h-9 w-9" />
            <span className="text-[0.8rem] font-semibold text-fox-dark tabular-nums">{streak} day{streak === 1 ? '' : 's'}</span>
          </div>
        </div>

        {badges.length > 0 && (
          <div className="glass animate-rise mt-3 w-full max-w-sm rounded-[24px] p-4" style={{ animationDelay: '900ms' }}>
            <p className="mb-3 text-[0.8rem] font-semibold tracking-wide text-wolf uppercase">
              New badge{badges.length > 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {badges.map((b, i) => (
                <div key={b.id} className="animate-grow flex w-20 flex-col items-center" style={{ animationDelay: `${1100 + i * 150}ms` }}>
                  <BadgeMedal badge={b} earned />
                  <p className="mt-1.5 text-[0.8rem] leading-tight font-semibold">{b.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="pb-safe px-5 pt-4">
        <button className="btn btn-tint btn-blue" onClick={onDone} autoFocus>
          Continue
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, tint, delay }: { label: string; value: string; icon: string; tint: string; delay: number }) {
  return (
    <div className="glass animate-rise rounded-[22px] px-2 py-3.5" style={{ animationDelay: `${350 + delay}ms` }}>
      <div className="flex items-center justify-center gap-1 text-[1.35rem] font-bold" style={{ color: tint }}>
        {icon === 'bolt' ? <Bolt /> : <Icon name={icon} className="h-5 w-5" strokeWidth={2.4} />}
        <span className="tabular-nums">{value}</span>
      </div>
      <p className="mt-0.5 text-[0.75rem] font-medium text-wolf">{label}</p>
    </div>
  );
}
