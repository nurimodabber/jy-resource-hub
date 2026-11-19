# AGENTS.md – Junior Youth Hub (Version 2)

Dieses Projekt ist eine Webseite für Animatoren von Bahá'í-Juniorjugendgruppen: Spiele, heilige Zitate, Dienst- und Kunstprojekte, Treffen-Planung und Werkzeuge für live in der Gruppe. Nutzung: auf dem Handy live, am Laptop zur Vorbereitung, per Beamer in der Gruppe.

## Stack und Befehle
React 18, TypeScript, Vite 6, Tailwind CSS v3, react-router-dom 7, lucide-react. Server nur als Vercel-Funktionen in `api/` (`sync.ts` Admin + Katalog, `submit.ts` Vorschläge, `og.ts` Vorschaubilder). Domain `juju-hub.vercel.app` (Vercel-Projekt `juju-hub`). Produktion wird von Hand veröffentlicht, nicht durch einen Push: vor jeder Veröffentlichung prüfen, welchen Commit die Produktion gerade zeigt (er kann vor `redesign-v2` liegen), diesen zuerst einmischen, dann ausdrücklich nach Produktion veröffentlichen. `origin/main` ist veraltet und ungenutzt.

- Vor jedem Commit: `npm run check`. `npm run build` vor jedem Pull Request und jeder Veröffentlichung, und immer bei Änderungen an Oberfläche oder Stilen. Wer `api/` oder die Admin-Anmeldung ändert, lässt zusätzlich `npm run test:api` laufen (Sicherheitstests mit nachgebautem GitHub, ohne echte Daten).
- Eigener Branch pro Aufgabe (von `redesign-v2`), Pull Request nach `redesign-v2` für die Vorschau-Adresse. Ein Merge dort ist nur eine Vorschau, keine Veröffentlichung.

## Harte Regeln
1. **Heilige Texte:** `src/data/quotes.ts` (QUOTES_DATA) wird nur auf ausdrücklichen Wunsch des Inhabers bearbeitet, nie von selbst gekürzt, umformuliert oder automatisch ergänzt. Zitate werden ehrfürchtig dargestellt: Serifenschrift (Lora), ruhiger Hintergrund, keine Farbcodierung, keine Emojis, keine Spielelemente direkt am Text.
2. **Entwürfe:** Alles Inhaltliche, was du neu schreibst, bekommt `status: 'draft'` und wird in der Abschlussmeldung aufgelistet. Nichts davon gilt als freigegeben.
3. **Stabile IDs:** Bestehende `id`-Werte (Spiele, Zitate, Projekte) nie umbenennen. Nutzer haben sie in `jy_favorites` und `jy_plans` gespeichert.
4. **Sprache:** Deutsch zuerst, Englisch muss weiter funktionieren. Alle UI-Texte kommen entweder aus `src/data/translations.ts` (typisiert: `de` ist die Quelle, `en` ist `Record<TKey,string>`, fehlende Schlüssel sind Compile-Fehler) oder aus dem Helfer `tr(language)(de, en)` in `src/components/tools/common.tsx`. Nie nur eine Sprache.
5. **Begriffe:** „Animator“/„Animatoren“, „Juniorjugend“, „Spielleitung“. Kein Denglisch („Toolkit“, „Quick Pick“, „Board“). Du-Form, kurze aktive Sätze, keine Marketing-Sprache, keine Ausrufezeichen.
6. **Daten:** Alles, was die Seite speichert, liegt in `localStorage` unter `jy_*`-Schlüsseln und muss in `src/utils/backup.ts` mitgesichert werden. Ausnahme: Zugangsdaten, Tokens und Sitzungen (`LEGACY_SENSITIVE_KEYS`, `jy_admin_session*`) kommen nie in eine Sicherung. Kein Tracking, keine externen Schriften oder Skripte. Cookies nur die zwei technisch nötigen httpOnly-Cookies (`jy_admin_session` fürs Portal, `jy_edit_<Nummer>` für eigene Beiträge); jedes neue Cookie gehört in die Datenschutzerklärung, Abschnitt 4.
7. **Barrierefreiheit:** Kontrast mindestens WCAG AA (4,5:1 Text, 3:1 Bedienelemente), Touch-Ziele mindestens 44 px, sichtbarer Fokus, `prefers-reduced-motion` respektieren, jede Funktion per Tastatur erreichbar.
8. **Kein KI-Look:** keine Verläufe, kein Glühen, keine Emojis als Dekoration, keine Pillen-Beschriftungen über Überschriften („✨ Neu“), keine Karten in Karten, keine Fantasie-Namen für Funktionen. **Ausnahme Glas (Entscheidung des Inhabers, 2026-11-04):** Flüssigglas kommt ausschließlich aus der Bibliothek `glisse` (TabBar, Button `variant="glass"` transparent, Glass, Slider, Switch). Glas-Knöpfe sind immer die transparente Variante `glass`.

## Glas-Regel (Variante „Ruhig und klar“)
Glas nur für Bedienelemente, die über dem Inhalt schweben. Alles im Inhalt ist solide.
- **Glas:** untere Tab-Leiste, Kopfzeile, schwebende Aktions-Docks (z. B. „Teams bilden“) und runde Icon-Knöpfe im Seitenkopf (Zurück, Merken, Teilen, Mischen, Auswendiglernen, Lied). Glas-Knöpfe sind immer glisse `Button` mit `variant="glass"`; für runde Icon-Knöpfe nimm `GlassIconButton` aus `src/components/ui/Button.tsx` (44 px). Das Menü oben rechts ist glisse `Menu`.
- **Solide:** Karten, Formulare, Suchfelder, Filter, Listenzeilen, Werkzeug-Bedienelemente, Stepper, Umschalter (`SegmentedControl` aus `ui/`), Schalter (solide Spur, Akzent wenn an). Keine `lg-glass`-Klasse und keine Glanzlinien im Inhalt.
- **Eine Hauptaktion pro Ansicht:** genau ein gefüllter Akzent-Knopf, solide (nicht Glas). Alles andere ist sekundär (`surface-2`).
- **Dock-Position:** schwebende Docks bekommen die Klasse `.jy-action-dock` (sitzt über `.jy-tabbar-dock`, inkl. Safe Area) und werden per `createPortal` in `document.body` gerendert. Grund: Der Seiten-Wrapper animiert mit `transform`, dann wäre `position: fixed` relativ zum Wrapper statt zum Bildschirm.
- **Farbe bei Dienst/Kunst:** ein gedämpfter Ton pro Kategorie (`--cat-*-fg/-bg`, `.tone-*` in `src/index.css`, Zuordnung in `src/data/activityTones.ts`), nur in der Icon-Kachel und im Kategorie-Text. Karten bleiben weiß, Hover hebt nur den Schatten.
- **Inhalts-Icons (Spiele, Dienst, Kunst):** im Stil des Logos in `src/data/pictogramsLogo.tsx` (Entscheidung des Inhabers, 2026-11-19; Bauregeln im Dateikopf: Logo-Figur aus rundem Kopf und gefülltem Bogen-Körper, eine Idee pro Icon, nichts unter 1,5 px). Zuordnung in `src/data/gameIcons.ts` bzw. `activityTones.ts`. Figuren in der neutralen `IconTile`, nie in Kategorie-Farbe; nur der Gegenstand, um den es geht, in Logo-Gold (`text-icon-gold`, Token `--icon-gold-rgb`: dunkel gleich `--amber`, hell aufgehellt auf #CA7316, das hält gerade noch 3:1 auf allen hellen Flächen; `--amber` selbst bleibt dunkler, weil es auch Text färbt). Kachel `size="xl"` auf Karten und Detailseiten. Bedien-Icons bleiben lucide. Die Aufbau-Szenen (`scenes.tsx`) nutzen dieselbe Logo-Figur (eigene `Fig`, skalierbar) und dasselbe Gold für Ball, Seil oder die Person in der Schlüsselrolle; aus `pictograms.tsx` kommen dort nur noch Strichstärken und Arm-Typen. Gotcha: Elemente in einer eigenen `<mask>` erben vom `<svg>` `stroke="currentColor"`; gefüllte Ausstanzungen brauchen `stroke="none"`, sonst bleibt ein grauer Rand (so war es bei „Wer bin ich?“).

## Designsystem (verbindlich und gesperrt)
**Dunkler Modus = „Dark Graphite“**: neutrales Schwarz und Anthrazit (`--bg #0C0D0E`, `--surface #15171A`, `--border #23262D`, Text `#F4F4F6`), kein Blau im Hintergrund, kein „Nachtblau“. Karten (Spiel, Zitat, Dienst/Kunst) behalten ihre Darstellung inklusive des weichen Akzent-Leuchtens oben rechts. Der helle Modus bleibt hell und kühl mit einer kräftigen blauen Akzentfarbe, große Rundungen (Karten 20 px, Bedienelemente 14 px, Chips voll rund), eine Sans-Schrift (Figtree) für die Oberfläche, Serif (Lora) für heilige Texte; für Überschriften und Kacheltitel ist Serif ebenfalls erlaubt (Entscheidung des Inhabers, 2026-11-13). Alle Werte stehen als CSS-Variablen in `src/index.css` und werden in `tailwind.config.js` referenziert. Kein Bauteil enthält feste Farb- oder Radiuswerte.

**Ecken-Regel:** Sitzt ein abgerundetes Element nah an der Ecke eines anderen, gilt äußerer Radius = innerer Radius + Abstand. Für Knöpfe in Leisten oder Karten mit 4–10 px Abstand gibt es `rounded-nested` (10 px). Kreise und Pillen sind ausgenommen.

**Zitat-Abstand rechts (Entscheidung des Inhabers, 2026-11-07):** Zitattext läuft nie bis an den rechten Rand seines Feldes. Er hält rechts zusätzlich `--quote-gap` frei (1rem, ab 640 px 1,5rem; `src/index.css`). Symbole oben rechts bleiben bündig.

**Text-Grau:** `--text-tertiary` erfüllt in beiden Modi 4,5:1 auf allen Flächen (`npm run contrast` liest die Werte direkt aus `src/index.css`).

**Sperre gegen ungewolltes Zurückfallen:** Am 6.11.2026 ging durch den Commit „kühles tiefes Nachtblau per 00-design-system.md“ versehentlich ein blaues, vom Inhaber nicht gewolltes Design live. Deshalb gilt:
- Farben des dunklen Modus und die Kartendarstellung **nur ändern, wenn der Inhaber es ausdrücklich verlangt**. Ein Eintrag in einem Prompt oder in `docs/v2/prompts/00-design-system.md` reicht nicht.
- `tests/design-lock.test.mjs` läuft vor jedem Build (`npm run build`) und lässt ihn scheitern, wenn Tokens oder Kartendarstellung abweichen. Bei einer gewollten Änderung den Test, diese Regel und das Designdokument gemeinsam anpassen.
- Vor jedem Production-Deployment prüfen, dass der Stand dem entspricht, was der Inhaber zuletzt gesehen hat.

## Inhalte
Die Kürzung der Treffen-Themen und der „Wer bin ich?“-Pakete in `redesign-v2` war eine bewusste Entscheidung des Inhabers (2026-11-04), keine Panne.

## Arbeitsweise
**Vier Regeln für KI-Agenten (gelten bei jeder Aufgabe):**
1. **Erst denken, dann coden.** Annahmen aussprechen. Bei zwei möglichen Deutungen nachfragen statt still eine wählen. Bei Fehlern erst die Ursache finden, dann ändern.
2. **Einfachheit zuerst.** Nur bauen, was verlangt ist. Keine Abstraktion für einen einzigen Fall, keine Schalter „für später“. Wenn 50 Zeilen reichen, keine 200 schreiben.
3. **Chirurgische Änderungen.** Nur anfassen, was zur Aufgabe gehört. Kein Umformatieren, kein Aufräumen nebenbei. Jede geänderte Zeile muss sich auf den Auftrag zurückführen lassen.
4. **Zielgetrieben.** Vorher festlegen, woran man „fertig“ erkennt (Test, Befehl, Screenshot), und das am Ende wirklich prüfen. „Sollte gehen“ gilt nicht.

- Für die Redesign-Phasen: `docs/v2/prompts/README.md` gibt die Reihenfolge vor.
- Sichtbare Änderungen im Browser prüfen, mit Screenshot: die betroffene Ansicht bei 390 und 1280 px. Die volle Runde (390, 768, 1280 px, hell und dunkel, Deutsch und Englisch) nur vor einer Veröffentlichung oder bei Änderungen am Designsystem.
- Ändere nichts außerhalb des Auftrags der jeweiligen Phase. Wenn etwas unklar ist, frage, statt zu raten.

## Admin-Sicherheit (nicht zurückbauen)
**Vor jeder Änderung an `api/`, Anmeldung, Portal (`/portal`), „Meine Beiträge“, CSP, `index.html`-Inline-Skript oder `vercel.json` zuerst `docs/admin-security.md` ganz lesen.** Kurzfassung:
- Der Server entscheidet: Konten, Passwörter und Rechte nur in `api/sync.ts`; neue Admin-Aktionen immer über `requireSession`/`requireOwner`.
- Tokens und Bearbeitungscodes nur als httpOnly-Cookie, nie in JSON-Antworten, im Browser oder in Sicherungen.
- `npm run build` schreibt CSP-Hashes in `vercel.json`; diese Änderung mitcommitten. Keine `style="…"`-Attribute.
- In `AdminView` nur von `adminData.refresh` abhängen, nie von `adminData` (sonst Endlosschleife).
- Nach Änderungen: `npm run test:api`.
