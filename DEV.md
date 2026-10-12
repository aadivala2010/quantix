# Dev cheat console

`src/lib/dev.ts`, loaded from `main.tsx` behind `import.meta.env.DEV` — it does
not exist in production builds.

Run `npm run dev`, open the browser console, type `qx.help()`.

## Commands

| Command | What it does |
| --- | --- |
| `qx.pass(id)` | Set every skill under `id` to complete |
| `qx.clear(id)` | Same targets, back to 0 |
| `qx.unlock(skillId)` | Complete everything *before* that skill so it opens next |
| `qx.streak(n)` | Fake an n-day streak ending today (fills the calendar too) |
| `qx.list()` | Level and course ids |
| `qx.list(courseId)` | Skill ids + titles in that course |
| `qx.state()` | Current store state |
| `qx.reset()` | Wipe all progress |
| `qx.help()` | This list |

## Targets

`pass` / `clear` take any of:

- a level id — `qx.pass('high')`
- a course id — `qx.pass('alg1')`
- a skill id — `qx.pass('alg1.quadratic')`
- `'*'` — the entire app

Level ids come from `LEVELS` in `src/lib/courses.ts` (`elementary`, `middle`,
`high`, …); course ids from `COURSES` (`elem`, `mid`, `alg1`, …). When unsure,
`qx.list()`.

## Examples

```js
qx.pass('high')             // all high-school courses done
qx.unlock('alg1.quadratic') // jump straight to that skill's bubble
qx.pass('alg1', 2)          // every alg1 skill half-finished (2 of 4 lessons)
qx.streak(30)               // 30-day streak + 30 calendar days
qx.reset()                  // back to a fresh install
```

## Notes

- Writes go through `set()` in `src/lib/store.ts`, so the UI re-renders
  immediately — no refresh needed.
- Everything lives in `localStorage` under `quantix.v1`; clearing site data is
  the same as `qx.reset()`.
- `qx.pass` clamps to `LESSONS_PER_SKILL` (4), so `qx.pass('alg1', 99)` is just
  "complete".
