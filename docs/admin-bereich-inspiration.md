# Der Admin-Bereich des Junior Youth Hub – Aufbau zum Nachbauen

Stand: 14.11.2026. Quellen: `api/sync.ts`, `api/submit.ts`, `src/components/AdminView.tsx`, `docs/admin-security.md`, `tests/api-security.mjs`.

Das Dokument beschreibt, wie das Redaktionsportal funktioniert und warum es so gebaut ist. Es soll als Vorlage für andere Projekte dienen. Es enthält keine Geheimnisse.

---

## 1. Überblick

| Teil | Was er tut |
|---|---|
| **Portal** (`/portal`, React, `AdminView.tsx`) | Oberfläche für das Team: Vorschläge prüfen, Katalog bearbeiten, Konten verwalten |
| **`/api/sync`** (Vercel-Funktion) | Der einzige Admin-Server: Anmeldung, Konten, Rechte, Prüfaktionen, öffentlicher Katalog |
| **`/api/submit`** (Vercel-Funktion) | Öffentliche Vorschläge von Besuchern, ohne Konto |
| **GitHub-Issues** (öffentliches Repo) | Speicher für Vorschläge und deren Status (über Labels) |
| **Privates Gist, verschlüsselt** | Speicher für Konten, Rechte, Versionsverlauf, Zugangsanfragen |
| **Resend** | E-Mails (neue Zugangsanfrage, Freischaltung) |

Es gibt **keine Datenbank**. GitHub dient als kostenloser Speicher: Issues für öffentliche Inhalte, ein Gist für den geheimen Zustand.

```
Besucher ──/api/submit──► GitHub-Issue (Label "vorschlag")
                                 │
Team ──/portal──/api/sync──► prüft ──► Label "übernommen" / "abgelehnt" / "änderung-nötig" / "gelöscht"
                                 │
Alle Besucher ──GET /api/sync──► liest freigegebene Issues ──► Katalog auf der Seite
```

---

## 2. Grundprinzip: Der Server entscheidet

Der wichtigste Satz des ganzen Aufbaus. Er kam aus einem echten Vorfall: Früher war `/api/sync` ohne Anmeldung nutzbar. Jeder konnte alle Passwort-Hashes lesen, das Inhaber-Konto übernehmen und Einträge veröffentlichen oder löschen.

Daraus folgt:
- Konten, Passwörter und Rechte existieren **nur auf dem Server**. Der Browser speichert keine Konten und keine Hashes.
- Rechte im Browser blenden nur Knöpfe ein oder aus. Sie schützen nichts. Jede Aktion wird auf dem Server neu geprüft.
- Neue Admin-Aktionen laufen immer über `requireSession` (angemeldet) oder `requireOwner` (nur Inhaber). Nie ohne.
- Ohne die nötigen Server-Variablen antwortet der Admin-Teil mit **503** (fail closed), statt unsicher weiterzulaufen.

---

## 3. Rollen und Rechte

Vier Rollen: `owner`, `editor`, `contributor`, `viewer`. Jede hat Standardrechte, die der Inhaber pro Konto anpassen kann.

| Recht | owner | editor | contributor | viewer |
|---|:-:|:-:|:-:|:-:|
| Entwürfe anlegen | ✔ | ✔ | ✔ | |
| Live veröffentlichen | ✔ | ✔ | | |
| Vorschläge prüfen | ✔ | ✔ | | |
| Minispiele bearbeiten | ✔ | ✔ | | |
| Katalog-Einträge löschen | ✔ | (anpassbar) | | |
| Eigene Änderungen zurücknehmen | ✔ | ✔ | ✔ | |
| **Konten verwalten** | ✔ | nie | nie | nie |
| **Alle Änderungen zurücknehmen** | ✔ | nie | nie | nie |
| **Systemeinstellungen** | ✔ | nie | nie | nie |

Wichtige Details:
- `maskPermissions` setzt die drei Grundrechte (fett) für Nicht-Inhaber **immer** auf `false`, egal was gespeichert ist. Auch ein manipulierter Datensatz kann sie nicht vergeben.
- **Inhaber** ist nur das Konto mit genau der E-Mail aus der Variable `OWNER_USERNAME`. Keine Namensvergleiche, kein Feld, das man selbst setzen kann.

---

## 4. Anmeldung und Sitzungen

### Passwörter
- **PBKDF2-SHA256**, 310 000 Runden, zufälliges Salt pro Konto (Node `crypto`, keine Bibliothek).
- Länge 8–200 Zeichen.
- Vergleich immer zeitkonstant (`crypto.timingSafeEqual` über SHA-256 beider Werte).
- Alte, öffentlich gewordene SHA-256-Hashes werden abgelehnt („Neues Passwort nötig“). Alte, nie öffentliche Hashes werden beim nächsten Login automatisch auf PBKDF2 gehoben.

### Sitzung als Cookie
- Nach dem Login signiert der Server ein Token: `payload.signatur`, HMAC-SHA256 mit `ADMIN_SESSION_SECRET` (mindestens 32 Zeichen).
- Payload: Konto-ID, **Passwort-Version** (kurzer Hash aus Salt + Hash), Ablaufzeit (12 h).
- Das Token liegt nur im Cookie: `jy_admin_session; Path=/api/sync; HttpOnly; Secure; SameSite=Strict`.
- JavaScript sieht das Token nie. Es steht auch nie in einer JSON-Antwort (ein Test prüft das).
- Im Browser liegt nur das Konto zur Anzeige (`sessionStorage`).

### Prüfung bei jeder Anfrage
Die Sitzung ist zustandslos, wird aber bei **jedem** Aufruf gegen das gespeicherte Konto geprüft:
- Signatur gültig? Nicht abgelaufen?
- Konto existiert noch und ist `active`?
- Passwort-Version stimmt noch? → Ein Passwortwechsel beendet automatisch alle alten Sitzungen. Kein Sperrlisten-Speicher nötig.

Ungültige Sitzung → Cookie wird gelöscht, Antwort 401.

### Abmelden
`logout` lässt den Server den Cookie löschen (`Max-Age=0`).

---

## 5. Schutz gegen Angriffe

| Schutz | Umsetzung |
|---|---|
| **CSRF** | `SameSite=Strict` + `isSameOrigin()`: lehnt `Sec-Fetch-Site: cross-site` und fremde `Origin` ab. Keine CORS-Header. |
| **Passwort raten** | Höchstens 10 Logins pro IP in 15 min. Pro Konto: nach 10 Fehlversuchen sind nur Verbindungen gesperrt, die für dieses Konto schon falsch lagen. So kann niemand den Inhaber aussperren, indem er absichtlich falsche Passwörter tippt. |
| **Fehlversuch-Bremse** | 600 ms Pause nach jedem Fehler. |
| **Konten ausspähen** | Unbekannte E-Mail: Der Server rechnet trotzdem ein PBKDF2 (gleiche Antwortzeit) und gibt dieselbe Antwort `invalid`. Zugangsanfragen antworten immer `ok`, auch wenn die Adresse schon ein Konto hat. |
| **Große Anfragen** | Body höchstens 3,5 MB, einzelne Inhalte höchstens 40 KB. |
| **Fremde Issues anfassen** | Prüfaktionen gelten nur für Issues mit einem Vorschlags-Label, nie für beliebige Issues oder Pull Requests. |
| **@-Erwähnungen** | `@` in Texten wird mit einem unsichtbaren Zeichen entschärft, damit der Server-Token keine GitHub-Nutzer anpingt. |
| **Hängende Dienste** | Jeder Aufruf an GitHub/Resend hat 8 s Frist. |
| **XSS-Folgen** | Strenge CSP ohne `unsafe-inline`; Inline-Skripte und -Stile nur per SHA-256-Hash. Der Build berechnet die Hashes selbst und schreibt sie in `vercel.json`. Token ist httpOnly, also auch bei XSS nicht lesbar. |
| **Scanner** | `/admin` liefert die normale 404-Seite. Das Portal liegt unter `/portal`. |

Hinweis: Die Rate-Limits liegen im Speicher einer Server-Instanz. Auf Vercel kann es mehrere geben. Die PBKDF2-Kosten und die Pause bilden trotzdem eine Untergrenze. Für mehr: Vercel-Firewall (wird bei `/api/submit` genutzt, 5 pro Minute) oder einen geteilten Speicher.

---

## 6. Speicher: verschlüsseltes Gist

Der geheime Zustand (Konten, Verlauf, Anfragen) ist ein JSON-Objekt in **einer Datei in einem privaten Gist**.

- **Verschlüsselt mit AES-256-GCM.** Schlüssel = SHA-256 aus `ADMIN_STATE_KEY`. Pro Speicherung ein neuer Zufalls-IV. Unverschlüsselter Inhalt wird beim Lesen abgelehnt.
- **Konfliktschutz**: Ein Gist kennt kein „nur schreiben, wenn unverändert“. Deshalb:
  1. Vor jedem Schreiben die aktuelle Fassung über die API lesen (nicht über das CDN, das hinterherhinkt).
  2. Ist sie neuer als die eigene (`updatedAt` weicht ab) → Fehler `state_conflict`.
  3. Der Handler wiederholt die ganze Aktion bis zu viermal mit frischen Daten und kurzer Zufallspause (40–160 ms). Danach Antwort 409.
  4. Auch GitHubs eigenes 409 zählt als Konflikt.
- Speichern läuft pro Instanz in einer Warteschlange nacheinander.
- Kurzer Lese-Cache (15 s) und ein Fingerabdruck, damit unveränderte Zustände gar nicht erst geschrieben werden.

**Regel, die daraus folgt:** Jede Aktion speichert **vor** Nebenwirkungen (E-Mail, GitHub-Aufruf). Sonst würde eine Wiederholung nach Konflikt die E-Mail doppelt senden.

Ein Rest bleibt: ein Zeitfenster von einer Rundreise. Für ein kleines Team reicht das. Bei mehr Last ist eine echte Datenbank besser.

---

## 7. Vorschläge von Besuchern (ohne Konto)

1. Besucher füllt ein Formular aus → `POST /api/submit`.
2. Server legt ein **GitHub-Issue** an, Labels `vorschlag` + Typ (`spiel`, `dienst`, `kunst`). Der Inhalt steht als JSON-Block im Issue-Text.
3. **Kontaktdaten** stehen nie im Klartext im (öffentlichen) Issue. Sie werden verschlüsselt (AES-GCM) als HTML-Kommentar `<!-- jy-contact:… -->` eingebettet. Nur Prüfende bekommen sie entschlüsselt.
4. **Bearbeitungscode** statt Konto:
   - Server erzeugt einen zufälligen Code.
   - Im Issue steht nur sein SHA-256 (`<!-- jy-edit:… -->`).
   - Der Code selbst geht nur als httpOnly-Cookie `jy_edit_<Issue-Nummer>` (Path `/api/submit`, 1 Jahr) an den Browser. Nie in die JSON-Antwort.
   - „Meine Beiträge“ = Beiträge von diesem Gerät (`jy_my_submissions` in `localStorage`).
5. **Überarbeiten** geht nur mit gültigem Code und nur, solange das Issue das Label `änderung-nötig` trägt.
6. **Status abfragen** läuft über `GET /api/sync?issues=…` (nicht über `/api/submit`, dort begrenzt die Firewall).

---

## 8. Prüfen im Portal

Prüfende sehen offene Vorschläge und haben vier Aktionen. Jede setzt ein Label, schreibt einen Kommentar ins Issue und speichert eine Notiz:

| Aktion | Recht | Label | Issue |
|---|---|---|---|
| Übernehmen | Prüfen oder Veröffentlichen | `übernommen` | geschlossen |
| Ablehnen | Prüfen | `abgelehnt` | geschlossen |
| Änderung erbitten | Prüfen, **Begründung Pflicht** (min. 3 Zeichen) | `änderung-nötig` | bleibt offen |
| Löschen | Löschen | `gelöscht` | geschlossen |

Beim Übernehmen kann der Prüfende den Inhalt vorher korrigieren (`updatedPayload`).

**Der öffentliche Katalog** ist einfach: `GET /api/sync` liest alle Issues (bis 1000, seitenweise), nimmt die mit `übernommen` und sammelt die IDs mit `gelöscht`. Schlägt eine Seite fehl, gibt der Server gar nichts zurück statt einer halben Liste. Sonst würden gelöschte Einträge wieder auftauchen. Alte Kontaktfelder werden vor der Ausgabe entfernt.

---

## 9. Konten und Zugangsanfragen

- **Zugang anfragen** (öffentlich): Name, E-Mail, Passwort, Nachricht. Das Passwort wird sofort gehasht gespeichert. Höchstens 5 Anfragen pro IP und Stunde, höchstens 50 offen. Der Inhaber bekommt eine E-Mail.
- **Inhaber entscheidet**: annehmen (mit Rolle) → Konto entsteht mit dem schon gesetzten Passwort, Bestätigungs-E-Mail. Ablehnen → Hash wird gelöscht.
- **Inhaber-Aktionen**: Konto anlegen, Rolle/Rechte ändern, Passwort zurücksetzen, sperren, löschen.
- **Jeder** kann sein eigenes Passwort ändern.
- **Sichtbarkeit**: Nur der Inhaber sieht E-Mail-Adressen aller Konten und den Autor im Verlauf. Andere sehen eine reduzierte Teamliste.

### Inhaber-Einrichtung und Notfall
Kein Hintertür-Passwort im Code. Stattdessen:
1. `ADMIN_SETUP_TOKEN` (mindestens 16 Zeichen) in Vercel setzen.
2. Im Portal „Inhaber-Einrichtung“: Token + Inhaber-E-Mail + neues Passwort.
3. Variable danach wieder löschen. Ohne sie ist die Funktion aus.

---

## 10. Versionsverlauf

Katalog-Änderungen aus dem Portal werden als **Revisionen** gespeichert (nur anhängen, nie überschreiben). Der Server stempelt den Autor selbst ein (`mergeRevisions`), der Browser kann ihn nicht fälschen. Daraus ergibt sich das Zurücknehmen: eigene Änderungen (Editoren, Beitragende) oder alle (nur Inhaber).

---

## 11. Server-Variablen

| Variable | Zweck |
|---|---|
| `GITHUB_TOKEN` | Zugriff auf Issues und Gist. Nur auf dem Server. |
| `GITHUB_REPO` | Repo für Vorschläge |
| `ADMIN_STATE_GIST_ID` | Gist für den geheimen Zustand |
| `OWNER_USERNAME` | E-Mail des Inhabers |
| `ADMIN_SESSION_SECRET` | HMAC-Schlüssel, min. 32 Zeichen, zufällig |
| `ADMIN_STATE_KEY` | Schlüssel für die Verschlüsselung (empfohlen, sonst Fallback auf den GitHub-Token) |
| `ADMIN_SETUP_TOKEN` | Nur kurz für Einrichtung/Notfall |
| `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_NOTIFY_EMAIL` | E-Mails |
| `SITE_URL` | Links in E-Mails |

---

## 12. Tests

`npm run test:api` startet die Funktionen gegen ein **nachgebautes GitHub** (`scripts/dev-mock-github.mjs`), ohne echte Daten. Geprüft wird unter anderem:
- Token taucht nie in einer JSON-Antwort auf.
- Aktionen ohne Sitzung → 401, ohne Recht → 403.
- Fremde Herkunft (CSRF) wird abgelehnt.
- Konflikte im Gist werden wiederholt statt überschrieben (`tests/api-resilience.mjs`).

Diese Tests sind der Grund, warum man den Admin-Teil ruhig ändern kann.

---

## 13. Lehren für das nächste Projekt

1. **Sicherheit gehört auf den Server.** Was im Browser geprüft wird, ist nur Bequemlichkeit.
2. **Tokens in httpOnly-Cookies**, nie in `localStorage` oder JSON-Antworten.
3. **Passwort-Version in die Sitzung** einbauen: Passwortwechsel beendet alle Sitzungen ohne zusätzlichen Speicher.
4. **Fail closed:** Fehlt eine Variable, ist der Admin-Teil aus.
5. **Keine Namensvergleiche** für Sonderrechte. Eine feste Variable bestimmt den Inhaber.
6. **Gleiche Antworten** für „gibt es“ und „gibt es nicht“, sonst lassen sich Konten ausspähen.
7. **Rate-Limit pro Konto so bauen, dass man niemanden aussperren kann.**
8. **Ohne Datenbank geht viel** (Issues + verschlüsseltes Gist), aber dann selbst für Konfliktschutz sorgen und vor Nebenwirkungen speichern.
9. **Besucher ohne Konto** bekommen einen Code als Cookie; gespeichert wird nur dessen Hash.
10. **Private Daten nie in öffentliche Speicher**, auch nicht „versteckt“ – nur verschlüsselt.
11. **Tests mit nachgebautem Dienst** für jede Sicherheitsregel.
12. **Admin-Pfad nicht erratbar** und alte Pfade als 404, nicht als Weiterleitung.

### Was man anders machen könnte
- Bei mehr als einer Handvoll Admins oder viel Verkehr: echte Datenbank (z. B. Postgres) statt Gist, mit Transaktionen statt Wiederholungsschleife.
- Rate-Limits in einem geteilten Speicher (z. B. Redis/KV) statt pro Instanz.
- Zwei-Faktor-Anmeldung für den Inhaber.
- Für React-Portale: Sync-Effekte nie von einem Objekt abhängig machen, das bei jedem Laden neu entsteht (hier gab es dadurch eine Endlosschleife von Anfragen).
