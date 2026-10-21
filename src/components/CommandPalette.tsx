import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  Compass,
  BookOpen,
  Palette,
  Music,
  HeartHandshake,
  Bookmark,
  Settings,
  X,
  ArrowRight,
  Award,
  Users,
  Timer,
  UserCheck,
  MessageSquareQuote,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Language } from '../types';
import { GAMES_DATA } from '../data/games';
import { QUOTES_DATA } from '../data/quotes';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { DEVOTIONAL_SONGS_DATA } from '../data/songs';
import { Badge } from './ui/Badge';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onNavigate: (type: 'game' | 'quote' | 'method' | 'service' | 'art' | 'song' | 'tool' | 'page', id: string) => void;
  onOpenSettings?: () => void;
}

interface SearchResult {
  id: string;
  type: 'game' | 'quote' | 'method' | 'service' | 'art' | 'song' | 'tool' | 'page';
  groupName: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: LucideIcon;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  language,
  onNavigate,
  onOpenSettings,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDe = language === 'de';

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Global keyboard shortcut (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();

    // Tools dataset
    const TOOLS_SEARCH = [
      { id: 'teams', title: isDe ? 'Teams & Zweiergruppen' : 'Teams & pairs', desc: isDe ? 'Zufällig und fair Gruppen einteilen' : 'Random and balanced team builder', icon: Users },
      { id: 'timer', title: 'Timer', desc: isDe ? 'Große Countdown-Anzeige mit Signalton' : 'Large countdown display with chime', icon: Timer },
      { id: 'scoreboard', title: isDe ? 'Punktetafel' : 'Scoreboard', desc: isDe ? 'Punkte für Stationen oder Quizrunden ohne Rangliste' : 'Track points for stations or quiz rounds without rankings', icon: Award },
      { id: 'cards', title: isDe ? 'Gesprächskarten' : 'Conversation cards', desc: isDe ? 'Fragen und Zitate für den Kreis' : 'Questions and quotes for group circles', icon: MessageSquareQuote },
      { id: 'group', title: isDe ? 'Meine Gruppe' : 'My group', desc: isDe ? 'Gemeinsame Namens- und Anwesenheitsliste' : 'Shared member presence list', icon: UserCheck },
    ];

    // Static Pages
    const PAGES_SEARCH = [
      { id: 'saved', title: isDe ? 'Gemerkt (Merkliste)' : 'Saved Items', desc: isDe ? 'Deine gespeicherten Favoriten auf einen Blick' : 'All your bookmarked favorites in one place', icon: Bookmark },
      { id: 'settings', title: isDe ? 'Einstellungen' : 'Settings', desc: isDe ? 'Darstellung, Sprache, Gruppe und Sicherung' : 'Appearance, language, group and backup', icon: Settings },
    ];

    if (!q) {
      // Default recommended quick-links
      return [
        {
          id: 'saved',
          type: 'page',
          groupName: isDe ? 'Seiten' : 'Pages',
          title: isDe ? 'Gemerkt' : 'Saved Items',
          subtitle: isDe ? 'Deine gespeicherten Favoriten' : 'Your saved favorites',
          badge: isDe ? 'Seite' : 'Page',
          icon: Bookmark,
        },
        {
          id: GAMES_DATA[0].id,
          type: 'game',
          groupName: isDe ? 'Spiele' : 'Games',
          title: GAMES_DATA[0].title[language],
          subtitle: GAMES_DATA[0].summary[language],
          badge: isDe ? 'Spiel' : 'Game',
          icon: Compass,
        },
        {
          id: 'timer',
          type: 'tool',
          groupName: isDe ? 'Werkzeuge' : 'Tools',
          title: 'Timer',
          subtitle: isDe ? 'Große Countdown-Anzeige' : 'Clean countdown display',
          badge: isDe ? 'Werkzeug' : 'Tool',
          icon: Timer,
        },
        {
          id: QUOTES_DATA[0].id,
          type: 'quote',
          groupName: isDe ? 'Zitate' : 'Quotes',
          title: QUOTES_DATA[0].theme[language],
          subtitle: language === 'de' ? QUOTES_DATA[0].textDe : QUOTES_DATA[0].textEn,
          badge: isDe ? 'Zitat' : 'Quote',
          icon: BookOpen,
        },
      ];
    }

    const items: SearchResult[] = [];

    // 1. Pages
    PAGES_SEARCH.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
        items.push({
          id: p.id,
          type: 'page',
          groupName: isDe ? 'Seiten' : 'Pages',
          title: p.title,
          subtitle: p.desc,
          badge: isDe ? 'Seite' : 'Page',
          icon: p.icon,
        });
      }
    });

    // 2. Tools
    TOOLS_SEARCH.forEach((tool) => {
      if (tool.title.toLowerCase().includes(q) || tool.desc.toLowerCase().includes(q)) {
        items.push({
          id: tool.id,
          type: 'tool',
          groupName: isDe ? 'Werkzeuge' : 'Tools',
          title: tool.title,
          subtitle: tool.desc,
          badge: isDe ? 'Werkzeug' : 'Tool',
          icon: tool.icon,
        });
      }
    });

    // 3. Games
    GAMES_DATA.forEach((g) => {
      const matchDe = g.title.de.toLowerCase().includes(q) || g.summary.de.toLowerCase().includes(q);
      const matchEn = g.title.en.toLowerCase().includes(q) || g.summary.en.toLowerCase().includes(q);
      if (matchDe || matchEn) {
        items.push({
          id: g.id,
          type: 'game',
          groupName: isDe ? 'Spiele' : 'Games',
          title: g.title[language],
          subtitle: g.summary[language],
          badge: isDe ? 'Spiel' : 'Game',
          icon: Compass,
        });
      }
    });

    // 4. Quotes
    QUOTES_DATA.forEach((quote) => {
      const matchDe = quote.theme.de.toLowerCase().includes(q) || quote.textDe.toLowerCase().includes(q) || quote.book.de.toLowerCase().includes(q) || quote.keywords.some((k) => k.toLowerCase().includes(q));
      const matchEn = quote.theme.en.toLowerCase().includes(q) || quote.textEn.toLowerCase().includes(q) || quote.book.en.toLowerCase().includes(q);
      if (matchDe || matchEn) {
        items.push({
          id: quote.id,
          type: 'quote',
          groupName: isDe ? 'Zitate' : 'Quotes',
          title: quote.theme[language],
          subtitle: language === 'de' ? quote.textDe : quote.textEn,
          badge: isDe ? 'Zitat' : 'Quote',
          icon: BookOpen,
        });
      }
    });

    // 5. Quote Methods
    QUOTE_METHODS_DATA.forEach((m) => {
      const matchDe = m.name.de.toLowerCase().includes(q) || m.summary.de.toLowerCase().includes(q);
      const matchEn = m.name.en.toLowerCase().includes(q) || m.summary.en.toLowerCase().includes(q);
      if (matchDe || matchEn) {
        items.push({
          id: m.id,
          type: 'method',
          groupName: isDe ? 'Lernmethoden' : 'Methods',
          title: m.name[language],
          subtitle: m.summary[language],
          badge: isDe ? 'Methode' : 'Method',
          icon: Zap,
        });
      }
    });

    // 6. Service Projects
    SERVICE_PROJECTS_DATA.forEach((sp) => {
      const matchDe = sp.title.de.toLowerCase().includes(q) || sp.objective.de.toLowerCase().includes(q);
      const matchEn = sp.title.en.toLowerCase().includes(q) || sp.objective.en.toLowerCase().includes(q);
      if (matchDe || matchEn) {
        items.push({
          id: sp.id,
          type: 'service',
          groupName: isDe ? 'Dienst' : 'Service',
          title: sp.title[language],
          subtitle: sp.objective[language],
          badge: isDe ? 'Dienst' : 'Service',
          icon: HeartHandshake,
        });
      }
    });

    // 7. Arts Prompts
    ARTS_PROMPTS_DATA.forEach((art) => {
      const matchDe = art.title.de.toLowerCase().includes(q) || art.description.de.toLowerCase().includes(q) || art.theme.de.toLowerCase().includes(q);
      const matchEn = art.title.en.toLowerCase().includes(q) || art.description.en.toLowerCase().includes(q) || art.theme.en.toLowerCase().includes(q);
      if (matchDe || matchEn) {
        items.push({
          id: art.id,
          type: 'art',
          groupName: isDe ? 'Kunst' : 'Arts',
          title: art.title[language],
          subtitle: art.description[language],
          badge: isDe ? 'Kunst' : 'Art',
          icon: Palette,
        });
      }
    });

    // 8. Songs
    DEVOTIONAL_SONGS_DATA.forEach((song) => {
      const matchDe = song.title.de.toLowerCase().includes(q) || song.theme.de.toLowerCase().includes(q);
      const matchEn = song.title.en.toLowerCase().includes(q) || song.theme.en.toLowerCase().includes(q);
      if (matchDe || matchEn) {
        items.push({
          id: song.id,
          type: 'song',
          groupName: isDe ? 'Lieder' : 'Songs',
          title: song.title[language],
          subtitle: song.theme[language],
          badge: isDe ? 'Lied' : 'Song',
          icon: Music,
        });
      }
    });

    return items.slice(0, 20);
  }, [query, language, isDe]);

  const handleSelect = useCallback((selected: SearchResult) => {
    if (selected.id === 'settings' && onOpenSettings) {
      onClose();
      onOpenSettings();
    } else {
      onNavigate(selected.type, selected.id);
      onClose();
    }
  }, [onOpenSettings, onNavigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        const selected = results[selectedIndex];
        handleSelect(selected);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-70 flex items-end sm:items-start justify-center p-0 sm:p-6 sm:pt-20 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Schnellsuche"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Mobile Sheet Panel */}
      <div className="relative w-full max-w-2xl glass-surface-panel rounded-t-sheet sm:rounded-dialog shadow-2 border border-border overflow-hidden z-10 flex flex-col max-h-[92vh] sm:max-h-[80vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 ease-out outline-hidden safe-bottom">
        {/* Input Bar */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-line gap-3 glass-surface sticky top-0 z-10">
          <Search className="w-5 h-5 text-text-tertiary shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={isDe ? 'Spiele, Zitate, Methoden, Dienst, Werkzeuge suchen...' : 'Search games, quotes, methods, service, tools...'}
            className="w-full bg-transparent text-base text-text placeholder:text-text-tertiary outline-hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-text-tertiary hover:text-text"
              aria-label="Suche löschen"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-control text-2xs tabular-nums bg-surface-2 text-text-tertiary">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 sm:p-3 custom-scrollbar divide-y divide-border/60">
          {results.length === 0 ? (
            <div className="py-12 text-center text-text-secondary text-sm">
              <p>{isDe ? `Keine Treffer für „${query}“.` : `No results for "${query}".`}</p>
            </div>
          ) : (
            results.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-control cursor-pointer transition-colors duration-100 ease-out ${
                    isSelected
                      ? 'bg-surface-2 text-text'
                      : 'hover:bg-surface-2/60 text-text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-9 h-9 rounded-control bg-accent-subtle text-accent-text flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-text truncate">
                          {item.title}
                        </span>
                        <Badge category="neutral" size="sm">
                          {item.groupName}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-tertiary truncate max-w-md mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-opacity duration-150 ${
                      isSelected ? 'opacity-100 text-accent' : 'opacity-0'
                    }`}
                    strokeWidth={1.75}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-surface-2/60 border-t border-border flex items-center justify-between text-2xs text-text-tertiary">
          <span>{results.length} {isDe ? 'Ergebnisse' : 'results'}</span>
          <div className="hidden sm:flex items-center gap-3">
            <span>↑↓ {isDe ? 'Navigieren' : 'Navigate'}</span>
            <span>↵ {isDe ? 'Auswählen' : 'Select'}</span>
            <span>ESC {isDe ? 'Schließen' : 'Close'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
