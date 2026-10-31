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
6. **Daten:** Alles, was die Seite speichert, liegt in `localStorage` unter `jy_*`-Schlüsseln und muss in `src/utils/backup.ts` mitgesichert werden. Ausnahme: Zugangsdaten, Tokens und Sitzungen (`LEGACY_SENSITIVE_KEYS`, `jy_admin_session*`) kommen nie in eine Sicherung. Keine Cookies, kein Tracking, keine externen Schriften oder Skripte.
7. **Barrierefreiheit:** Kontrast mindestens WCAG AA (4,5:1 Text, 3:1 Bedienelemente), Touch-Ziele mindestens 44 px, sichtbarer Fokus, `prefers-reduced-motion` respektieren, jede Funktion per Tastatur erreichbar.
8. **Kein KI-Look:** keine Verläufe, kein Glas-Effekt, kein Glühen, keine Emojis als Dekoration, keine Pillen-Beschriftungen über Überschriften („✨ Neu“), keine Karten in Karten, keine Fantasie-Namen für Funktionen.

## Designsystem (verbindlich, Details in `prompts/00-design-system.md`)
Richtung „frisch und freundlich“: helle kühle Flächen, eine kräftige blaue Akzentfarbe, große Rundungen (Karten 20 px, Bedienelemente 14 px, Chips voll rund), weiche Flächen statt harter Linien, großzügiger Weißraum, eine Sans-Schrift (Figtree), Serif nur für heilige Texte. Alle Werte stehen als CSS-Variablen in `src/index.css` und werden in `tailwind.config.js` referenziert. Kein Bauteil enthält feste Farb- oder Radiuswerte.

## Arbeitsweise
- Lies zuerst `prompts/README.md` und arbeite die Phasen in der dort genannten Reihenfolge ab.
- Prüfe jede Phase im Browser bei 390, 768 und 1280 px, hell und dunkel, Deutsch und Englisch, und mache Screenshots.
- Ändere nichts außerhalb des Auftrags der jeweiligen Phase. Wenn etwas unklar ist, frage, statt zu raten.

## Admin-Sicherheit (seit 2026-10, nicht zurückbauen)
Vorher war `/api/sync` ohne Anmeldung nutzbar: Jeder konnte alle Passwort-Hashes lesen, das Inhaber-Konto übernehmen und Katalog-Einträge veröffentlichen oder löschen. Deshalb gilt:
- **Der Server entscheidet.** Konten, Passwörter und Rechte gibt es nur in `api/sync.ts`. Der Browser speichert keine Konten und keine Hashes und lädt sie nie hoch. Rechte im Browser (`getEffectivePermissions`) blenden nur Bedienelemente ein oder aus.
- **Sitzungen:** `login` liefert ein signiertes Token (HMAC, 12 h, in `sessionStorage`). Jede Admin-Aktion schickt es als `Authorization: Bearer …` und wird auf dem Server gegen Rolle, Status und Passwort-Version geprüft. Neue Admin-Aktionen immer über `requireSession`/`requireOwner` bauen, nie ohne.
- **Inhaber** ist nur das Konto mit genau der Adresse aus `OWNER_USERNAME`. Keine Namensvergleiche („nuri“, „modabber“).
- **Passwörter:** PBKDF2-SHA256 auf dem Server. Alte SHA-256-Hashes ohne `hashAlgo` waren öffentlich lesbar und werden abgelehnt („Neues Passwort nötig“); der Inhaber setzt sie neu.
- **Inhaber-Einrichtung/Notfall:** `ADMIN_SETUP_TOKEN` in Vercel setzen, unter `/admin` → „Inhaber-Einrichtung“ das Passwort festlegen, danach die Variable wieder löschen.
- **GitHub-Token** nur als `GITHUB_TOKEN` in Vercel. Kein Token im Browser, kein Token in Sicherungen.
- **Kontaktdaten** aus Vorschlägen stehen nie im öffentlichen Issue, nur verschlüsselt (`jy-contact`-Kommentar), lesbar nur für Prüfende.
- **Vercel-Variablen:** `GITHUB_TOKEN`, `GITHUB_REPO`, `ADMIN_STATE_GIST_ID`, `OWNER_USERNAME`, `ADMIN_SESSION_SECRET` (mind. 32 Zeichen, zufällig), `ADMIN_STATE_KEY` (empfohlen; sonst wird der GitHub-Token als Datenschlüssel benutzt), `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_NOTIFY_EMAIL`, `SITE_URL`. Fehlt `GITHUB_TOKEN` oder `ADMIN_SESSION_SECRET`, antwortet der Admin-Teil mit 503 (bewusst).
- **CSP** in `vercel.json` erlaubt das Inline-Skript in `index.html` per SHA-256. Wer dieses Skript ändert, muss den Hash neu berechnen, sonst bricht der Dunkelmodus-Start.
- **Gotcha:** In `AdminView` nie von `adminData` (neues Objekt nach jedem Refresh) in Sync-Effekten abhängen, nur von `adminData.refresh`. Sonst entsteht eine Endlosschleife von `/api/sync`-Aufrufen.
