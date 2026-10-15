# AGENTS.md – Junior Youth Hub (Version 2)

Dieses Projekt ist eine Webseite für Animatoren von Bahá'í-Juniorjugendgruppen: Spiele, heilige Zitate, Dienst- und Kunstprojekte, Treffen-Planung und Werkzeuge für live in der Gruppe. Nutzung: auf dem Handy live, am Laptop zur Vorbereitung, per Beamer in der Gruppe.

## Stack und Befehle
React 18, TypeScript, Vite 6, Tailwind CSS v3, react-router-dom 7, lucide-react. Kein Backend (Ausnahme: Phase 08, eine Vercel-Funktion). Vercel veröffentlicht `main` automatisch.

- Vor jedem Commit: `npm run check` und `npm run build` müssen fehlerfrei laufen.
- Branch `redesign-v2`, ein Commit pro Phase, Pull Request für die Vorschau-Adresse. Nie direkt auf `main`.

## Harte Regeln
1. **Heilige Texte:** `src/data/quotes.ts` (QUOTES_DATA) wird nie bearbeitet, gekürzt, umformuliert oder automatisch ergänzt. Zitate werden ehrfürchtig dargestellt: Serifenschrift (Lora), ruhiger Hintergrund, keine Farbcodierung, keine Emojis, keine Spielelemente direkt am Text.
2. **Entwürfe:** Alles Inhaltliche, was du neu schreibst, bekommt `status: 'draft'` und wird in der Abschlussmeldung aufgelistet. Nichts davon gilt als freigegeben.
3. **Stabile IDs:** Bestehende `id`-Werte (Spiele, Zitate, Projekte) nie umbenennen. Nutzer haben sie in `jy_favorites` und `jy_plans` gespeichert.
4. **Sprache:** Deutsch zuerst, Englisch muss weiter funktionieren. Alle UI-Texte kommen entweder aus `src/data/translations.ts` (typisiert: `de` ist die Quelle, `en` ist `Record<TKey,string>`, fehlende Schlüssel sind Compile-Fehler) oder aus dem Helfer `tr(language)(de, en)` in `src/components/tools/common.tsx`. Nie nur eine Sprache.
5. **Begriffe:** „Animator“/„Animatoren“, „Juniorjugend“, „Spielleitung“. Kein Denglisch („Toolkit“, „Quick Pick“, „Board“). Du-Form, kurze aktive Sätze, keine Marketing-Sprache, keine Ausrufezeichen.
6. **Daten:** Alles, was die Seite speichert, liegt in `localStorage` unter `jy_*`-Schlüsseln und muss in `src/utils/backup.ts` mitgesichert werden. Keine Cookies, kein Tracking, keine externen Schriften oder Skripte.
7. **Barrierefreiheit:** Kontrast mindestens WCAG AA (4,5:1 Text, 3:1 Bedienelemente), Touch-Ziele mindestens 44 px, sichtbarer Fokus, `prefers-reduced-motion` respektieren, jede Funktion per Tastatur erreichbar.
8. **Kein KI-Look:** keine Verläufe, kein Glas-Effekt, kein Glühen, keine Emojis als Dekoration, keine Pillen-Beschriftungen über Überschriften („✨ Neu“), keine Karten in Karten, keine Fantasie-Namen für Funktionen.

## Designsystem (verbindlich, Details in `prompts/00-design-system.md`)
Richtung „frisch und freundlich“: helle kühle Flächen, eine kräftige blaue Akzentfarbe, große Rundungen (Karten 20 px, Bedienelemente 14 px, Chips voll rund), weiche Flächen statt harter Linien, großzügiger Weißraum, eine Sans-Schrift (Figtree), Serif nur für heilige Texte. Alle Werte stehen als CSS-Variablen in `src/index.css` und werden in `tailwind.config.js` referenziert. Kein Bauteil enthält feste Farb- oder Radiuswerte.

## Arbeitsweise
- Lies zuerst `prompts/README.md` und arbeite die Phasen in der dort genannten Reihenfolge ab.
- Prüfe jede Phase im Browser bei 390, 768 und 1280 px, hell und dunkel, Deutsch und Englisch, und mache Screenshots.
- Ändere nichts außerhalb des Auftrags der jeweiligen Phase. Wenn etwas unklar ist, frage, statt zu raten.
