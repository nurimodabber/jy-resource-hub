# Phase 06 – Werkzeuge

## Ziel
Sieben Werkzeuge, die live in der Gruppe auf dem Handy und auf dem Beamer funktionieren, im neuen Design und mit einer gemeinsamen Namensliste.

## Ist-Zustand (Live-Seite)
Eine klare Liste in drei Gruppen: Spiele leiten (Empire, Rollenverteiler), Gruppe organisieren (Teams und Zweiergruppen, Timer), Ideen (Spielfinder, Impulse, Gesprächskarten). Funktioniert, nutzt aber noch die Optik der Version 1. Namen müssen in Teams, Empire und Rollenverteiler getrennt gepflegt werden (sie teilen derzeit `jy_group_names`, aber ohne sichtbare Verwaltung).

## Aufgaben
1. **Liste:** Raster 1 Spalte Handy, 2 ab 768 mit Karten (Symbol im getönten Kreis, Titel, ein Satz). Gruppen mit H2. Zuletzt benutzte Werkzeuge als erste Zeile „Zuletzt“ (nur lokal gespeichert).
2. **Meine Gruppe** als gemeinsame Namensliste: Chips mit Namen, Hinzufügen per Eingabe, Anwesende an- und abwählen (Schalter), gespeichert unter `jy_group_names` plus `jy_group_present`. Alle Werkzeuge lesen daraus. Verwaltung auch in den Einstellungen (Phase 01). Kein Textfeld mit Kommas mehr in jedem Werkzeug.
3. **Empire:** Schritte als gefüllte Pillen-Leiste mit Fortschritt (1 Kategorie, 2 Zettel, 3 Vorlesen, 4 Spielen). Kategorie groß mit Beispielen, Filter im Sheet statt als Block. Entwurf-Kategorien (`status: 'draft'`) in den Einstellungen abschaltbar. Spielphase: Reiche als Karten mit Mitgliederzahl, „erraten“ als klarer Knopf, Rückgängig, Anzeige der Spielreihenfolge („Wer ist dran“ springt automatisch zum Reich, das weiterrät). Siegerseite mit Zusammenfassung. Zustand bleibt nach dem Neuladen erhalten (vorhanden), „Neue Runde“ mit Bestätigung.
4. **Rollenverteiler:** Weitergabemodus als Vollbild mit großem Verbergen-Knopf, kurzer Vibration beim Aufdecken und Verbergen, zufällige Reihenfolge optional, Fortschrittspunkte. Spion mit Rundentimer (8 Minuten, einstellbar) und Abstimmungshilfe. Werwölfe mit Erzähler-Ansicht in großer Schrift, Nachtfortschritt, Schnelleinstellung der Rollen (Anzahl, Amor an/aus), Variantenwahl „Niemand scheidet aus“ sichtbar mit Kurzregel. Mörder-Spiel mit Varianten.
5. **Teams:** Anwesende aus „Meine Gruppe“, Ergebnis als große Karten (Beamer-tauglich: Vollbildknopf), „Neu mischen“ und Verlauf zum Vermeiden wiederholter Paare (vorhanden), Option „Gleichmäßig nach Anzahl“ und „Zweiergruppen mit Rotation“.
6. **Timer:** große Ziffern (mindestens 30 vw mobil), Vollbild, Schnellwahl, eigener Wert, mehrere Zeitgeber nacheinander („Intervall“: Runde 2:00, Pause 0:30, 5 Runden), Signalton und Vibration (vorhanden), Farbe wechselt nur bei Ablauf. Der Timer läuft korrekt, wenn die Seite im Hintergrund war (Zeit über Endzeitpunkt, vorhanden).
7. **Spielfinder:** gemeinsame Filterlogik aus Phase 02, Ergebnis als Liste mit „Anderes Spiel“. Auf der Startseite eingebettet in kompakter Form (Phase 07).
8. **Impulse und Gesprächskarten:** Kartenansicht mit Wisch, große Schrift, Beamer-Modus. Zitate in den Gesprächskarten werden einmal in Anführungszeichen gesetzt (Hilfsfunktion `stripQuotes`, vorhanden) und im Lesestil aus Phase 04 gezeigt.
9. **Neues Werkzeug „Punktetafel“:** Teams aus „Meine Gruppe“, große Plus/Minus-Knöpfe, Rückgängig, Beamer-Ansicht. Keine Rangliste, die jemanden bloßstellt: standardmäßig nur Summen pro Team.
10. **Jedes Werkzeug:** Bildschirm bleibt an, funktioniert offline, hat eine Beamer-Ansicht (Vollbildknopf), kleine Hilfe „So geht’s“ (zwei Sätze, einklappbar), Tastaturbedienung.

## Akzeptanzkriterien
- Namen werden nur einmal eingegeben und stehen in allen Werkzeugen bereit.
- Rollenverteiler zeigt Karten nie zwei Spielern gleichzeitig, auch nicht bei schnellem Tippen (Test).
- Alle Werkzeuge laufen offline, bei 390 px ohne Überlauf, mit 44-px-Zielen.
- Entwurf-Inhalte sind sichtbar gekennzeichnet („Entwurf“ im Detail) oder abschaltbar.

## Nicht anfassen
Inhaltliche Texte der Entwurf-Listen (`empireContent.ts`, `roleContent.ts`). Änderungen daran nur auf ausdrücklichen Auftrag.
