# Designsystem „frisch und freundlich“ (Junior Youth Hub v2)

Das Designsystem des Junior Youth Hub (Version 2) folgt der gestalterischen Richtung **„frisch und freundlich“**: helle, kühle Flächen, eine kräftige blaue Akzentfarbe (#1F6FEB), großzügige Radien, weiche Flächen statt harter Linien und kompromisslose Barrierefreiheit (WCAG 2.1 AA Kontrast).

---

## 1. Gestaltungsprinzipien

1. **Flächen statt Linien:**
   Karten sind weiß auf getöntem Hintergrund (`bg`) mit dezentem Schatten (`--shadow-1`), ohne störende Rahmen. Eingaben und Chips besitzen eine getönte Füllung (`surface-2`) ohne Rahmen. Linien dienen ausschließlich als dezente Trenner in Listen oder als Fokus-Indikator.

2. **Ehrfurcht vor heiligen Texten:**
   Zitate und Gebete werden in der klassischen Serifenschrift **Lora** auf ruhigem Hintergrund dargestellt. Keine Farbcodierung, keine Emojis, keine spielerischen Elemente direkt am heiligen Text.

3. **Kein KI-Look:**
   Keine Farbverläufe, kein Glas im Inhalt (Glas nur aus `glisse` für schwebende Bedienelemente, siehe Glas-Regel in `AGENTS.md`), kein Glühen, keine Emojis als Dekoration, keine Pillen-Badges über Überschriften („✨ Neu“), keine verschachtelten Karten in Karten.

4. **100% Token-basiert:**
   Kein Bauteil enthält fest verdrahtete Hex-Farbcodes, feste Pixel-Radien oder willkürliche Schatten. Alle visuellen Attribute werden über CSS-Variablen in `src/index.css` und Tokens in `tailwind.config.js` gesteuert.

---

## 2. Design-Tokens

### Farb-Tokens

| Token | Hell | Dunkel | Verwendung & Kontrast |
|---|---|---|---|
| `--bg` | `#F7F9FC` | `#0C0D0E` | App-Hintergrund |
| `--surface` | `#FFFFFF` | `#15171A` | Karten, Dialoge, Sheets |
| `--surface-2` | `#EEF2F8` | `#1E2025` | Eingabefelder, Chips, neutrale Badges |
| `--surface-raised` | `#FFFFFF` | `#1A1C20` | Angehobene Ebenen |
| `--border` | `#E3E8F0` | `#23262D` | Listentrenner, dezent |
| `--text` | `#142033` | `#F4F4F6` | Primärer Text (15.5:1 / 16.4:1 AA) |
| `--text-secondary` | `#4A5568` | `#A1A1AA` | Sekundärer Text (7.1:1 / 7.0:1 AA) |
| `--text-tertiary` | `#5D6679` | `#93939C` | Metadaten, Zähler (5.8:1 / 5.9:1 AA) |
| `--accent` | `#1F6FEB` | `#3B82F6` | Primäre Aktionen, Fokus-Ring |
| `--accent-hover` | `#1859C4` | `#60A5FA` | Hover-Zustand primärer Buttons |
| `--accent-subtle` | `#E8F0FE` | `#162238` | Hintergründe aktiver Chips & Symbolkreise |
| `--accent-text` | `#1850B8` | `#93C5FD` | Text auf accent-subtle (6.4:1 / 8.8:1 AA) |
| `--accent-contrast` | `#FFFFFF` | `#080C14` | Text auf accent-Button (4.6:1 / 5.3:1 AA) |
| `--highlight` | `#F5B82E` | `#F5B82E` | Nur kleine Markierungen (z. B. Heute-Punkt) |
| `--success` | `#167448` | `#4FC08A` | Erfolgsstatus, Bestätigungen (5.2:1 / 7.9:1 AA) |
| `--danger` | `#C13333` | `#FF8A8A` | Warnungen, Löschaktionen (4.9:1 / 7.9:1 AA) |

Die Dunkel-Spalte ist „Dark Graphite“ und gesperrt (siehe `AGENTS.md`). Die Dunkel-Kontraste gelten gegen `--surface`, gemessen mit `npm run contrast`.

> **Begründung Akzentfarbe #1F6FEB:**
> Das Logo (`public/logo.png`) besitzt ein tiefes Marineblau (`#23496D`), Gold (`#E5A43B`) und Salbeigrün (`#4D8065`). Ein Farbwert wie `#23496D` ist für primäre Schaltflächen und aktive Filterzustände zu dunkel und unzugänglich. `#1F6FEB` liegt in derselben blauen Farbfamilie (216° Hue vs 209° Hue im Logo), sorgt für einen frischen, einladenden Charakter und erfüllt auf Weiß und auf `#142033` streng die WCAG-AA-Kontrastanforderungen.

### Radius-Tokens

| Variable | Tailwind-Klasse | Wert | Verwendung |
|---|---|---|---|
| `--r-chip` | `rounded-chip`, `rounded-full` | `9999px` | Chips, Tags, Badges, SegmentedControl |
| `--r-control` | `rounded-control`, `rounded-lg`, `rounded-xl` | `14px` | Buttons, IconButtons, Inputs, Select, Stepper |
| `--r-card` | `rounded-card`, `rounded-2xl` | `20px` | Kachel-Karten, Listen-Container, Panels |
| `--r-dialog` | `rounded-dialog`, `rounded-3xl` | `24px` | Modale Fenster / Dialoge |
| `--r-sheet` | `rounded-t-sheet`, `rounded-sheet` | `28px` | Bottom-Sheets (obere Rundung) |

### Elevations-Tokens

| Variable | Tailwind-Klasse | Licht | Dunkel | Verwendung |
|---|---|---|---|---|
| `--shadow-1` | `shadow-1`, `shadow-card` | `0 1px 2px rgba(20,32,51,.06)` | `0 1px 2px rgba(0,0,0,.35)` | Statische Karten, Segment-Schieber |
| `--shadow-2` | `shadow-2`, `shadow-overlay` | `0 8px 24px rgba(20,32,51,.08)` | `0 8px 24px rgba(0,0,0,.50)` | Hover-Karten, Dialoge, Sheets, Toasts |

### Typografie-Skala

- **Schriftfamilie:** `Figtree` (UI), `Lora` (heilige Texte und Zitate; für Überschriften und Kacheltitel ebenfalls erlaubt, Entscheidung des Inhabers 2026-11-13)
- **H1:** 32 px / Zeilenhöhe 40 px (mobil 28 px / 36 px), `font-bold`
- **H2:** 22 px / Zeilenhöhe 30 px, `font-bold`
- **H3:** 18 px / Zeilenhöhe 26 px, `font-bold`
- **Fließtext:** 16 px / Zeilenhöhe 26 px, `font-normal` (400) / `font-medium` (500)
- **Klein:** 14 px / Zeilenhöhe 20 px, `font-normal` / `font-medium`
- **Kleinste:** 13 px / Zeilenhöhe 18 px, `font-medium`
- **Zahlen:** Stets mit `tabular-nums` formatiert.

### Animation & Übergänge

- **Standard-Übergang:** `150ms ease-out` (`duration-150 ease-out`) für Farben, Hintergründe, Hover.
- **Sheets:** `220ms ease-out` (`duration-220 ease-out`).
- **Barrierefreiheit:** Bei `prefers-reduced-motion: reduce` werden alle Übergänge und Animationen auf 0.01 ms gesetzt.

---

## 3. Bauteile & Codebeispiele

Alle Bauteile sind in `src/components/ui/` definiert und exportiert.

### 1. Button
```tsx
import { Button } from './components/ui';

<Button variant="primary" size="md" icon={<Sparkles className="w-4 h-4" strokeWidth={1.75} />}>
  Treffen starten
</Button>
<Button variant="secondary" size="md">
  Abbrechen
</Button>
```

### 2. Chip (Filter & Optionen)
```tsx
import { Chip } from './components/ui';

<Chip selected={isActive} count={12} onClick={toggle}>
  Hohe Energie
</Chip>
```

### 3. SegmentedControl
```tsx
import { SegmentedControl } from './components/ui';

<SegmentedControl
  options={[
    { id: 'all', label: 'Alle Spiele', count: 48 },
    { id: 'favorites', label: 'Favoriten', count: 5 },
  ]}
  value={tab}
  onChange={setTab}
/>
```

### 4. Card (Kachel & Liste)
```tsx
import { Card, CardItem } from './components/ui';

// Kachel-Variante
<Card variant="tile" hoverable>
  <h3 className="text-lg font-bold text-text">Titel</h3>
  <p className="text-sm text-text-secondary">Beschreibung...</p>
</Card>

// Listen-Variante mit Trennlinien
<Card variant="list">
  <CardItem hoverable>Eintrag 1</CardItem>
  <CardItem hoverable>Eintrag 2</CardItem>
</Card>
```

### 5. Input & Select
```tsx
import { Input, Select } from './components/ui';

<Input
  placeholder="Suchen..."
  icon={<Search className="w-4 h-4" strokeWidth={1.75} />}
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>

<Select
  label="Kategorie"
  options={[
    { value: 'cooperative', label: 'Kooperativ' },
    { value: 'social', label: 'Kennenlernen' },
  ]}
  value={category}
  onChange={(e) => setCategory(e.target.value)}
/>
```

### 6. Switch & Stepper
```tsx
import { Switch, Stepper } from './components/ui';

<Switch
  label="Nur Favoriten"
  checked={onlyFavs}
  onChange={setOnlyFavs}
/>

<Stepper
  label="Teilnehmer"
  value={participants}
  onChange={setParticipants}
  min={2}
  max={40}
/>
```

### 7. EmptyState
```tsx
import { EmptyState } from './components/ui';

<EmptyState
  icon={<Search className="w-6 h-6" strokeWidth={1.75} />}
  title="Keine Ergebnisse gefunden"
  description="Passe deine Filterkriterien an, um Aktivitäten anzuzeigen."
  actionLabel="Filter zurücksetzen"
  onAction={resetFilters}
/>
```

### 8. Dialog, Sheet & Toast
```tsx
import { Dialog, Sheet, Toast } from './components/ui';

<Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Spielregeln">
  Inhalt...
</Dialog>

<Sheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter">
  Inhalt...
</Sheet>

<Toast message="Erfolgreich gespeichert" type="success" />
```

---

## 4. Galerie & Verifikation

- **Galerie:** Unter der Route `/_design` erreichbar.
- **Kontrast-Audit:** Ausführbar mit `npm run contrast`.
- **Typecheck & Build:** Ausführbar mit `npm run check && npm run build`.
