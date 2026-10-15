# Vorschläge einrichten und verwalten

Über die Seite `/vorschlagen` können Animatoren neue Spiele, Dienstprojekte und kreative Aktivitäten einreichen. Das Formular legt automatisch ein GitHub-Issue im Repository an. So behältst du die volle redaktionelle Kontrolle, ohne dass eine Datenbank nötig ist.

---

## 1. GitHub-Token erstellen

1. Öffne auf GitHub deine Kontoeinstellungen: **Settings** → **Developer Settings** → **Personal access tokens** → **Fine-grained tokens**.
2. Klicke auf **Generate new token**.
3. Gib dem Token einen Namen (z. B. `jy-hub-proposal-bot`) und wähle eine Laufzeit (z. B. 1 Jahr).
4. Unter **Repository access** wähle **Only select repositories** und wähle das Repository `jy-hub-redesign` (oder dein Haupt-Repository).
5. Unter **Permissions** → **Repository permissions**:
   - **Issues**: Wähle **Read and Write** (Lesen und Schreiben).
   - Alle anderen Berechtigungen bleiben auf „No access“.
6. Klicke unten auf **Generate token** und kopiere den Schlüssel (er beginnt meist mit `github_pat_...`).

---

## 2. In Vercel hinterlegen

1. Öffne dein Projekt im **Vercel Dashboard**.
2. Gehe auf **Settings** → **Environment Variables**.
3. Trage folgende zwei Variablen für **Production** und **Preview** ein:
   - `GITHUB_TOKEN`: Dein kopierter GitHub-Token.
   - `GITHUB_REPO`: `owner/repo-name` (z. B. `dein-nutzername/jy-hub-redesign`).
4. Klicke auf **Save**.

*Hinweis: Wenn diese Variablen lokal nicht gesetzt sind, bietet das Formular automatisch einen E-Mail-Rückfall an, sodass keine Einsendung verloren geht.*

---

## 3. Benachrichtigungen auf dem Handy aktivieren

1. Installiere die offizielle **GitHub Mobile App** (iOS / Android) und melde dich an.
2. Öffne dein Repository auf GitHub (im Web oder in der App).
3. Klicke oben rechts auf den Button **Watch** (Auge) und wähle **All Activity** (Alle Aktivitäten).
4. Nun erhältst du sofort eine Push-Benachrichtigung und eine E-Mail, sobald ein neuer Vorschlag eingeht.

---

## 4. Vorschlag prüfen und übernehmen

Jedes neue Issue enthält den Vorschlag als lesbaren Text und als strukturierten JSON-Block.

### Automatische Übernahme per Skript:

1. Öffne ein Terminal im Projektverzeichnis.
2. Führe den Befehl mit der Issue-Nummer aus:
   ```bash
   node scripts/issue-to-data.mjs 42
   ```
   *(Ersetze `42` durch die Nummer des GitHub-Issues).*
3. Das Skript:
   - Extrahiert den JSON-Block,
   - Weist eine saubere, kollisionsfreie ID zu,
   - Fügt den Eintrag mit `status: 'draft'` in die passende Datendatei (`games.ts`, `serviceProjects.ts` oder `artsPrompts.ts`) ein.
4. Führe `npm run check` aus, um die Typsicherheit zu bestätigen.
5. Erstelle einen Branch und Pull Request zur Freigabe:
   ```bash
   git checkout -b vorschlag-issue-42
   git commit -am "feat: add proposal from issue #42"
   git push origin vorschlag-issue-42
   ```
6. Schließe das GitHub-Issue mit einem Dankeskommentar.
