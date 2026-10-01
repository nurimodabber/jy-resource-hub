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
npm run build     # tsc && vite build → dist/  (doubles as type check)
npm run check     # tsc --noEmit && eslint src (type check + lint)
npx tsc --noEmit  # type check only
```
Before committing: `npm run check` and `npm run build` must pass.

## Architecture
- React 18 + TypeScript + Vite 6 + Tailwind CSS v3 (`tailwind.config.js`, PostCSS), icons from `lucide-react`.
- Single deploy target: Vercel (`base: '/'` in `vite.config.ts`, `vercel.json` rewrites for SPA routing).
- React Router (`react-router-dom`) with clean URLs (`/`, `/games/:id`, `/quotes/:id`, `/planner`, `/service-arts`, `/tools`, `/impressum`, `/datenschutz`) and legacy hash redirection (`#/games` → `/games`).
- Responsive Shell Architecture:
  - Phone portrait: fixed `BottomTabBar` (56px + safe-area) with 5 primary destinations (Home, Games, Quotes, Planner, More) and `MoreSheet` for secondary tools, settings and legal pages.
  - Phone landscape (`short:` / `<500px` height): slim 56px `LeftNavigationRail` + auto-collapsing compact header, providing >320px of vertical space and a 2-column game modal layout.
  - Desktop & Tablet: top segmented navigation bar + global Command Palette (`⌘K` fuzzy search across games, quotes, methods, service, arts, songs).
- Calm Home View ("Was brauchst du heute?"): 3-tap Quick Pick (group size, time, energy, no materials) with instant matches, "Surprise me", daily featured quote/method, and community stats.
- Design System: Dark mode (`ThemeContext` with light/dark/system), semantic CSS tokens (`--bg`, `--surface`, `--accent`), 12px absolute minimum typography floor, 44px coarse touch targets, and accessible primitives (`src/components/ui/` Dialog, Sheet, Button, IconButton, Chip, Badge, Card, etc.).
- Legal & Privacy: `ImpressumView` and `DatenschutzView` (GDPR compliant, zero cookies, zero external trackers, strict child safeguarding clause).
- Language (`jy_lang`) and favorites (`jy_favorites`) persist in localStorage; initial favorites start at `[]`. `<html lang>` dynamically updates on language toggle.
- Views in `src/components/`: `HomeView`, `GamesView` (+ `GameCard`, `GameModal`, `EmpireBoard`), `QuotesView` (+ interactive simulators in `components/quotes/`), `SessionBuilder`, `ServiceArtsView`, `ToolkitsView`, `ImpressumView`, `DatenschutzView`, `BahaiSongsModal`, `Navbar`, `BottomTabBar`, `LeftNavigationRail`, `MoreSheet`, `CommandPalette`.
- **All content lives in typed data files** `src/data/*.ts`; shapes in `src/types.ts`. Bilingual fields are
  `{de, en}` objects (`L`) or `{de: [], en: []}` (`LA`):
  - `quotes.ts` → `QUOTES_DATA: QuoteItem[]` (~51, grouped by JY text, lessons, and 8 general spiritual topics)
  - `quoteMethods.ts` → `QUOTE_METHODS_DATA` (~50 memorisation methods, phase 1–3)
  - `games.ts` → `GAMES_DATA` · `songs.ts` → `DEVOTIONAL_SONGS_DATA`
  - `serviceProjects.ts` → `SERVICE_PROJECTS_DATA` · `artsPrompts.ts` → `ARTS_PROMPTS_DATA`
  - `toolkits.ts` → `EMPIRE_PROMPTS`, `DISCUSSION_CARDS`, `CAMP_BEST_PRACTICES`
  - `translations.ts` → `UI_TRANSLATIONS.de/en` (UI strings; 100% key parity required)
- Counts are derived dynamically from data arrays (no hard-coded resource counts in views).
- Code splitting: manualChunks splits `vendor` (`react`, `react-dom`, `react-router-dom`), `lucide`, and `data`, keeping the initial entry chunk under 80 KB gzipped.

## Content rules
- Quotes: **100% DE/EN parity**, canonical wording from official translations (commit `53afb90`).
  Citation format in `source`: `Author (Work, locator)`, German titles on the DE side ("Botschaften aus Akka").
  Planned: structured `{work, ref, lesson}` fields and links to the Bahá'í-Bibliothek
  (`https://bahaibibliothek.vercel.app/#doc=<id>&p=<n>`).
- `id`s on quotes, games and methods are stable slugs; don't rename them (favorites, planner presets and deep links depend on them).
- Child safety: Accounts and contributions are for adults/animators only. Never collect personal data or photos of junior youth.

## Terminology & Glossary
- Sections: Start (`/`), Spiele (`/games`), Zitate (`/quotes`), Planer (`/planner`), Dienst & Kunst (`/service-arts`), Werkzeuge (`/tools`).
- Person: **Animator** (DE & EN) / **Animatoren** (DE Plural). Avoid "Gruppenleiter" or "Facilitator".
- Tools: **Empire Spielleitung** (avoid "Empire-Spiel Assistent").
- Core actions: "Schnell finden", "Zum Plan hinzufügen", "Ablauf durchführen", "Üben", "Lieder". No Denglish ("Blitz-Finder", "Songs", "Interaktives Studio", "Feld-Tools").

## Gotchas & Notes
- Single deployment target: Vercel auto-deploys `main`. GitHub Pages workflow deleted.
- Scratch and test SVGs removed from git and public directory.
- The folder holds ignored personal clutter (Google Takeout zip, `.rtfd` folder, `rtf_converted.txt`).
  Don't read, commit or move it without asking. Never read `.env.local`.
- `node_modules/` inside OneDrive is slow on first run (hydration). Mark the folder "Always keep on this device".

