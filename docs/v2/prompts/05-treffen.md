# Phase 05 – Treffen-Assistent (statt Planer)

## Entscheidung und Begründung
Der Planer wird nicht kleiner, sondern zum Herzstück. Auf der Live-Seite ist er eine leere Seite mit drei verschachtelten Kästen („0 Blöcke · 0 Min.“) ohne Bezug zu dem, was Animatoren wirklich tun. Ein Treffen hat aber einen festen Bogen: **Andacht, Zitat lernen, Spiel, Dienst oder Kunst, Abschluss.** Im Camp kommen kreative Projekte und Abendprogramme dazu. Die Seite hat alle Zutaten, bringt sie aber nirgends zusammen. Das soll der Treffen-Assistent tun, geführt statt leer.

## Ziel
In unter drei Minuten steht ein Treffen: Man wählt eine Vorlage, tauscht Bausteine mit einem Tipp aus und leitet das Treffen live aus dem Plan heraus.

## Ist-Zustand
Plan mit Blöcken (`SessionSlot` mit Typ warmup, devotional, study, arts_discussion, service, closing), Vorlagen 75 Min Standard, 45 Min Schnell, 2 h Camp, Speicher in `jy_plans` und `jy_active_plan_id`, ein doppelter alter Schlüssel `jy_modular_session_plan`. Drucken als Handout.

## Aufgaben
1. **Umbenennen:** Bereich heißt „Treffen“, Route `/treffen` (mit Weiterleitung von `/planner`). Hauptmenü-Eintrag aus Phase 01. Schlüssel migrieren: `jy_modular_session_plan` in `jy_plans` überführen und löschen (einmalig, mit Sicherungskopie in `jy_migration_backup`).
2. **Einstieg ohne leeren Zustand:** Wenn kein Plan existiert, zeigt die Seite zwei große Auswahlen: „Normales Treffen (75 Min)“ und „Camp-Abend (2 h)“, dazu „Leer anfangen“. Danach ist der Plan sofort mit Platzhalter-Bausteinen gefüllt.
3. **Bausteine mit festem Bogen** (Typen anpassen, Daten migrieren): Andacht, Zitat und Lernen, Spiel, Dienst oder Kunst, Abschluss, frei. Jeder Baustein hat Dauer, Titel und optional einen Verweis (`referenceType`/`referenceId`).
4. **Baustein füllen mit einem Tipp:** In jedem Baustein ein Knopf „Auswählen“, der ein Sheet mit passender Liste öffnet:
   - Andacht: Gebete aus den Zitaten (Kategorie Gebete) und Lieder aus `songs.ts` (Verlinkung über die vorhandene Lieder-Anbindung). Keine neuen Texte.
   - Zitat und Lernen: Zitat aus Liste, Lektion des Jugendbuchs (Metadaten der Zitate) und eine Methode.
   - Spiel: Liste mit Filter nach Dauer und Personenzahl der Gruppe.
   - Dienst oder Kunst: Liste aus Phase 03.
   - Vorschläge im Sheet sind vorgefiltert auf die Restzeit des Plans.
5. **Vorlagen:**
   - *Normales Treffen, 75 Min:* Andacht 10, Zitat und Lernen 20, Spiel 15, Dienst oder Kunst 20, Abschluss 10.
   - *Kurz, 45 Min:* Andacht 5, Zitat 15, Spiel 15, Abschluss 10.
   - *Camp-Abend, 2 h:* Andacht 10, Energizer 15, Kreativblock (Kunst oder Dienst, `camp`) 45, Spiel für den Abend 25 (z. B. Werwölfe, Salad Bowl), Reflexion 15, Abschluss 10.
   - *Camp-Tag mit Programm:* Bausteine als freie Kette aus Spielen, Kunst und Dienst, mit automatischer Zeitsumme.
   Die Aufteilung ist ein Entwurf, in der Abschlussmeldung kennzeichnen.
6. **Ansicht Plan:** Zeitleiste vertikal mit Startzeit-Eingabe („Beginn 17:00“ erzeugt Uhrzeiten), Gesamtdauer, Warnung bei Über- oder Unterschreitung eines Ziels, Drag-and-drop oder Pfeile zum Verschieben (Tastatur-tauglich), Duplizieren, Entfernen mit Rückgängig-Toast.
7. **Leiten statt nur planen („Treffen starten“):** Vollbildmodus, der die Bausteine nacheinander zeigt: aktueller Baustein groß, Restzeit-Anzeige, Knopf „Weiter“, direkter Sprung in den Spielmodus oder Lesemodus des verlinkten Inhalts, Bildschirm bleibt an. Gesamtfortschritt oben.
8. **Packliste:** automatisch aus den Materialien aller Bausteine, abhakbar, Teil der Druckansicht.
9. **Teilen und Drucken:** Druckansicht auf einer Seite (Ablauf mit Uhrzeiten, Material, Verweise mit Titeln). Teilen als Link, der den Plan in der URL kodiert (komprimiert, ohne Server), damit ein Mit-Animator ihn öffnen und übernehmen kann.
10. **Mehrere Pläne:** Liste „Meine Treffen“ mit Namen, Datum, Dauer. Schnelles Duplizieren („Nächste Woche“).

## Akzeptanzkriterien
- Neuer Nutzer: Vorlage wählen, zwei Bausteine tauschen, „Treffen starten“ – alles ohne Anleitung in unter 3 Minuten.
- Altes Planformat wird verlustfrei migriert (Test mit einem Beispiel aus dem alten Format).
- Plan funktioniert offline, Druckansicht passt auf eine A4-Seite bei 75 Minuten.
- Alle verlinkten Inhalte (Gebet, Zitat, Spiel, Projekt) öffnen aus dem Treffen heraus und führen mit dem Zurück-Link zurück.

## Nicht anfassen
`src/data/quotes.ts` und Zitattexte. Gebete werden nur verlinkt und angezeigt, nie kopiert oder geändert.
