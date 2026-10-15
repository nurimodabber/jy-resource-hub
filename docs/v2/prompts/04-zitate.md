# Phase 04 – Zitate (Lesen und Auswendiglernen)

## Ziel
Der Text steht im Vordergrund und wird ehrfürchtig dargestellt. Üben ist ein klar getrennter zweiter Schritt. Wenige, einfache Filter.

## Ist-Zustand (Live-Seite, 51 Zitate, 50 Methoden)
- Kopfkarte mit Titel, Zähler und drei Reitern (Zitate, Jetzt auswendig lernen, Alle 50 Methoden), darunter Suchfeld, Knopf „Buch & Lektion“, eine Chip-Reihe mit 11 Büchern (am Rand abgeschnitten) und eine zweite Chip-Reihe mit Themen. Insgesamt drei Filterzeilen vor dem ersten Zitat.
- Karten (zweispaltig): Etiketten mit Buch und Lektion, Titel, Text in Serifenschrift (gekürzt), Quelle, orangefarbener Knopf „Üben“ auf jeder Karte.
- Methoden-Seite: gut lesbar, Phasen-Chips, aber „Auf Website spielbar“ als Etikett und „Jetzt üben“ in Orange konkurrieren mit dem Inhalt.
- Der Gebete-Bereich („Gebete & Andacht“) steht zwischen den Zitaten und ist nicht als Andacht erkennbar.

## Aufgaben
1. **Zwei Reiter statt drei:** „Lesen“ (alle Zitate und Gebete) und „Auswendig lernen“ (Methoden und Übungen). Kopf wie Muster aus Phase 00, ohne Kopfkarte.
2. **Filter reduzieren:** Suchfeld und Knopf „Filter“. Im Sheet: Buch (mit Lektion), Thema, „Nur Gebete“. Keine Chip-Reihen auf der Seite. Aktive Filter als Chips über der Liste.
3. **Leseansicht:** Zitat als ruhiger Block auf `surface` mit großzügigem Rand, Lora 20/32 mobil, 24/38 Desktop, Lesebreite max. 680 px, Quelle darunter in text-secondary. Kein Farbhintergrund, keine Etiketten über dem Text, kein Knopf im Textblock. Der Text wird **nie** gekürzt oder verändert: In der Liste zeigt die Karte den vollen Text bis zu 6 Zeilen mit „Weiterlesen“, die Detailseite zeigt alles.
4. **Karte:** Quelle und Buch in einer kleinen Zeile oben, Text, unten Lesezeichen und „Üben“ als textlicher Link (nicht als Knopf), „Zum Treffen“ im Mehr-Menü.
5. **Detailseite eines Zitats:** großer Lesetext, Quelle, Lesemodus-Knopf (Vollbild, Schrift A−/A+, Beamer-Kontrast, Bildschirm bleibt an), danach ein Abschnitt „Auswendig lernen“ mit den passenden Methoden als Liste (3 Empfehlungen nach Länge des Zitats, Rest einklappbar), und „Zum Treffen hinzufügen“.
6. **Gebete als Andacht:** Gebete (Kategorie „Gebete & Andacht“) bekommen eine Kennzeichnung `kind: 'gebet'` in der Anzeige (nicht im Text), einen eigenen Filter und den Knopf „Als Andacht verwenden“. Das fügt sie im Treffen (Phase 05) als Baustein Andacht ein. Kein neuer Text.
7. **Methoden-Seite:** Phasen als SegmentedControl (Alle, 1, 2, 3), Liste mit Titel, einer Zeile Beschreibung und Dauer. „Auf Website spielbar“ wird zu einem kleinen Symbol „Digital“ mit Tooltip. Ein einziger Knopf „Üben“ nur auf der Detailseite, in accent.
8. **Übungsmodi** (`src/components/quotes/*`): neu stylen im Designsystem, Bedienelemente groß, Text bleibt unverändert und in Lora, keine Spielpunkte oder Konfetti.

## Akzeptanzkriterien
- Vor dem ersten Zitat steht maximal eine Zeile Bedienelemente.
- Zitattext ist zeichengenau identisch mit `quotes.ts` (Test: Vergleich des gerenderten Texts mit den Daten für alle 51 Einträge).
- Gebet lässt sich mit zwei Tipps als Andacht in ein Treffen übernehmen.
- Lesemodus funktioniert per Tastatur, Wisch und auf dem Beamer.

## Nicht anfassen
`src/data/quotes.ts`.
