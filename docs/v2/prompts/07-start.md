# Phase 07 – Startseite

## Ziel
Die Startseite beantwortet in zwei Sekunden: „Was mache ich heute mit der Gruppe?“ Sie führt zu Treffen, Spiel und Werkzeug, zeigt das Zitat des Tages ruhig und merkt sich, wo man aufgehört hat.

## Ist-Zustand (Live-Seite)
- Überschrift „Was brauchst du für dein Treffen?“, ein Satz, dann sofort der volle Spielfinder (Personen, Dauer, Energie, Material) mit einer langen Ergebnisliste. Der Finder füllt den ersten Bildschirm.
- Darunter „Andere Vorschläge“, „Werkzeuge“ (vier Kacheln) und ganz unten das Zitat des Tages.
- Kein Einstieg zu Treffen, Dienst und Kunst oder Andacht. „Weitermachen“ erscheint nur bei vorhandenem Plan.

## Aufgaben
1. **Aufbau von oben nach unten:**
   1. Kopf: H1 „Hallo“ oder, wenn ein Plan existiert, „Weiter mit deinem Treffen“. Ein Satz darunter.
   2. **Zwei große Einstiege** nebeneinander (Handy untereinander): „Treffen vorbereiten“ (Hauptaktion, accent) und „Spiel finden“ (sekundär).
   3. **Weitermachen:** zuletzt geöffnetes Treffen mit Dauer und Fortschritt, zuletzt angesehene Inhalte (3, lokal).
   4. **Heute:** Karte mit dem Zitat des Tages im Lesestil (Phase 04), Link „Als Andacht verwenden“ und „Lesen“. Das Zitat wechselt täglich (vorhanden, aus `QUOTES_DATA` nach Tag des Jahres). Kein Zitat wird gekürzt: lange Zitate zeigen „Weiterlesen“.
   5. **Dienst und Kunst:** zwei Beispiele (eines je Art) mit Link „Alle ansehen“. Saisonal sortiert ist nicht nötig, eine feste Auswahl genügt.
   6. **Werkzeuge:** vier Kacheln (Empire, Rollen, Teams, Timer) und „Alle ansehen“.
   7. **Vorschlag einreichen:** eine ruhige Zeile am Ende („Du hast ein Spiel oder Projekt, das fehlt? Schick es uns.“, Link auf Phase 08).
2. **Spielfinder kompakt:** Nur zwei Eingaben (Personenzahl-Stepper, Dauer-Chips). Der Knopf „Spiele anzeigen“ öffnet `/games?personen=…&dauer=…` mit Ergebnissen, statt die Startseite zu füllen. Die Vorbelegung bleibt gespeichert (`jy_quick_pick_v2`, vorhanden).
3. **„Heute“ nach Kontext:** Wenn ein Treffen für heute geplant ist (Datum im Plan), steht „Heute“ oben mit „Treffen starten“.
4. **Leere Zustände:** Erster Besuch zeigt keine leeren Kästen („Weitermachen“ erscheint erst mit Inhalt).
5. **Installationshinweis:** Einmaliger, dezenter Hinweis „Zum Startbildschirm hinzufügen“ auf Handys, die das unterstützen (schließbar, Zustand gespeichert).
6. **Laden:** Skeleton statt „Wird geladen…“.

## Akzeptanzkriterien
- Auf 390 × 844 px sind beide Einstiege, „Weitermachen“ (falls vorhanden) und der Anfang der Karte „Heute“ ohne Scrollen sichtbar.
- Kein Spielfinder-Ergebnis auf der Startseite, die Seite ist maximal vier Bildschirme lang.
- Zitat des Tages ist zeichengenau wie in `quotes.ts` und wechselt mit dem Datum (Test mit gemocktem Datum).

## Nicht anfassen
`src/data/quotes.ts`.
