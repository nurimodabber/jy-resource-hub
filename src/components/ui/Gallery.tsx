import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Chip,
  Badge,
  Tag,
  SegmentedControl,
  Card,
  CardItem,
  Input,
  Select,
  Switch,
  Stepper,
  Dialog,
  Sheet,
  EmptyState,
  Toast,
  Skeleton,
} from './index';
import {
  Sparkles,
  Search,
  Check,
  Moon,
  Sun,
  Flame,
  BookOpen,
  Heart,
  Compass,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react';

export const Gallery: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const [activeSegment, setActiveSegment] = useState<'all' | 'popular' | 'new'>('all');
  const [chipSelected, setChipSelected] = useState<Record<string, boolean>>({
    games: true,
    quotes: false,
    service: false,
  });
  const [switchChecked, setSwitchChecked] = useState(true);
  const [stepperValue, setStepperValue] = useState(12);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('cooperative');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jy_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jy_theme', 'light');
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-bg text-text p-4 sm:p-8 max-w-5xl mx-auto space-y-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">Designsystem v2</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text mt-1">Bauteil-Galerie</h1>
          <p className="text-sm text-text-secondary mt-1">
            Alle Komponenten nach der Richtung „frisch und freundlich“ mit WCAG AA Tokens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={theme === 'dark' ? <Sun className="w-4 h-4" strokeWidth={1.75} /> : <Moon className="w-4 h-4" strokeWidth={1.75} />}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? 'Hellmodus' : 'Dunkelmodus'}
          </Button>
        </div>
      </div>

      {/* 1. Typografie */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">1. Typografie (Figtree & Lora)</h2>
        <Card variant="tile" className="space-y-4">
          <div>
            <span className="text-xs text-text-tertiary">H1 (32/40, mobil 28/36, font-bold)</span>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-text">Spiele für Juniorjugendgruppen</p>
          </div>
          <div>
            <span className="text-xs text-text-tertiary">H2 (22/30, font-bold)</span>
            <p className="text-2xl font-bold text-text">Gemeinschaftliche Aktivitäten & Reflexion</p>
          </div>
          <div>
            <span className="text-xs text-text-tertiary">H3 (18/26, font-bold)</span>
            <p className="text-lg font-bold text-text">Vorbereitung für das Treffen</p>
          </div>
          <div>
            <span className="text-xs text-text-tertiary">Fließtext (16/26, font-normal)</span>
            <p className="text-base text-text leading-relaxed">
              Dieses Designsystem unterstützt Animatoren bei der Vorbereitung und Durchführung. Alle Farben, Kontraste und Schriften sind auf Lesbarkeit und Ruhe ausgelegt.
            </p>
          </div>
          <div>
            <span className="text-xs text-text-tertiary">Klein (14/20) & Kleinste (13/18)</span>
            <p className="text-sm text-text-secondary">Sekundäre Beschreibungen und Hinweise (14 px).</p>
            <p className="text-xs text-text-tertiary">Zusätzliche Metadaten, Zähler und Fußzeilen (13 px).</p>
          </div>
          <div>
            <span className="text-xs text-text-tertiary">Heilige Texte (Lora Serif, ehrfürchtig, ruhig)</span>
            <blockquote className="font-serif italic text-lg sm:text-xl text-text leading-relaxed p-4 bg-surface-2 rounded-control">
              „O Sohn des Geistes! Meine erste Mahnung ist diese: Besitze ein reines, gütiges und erleuchtetes Herz...“
            </blockquote>
          </div>
        </Card>
      </section>

      {/* 2. Farb- & Elevation-Tokens */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">2. Farben & Flächen</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-control bg-bg border border-border">
            <span className="text-xs text-text-tertiary">bg</span>
            <p className="text-sm font-semibold text-text">Hintergrund</p>
          </div>
          <div className="p-4 rounded-control bg-surface shadow-1">
            <span className="text-xs text-text-tertiary">surface (shadow-1)</span>
            <p className="text-sm font-semibold text-text">Kartenfläche</p>
          </div>
          <div className="p-4 rounded-control bg-surface-2">
            <span className="text-xs text-text-tertiary">surface-2</span>
            <p className="text-sm font-semibold text-text">Eingabe & Chip</p>
          </div>
          <div className="p-4 rounded-control bg-accent text-accent-contrast shadow-1">
            <span className="text-xs opacity-80">accent</span>
            <p className="text-sm font-semibold">Blau primär</p>
          </div>
          <div className="p-4 rounded-control bg-accent-subtle text-accent-text">
            <span className="text-xs opacity-80">accent-subtle</span>
            <p className="text-sm font-semibold">Sanfte Tönung</p>
          </div>
          <div className="p-4 rounded-control bg-surface shadow-2">
            <span className="text-xs text-text-tertiary">shadow-2</span>
            <p className="text-sm font-semibold text-text">Overlay & Angehoben</p>
          </div>
          <div className="p-4 rounded-control bg-success/15 text-success">
            <span className="text-xs opacity-80">success</span>
            <p className="text-sm font-semibold">Erfolg / Bestätigt</p>
          </div>
          <div className="p-4 rounded-control bg-danger/15 text-danger">
            <span className="text-xs opacity-80">danger</span>
            <p className="text-sm font-semibold">Warnung / Abbruch</p>
          </div>
        </div>
      </section>

      {/* 3. Symbole in getönten Kreisen */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">3. Symbole (Strichstärke 1,75 & 40 px Kreis)</h2>
        <Card variant="tile" className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Spiele</p>
              <p className="text-xs text-text-secondary">40 px getönter Kreis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Zitate</p>
              <p className="text-xs text-text-secondary">accent-subtle / accent-text</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Dienst & Kunst</p>
              <p className="text-xs text-text-secondary">lucide strokeWidth 1.75</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Treffen</p>
              <p className="text-xs text-text-secondary">Ablauf-Assistent</p>
            </div>
          </div>
        </Card>
      </section>

      {/* 4. Buttons & IconButtons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">4. Buttons & IconButtons</h2>
        <Card variant="tile" className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" icon={<Sparkles className="w-4 h-4" strokeWidth={1.75} />}>
              Primär Groß
            </Button>
            <Button variant="primary" size="md">
              Primär Normal
            </Button>
            <Button variant="primary" size="sm">
              Primär Klein
            </Button>
            <Button variant="primary" size="md" isLoading>
              Laden...
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="md">
              Sekundär (surface-2)
            </Button>
            <Button variant="outline" size="md">
              Outline
            </Button>
            <Button variant="ghost" size="md">
              Ghost
            </Button>
            <Button variant="danger" size="md">
              Gefahr
            </Button>
            <Button variant="secondary" size="md" disabled>
              Deaktiviert
            </Button>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <IconButton label="Favorit" variant="primary" size="md">
              <Heart className="w-5 h-5" strokeWidth={1.75} />
            </IconButton>
            <IconButton label="Suche" variant="secondary" size="md">
              <Search className="w-5 h-5" strokeWidth={1.75} />
            </IconButton>
            <IconButton label="Info" variant="outline" size="md">
              <Info className="w-5 h-5" strokeWidth={1.75} />
            </IconButton>
            <IconButton label="Bestätigen" variant="ghost" size="md">
              <Check className="w-5 h-5" strokeWidth={1.75} />
            </IconButton>
          </div>
        </Card>
      </section>

      {/* 5. Chips, Tags & SegmentedControl */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">5. Chips, Tags & SegmentedControl</h2>
        <Card variant="tile" className="space-y-6">
          <div>
            <p className="text-xs text-text-tertiary mb-2">SegmentedControl (Pille mit weißem Schieber auf surface-2)</p>
            <SegmentedControl
              options={[
                { id: 'all', label: 'Alle Spiele', count: 48 },
                { id: 'popular', label: 'Beliebt', count: 12 },
                { id: 'new', label: 'Neu', count: 5 },
              ]}
              value={activeSegment}
              onChange={setActiveSegment}
            />
          </div>

          <div>
            <p className="text-xs text-text-tertiary mb-2">Chips (Voll rund, aus: surface-2, an: accent-subtle, kein Rahmen)</p>
            <div className="flex flex-wrap gap-2">
              <Chip
                selected={chipSelected.games}
                count={24}
                icon={<Flame className="w-3.5 h-3.5" strokeWidth={1.75} />}
                onClick={() => setChipSelected(p => ({ ...p, games: !p.games }))}
              >
                Hohe Energie
              </Chip>
              <Chip
                selected={chipSelected.quotes}
                count={15}
                icon={<BookOpen className="w-3.5 h-3.5" strokeWidth={1.75} />}
                onClick={() => setChipSelected(p => ({ ...p, quotes: !p.quotes }))}
              >
                Ruhig / Fokus
              </Chip>
              <Chip
                selected={chipSelected.service}
                onClick={() => setChipSelected(p => ({ ...p, service: !p.service }))}
              >
                Ohne Material
              </Chip>
            </div>
          </div>

          <div>
            <p className="text-xs text-text-tertiary mb-2">Tags & Badges (Voll rund)</p>
            <div className="flex flex-wrap gap-2">
              <Badge category="accent">Aktiv</Badge>
              <Tag category="neutral">10–15 Min.</Tag>
              <Tag category="neutral">8–15 Spieler</Tag>
              <Badge category="success">Gemeinsam</Badge>
              <Tag category="danger">Ausgebucht</Tag>
            </div>
          </div>
        </Card>
      </section>

      {/* 6. Formularelemente: Input, Select, Switch, Stepper */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">6. Formularelemente</h2>
        <Card variant="tile" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Suchbegriff (Eingabefeld)"
              placeholder="Spielname oder Stichwort..."
              icon={<Search className="w-4 h-4" strokeWidth={1.75} />}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <Select
              label="Kategorie (Auswahl)"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              options={[
                { value: 'cooperative', label: 'Kooperativ' },
                { value: 'social', label: 'Kennenlernen' },
                { value: 'energizer', label: 'Energizer' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
            <div>
              <p className="text-sm font-medium text-text mb-2">Schalter (Switch)</p>
              <Switch
                checked={switchChecked}
                onChange={setSwitchChecked}
                label="Nur Favoriten anzeigen"
                description="Gefilterte Ansicht aktivieren"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-text mb-2">Teilnehmerzahl (Stepper)</p>
              <Stepper
                value={stepperValue}
                onChange={setStepperValue}
                min={2}
                max={50}
                label="Teilnehmer"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* 7. Karten: Kachel und Liste */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">7. Karten (Kachel & Liste)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kachel-Karte */}
          <Card variant="tile" hoverable className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Tag category="accent">Kooperationsspiel</Tag>
                <span className="text-xs text-text-tertiary">15 Min.</span>
              </div>
              <h3 className="text-lg font-bold text-text">Der magische Stab</h3>
              <p className="text-sm text-text-secondary mt-1">
                Die Gruppe senkt gemeinsam eine Stange ab, ohne dass ein Finger den Kontakt verliert. Fördert Absprache und Geduld.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">8–16 Teilnehmer</span>
              <span className="text-xs font-semibold text-accent inline-flex items-center gap-1">
                Details <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </span>
            </div>
          </Card>

          {/* Liste-Karte */}
          <Card variant="list">
            <CardItem hoverable>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-text">Begrüßung & Einstieg</h4>
                  <p className="text-xs text-text-secondary">Kurze Runde zum Ankommen</p>
                </div>
                <span className="text-xs tabular-nums text-text-tertiary">10 Min.</span>
              </div>
            </CardItem>
            <CardItem hoverable>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-text">Gebet & Zitat gemeinsam lesen</h4>
                  <p className="text-xs text-text-secondary">Ruhi Band 1, Textabschnitt 3</p>
                </div>
                <span className="text-xs tabular-nums text-text-tertiary">20 Min.</span>
              </div>
            </CardItem>
            <CardItem hoverable>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-text">Aktivitätsspiel im Hof</h4>
                  <p className="text-xs text-text-secondary">Der magische Stab</p>
                </div>
                <span className="text-xs tabular-nums text-text-tertiary">25 Min.</span>
              </div>
            </CardItem>
          </Card>
        </div>
      </section>

      {/* 8. EmptyState & Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">8. EmptyState & Skeleton</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="tile">
            <EmptyState
              icon={<Search className="w-6 h-6" strokeWidth={1.75} />}
              title="Keine Spiele gefunden"
              description="Passe deine Filterkriterien oder den Suchbegriff an, um Ergebnisse zu sehen."
              actionLabel="Filter zurücksetzen"
              onAction={() => triggerToast('Filter wurden zurückgesetzt.')}
            />
          </Card>

          <Card variant="tile" className="space-y-4">
            <p className="text-xs text-text-tertiary">Skeleton Ladezustand</p>
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </div>
            </div>
            <Skeleton variant="rectangular" height={80} />
            <div className="flex gap-2">
              <Skeleton variant="text" width={80} height={32} className="rounded-chip" />
              <Skeleton variant="text" width={100} height={32} className="rounded-chip" />
            </div>
          </Card>
        </div>
      </section>

      {/* 9. Overlays: Dialog, Sheet, Toast */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-text">9. Overlays (Dialog, Sheet, Toast)</h2>
        <Card variant="tile" className="flex flex-wrap gap-4">
          <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
            Dialog öffnen (24 px)
          </Button>
          <Button variant="secondary" onClick={() => setIsSheetOpen(true)}>
            Bottom-Sheet öffnen (28 px)
          </Button>
          <Button variant="outline" onClick={() => triggerToast('Änderungen wurden erfolgreich gespeichert.')}>
            Toast auslösen
          </Button>
        </Card>
      </section>

      {/* Interactive Dialog Demo */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Beispiel-Dialog"
        description="Dialogfenster mit 24 px Radius und shadow-2."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Dieser Dialog folgt den Designsystem-Richtlinien: sanfte Flächen, kein unnötiger Rand, sichtbarer Fokus und Schließen mit Escape.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsDialogOpen(false);
                triggerToast('Aktion im Dialog bestätigt.');
              }}
            >
              Verstanden
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Interactive Sheet Demo */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Beispiel Bottom-Sheet"
        description="Bottom-Sheet mit 28 px Radius oben und 220 ms Animation."
        position="bottom"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Optimal für mobile Filter oder Aktionen direkt mit dem Daumen erreichbar.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="primary" onClick={() => setIsSheetOpen(false)}>
              Fertig
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Interactive Toast Demo */}
      <Toast message={toastMessage} type="success" />
    </div>
  );
};

export default Gallery;
