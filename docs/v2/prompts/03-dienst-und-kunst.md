# Phase 03 – Dienst und Kunst

## Ziel
Dienstprojekte und kreative Aktivitäten sehen aus und funktionieren wie Spiele, sind im Hauptmenü erreichbar und lassen sich in ein Treffen oder einen Camp-Abend einbauen.

## Ist-Zustand (Live-Seite)
- Nur über „Mehr“ erreichbar.
- Kopfkarte mit Titel, Segment „Alle / Dienst / Kunst“, Suche und Filter in einem Rahmen. Darunter zweispaltige Karten mit zwei kleinen Etiketten („Dienstprojekt“, „1 Nachmittag (90–120 Min)“), Titel, drei Zeilen Text, „4 Schritte“ und „Details ansehen →“.
- Karten haben ungleiche Höhen. Dauer steht als Fließtext in Klammern.
- Der Aufbau unterscheidet sich von Spielen und Werkzeugen.

## Aufgaben
1. **Seitenmuster wie Phase 02:** H1 „Dienst und Kunst“, ein Satz, Zeile mit Suche und Filter, darunter Segment „Alle · Dienst · Kunst“, dann die Liste. Keine Kopfkarte.
2. **Daten angleichen** (`serviceProjects.ts`, `artsPrompts.ts`, `types.ts`), ohne IDs zu ändern: gemeinsame Felder `kind: 'dienst' | 'kunst'`, `durationMin`, `durationMax` (Zahlen), `groupSize` (min/max), `materials`, `setting` (`drinnen | draussen | beides`), `occasion` (`treffen | camp | beides`). Für Kunst zusätzlich `artForm` (vorhanden), für Dienst `category` (vorhanden). Fehlende Werte als Entwurf ergänzen und auflisten.
3. **Karte:** Titel, Untertitel (Kategorie oder Kunstform) in text-secondary, Meta-Zeile mit Symbolen (Uhr mit Dauer, Personen, Draußen/Drinnen), rechts oben Lesezeichen. Ein Tag maximal („Dienst“ oder „Kunst“ als Symbol im getönten Kreis links, kein Textetikett). Gleich hohe Karten, 1 Spalte Handy, 2 ab 768, 3 ab 1120.
4. **Filter-Sheet:** Dauer, Personenzahl, Draußen/Drinnen, „Für Camp geeignet“, Kategorie oder Kunstform. Aktive Filter als Chips.
5. **Detailseite** (eine Vorlage für beide Arten): Titel, Meta-Chips, feste Aktionsleiste („Zum Treffen“, Merken, Mehr). Abschnitte: Ziel, Material, Schritte (abhakbar), Reflexionsfragen (einklappbar), Tipps für Animatoren, Verbindung zu Zitaten (wenn `book` oder Thema vorhanden: Link auf passende Zitate, ohne Textkopie). Druckansicht auf einer bis zwei Seiten.
6. **Camp-Bausteine:** Aktivitäten mit `occasion: camp|beides` erscheinen in einer Rubrik „Für Camps“ oben in der Liste (Filter vorbelegbar über `?camp=1`). Phase 05 nutzt sie für die Abendprogramm-Vorlagen.
7. **Leere Zustände und Fehler** wie Phase 02.

## Akzeptanzkriterien
- Aufbau, Karte und Detailseite sind optisch und strukturell deckungsgleich mit Spielen, nur Inhalt unterscheidet sich.
- Alle Einträge haben Zahlen für Dauer, so dass Filter und Treffen-Planung rechnen können (Skript prüft).
- Erreichbar über Hauptmenü, Suche, Gemerkt und „Zum Treffen“.

## Nicht anfassen
Inhaltliche Beschreibungen der Projekte. Ergänzte Felder sind Entwürfe.
