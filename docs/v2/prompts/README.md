# Verbesserungs-Prompts für den Junior Youth Hub (Version 2)

Stand: nach Sichtung der Live-Seite (jy-resource-hub.vercel.app) am 15.10.2026.

## So benutzt du das Paket
1. Kopiere `AGENTS.md` in die Wurzel des Repos (ersetzt die alte Datei) und den Ordner `prompts/` nach `docs/v2/prompts/`.
2. Öffne das Repo in Google Antigravity und gib als Start-Prompt: *„Lies AGENTS.md und docs/v2/prompts/README.md. Arbeite Phase 00 ab, committe auf dem Branch redesign-v2 und warte dann auf mein Okay.“*
3. Danach Phase für Phase mit: *„Weiter mit Phase 0X.“* Prüfe nach jeder Phase die Vorschau-Adresse von Vercel.

## Reihenfolge
| Phase | Datei | Inhalt |
|---|---|---|
| 00 | 00-design-system.md | Neue Farben, Rundungen, Schrift, Bauteile |
| 01 | 01-navigation-einstellungen.md | Menüs, Suche, Einstellungen, Footer |
| 02 | 02-spiele.md | Spieleliste, Filter, Spielseite |
| 03 | 03-dienst-und-kunst.md | Projekte und Kunstideen |
| 04 | 04-zitate.md | Lesen und Auswendiglernen |
| 05 | 05-treffen.md | Aus dem Planer wird der Treffen-Assistent |
| 06 | 06-werkzeuge.md | Empire, Rollen, Teams, Timer und mehr |
| 07 | 07-start.md | Startseite |
| 08 | 08-vorschlaege-einreichen.md | Vorschläge von Animatoren, Prüfung durch dich |
| 09 | 09-qualitaet.md | Tests, Kontrast, Abschlussbericht |

Phase 00 muss zuerst laufen, 09 zuletzt. 01 bis 07 bauen auf 00 auf. 05 braucht 03 und 04.

## Meine Entscheidungen (bitte prüfen)
- **Planer wird zum Treffen-Assistenten und rückt nach vorn.** Auf der Live-Seite ist der Planer eine leere Seite mit drei verschachtelten Karten. Er ist aber die einzige Stelle, an der Andacht, Zitat, Spiel und Dienst oder Kunst zusammenkommen. Das ist der eigentliche Ablauf eines Treffens. Darum: Hauptmenü „Treffen“, geführter Ablauf, Vorlagen für ein normales Treffen und für Camp-Abende.
- **Dienst und Kunst rückt ins Hauptmenü.** Aktuell versteckt es sich hinter „Mehr“, obwohl du es für Camps und Abendprogramme brauchst.
- **Neue Hauptmenüs:** Spiele, Zitate, Dienst und Kunst, Treffen, Werkzeuge. „Mehr“ entfällt, Einstellungen und Gemerkt liegen in der Kopfzeile.
- **Andacht:** Es werden nur vorhandene Inhalte verwendet: die Gebete unter „Gebete & Andacht“ in den Zitaten und die Lieder-Anbindung. Keine neuen Texte.
- **Vorschläge einreichen per GitHub-Issue.** Am einfachsten zu betreiben und sicher: Das Formular legt in deinem Repo ein Issue an, GitHub benachrichtigt dich per E-Mail und in der Handy-App, du gibst frei. Keine Datenbank, keine Konten, keine Kosten. Details in Phase 08.
- **Zitate sind vom Einreichen ausgenommen.** Es sind kanonische Texte, die nur du pflegst. Falls du das anders willst, sag es.
- **Akzentfarbe:** Startwert ist ein Blau (#1F6FEB). Phase 00 soll prüfen, ob das zum Logo passt (`public/logo.png`), und eine Abweichung begründen.
- **Sprache der Prompts:** Deutsch, Code-Begriffe englisch.

## Was ich auf der Live-Seite beobachtet habe
- Start: Der Spielfinder belegt den ganzen ersten Bildschirm, das Zitat des Tages und die Werkzeuge liegen weit unten. Einen Einstieg in „Treffen vorbereiten“ gibt es nicht.
- Spiele: acht gleich aussehende Chips für drei verschiedene Dinge (Art, Energie, Material) in einem Block. Titel mit unterschiedlichem Aufbau („Name (Untertitel)“ mal mit, mal ohne). Energie heißt mal „Hohe Bewegung“, mal „Mittlere Intensität“, mal „Ruhig / Fokus“.
- Zitate: schwere Kopfkarte mit drei Reitern, Suche, zwei Chip-Reihen und Buchfilter. Der orange „Üben“-Knopf steht auf jeder Karte. Das Lesen der Texte steht nicht im Vordergrund.
- Planer: leerer Zustand mit drei Kästen, „0 Blöcke · 0 Min.“, kein Bezug zu Andacht oder Zitat.
- Dienst und Kunst: sieht anders aus als Spiele und Werkzeuge (Karten in der Kopfkarte, kleine Etiketten, „Details ansehen“), und ist nur über „Mehr“ erreichbar.
- Werkzeuge: klare Liste, funktioniert gut, bekommt das neue Design.
- Querschnitt: Rundungen von 6 bis 12 px und das Beige-Orange wirken veraltet. Die Bereiche folgen nicht demselben Aufbau.
