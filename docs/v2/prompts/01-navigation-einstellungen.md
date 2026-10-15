# Phase 01 – Navigation, Suche, Einstellungen

## Ziel
Man findet in zwei Tipps alles Wichtige. Dienst und Kunst und Treffen sind im Hauptmenü. Einstellungen und Gemerkt sind jederzeit erreichbar.

## Ist-Zustand (Live-Seite)
- Untere Leiste auf Handy: Spiele, Zitate, Planer, Werkzeuge, Mehr. Dienst und Kunst, Gemerkt-Liste und Einstellungen stecken hinter „Mehr“ bzw. dem Lesezeichen oben.
- Die untere Leiste wird noch bei etwa 900 px Breite genutzt, dann wirkt sie auf Tablets und kleinen Laptops verloren.
- Kopfzeile: Logo, Suche, Gemerkt. Auf großen Bildschirmen Reiter mit Unterstrich.
- Fußzeile mit Impressum, Datenschutz, Copyright.

## Aufgaben
1. **Hauptmenü, fünf Einträge** (Reihenfolge fest): Spiele, Zitate, Dienst und Kunst, Treffen, Werkzeuge. Die Startseite erreicht man über das Logo. „Mehr“ entfällt. Route `/planner` bleibt als Weiterleitung auf `/treffen` bestehen (Phase 05), bis dahin zeigt „Treffen“ auf `/planner`.
2. **Handy (bis 1023 px):** untere Leiste mit fünf Einträgen. Aktiv: Symbol in einer Pille (accent-subtle) mit accent-text, Beschriftung darunter. Höhe 64 px plus Safe-Area. Über 1024 px: Reiter in der Kopfzeile, keine untere Leiste. Quer-Handy (niedrige Höhe) behält die schmale Seitenleiste, sie bekommt dieselben fünf Einträge.
3. **Kopfzeile:** links Logo und Name (Name ab 360 px sichtbar), rechts drei Symbolknöpfe: Suche, Gemerkt (mit Zähler), Einstellungen. Auf Desktop ersetzt ein Suchfeld mit Tastenkürzel den Suchknopf. Keine Beschriftung neben den Symbolen auf dem Handy.
4. **Suche (Befehlspalette):** neu stylen und alle Bereiche durchsuchen: Spiele, Zitate, Methoden, Dienstprojekte, Kunstideen, Werkzeuge, Seiten (Treffen, Gemerkt, Einstellungen). Ergebnisse gruppiert, Tastatur-Navigation, leerer Zustand mit einem Satz. Auf dem Handy als Vollbild-Sheet.
5. **Einstellungen als Sheet** (Handy: von unten, Desktop: Dialog rechts): Abschnitte „Darstellung“ (Hell, Dunkel, System als SegmentedControl), „Sprache“ (Deutsch, English), „Meine Gruppe“ (Namensliste, die alle Werkzeuge nutzen, Verlinkung aus Phase 06), „Daten“ (Sichern, Wiederherstellen, Alles löschen mit Bestätigung), „Über die Seite“ (Impressum, Datenschutz, Vorschlag einreichen, Version). Hinweis „Funktioniert offline“ mit Status, wenn der Service Worker aktiv ist.
6. **Gemerkt:** Seite `/saved` im neuen Muster (Phase 00), gruppiert nach Bereich, Zähler in der Kopfzeile. Jedes Lesezeichen überall gleich: Symbol Lesezeichen, gefüllt in accent bei „gemerkt“, `aria-pressed`.
7. **Zurück-Navigation:** auf jeder Detailseite oben links ein Zurück-Link mit dem Namen des Bereichs. Kein Browser-Zurück nötig.
8. **Fußzeile:** eine Zeile: Impressum · Datenschutz · Vorschlag einreichen · © Jahr Name. Auf dem Handy über der unteren Leiste ohne doppelten Abstand.
9. **Seitentitel und Sprachwechsel:** `DocumentHead` prüfen, `lang`-Attribut, Fokus springt nach Routenwechsel auf die H1 (Screenreader).

## Akzeptanzkriterien
- Von jeder Seite aus sind alle fünf Bereiche, Suche, Gemerkt und Einstellungen mit einem Tipp erreichbar.
- Bei 390, 768, 1024 und 1280 px kein Layoutsprung, keine doppelten Navigationen, nichts überlappt.
- Tastatur: Tab-Reihenfolge logisch, Escape schließt Sheet, Suche und Dialog.
- Sicherungsdatei enthält alle `jy_*`-Schlüssel (Test: sichern, löschen, wiederherstellen).

## Nicht anfassen
Inhalte der Seiten, Datenstrukturen, Zitate.
