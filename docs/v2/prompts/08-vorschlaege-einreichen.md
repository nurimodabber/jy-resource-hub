# Phase 08 – Vorschläge einreichen und prüfen

## Ziel
Animatoren können Spiele, Dienstprojekte und kreative Aktivitäten vorschlagen. Du wirst benachrichtigt, prüfst den Vorschlag und übernimmst ihn mit wenig Aufwand. Nichts erscheint auf der Seite, bevor du es freigibst.

## Entscheidung
Das Formular legt über eine kleine Vercel-Funktion ein **GitHub-Issue** im Repo an. Gründe: GitHub benachrichtigt dich per E-Mail und in der GitHub-Handy-App, du siehst Vorschläge in einer Liste mit Labels, Einsendende brauchen kein Konto, es gibt keine Datenbank und keine Zusatzkosten, und der Vorschlag liegt schon im Repo, wo er später als Datensatz landet. Es gibt keine Anmeldung und keinen Adminbereich, den man absichern müsste.
**Zitate sind ausgenommen**: Es sind heilige Texte, die nur du pflegst.

## Aufgaben
1. **Seite `/vorschlagen`** im Designsystem. Aufruf aus Einstellungen, Fußzeile, Startseite und Leerzuständen („Fehlt etwas? Schick es uns“). Schritt 1: Art wählen (Spiel, Dienstprojekt, Kreative Aktivität). Schritt 2: Formular. Schritt 3: Bestätigung mit „Danke, wir schauen es uns an“ und einer Zusammenfassung zum Kopieren.
2. **Formularfelder** passend zu den Datentypen, nur Pflichtfelder markiert: Titel, Untertitel (optional), ein Satz Zusammenfassung, Gruppengröße (von/bis), Dauer (Minuten von/bis), Material (Liste), Ablauf (nummerierte Schritte, mindestens 3), Tipps für Animatoren (optional), Quelle oder Herkunft („selbst erfunden“, „abgewandelt von…“), Name oder Kürzel (optional), E-Mail (optional, nur für Rückfragen). Für Dienst und Kunst zusätzlich: Ziel, Reflexionsfragen, drinnen/draußen, für Camp geeignet.
   Pflicht-Kästchen: „Ich habe den Inhalt selbst geschrieben oder darf ihn weitergeben.“ und „Ich habe den Datenschutzhinweis gelesen.“
3. **Vorschau vor dem Senden:** Der Vorschlag wird so gezeigt, wie er als Spielseite aussehen würde.
4. **Serverfunktion** `api/submit.ts` (Vercel, Node):
   - Prüft Länge und Typ aller Felder, entfernt HTML, begrenzt Größe (max. 8 KB), lehnt Links in Titel und Zusammenfassung ab.
   - Spam-Schutz ohne Tracking: verstecktes Honeypot-Feld, Mindestzeit zwischen Seitenaufruf und Senden (3 s), einfache Begrenzung pro IP und Stunde (z. B. Vercel KV oder Edge Config, falls nicht verfügbar: Header-basiert mit kurzer Sperre). Optional Cloudflare Turnstile, wenn du ein Konto anlegst. Der Code ist dafür vorbereitet, aber standardmäßig aus.
   - Legt per GitHub-API ein Issue an mit Titel `[Spiel] Name`, Label `vorschlag` plus `spiel|dienst|kunst`, Beschreibung als lesbarer Text **und** als JSON-Block in dem Format der Datenstruktur (`Game` bzw. `ServiceProject`/`ArtsPrompt`) mit `status: 'draft'` und `submittedBy`.
   - Schlüssel liegen nur in Vercel-Umgebungsvariablen: `GITHUB_TOKEN` (fein abgestuft, nur dieses Repo, nur „Issues: schreiben“), `GITHUB_REPO`. Nie im Code oder im Browser.
   - Antwortet mit Erfolg oder einer verständlichen Fehlermeldung. Bei Fehlern speichert das Formular den Entwurf lokal (`jy_submit_draft`) und bietet „Per E-Mail senden“ als Rückfall (mailto mit dem Text).
5. **Datenschutz:** Texte in `DatenschutzView` und `translations.ts` ergänzen: Was gesendet wird, dass die Daten bei GitHub (USA) als Issue liegen, dass Name und E-Mail freiwillig sind, wie man Löschung verlangt. Dies ist ein Entwurf und muss von dir rechtlich geprüft werden (kein Rechtsrat).
6. **Prüfung durch dich (in GitHub):**
   - Lege `.github/ISSUE_TEMPLATE/config.yml` und Labels an (`vorschlag`, `geprüft`, `übernommen`, `abgelehnt`).
   - Skript `scripts/issue-to-data.mjs <issue-nummer>`: liest das Issue mit `gh`, extrahiert den JSON-Block, prüft ihn gegen die TypeScript-Typen, vergibt eine neue ID (Kleinbuchstaben mit Bindestrichen, kollisionsfrei) und hängt den Eintrag mit `status: 'draft'` an die passende Datendatei an. Dann öffnest du einen Pull Request, schaust auf der Vorschau-Adresse und gibst frei.
   - GitHub Action (optional): bei Label `geprüft` führt sie das Skript aus und öffnet automatisch den Pull Request.
7. **Anzeige auf der Seite:** Übernommene Einträge tragen im Detail den Hinweis „Eingereicht von Animatoren“ (und den Namen, falls angegeben und erlaubt) und, solange `status: 'draft'`, den Hinweis „Noch nicht geprüft“. Entwürfe sind standardmäßig ausgeblendet und in den Einstellungen einblendbar.
8. **Anleitung für dich:** `docs/v2/vorschlaege-einrichten.md` in einfachem Deutsch: GitHub-Token erstellen (Schritte), in Vercel eintragen, GitHub-Benachrichtigungen für das Repo auf „Alle Aktivitäten“ stellen, Handy-App installieren, Test-Vorschlag senden, Vorschlag übernehmen.

## Akzeptanzkriterien
- Testvorschlag erzeugt ein Issue in unter 5 Sekunden und löst eine Benachrichtigung aus.
- Kein Token im Client-Bundle (Test: `grep` im `dist/`-Ordner).
- Honeypot, Mindestzeit und Größenbegrenzung abgesichert durch Tests.
- Ohne Vercel-Variablen zeigt das Formular nur den E-Mail-Rückfall und bricht nicht ab.
- Übernahmeskript erzeugt aus dem Testvorschlag einen gültigen Datensatz (`npm run check` grün).

## Nicht anfassen
Bestehende Inhalte. Eingereichte Inhalte werden nie automatisch veröffentlicht.
