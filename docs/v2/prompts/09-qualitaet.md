# Phase 09 – Qualität und Abschluss

## Aufgaben
1. **Tests aktualisieren:** `tests/e2e.spec.mjs` auf die neue Navigation und neue Texte umstellen (Hauptmenü mit fünf Einträgen, Treffen, Vorschlagen). Ergänze Tests für: Spiel filtern per URL, Treffen aus Vorlage erstellen und starten, Empire-Ablauf, Rollenverteiler (Karte nie doppelt sichtbar), Sicherung und Wiederherstellung, Zitattext zeichengenau, Übernahmeskript.
2. **Matrix prüfen:** 390, 768, 1024, 1280, 1920 px × hell und dunkel × Deutsch und Englisch × alle Routen. Kein horizontaler Überlauf, keine abgeschnittenen Texte (besonders lange deutsche Wörter), Screenshots in `docs/v2/screens/`.
3. **Barrierefreiheit:** axe-core über alle Routen ohne Verstöße der Stufe „serious“ oder „critical“, Tastatur-Durchlauf, Screenreader-Beschriftungen der Symbolknöpfe, Fokus nach Routenwechsel, `prefers-reduced-motion`.
4. **Kontrast:** `npm run contrast` ohne Verstöße.
5. **Leistung:** Lighthouse mobil: Leistung ≥ 90, Barrierefreiheit ≥ 95. Bundle-Größe pro Route im Bericht, große Datendateien (`data-*.js`) nur in der Route laden, die sie braucht.
6. **Offline:** Service Worker prüfen (neue Routen, Vorschlagsformular zeigt Offline-Hinweis), Cache-Version erhöhen.
7. **Übersetzungen:** Test, dass `de` und `en` exakt dieselben Schlüssel haben und keine leeren Werte. Inline-Texte per `tr()` müssen beide Sprachen enthalten (Lint-Regel oder Test).
8. **Aufräumen:** Obsolete Dateien löschen (`EmpireBoard.tsx`, `GameModal.tsx`-Stubs, ungenutzte Tokens und Übersetzungen), keine toten Routen.
9. **Abschlussbericht** `docs/v2/REPORT.md`: Was gebaut wurde, Screenshots, geänderte Dateien, offene Punkte und eine Liste **aller Entwurf-Inhalte** (Wirkung der Spiele, ergänzte Felder bei Projekten, Vorlagen im Treffen, Datenschutztext), die du prüfen musst.

## Akzeptanzkriterien
`npm run check`, `npm run build`, E2E-Tests, axe und Kontrastbericht sind grün. Der Bericht listet jede Abweichung vom Auftrag.
