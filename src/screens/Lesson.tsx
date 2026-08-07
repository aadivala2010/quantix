import { useMemo, useRef, useState } from 'react';
import { drawQuestions, isCorrect, type Question } from '../lib/generators';
import { LESSONS_PER_SKILL, QUESTIONS_PER_LESSON } from '../lib/courses';
import {
  completeLesson,
  currentStreak,
  isSkillComplete,
  recordPractice,
  skillProgress,
  useStore,
} from '../lib/store';
import { fx } from '../lib/fx';
import { Celebration } from '../components/Celebration';
import { Mascot, SpeechBubble } from '../components/Mascot';
import { Icon } from '../components/Icon';
import { Flame } from '../components/StreakPill';
import { cx } from '../lib/ui';

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
      fx.correct();
    } else {
      // Missed questions come back at the end of the queue, like Duolingo.
      setQueue((q) => [...q, question]);
      fx.wrong();
    }
  }

  function next() {
    if (index + 1 >= queue.length) {
      // A lesson that fills the last crown slot gets the bigger payoff.
      const earnedCrown = !!skillId && !isSkillComplete(skillId) && skillProgress(skillId) + 1 >= LESSONS_PER_SKILL;
      if (skillId) completeLesson(skillId);
      else recordPractice();
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

  if (finished) {
    return <Complete correct={correct} asked={asked} color={color} crowned={crowned} onDone={onExit} />;
  }

  if (!question) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-white p-8 text-center text-wolf">
        This skill has no questions yet.
        <button className="btn btn-blue mt-4" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  const longPrompt = question.prompt.length > 46 || question.prompt.includes('\n');
  const numeric = /^-?[\d.]+$/.test(question.answer);

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-white">
      {/* ---- header: quit + progress */}
      <header className="pt-safe flex items-center gap-3 px-4 pb-2">
        <button
          onClick={() => (asked > 0 ? setConfirmQuit(true) : onExit())}
          aria-label="Quit lesson"
          className="shrink-0 p-1 text-hare active:scale-90"
        >
          <Icon name="close" className="h-7 w-7" strokeWidth={3.5} />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-swan">
          <div
            className="relative h-full rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(progress * 100, 2)}%`, background: color }}
          >
            <span className="absolute inset-x-1.5 top-[3px] h-1 rounded-full bg-white/30" />
          </div>
        </div>
      </header>

      {/* ---- question */}
      <main className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
        <h1 className="mt-2 text-xl font-extrabold text-eel">{question.instruction}</h1>

        {longPrompt ? (
          <div className="mt-5 flex items-start gap-2">
            <div className="shrink-0">
              <Mascot size={64} color={color} />
            </div>
            <SpeechBubble>
              <p className="text-[1.05rem] leading-relaxed font-bold whitespace-pre-line">{question.prompt}</p>
            </SpeechBubble>
          </div>
        ) : (
          <p className="no-select mt-8 mb-2 text-center text-4xl font-extrabold tracking-tight whitespace-pre-line text-eel">
            {question.prompt}
          </p>
        )}

        {question.choices ? (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {question.choices.map((choice) => (
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
                className="choice"
              >
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
              placeholder="Type your answer"
              aria-label="Your answer"
              className={cx(
                'answer-input',
                result === 'wrong' && 'animate-shake border-cardinal text-cardinal',
                result === 'correct' && 'border-mask text-grass-dark',
              )}
            />
          </form>
        )}
      </main>

      {/* ---- footer: check / feedback */}
      <footer
        className={cx(
          'pb-safe border-t-2 px-4 pt-4',
          !answered && 'border-swan bg-white',
          result === 'correct' && 'animate-slide-up border-transparent bg-[#d7ffb8]',
          result === 'wrong' && 'animate-slide-up border-transparent bg-[#ffdfe0]',
        )}
      >
        {answered && (
          <div className="mb-3 flex items-center gap-3">
            <div
              className={cx(
                'grid h-9 w-9 shrink-0 place-items-center rounded-full',
                result === 'correct' ? 'bg-grass-dark text-white' : 'bg-cardinal-dark text-white',
              )}
            >
              <Icon name={result === 'correct' ? 'check' : 'close'} className="h-5 w-5" strokeWidth={3.5} />
            </div>
            <div className="min-w-0">
              <p
                className={cx(
                  'text-lg font-extrabold',
                  result === 'correct' ? 'text-grass-dark' : 'text-cardinal-dark',
                )}
              >
                {result === 'correct' ? praise() : 'Correct answer:'}
              </p>
              {result === 'wrong' && (
                <p className="truncate text-base font-bold text-cardinal-dark">{question.answer}</p>
              )}
            </div>
          </div>
        )}

        {answered ? (
          <button
            className={cx('btn', result === 'correct' ? 'btn-green' : 'btn-red')}
            onClick={next}
            autoFocus
          >
            Continue
          </button>
        ) : (
          <button className={cx('btn', canCheck ? 'btn-green' : '')} disabled={!canCheck} onClick={check}>
            Check
          </button>
        )}
      </footer>

      {confirmQuit && (
        <div className="absolute inset-0 z-40 grid place-items-end bg-black/40 sm:place-items-center">
          <div className="animate-slide-up w-full rounded-t-3xl bg-white p-6 sm:max-w-sm sm:rounded-3xl">
            <div className="mb-4 flex justify-center">
              <Mascot size={80} color={color} mood="sad" />
            </div>
            <h2 className="text-center text-xl font-extrabold">Wait, don't go!</h2>
            <p className="mt-2 mb-5 text-center font-bold text-wolf">
              You'll lose your progress in this lesson if you quit now.
            </p>
            <button className="btn btn-red" onClick={onExit}>
              Quit lesson
            </button>
            <button className="btn btn-white mt-3" onClick={() => setConfirmQuit(false)}>
              Keep learning
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
  color,
  crowned,
  onDone,
}: {
  correct: number;
  asked: number;
  color: string;
  crowned: boolean;
  onDone: () => void;
}) {
  const streak = useStore(currentStreak);
  const accuracy = useMemo(() => (asked ? Math.round((correct / asked) * 100) : 100), [correct, asked]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-white">
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Celebration count={crowned ? 40 : 26} className="-mt-24" />

        <div className="animate-pop relative">
          {crowned && (
            <div className="absolute -inset-6 -z-10 rounded-full bg-bee/25 blur-2xl" />
          )}
          {crowned ? (
            <div className="grid h-[140px] w-[140px] place-items-center rounded-full bg-bee text-white shadow-[0_8px_0_var(--color-bee-dark)]">
              <Icon name="crown" className="h-20 w-20" strokeWidth={2} />
            </div>
          ) : (
            <Mascot size={140} color={color} mood="cheer" />
          )}
        </div>

        <h1 className="mt-6 text-3xl font-extrabold text-bee-dark">
          {crowned ? 'Skill mastered!' : 'Lesson complete!'}
        </h1>
        <p className="mt-2 font-bold text-wolf">
          {crowned ? 'You earned the crown for this skill.' : 'Keep it up — come back tomorrow.'}
        </p>

        <div className="mt-8 grid w-full max-w-sm grid-cols-2 gap-3">
          <Stat label="Streak" value={`${streak}`} icon="flame" color="#ff9600" />
          <Stat label="Accuracy" value={`${accuracy}%`} icon="target" color="#1cb0f6" />
        </div>
      </div>
      <div className="pb-safe px-4 pt-4">
        <button className="btn btn-green" onClick={onDone} autoFocus>
          Continue
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="rounded-2xl border-2 p-[2px]" style={{ borderColor: color }}>
      <div className="rounded-xl py-1 text-xs font-extrabold tracking-wide text-white uppercase" style={{ background: color }}>
        {label}
      </div>
      <div className="flex items-center justify-center gap-1.5 py-3 text-2xl font-extrabold" style={{ color }}>
        {icon === 'flame' ? <Flame className="h-6 w-6" /> : <Icon name={icon} className="h-6 w-6" strokeWidth={2.4} />}
        <span className="tabular-nums">{value}</span>
      </div>
    </div>
  );
}
