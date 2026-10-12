import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Run a state change as a View Transition. Pass `from` to have that element
 * morph into the lesson screen (which carries `view-transition-name: lesson`);
 * otherwise the screens cross-fade. Plain update where unsupported.
 */
export function transition(update: () => void, from?: Element | null) {
  if (!document.startViewTransition || calm()) return update();
  const el = from as HTMLElement | null | undefined;
  if (el) el.style.viewTransitionName = 'lesson';
  document.startViewTransition(() => {
    if (el) el.style.viewTransitionName = '';
    flushSync(update);
  });
}

/**
 * visionOS-style hover: the element tilts toward the pointer and its
 * highlight follows it. Pair with the `.tilt` class.
 */
export const tilt = {
  onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - y) * 14}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
    el.style.setProperty('--hx', `${x * 100}%`);
    el.style.setProperty('--hy', `${y * 100}%`);
  },
  onPointerLeave(e: React.PointerEvent<HTMLElement>) {
    for (const p of ['--rx', '--ry', '--hx', '--hy']) e.currentTarget.style.removeProperty(p);
  },
};

/** Count from `from` up to `to` once, after `delay` ms. */
export function useCountUp(to: number, { from = 0, delay = 0, ms = 900 } = {}) {
  const [n, setN] = useState(calm() ? to : from);
  useEffect(() => {
    if (calm()) return;
    let raf = 0;
    const start = performance.now() + delay;
    const step = (t: number) => {
      const p = Math.min(Math.max((t - start) / ms, 0), 1);
      setN(Math.round(from + (to - from) * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, from, delay, ms]);
  return n;
}
