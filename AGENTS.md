# JY Hub (jy-resource-hub) — Agent Brain

Shared by Antigravity and Claude Code (`CLAUDE.md` imports this file). Workspace tandem rules: `../AGENTS.md`.

Bilingual (DE/EN) resource hub for Bahá'í **junior youth animators and camps** (Ruhi Book 5 context): games,
scripture quotes with memorisation methods, discussion toolkits, a session builder and devotional songs.
Live at **https://jy-resource-hub.vercel.app** (Vercel project `jy-resource-hub`, auto-deploys `main`).
GitHub: `github.com/nurimodabber/jy-resource-hub`. Branch `main`.

## Commands
```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # tsc && vite build → dist/  (doubles as the type check)
npx tsc --noEmit  # type check only
```
No linter is configured. Before committing: `npm run build` must pass.

## Architecture
- React 18 + TypeScript + Vite 6 + Tailwind CSS v3 (`tailwind.config.js`, PostCSS), icons from `lucide-react`.
- **No router.** `src/App.tsx` holds `activeTab` (`games | quotes | planner | toolkits`) in `useState`, so
  nothing is deep-linkable yet. Language (`jy_lang`) and favorites (`jy_favorites`) persist in localStorage;
  the session builder does not.
- Views in `src/components/`: `GamesView` (+ `GameCard`, `GameModal`, `EmpireBoard`), `QuotesView`
  (+ interactive simulators in `components/quotes/`), `SessionBuilder`, `ToolkitsView`, `BahaiSongsModal`, `Navbar`, `Logo`.
- **All content lives in typed data files** `src/data/*.ts`; shapes in `src/types.ts`. Bilingual fields are
  `{de, en}` objects (`L`) or `{de: [], en: []}` (`LA`):
  - `quotes.ts` → `QUOTES_DATA: QuoteItem[]` (~51, grouped by JY text: Breezes of Confirmation, Walking the Straight Path, …)
  - `quoteMethods.ts` → `QUOTE_METHODS_DATA` (~50 memorisation methods, phase 1–3)
  - `games.ts` → `GAMES_DATA` · `songs.ts` → `DEVOTIONAL_SONGS_DATA` · `toolkits.ts` → `EMPIRE_PROMPTS`, `DISCUSSION_CARDS`, `CAMP_BEST_PRACTICES`
  - `translations.ts` → `UI_TRANSLATIONS.de/en` (UI strings; add both languages, keep key parity)
- Design: Apple-style tokens in `tailwind.config.js` (`apple.*`: bg `#f5f5f7`, text `#1d1d1f`, blue `#0071e3`),
  SF system stack + Playfair Display (Google Fonts). Prefer tokens over hard-coded hex values.

## Content rules
- Quotes: **100% DE/EN parity**, canonical wording from official translations (commit `53afb90`).
  Citation format in `source`: `Author (Work, locator)`, German titles on the DE side ("Botschaften aus Akka").
  Planned: structured `{work, ref, lesson}` fields and links to the Bahá'í-Bibliothek
  (`https://bahaibibliothek.vercel.app/#doc=<id>&p=<n>`), see the ecosystem plan in `../AGENTS.md`.
- `id`s on quotes, games and methods are stable slugs; don't rename them (favorites and future deep links depend on them).

## Gotchas (verified 2026-09-26)
- **Two deploy targets:** besides Vercel, `.github/workflows/deploy.yml` still publishes to GitHub Pages
  (`nurimodabber.github.io/jy-resource-hub/`), which serves an older build. `vite.config.ts` uses `base: './'`
  only because of Pages. Decision pending: drop Pages, then switch to `base: '/'`.
- Scratch/test SVGs (`scratch_*.svg`, `test_*.svg`, `public/test_emblem2.svg`) are tracked in git; the last one ships to production.
- The folder also holds ignored personal clutter (Google Takeout zip, `.rtfd` folder, `rtf_converted.txt`).
  Don't read, commit or move it without asking. Never read `.env.local`.
- `node_modules/` inside OneDrive is slow on first run (hydration). Mark the folder "Always keep on this device".
- Known a11y gaps: modals lack `role="dialog"`/Escape/focus trap, `GameCard` is a clickable `div`,
  search is hidden below `lg`, `#86868b` small text fails contrast, `<html lang>` doesn't follow the language toggle.
