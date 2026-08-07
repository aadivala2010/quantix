# Quantix

Duolingo-style math practice. K–12 plus a separate SAT Prep section. Mobile-first,
no accounts, no server — progress and streak live in `localStorage`.

```bash
npm install
npm run dev     # http://localhost:5173
npm run check   # self-checks: question bank + streak/unlock logic
npm run build   # static site in dist/ — deploy anywhere
```

## Structure

| Path | What |
| --- | --- |
| `src/lib/generators.ts` | ~130 question generators. Each returns a fresh question every call, so lessons never repeat. |
| `src/lib/courses.ts` | The curriculum: levels → courses → units → skills. A skill points at generator ids. |
| `src/lib/store.ts` | localStorage state: progress, streak, unlocks. |
| `src/lib/fx.ts` | Sound and haptics. Every cue is synthesised from oscillators — no audio files. |
| `src/components/Icon.tsx` | The icon set. 24×24 grid, 2px round stroke, `currentColor`. No emoji anywhere structural. |
| `src/screens/` | Home, Path, Lesson, Practice, Profile. |

Motion tokens (`--ease-spring`, `--ease-glide`) and every keyframe live in `src/index.css`,
so the whole app shares one rhythm. All of it is disabled under `prefers-reduced-motion`.

## Adding a skill

1. Write a generator in `generators.ts` and add it to the section record.
2. Reference its id from a unit in `courses.ts`: `['myGen', 'Skill Name', '🎯']`.
3. `npm run check` — it verifies the generator's answer is among its own choices,
   that no distractor is secretly also correct, and that every skill points at a
   generator that exists.

Tuning knobs live at the top of `courses.ts`: `LESSONS_PER_SKILL` (4) and
`QUESTIONS_PER_LESSON` (8).
