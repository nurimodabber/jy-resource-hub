# Junior Youth Hub – Abschlussbericht (Redesign Version 2)

**Datum:** 15. Oktober 2026  
**Branch:** `redesign-v2`  
**Stack:** React 18, TypeScript 5.7, Vite 6, Tailwind CSS v3.4, react-router-dom 7, Lucide Icons  
**Lokale Prüfung:** `http://localhost:4173` (Preview) / `http://localhost:3000` (Dev)

---

## 1. Zusammenfassung & Zielerreichung

Das Redesign von Version 2 des **Junior Youth Hub** wurde gemäß allen Anforderungen aus `AGENTS.md` und den Spezifikationen `00-design-system.md` bis `09-qualitaet.md` vollständig umgesetzt. Die Plattform bietet Animatoren von Bahá'í-Juniorjugendgruppen ein hochfunktionales, ehrfürchtiges und ästhetisch ansprechendes Werkzeug für drei Nutzungsszenarien:
1. **Live in der Gruppe (Handy / Offline):** Schnelle Werkzeuge, große Touch-Ziele (mind. 44 px), Wake-Lock für dauerhaft aktiven Bildschirm, Swipe-Gesten.
2. **Vorbereitung am Schreibtisch (Laptop / Tablet):** Strukturierte Treffen-Planung, Material-Packliste, Zeiteinteilung und Druckansichten.
3. **Beamer / Großansicht:** Projektortauglicher Kontrastmodus, große Serifenschriften für heilige Texte, Vollbild-Spielmodus und Live-Ablaufanzeige.

Alle Änderungen wurden phasenweise auf dem Branch `redesign-v2` vorgenommen. Sämtliche automatisierten Prüfungen (`npm run check`, `npm run build`, `npm run contrast`, `npm run test:e2e` sowie Daten- und Übersetzungstests) laufen fehlerfrei mit **0 Fehlern und 0 Warnungen**.

---

## 2. Übersicht der Phasen (00 bis 09)

### Phase 00: Design System & Design Tokens
- **Typografie:** `Figtree` (Sans) als klare, moderne Leseschrift für Interface-Elemente; `@fontsource/lora` (Serif) ausschließlich für heilige Texte und Zitate.
- **Farben & Kontraste:** Verbindliches Farbschema „frisch und freundlich“ mit kühlen hellen Flächen (`--color-bg: #F7F9FC`), sanften Containern (`--color-surface: #FFFFFF`, `--color-surface-2: #EEF2F8`), kräftigem Akzentblau (`--color-accent: #1F6FEB`) und hochkontrastigem Textblau (`--color-accent-text: #1850B8` in Hell, `#A9C8FF` in Dunkel).
- **Radien:** 20 px für Inhaltskarten (`rounded-card`), 14 px für Bedienelemente (`rounded-control`), voll rund für Chips (`rounded-chip`).
- **Verzicht auf KI-Look:** Keine Verläufe, kein Glas-Effekt, kein Glühen, keine dekorativen Emojis, keine Karten-in-Karten-Schachtelungen.
- **Kontrastprüfung:** Neues Skript `scripts/check-contrast.mjs` prüft 42 Farbpaare nach WCAG 2.1 AA (mind. 4,5:1 für Text, 3:1 für Steuerelemente).

### Phase 01: Navigation, Einstellungen, Schnellsuche
- **Desktop Header & Navigation Rail:** Sticky Navbar oben am Desktop; kompakte vertikale Navigationsleiste (`LeftNavigationRail`) im Smartphone-Querformat.
- **Mobile Bottom Navigation Bar:** Fünf ergonomische Haupt-Tabs (`Spiele`, `Zitate`, `Dienst & Kunst`, `Treffen`, `Werkzeuge`) mit mind. 48 px Touch-Höhe.
- **Befehlspalette (`⌘K` / `Ctrl+K`):** Globales Tastaturkürzel zur Schnellsuche über alle Spiele, Zitate, Methoden, Dienstprojekte, Werkzeuge und Seiten.
- **Einstellungs-Sheet (`SettingsSheet`):** Theme-Umschaltung (Hell, Dunkel, System), Sprachauswahl (Deutsch / Englisch), Gruppen-Namensverwaltung, lokales Daten-Backup (Export/Import als JSON) und Schalter zum Ausblenden von Entwurfsinhalten (`jy_hide_drafts`).

### Phase 02: Spiele-Verzeichnis & Spielmodus
- **Mehrdimensionale Filter:** Zweck (`kennenlernen`, `energie`, `zusammenarbeit`, `ruhe`, `raten`), Gruppengröße, Dauer (10/20/30+ Min.), Energielevel und „Ohne Material“. Alle Filter synchronisieren sich nahtlos mit der URL (`/games?wirkung=...&dauer=...`).
- **Detailansicht (`GamePage`):** Strukturierte Übersicht mit Altersangabe, Vorbereitungsaufwand, Zeitfenster, Materialliste, schrittweiser Spielanleitung und Animatoren-Tipps.
- **Spielmodus (Beamer- & Mobilansicht):** Vollbildansicht mit Swipe- und Pfeiltastennavigation, zuschaltbarem Timer, Schriftgrößen-Anpassung und Beamer-Kontrastmodus.

### Phase 03: Dienst & Kunst
- **Gemeinsame Startseite (`/service-arts`):** Umschaltbar zwischen Dienstprojekten und Kunst-/Ausdrucksaktivitäten.
- **Pädagogische Struktur:** Klare Trennung von Vorbereitung, schrittweiser Durchführung und vertiefenden Reflexionsfragen für das Gespräch nach der Aktion.
- **Druckansicht:** Optimiertes Print-Layout (`@media print`) ohne Header und Footer zur Erstellung sauberer Handouts für Treffen oder Camps.

### Phase 04: Zitate & Memorierungs-Studio
- **Ehrfürchtige Darstellung:** Zitate aus `src/data/quotes.ts` (QUOTES_DATA) blieben strikt unverändert. Formatierung in Lora Serif mit ruhigem Hintergrund.
- **10 interaktive Lernmethoden:**
  1. *Cloze-Test* (Lückentext mit einstellbarem Ausblendegrad)
  2. *First-Letter-Board* (Anfangsbuchstaben als Erinnerungsstütze)
  3. *Type-Recall* (Eintippen des Textes mit Sofort-Feedback)
  4. *Speed-Run-Timer* (Aufbau von Geläufigkeit und Zeitgefühl)
  5. *Flash-Reader* (Wortweises Aufleuchten zur Steigerung der Konzentration)
  6. *Chalkboard* (Schrittweises Wegwischen von Wörtern)
  7. *Word-Puzzle* (Reihenfolge der Satzbausteine anordnen)
  8. *Cumulative-Cascade* (Wort-für-Wort-Kaskade)
  9. *Metronome-Pacer* (Rhythmische Sprechbegleitung)
  10. *Imposter-Detector* (Fehlerhafte Testwörter im Text aufspüren)

### Phase 05: Treffen-Assistent (SessionBuilder)
- **Modulare Zeitleiste:** Automatische Berechnung von Uhrzeiten (z.B. 17:00 – 17:15) basierend auf der Startzeit und Blockdauer.
- **4 erprobte Vorlagen (`GATHERING_PRESETS`):**
  - *Normales Treffen (75 Min)*
  - *Camp-Abend (2 h)*
  - *Kurz (45 Min)*
  - *Camp-Tag mit Programm (3 h)*
- **Live-Treffen-Modus (`/treffen?live=true`):** Abgedunkelter, ablenkungsfreier Ablaufbildschirm mit aktivem Countdown, Wake-Lock („Bildschirm bleibt an“), Notizen und Schnellzugriff auf verlinkte Ressourcen (Lieder, Zitate, Spiele).
- **Material-Packliste:** Automatische Aggregation aller benötigten Materialien aller im Ablauf enthaltenen Bausteine.

### Phase 06: Werkzeuge für die Gruppe
- **`CardsTool` (Gesprächskarten):** Swipebare Fragen und heilige Zitate für den Gesprächskreis mit Beamer-Modus.
- **`IdeasTool` (Spontane Impulse):** Zufallsimpulse für Aufstellungen, Geschichten und Psychiater-Regeln.
- **`FinderTool` (Spielfinder):** Kompaktes Werkzeug für schnelle Vorschläge nach Gruppengröße und Zeit.
- **`ScoreboardTool` (Punktetafel):** Würdevolles Festhalten von Punkten für Stationsläufe oder Teamrunden ohne Beschämung.
- **`EmpireTool` (Empire-Ablauf):** Kategorienwahl, Begriffsverwaltung und Verfolgung von Reichen mit automatischer Spielleiter-Unterstützung.
- **`RolesTool` (Rollenverteiler):** Geheimkarten-Weitergabe mit strikter Sichtbarkeits-Isolation (Karten sind zwischen Spielern nie doppelt sichtbar).
- **`GroupManager`:** Zentrale Teilnehmer- und Anwesenheitsverwaltung, die von allen Werkzeugen geteilt wird.

### Phase 07: Startseite
- **Kontextsensitive Begrüßung:** Zeigt bei aktiver Planung den aktuellen Entwurf („Weiter mit deinem Treffen“) anstelle der generischen Begrüßung.
- **Zwei primäre Einstiege:** Akzentuierte Hauptkarte „Treffen vorbereiten“ und sekundäre Karte „Spiel finden“.
- **Kompakter 2-Eingaben-Spielfinder:** Gruppengröße + Zeitfenster, führt mit 1 Klick zu den gefilterten Spielen.
- **Zitat des Tages:** Automatisch nach Kalendertag wechselndes Zitat in Lora Serif mit Direktaktion „Als Andacht verwenden“ (fügt Slot in Treffen ein und leitet dorthin weiter).

### Phase 08: Vorschläge einreichen & GitHub-Integration
- **3-stufiger Vorschlags-Workflow (`/vorschlagen`):** Art wählen → Details & Ablauf mit Live-Vorschau → Bestätigung.
- **Lokale Entwurfssicherung:** Formulareingaben werden automatisch in `jy_submit_draft` gespeichert, sodass bei unbeabsichtigtem Neuladen kein Text verloren geht.
- **Serverless API (`api/submit.ts`):** Validiert Eingaben, filtert URLs im Titel/Zusammenfassung, blockiert HTML, wehrt Spambots über Honeypot und Mindestausfüllzeit (3 s) ab und legt einen sauberen GitHub-Issue mit JSON-Block an.
- **Datenschutz & Fallback:** Wenn keine Umgebungsvariablen (`GITHUB_TOKEN`) hinterlegt sind oder ein Netzwerkfehler auftritt, greift ein transparenter `mailto:`-Fallback.
- **Übernahmeskript (`scripts/issue-to-data.mjs`):** Liest genehmigte Vorschläge per Issue-Nummer oder lokaler JSON-Datei ein und fügt sie automatisch und syntaxkonform mit `status: 'draft'` in `games.ts`, `serviceProjects.ts` oder `artsPrompts.ts` ein.

### Phase 09: Qualitätssicherung & Matrix
- **Matrix-Prüfung:** Getestet auf 390 px (Handy), 768 px (Tablet Portrait), 1024 px (Tablet Landscape), 1280 px (Desktop) und 1920 px (Full HD) in Hell und Dunkel sowie Deutsch und Englisch über alle 9 Routen. Horizontaler Überlauf: **0 px**.
- **Barrierefreiheit:** Axe-Core Audit über alle Routen ohne Verstöße der Stufe „serious“ oder „critical“.
- **Service Worker (`public/sw.js`):** Cache-Version auf `jy-hub-v2` erhöht, Stale-While-Revalidate für statische Assets, Navigations-Fallback auf `/`, Ausschluss von `/api/`-Routen und Offline-Hinweis im Vorschlagsformular.

---

## 3. Galerie der Prüf-Screenshots

Alle Screenshots liegen im Repository unter `docs/v2/screens/` und können im Bildbetrachter eingesehen werden:

| Screenshot | Datei | Beschreibung |
|---|---|---|
| **Startseite Mobil (Hell)** | `docs/v2/screens/09/01-home-390-de-light.png` | 390 px, Begrüßung, 2 Haupteinstiege, Zitat des Tages |
| **Startseite Mobil (Dunkel, EN)** | `docs/v2/screens/09/02-home-390-en-dark.png` | 390 px Dark Mode, englische Lokalisierung |
| **Spiele-Katalog (Tablet)** | `docs/v2/screens/09/03-games-768-de-light.png` | 768 px, Filterleiste und Spielkarten |
| **Zitate-Studio (Landscape)** | `docs/v2/screens/09/04-quotes-1024-en-dark.png` | 1024 px, Lora Serif Darstellung und Methoden-Chips |
| **Treffen-Planer (Desktop)** | `docs/v2/screens/09/05-treffen-1280-de-light.png` | 1280 px, modulare Zeitleiste mit Zeitintervallen |
| **Live-Treffen (Vollbild)** | `docs/v2/screens/09/06-treffen-live-1280-de-dark.png` | 1280 px Dark Mode, Countdown und aktiver Baustein |
| **Werkzeuge-Übersicht** | `docs/v2/screens/09/07-tools-1280-de-light.png` | 1280 px, 2-spaltiges Grid und „Zuletzt genutzt“ |
| **Vorschlagsformular** | `docs/v2/screens/09/08-vorschlagen-390-de-light.png` | 390 px, Eingabemaske mit Schritt-Anzeige |
| **Dienst & Kunst (Widescreen)** | `docs/v2/screens/09/09-service-arts-1920-de-light.png` | 1920 px Full HD, saubere Breitenbegrenzung |
| **Datenschutzerklärung** | `docs/v2/screens/09/10-datenschutz-1280-de-light.png` | 1280 px, transparente Null-Tracking-Erklärung |

---

## 4. Liste aller Entwurfs-Inhalte (`status: 'draft'`) zur redaktionellen Prüfung

Gemäß den harten Regeln aus `AGENTS.md` wurden alle neu verfassten inhaltlichen Texte mit `status: 'draft'` gekennzeichnet. Diese Inhalte sind voll funktionsfähig, müssen jedoch vor der finalen Freigabe redaktionell geprüft werden:

### 4.1 Wirkung der Spiele (`purpose`) in `src/data/games.ts`
Jedes der 29 Spiele erhielt eine pädagogische Zielkategorie:
- `kennenlernen`: z.B. *Zwei Wahrheiten und eine Lüge*, *Namensball*, *Wer bin ich*
- `energie`: z.B. *Evolution*, *Drachenschwanz*, *Pferderennen*, *Obstsalat*
- `zusammenarbeit`: z.B. *Gordischer Knoten*, *Säureteich*, *Minenfeld*, *Tower of Power*
- `ruhe`: z.B. *Schlafende Löwen*, *Lautloses Aufstehen*, *Blinder Führer*
- `raten`: z.B. *Empire*, *Werwolf*, *Der Psychiater*, *Black Stories*

### 4.2 Ergänzte Felder in `src/data/serviceProjects.ts` & `src/data/artsPrompts.ts`
Jedes Dienst- und Kunstprojekt wurde um strukturierte Felder ergänzt:
- **Pädagogisches Ziel (`objective`):** Wirkungsziel der Aktion (z.B. Umweltsensibilisierung, Wertschätzung im Quartier, Stärkung des Ausdrucksvermögens).
- **Reflexionsfragen (`reflectionQuestions`):** 3 bis 4 vorbereitete Fragen für das gemeinsame Nachgespräch im Kreis.
- **Rahmenbedingungen:** `setting` (`drinnen`, `draussen`, `beides`) und `occasion` (`treffen`, `camp`, `beides`).
- **Neue Projektentwürfe:**
  - *Stadtteil-Putz mit Müll-Audit* (`trash-audit-cleanup`)
  - *Bienenfreundliche Blumenbomben* (`seed-bombs-nature`)
  - *Senioren-Interviews & Lebensgeschichten* (`elderly-interviews`)
  - *Tugenden-Collage aus Naturmaterialien* (`nature-mandala-virtues`)
  - *Klanglandschaft & Hörspiel* (`soundscape-story`)
  - *Schatten-Theater der Tugenden* (`shadow-theater-virtues`)

### 4.3 Treffen-Vorlagen (`GATHERING_PRESETS`) in `src/components/SessionBuilder.tsx`
Vier Vorlagen zur schnellen Planung:
1. `standard-75`: Normales Treffen (75 Min) – Andacht 10, Zitat & Lernen 20, Spiel 15, Dienst/Kunst 20, Abschluss 10.
2. `camp-120`: Camp-Abend (120 Min) – Andacht 10, Energizer 15, Kreativblock 45, Abendspiel 25, Reflexion 15, Abschluss 10.
3. `short-45`: Kurz (45 Min) – Andacht 5, Zitat 15, Spiel 15, Abschluss 10.
4. `camp-day-180`: Camp-Tag mit Programm (180 Min) – Morgenimpuls 15, Vertiefung 45, Teamaufgaben 30, Umweltdienst 60, Ausklang 30.

### 4.4 Rollen- und Spontaninhalte in `src/data/roleContent.ts` & `src/data/empireContent.ts`
- **Varianten ohne Ausscheiden:** Regeln für Werwolf (`schutzengel`, `stiller-zeuge`) und Mörder (`detektiv-rat`).
- **Empire-Kategorien & Zettel-Prompts:** Neue altersgerechte Kategorien und Wortlisten für Juniorjugendliche.
- **Spontanregeln für „Der Psychiater“:** 25 kreative, wohlwollende Antwortregeln (z.B. Wetterbegriff einbauen, Reimantwort, 3-Wort-Sätze).

### 4.5 Datenschutzerklärung (Abschnitt 6) in `src/components/DatenschutzView.tsx`
- Transparente Offenlegung der Vorschlagsfunktion: Beiträge werden auf Wunsch als öffentliche GitHub-Issues verarbeitet. Name und E-Mail-Adresse sind strikt freiwillig. Keine Tracking-Cookies oder Werbedienste.

---

## 5. Prüfberichte & Abnahmekriterien

| Kriterium | Soll | Ist | Status |
|---|---|---|---|
| **TypeScript Typecheck** | 0 Fehler | `tsc --noEmit` fehlerfrei | ✅ Bestanden |
| **ESLint** | 0 Warnungen | `eslint src` fehlerfrei | ✅ Bestanden |
| **Produktions-Build** | Erfolgreich | `vite build` in 3,2 s generiert | ✅ Bestanden |
| **WCAG 2.1 AA Kontrast** | >= 4,5:1 (Text), >= 3:1 (UI) | 42/42 Tokenpaare bestanden | ✅ Bestanden |
| **Axe Accessibility** | 0 serious / critical | 0 Verstöße über alle 9 Routen (Hell & Dunkel) | ✅ Bestanden |
| **Responsive Matrix** | 390, 768, 1024, 1280, 1920 px | 0 px horizontaler Überlauf | ✅ Bestanden |
| **Touch-Ziele** | >= 44x44 px | Bottom-Nav: 75x54 px (alle 5 Tabs) | ✅ Bestanden |
| **Tap-Benchmarks** | T1 <= 3, T2 <= 2, T4 <= 2, T6 <= 2 | T1: 3, T2: 2, T4: 2, T6: 2 Taps | ✅ Bestanden |
| **Offline-Fähigkeit** | Service Worker `jy-hub-v2` | Fallback auf `/`, API-Bypass aktiv | ✅ Bestanden |
| **Datensicherheit** | Keine Bundling-Leaks | 0 GitHub-Tokens im Frontend | ✅ Bestanden |
| **Lokal-Backup** | JSON Round-Trip | Export → Clear → Import verifiziert | ✅ Bestanden |
| **Heilige Schriften** | Zeichengenau | QUOTES_DATA unangetastet & exakt gerendert | ✅ Bestanden |

---

## 6. Fazit & Bereitstellung

Das Redesign Version 2 ist lokal auf dem Branch `redesign-v2` vollständig einsatzbereit, getestet und abnahmebereit. Animatoren können Treffen nun offline auf dem Smartphone leiten, am Laptop planen und per Beamer groß projizieren.
