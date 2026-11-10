# AGENTS.md – Junior Youth Hub (Version 2)

Dieses Projekt ist eine Webseite für Animatoren von Bahá'í-Juniorjugendgruppen: Spiele, heilige Zitate, Dienst- und Kunstprojekte, Treffen-Planung und Werkzeuge für live in der Gruppe. Nutzung: auf dem Handy live, am Laptop zur Vorbereitung, per Beamer in der Gruppe.

## Stack und Befehle
React 18, TypeScript, Vite 6, Tailwind CSS v3, react-router-dom 7, lucide-react. Server nur als Vercel-Funktionen in `api/` (`sync.ts` Admin + Katalog, `submit.ts` Vorschläge, `og.ts` Vorschaubilder). Vercel veröffentlicht `main` automatisch, Domain `juju-hub.vercel.app`.

- Vor jedem Commit: `npm run check` und `npm run build` müssen fehlerfrei laufen. Wer `api/` oder die Admin-Anmeldung ändert, lässt zusätzlich `npm run test:api` laufen (Sicherheitstests mit nachgebautem GitHub, ohne echte Daten).
- Branch `redesign-v2`, ein Commit pro Phase, Pull Request für die Vorschau-Adresse. Nie direkt auf `main`.

## Harte Regeln
1. **Heilige Texte:** `src/data/quotes.ts` (QUOTES_DATA) wird nie bearbeitet, gekürzt, umformuliert oder automatisch ergänzt. Zitate werden ehrfürchtig dargestellt: Serifenschrift (Lora), ruhiger Hintergrund, keine Farbcodierung, keine Emojis, keine Spielelemente direkt am Text.
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
- **Inhalts-Icons (Spiele, Dienst, Kunst):** eigene Piktogramme in `src/data/pictograms.tsx` (Bauregeln im Dateikopf: Figur-Modul, drei Figurgrößen, Linien 2 / 2,25 px, keine Details unter 1,5 px). Zuordnung in `src/data/gameIcons.ts` bzw. `activityTones.ts`. Spiel- und Projekt-Icons (Dienst/Kunst) immer einfarbig in der neutralen `IconTile`, nie in Kategorie-Farbe, Kachel `size="xl"` auf Karten und Detailseiten. Bedien-Icons bleiben lucide. Umwelt (volunteer_activism) und Kinder (diversity_3) nutzen Formen aus Material Symbols (Apache-2.0, Helfer `Mat`, Quelle im Kommentar), weil sie handgezeichnet nicht sauber genug wurden. Gotcha: Elemente in einer eigenen `<mask>` erben vom `<svg>` `stroke="currentColor"`; gefüllte Ausstanzungen brauchen `stroke="none"`, sonst bleibt ein grauer Rand (so war es bei „Wer bin ich?“).

## Designsystem (verbindlich und gesperrt)
**Dunkler Modus = „Dark Graphite“**: neutrales Schwarz und Anthrazit (`--bg #0C0D0E`, `--surface #15171A`, `--border #23262D`, Text `#F4F4F6`), kein Blau im Hintergrund, kein „Nachtblau“. Karten (Spiel, Zitat, Dienst/Kunst) behalten ihre Darstellung inklusive des weichen Akzent-Leuchtens oben rechts. Der helle Modus bleibt hell und kühl mit einer kräftigen blauen Akzentfarbe, große Rundungen (Karten 20 px, Bedienelemente 14 px, Chips voll rund), eine Sans-Schrift (Figtree), Serif nur für heilige Texte. Alle Werte stehen als CSS-Variablen in `src/index.css` und werden in `tailwind.config.js` referenziert. Kein Bauteil enthält feste Farb- oder Radiuswerte.

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

- Lies zuerst `prompts/README.md` und arbeite die Phasen in der dort genannten Reihenfolge ab.
- Prüfe jede Phase im Browser bei 390, 768 und 1280 px, hell und dunkel, Deutsch und Englisch, und mache Screenshots.
- Ändere nichts außerhalb des Auftrags der jeweiligen Phase. Wenn etwas unklar ist, frage, statt zu raten.

## Admin-Sicherheit (seit 2026-10, nicht zurückbauen)
Vorher war `/api/sync` ohne Anmeldung nutzbar: Jeder konnte alle Passwort-Hashes lesen, das Inhaber-Konto übernehmen und Katalog-Einträge veröffentlichen oder löschen. Deshalb gilt:
- **Der Server entscheidet.** Konten, Passwörter und Rechte gibt es nur in `api/sync.ts`. Der Browser speichert keine Konten und keine Hashes und lädt sie nie hoch. Rechte im Browser (`getEffectivePermissions`) blenden nur Bedienelemente ein oder aus.
- **Sitzungen (seit 2026-11-09 als Cookie):** `login` setzt ein signiertes Token (HMAC, 12 h) als Cookie `jy_admin_session` (`HttpOnly; Secure; SameSite=Strict; Path=/api/sync`). JavaScript sieht das Token nie, im Browser liegt nur das Konto zur Anzeige (`sessionStorage`). Abmelden ruft `logout` auf, der Server löscht den Cookie. Jede Admin-Aktion wird auf dem Server gegen Rolle, Status und Passwort-Version geprüft. Neue Admin-Aktionen immer über `requireSession`/`requireOwner` bauen, nie ohne. Das Token nie wieder in die JSON-Antwort legen (`npm run test:api` prüft das).
- **Inhaber** ist nur das Konto mit genau der Adresse aus `OWNER_USERNAME`. Keine Namensvergleiche („nuri“, „modabber“).
- **Passwörter:** PBKDF2-SHA256 auf dem Server. Alte SHA-256-Hashes ohne `hashAlgo` waren öffentlich lesbar und werden abgelehnt („Neues Passwort nötig“); der Inhaber setzt sie neu.
- **Inhaber-Einrichtung/Notfall:** `ADMIN_SETUP_TOKEN` in Vercel setzen, unter `/admin` → „Inhaber-Einrichtung“ das Passwort festlegen, danach die Variable wieder löschen.
- **Admin-Speicher (Gist):** `saveState` liest vor jedem Schreiben die aktuelle Fassung über die API und schreibt nie über eine neuere; Speichern läuft pro Server-Instanz nacheinander (sonst gehen parallele Speicherungen verloren); bei Konflikt (auch GitHub-409) wiederholt der Server die Aktion bis zu viermal mit kurzer Zufallspause, danach Antwort 409. Jeder Aufruf an GitHub/Resend hat 8 s Frist (`upstream`). Unverschlüsselter Inhalt wird abgelehnt. Neue Aktionen speichern immer vor E-Mails oder GitHub-Aufrufen, sonst laufen diese bei der Wiederholung doppelt.
- **Portal statt Admin (2026-11-07):** Der Redaktionsbereich liegt unter `/portal`. `/admin` gibt seit 2026-11-10 die normale 404-Seite (keine Weiterleitung mehr), damit Scanner und Neugierige dort keine Seite finden.
- **Meine Beiträge (2026-11-07):** Beitragende haben kein Konto, „meine“ Beiträge sind die von diesem Gerät (`jy_my_submissions`). Jeder neue Vorschlag bekommt einen Bearbeitungscode; im öffentlichen Issue steht nur sein SHA-256 (`jy-edit`-Kommentar), der Code selbst kommt seit 2026-11-10 nur als httpOnly-Cookie `jy_edit_<Nummer>` (`Path=/api/submit`, 1 Jahr) und nie in die JSON-Antwort. Ein Code im Body zählt nicht (der alte Weg über `jy_submission_tokens` wurde am 2026-11-10 entfernt, als kein offener Beitrag mehr einen hatte). Überarbeiten (`/api/submit`, `action: 'update'`) geht nur mit Code und nur, solange das Issue das Label `änderung-nötig` trägt. Status liefert `GET /api/sync?issues=…` (nicht `/api/submit`, dort begrenzt die Firewall auf 5 pro Minute). Die Notiz der Redaktion ist öffentlich im Issue.
- **GitHub-Token** nur als `GITHUB_TOKEN` in Vercel. Kein Token im Browser, kein Token in Sicherungen.
- **Kontaktdaten** aus Vorschlägen stehen nie im öffentlichen Issue, nur verschlüsselt (`jy-contact`-Kommentar), lesbar nur für Prüfende.
- **Vercel-Variablen:** `GITHUB_TOKEN`, `GITHUB_REPO`, `ADMIN_STATE_GIST_ID`, `OWNER_USERNAME`, `ADMIN_SESSION_SECRET` (mind. 32 Zeichen, zufällig), `ADMIN_STATE_KEY` (empfohlen; sonst wird der GitHub-Token als Datenschlüssel benutzt), `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_NOTIFY_EMAIL`, `SITE_URL`. Fehlt `GITHUB_TOKEN` oder `ADMIN_SESSION_SECRET`, antwortet der Admin-Teil mit 503 (bewusst).
- **CSP** in `vercel.json` erlaubt das Inline-Skript in `index.html` (Dunkelmodus vor dem ersten Bild) per SHA-256. `npm run build` berechnet den Hash selbst und schreibt ihn in `vercel.json`; diese Änderung mitcommitten. Das Skript muss `jy_theme = 'system'` wie „Gerät folgen“ behandeln, sonst blitzt beim Neuladen der helle Modus auf.
- **Vorgerenderter Platzhalter** (`.jy-static-shell`): für Suchmaschinen und Besucher ohne JavaScript. Mit JavaScript ist er unsichtbar und erscheint erst nach 4 s, falls die App nicht startet (`src/index.css`).
- **CSP für Stile:** kein `'unsafe-inline'`. Erlaubt sind per Hash nur das eingebettete Haupt-CSS und das `<style>` von glisse. `npm run build` (`scripts/prerender-meta.mjs`) schreibt die Hashes selbst in `vercel.json`; diese Änderung mitcommitten. Auf Vercel bricht der Build ab, wenn die Hashes veraltet sind. Keine `style="…"`-Attribute in HTML oder per `setAttribute` (React-`style={}` ist erlaubt).
- **Gotcha:** In `AdminView` nie von `adminData` (neues Objekt nach jedem Refresh) in Sync-Effekten abhängen, nur von `adminData.refresh`. Sonst entsteht eine Endlosschleife von `/api/sync`-Aufrufen.
