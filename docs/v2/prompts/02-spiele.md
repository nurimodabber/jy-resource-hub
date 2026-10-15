# Phase 02 – Spiele

## Ziel
Man findet in unter 10 Sekunden ein passendes Spiel und kann es vom Handy aus leiten. Die Liste ist klar, die Spielseite ist für die Gruppe lesbar.

## Ist-Zustand (Live-Seite, 29 Spiele)
- Liste: Suche, dann acht gleich aussehende Chips in einem Block, die drei verschiedene Dinge mischen: Art (Kooperativ, Rollen & Täuschung, Wettkampf / Duelle, Energizer), Energie (Ruhig / Fokus, Mittlere Intensität, Hohe Bewegung) und Material („Ohne Material“).
- Titel uneinheitlich: „Der menschliche Knoten“, „Gemeinsam Zählen (The Mind)“, „Eisschollen-Rettung (Flussüberquerung)“, „Spion (Spyfall)“. Manche haben einen Untertitel in Klammern, andere nicht.
- Karten zeigen Titel, drei Zeilen Beschreibung und eine Zeile „6–16 Pers. · 10–20 Min · Mittlere Intensität“. Kein Hinweis auf Material, Vorbereitung oder Raum.
- Der Spielfinder auf der Startseite und der Filter der Liste sind zwei getrennte Logiken.
- Spielseite: Spielmodus, Zum Plan, Merken, Werkzeug-Hinweis, Idee, Material, Ablauf, Tipps, Kopieren, Teilen, Drucken. Funktioniert, ist aber lang und hat keine feste Aktionsleiste.

## Aufgaben
1. **Datenmodell bereinigen** (`src/data/games.ts` und `src/types.ts`), ohne IDs zu ändern:
   - `title` ist nur der Name. Der Zusatz in Klammern wandert in ein neues Feld `subtitle` (optional, de/en). Beispiel: `title: Gemeinsam Zählen`, `subtitle: The Mind`. Lege eine Liste aller Änderungen als Tabelle im Commit ab.
   - Neues Feld `purpose: 'kennenlernen' | 'energie' | 'zusammenarbeit' | 'ruhe' | 'raten'` (Wirkung). Weise jedem Spiel genau einen Wert zu und schreibe die Zuordnung in die Abschlussmeldung zur Prüfung (Entwurf).
   - `durationMinutes` bleibt als Text für die Anzeige. Ergänze `durationMin` und `durationMax` als Zahlen, damit man filtern und sortieren kann. Ein Skript prüft, dass beide zum Text passen.
   - Energie-Beschriftung vereinheitlichen: **Ruhig**, **Mittel**, **Lebhaft**. Überall dieselben drei Wörter (Liste, Karte, Spielseite, Finder).
2. **Eine gemeinsame Filterlogik** in `src/utils/gameFilter.ts`, genutzt von Liste, Startseite und Spielfinder. Parameter in der URL, damit Links teilbar sind: `/games?personen=12&dauer=20&energie=lebhaft&wirkung=raten&material=ohne`.
3. **Listenseite im neuen Muster:**
   - H1 „Spiele“, ein Satz, Zähler.
   - Eine Zeile: Suchfeld und Knopf „Filter“ (zeigt die Zahl aktiver Filter).
   - Darunter eine einzeilige, horizontal scrollbare Chip-Reihe nur für **Wirkung** (Alle, Kennenlernen, Energie, Zusammenarbeit, Ruhe, Raten).
   - Im Filter-Sheet: Personenzahl (Stepper), Dauer (Chips: bis 10, bis 20, bis 30, egal), Energie (Segmentiert), Material (Schalter „Ohne Material“), Sortierung (Passend, Kürzeste zuerst, Gruppengröße).
   - Aktive Filter erscheinen als entfernbare Chips über der Liste, daneben „Zurücksetzen“.
4. **Karte:** Titel (max. 2 Zeilen), Untertitel in text-secondary (eine Zeile), eine Zeile Meta mit Symbolen (Personen, Uhr, Energie als drei Punkte), rechts oben das Lesezeichen. Keine Beschreibung auf der Karte. Karten gleich hoch. Raster: 1 Spalte Handy, 2 Spalten ab 768, 3 ab 1120.
5. **Spielseite:**
   - Kopf: Titel, Untertitel, Meta als Chips (Personen, Dauer, Energie, Raum, Material oder „Kein Material“).
   - **Feste Aktionsleiste** unten auf dem Handy (Spielmodus als Hauptknopf, Zum Treffen, Merken, Mehr-Menü mit Teilen, Kopieren, Drucken). Auf Desktop in der rechten Spalte, klebend.
   - Reihenfolge: Idee (zwei Sätze), Material, Ablauf als nummerierte Schritte mit Häkchen zum Abhaken während des Spiels (Zustand nur im Speicher), Tipps für Animatoren als einklappbarer Block, Verwandte Werkzeuge, Ähnliche Spiele (drei, gleiche Wirkung).
   - **Spielmodus** (vorhanden) verbessern: Schritt-Fortschritt als Balken, Wisch-Gesten, Schriftgröße einstellbar (A−/A+), Beamer-Kontrast, Timer-Knopf, der einen Mini-Timer einblendet, Bildschirm bleibt an (vorhanden).
   - Druckansicht: eine Seite, ohne Navigation, Titel, Material, Ablauf, Tipps.
6. **Leere und Fehlerzustände:** keine Treffer (ein Satz und „Filter zurücksetzen“), unbekannte Spiel-ID (Hinweis und Link zur Liste).
7. **„Zum Treffen“** verwendet die Treffen-Logik aus Phase 05. Bis dahin der bestehende Planer-Aufruf.

## Akzeptanzkriterien
- Von „keine Filter“ bis „Spiel für 12 Personen, 20 Minuten, lebhaft“ sind es höchstens 4 Tipps.
- Alle 29 Spiele haben `subtitle` (wo vorher Klammern standen), `purpose`, `durationMin/Max`. IDs unverändert (Test).
- Energie heißt überall Ruhig, Mittel, Lebhaft.
- Spielmodus lesbar auf 5 m Abstand bei Beamer (Schritt ≥ 40 px Schrift auf 1280 px).

## Nicht anfassen
Spielregeln und Beschreibungstexte inhaltlich (nur Titel und Untertitel trennen). Neu geschriebene Texte sind Entwürfe.
