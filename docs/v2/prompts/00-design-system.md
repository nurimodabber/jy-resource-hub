# Phase 00 – Designsystem „frisch und freundlich“

## Ziel
Die Seite soll hell, freundlich und modern wirken statt beige und altmodisch. Funktion und Einfachheit bleiben. Ein einziges Designsystem für alle Bereiche, vollständig über Tokens gesteuert.

## Ist-Zustand
Warmes Beige (#F6F5F2) mit Ziegelorange (#B4540A), Radien 6/8/10/12 px, keine Schatten, Rahmen um fast alles. Das wirkt streng und alt. Tokens liegen in `src/index.css`, Tailwind-Mapping in `tailwind.config.js`, Primitive in `src/components/ui/`.

## Aufgaben
1. **Tokens ersetzen** in `src/index.css` (hell und dunkel). Startwerte, bitte per Skript auf WCAG AA prüfen und bei Bedarf nachziehen:

   | Token | Hell | Dunkel |
   |---|---|---|
   | bg | #F7F9FC | #0E1626 |
   | surface | #FFFFFF | #162036 |
   | surface-2 (Eingabe, Chip, sanfte Fläche) | #EEF2F8 | #1E2A44 |
   | border (sparsam) | #E3E8F0 | #2A3858 |
   | text | #142033 | #EEF2FA |
   | text-secondary | #4A5568 | #AAB6CC |
   | text-tertiary | #667085 | #8D9AB3 |
   | accent | #1F6FEB | #6FA3FF |
   | accent-hover | #1859C4 | #8DB8FF |
   | accent-subtle | #E8F0FE | #1B2E55 |
   | accent-text (Text auf accent-subtle) | #1850B8 | #A9C8FF |
   | accent-contrast (Text auf accent) | #FFFFFF | #0A1426 |
   | highlight (nur kleine Markierungen, z. B. Punkt „heute“) | #F5B82E | #F5B82E |
   | success | #1E8E5A | #4FC08A |
   | danger | #C73E3E | #FF8A8A |

   Prüfe das Logo (`public/logo.png`). Passt das Blau nicht dazu, wähle das Logo-Blau und begründe es im Commit.
2. **Rundungen:** Chips und Tags voll rund (999 px), Bedienelemente und Eingaben 14 px, Karten 20 px, Bottom-Sheets oben 28 px, Dialoge 24 px. Als Variablen `--r-chip`, `--r-control`, `--r-card`, `--r-sheet`.
3. **Flächen statt Linien:** Karten sind weiß auf dem getönten Hintergrund mit `--shadow-1: 0 1px 2px rgba(20,32,51,.06)` und ohne Rahmen. Eingaben und Chips haben eine getönte Füllung (surface-2) ohne Rahmen. Rahmen nur bei Trennlinien in Listen und bei Fokus. Overlays und angehobene Karten bei Hover/Tipp: `--shadow-2: 0 8px 24px rgba(20,32,51,.08)`. Keine weiteren Schatten.
4. **Typografie:** Figtree bleibt. Skala: H1 32/40 (mobil 28/36), H2 22/30, H3 18/26, Text 16/26, klein 14/20, kleinste 13/18. Überschriften 700, Text 400/500. Zahlen mit `tabular-nums`. Lora nur für heilige Texte (Zitate, Gebete). Keine Monospace-Schrift.
5. **Abstände:** 8-Punkt-Raster. Seitenrand mobil 16 px, ab 768 px 24 px. Inhaltsbreite: Listen max. 1120 px, Lesetext max. 680 px. Abstand zwischen Abschnitten 40 px, zwischen Karten 12 bis 16 px.
6. **Bauteile neu stylen** in `src/components/ui/` und `src/components/tools/common.tsx`: Button (primär gefüllt in accent, sekundär in surface-2, ghost), IconButton, Chip (aus: surface-2; an: accent-subtle mit accent-text, kein Rahmen), SegmentedControl (Pille mit weißem Schieber auf surface-2), Eingabefeld, Auswahl, Schalter statt Checkbox für Ein/Aus-Optionen, Stepper, Karte (Variante „Liste“ mit Trennlinien und Variante „Kachel“), Tag, EmptyState (ein Satz, eine Aktion, ein Symbol in einem getönten Kreis), Toast, Sheet, Dialog, Skeleton für Ladezustände.
7. **Symbole:** lucide-react, Strichstärke 1,75, in getönten Kreisen (40 px, accent-subtle) dort, wo sie einen Bereich oder ein Werkzeug markieren. Keine Emojis.
8. **Bewegung:** 150 ms ease-out für Farbe und Hover, 220 ms für Sheets. Alles abschalten bei `prefers-reduced-motion`.
9. **Seitenaufbau-Muster** (für alle Bereiche gleich): H1 und ein Satz Beschreibung, darunter eine Zeile mit Suche und Filter-Knopf, darunter der Inhalt. Keine große Kopfkarte um diese Elemente.
10. **Dokumentation:** Lege `docs/design-system.md` an mit Tokens, Bauteilen und je einem Beispiel. Ergänze eine Datei `src/components/ui/Gallery.tsx` hinter der Route `/_design` (nur im Dev-Modus), die alle Bauteile hell und dunkel zeigt.

## Akzeptanzkriterien
- Kein festes Hex, kein fester `rounded-*`-Wert und kein `shadow-*` außerhalb der Tokens in Komponenten (per `grep` nachweisen).
- Kontrastbericht (Skript im Repo, `npm run contrast`) ohne Verstöße in hell und dunkel.
- Alle bestehenden Seiten laufen weiter und übernehmen automatisch die neue Optik, auch Zitate, Planer und Dienst und Kunst.
- Screenshots der Galerie in hell und dunkel liegen in `docs/v2/screens/00/`.

## Nicht anfassen
`src/data/quotes.ts`, Routen, Datenstrukturen.
