/**
 * Sound and haptics. No audio files — every cue is synthesised on the fly with
 * a couple of oscillators, so the whole sound design costs zero bytes of assets
 * and zero network requests.
 */

const KEY = 'quantix.sound';

let ctx: AudioContext | null = null;
let muted = (() => {
  try {
    return localStorage.getItem(KEY) === 'off';
  } catch {
    return false;
  }
})();

export const isMuted = () => muted;

export function setMuted(next: boolean) {
  muted = next;
  try {
    localStorage.setItem(KEY, next ? 'off' : 'on');
  } catch {
    // Private browsing — the setting just won't survive a reload.
  }
}

/** Browsers only allow audio after a user gesture, so the context is lazy. */
function audio(): AudioContext | null {
  if (muted) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

type Note = { hz: number; at: number; len?: number; gain?: number; type?: OscillatorType };

function play(notes: Note[]) {
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  for (const n of notes) {
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    const len = n.len ?? 0.12;
    const peak = n.gain ?? 0.18;

    osc.type = n.type ?? 'sine';
    osc.frequency.value = n.hz;

    // Quick attack, exponential tail — a linear fade sounds like a click.
    amp.gain.setValueAtTime(0.0001, now + n.at);
    amp.gain.exponentialRampToValueAtTime(peak, now + n.at + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + n.at + len);

    osc.connect(amp).connect(ac.destination);
    osc.start(now + n.at);
    osc.stop(now + n.at + len + 0.02);
  }
}

/** Short vibration. Silently ignored on desktop and on iOS Safari. */
function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Not supported — haptics are a bonus, never a requirement.
  }
}

/* ------------------------------------------------------------------- cues */

export const fx = {
  /** Rising major third — reads as "yes". */
  correct() {
    play([
      { hz: 587.33, at: 0, len: 0.1 },
      { hz: 880, at: 0.06, len: 0.16 },
    ]);
    buzz(12);
  },

  /** Low, short, slightly detuned — wrong but not punishing. */
  wrong() {
    play([
      { hz: 196, at: 0, len: 0.16, type: 'triangle', gain: 0.14 },
      { hz: 185, at: 0.02, len: 0.16, type: 'triangle', gain: 0.12 },
    ]);
    buzz([18, 40, 18]);
  },

  /** Four-note arpeggio for finishing a lesson. */
  complete() {
    [523.25, 659.25, 783.99, 1046.5].forEach((hz, i) =>
      play([{ hz, at: i * 0.09, len: 0.28, gain: 0.16 }]),
    );
    buzz([14, 50, 14, 50, 26]);
  },

  /** Brighter, longer fanfare when a skill hits the crown. */
  crown() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((hz, i) =>
      play([{ hz, at: i * 0.075, len: 0.4, gain: 0.15, type: 'triangle' }]),
    );
    buzz([20, 40, 20, 40, 60]);
  },

  /** Tiny tick for selecting an answer. */
  tap() {
    play([{ hz: 440, at: 0, len: 0.045, gain: 0.07 }]);
  },
};
