import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Compass, BookOpen, Clock, Palette, Music, Layers, X, ArrowRight } from 'lucide-react';
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
  onNavigate: (type: 'game' | 'quote' | 'method' | 'service' | 'art' | 'song' | 'tool', id: string) => void;
}

interface SearchResult {
  id: string;
  type: 'game' | 'quote' | 'method' | 'service' | 'art' | 'song';
  title: string;
  subtitle: string;
  badge: string;
  category?: 'cooperative' | 'competitive' | 'social' | 'energizer' | 'service' | 'arts' | 'devotional' | 'study';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  language,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut (⌘K, Ctrl+K, or /)
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

  // Search logic across all resources with bilingual matching
  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default suggestions: 3 popular games, 2 top quotes, 2 methods
      return [
        {
          id: GAMES_DATA[0].id,
          type: 'game',
          title: GAMES_DATA[0].title[language],
          subtitle: GAMES_DATA[0].summary[language],
          badge: language === 'de' ? 'Spiel' : 'Game',
          category: 'cooperative',
        },
        {
          id: GAMES_DATA[1].id,
          type: 'game',
          title: GAMES_DATA[1].title[language],
          subtitle: GAMES_DATA[1].summary[language],
          badge: language === 'de' ? 'Spiel' : 'Game',
          category: 'social',
        },
        {
          id: QUOTES_DATA[0].id,
          type: 'quote',
          title: QUOTES_DATA[0].theme[language],
          subtitle: language === 'de' ? QUOTES_DATA[0].textDe : QUOTES_DATA[0].textEn,
          badge: language === 'de' ? 'Zitat' : 'Quote',
          category: 'study',
        },
        {
          id: QUOTE_METHODS_DATA[0].id,
          type: 'method',
          title: QUOTE_METHODS_DATA[0].name[language],
          subtitle: QUOTE_METHODS_DATA[0].summary[language],
          badge: language === 'de' ? 'Methode' : 'Method',
          category: 'study',
        },
      ];
    }

    const items: SearchResult[] = [];

    // 1. Search Games
    GAMES_DATA.forEach(g => {
      const matchDe = g.title.de.toLowerCase().includes(q) || g.summary.de.toLowerCase().includes(q);
      const matchEn = g.title.en.toLowerCase().includes(q) || g.summary.en.toLowerCase().includes(q);
      if (matchDe || matchEn) {
        items.push({
          id: g.id,
          type: 'game',
          title: g.title[language],
          subtitle: g.summary[language],
          badge: language === 'de' ? 'Spiel' : 'Game',
          category: g.category === 'social_deduction' ? 'social' : g.category,
        });
      }
    });

    // 2. Search Quotes
    QUOTES_DATA.forEach(quote => {
      const matchDe = quote.theme.de.toLowerCase().includes(q) || quote.textDe.toLowerCase().includes(q) || quote.book.de.toLowerCase().includes(q) || quote.keywords.some(k => k.toLowerCase().includes(q));
      const matchEn = quote.theme.en.toLowerCase().includes(q) || quote.textEn.toLowerCase().includes(q) || quote.book.en.toLowerCase().includes(q);
      if (matchDe || matchEn) {
        items.push({
          id: quote.id,
          type: 'quote',
          title: quote.theme[language],
          subtitle: language === 'de' ? quote.textDe : quote.textEn,
          badge: language === 'de' ? 'Zitat' : 'Quote',
          category: 'study',
        });
      }
    });

    // 3. Search Methods
    QUOTE_METHODS_DATA.forEach(m => {
      const matchDe = m.name.de.toLowerCase().includes(q) || m.summary.de.toLowerCase().includes(q);
      const matchEn = m.name.en.toLowerCase().includes(q) || m.summary.en.toLowerCase().includes(q);
      if (matchDe || matchEn) {
        items.push({
          id: m.id,
          type: 'method',
          title: m.name[language],
          subtitle: m.summary[language],
          badge: language === 'de' ? 'Methode' : 'Method',
          category: 'study',
        });
      }
    });

    // 4. Search Service & Arts
    SERVICE_PROJECTS_DATA.forEach(sp => {
      const matchDe = sp.title.de.toLowerCase().includes(q) || sp.objective.de.toLowerCase().includes(q);
      const matchEn = sp.title.en.toLowerCase().includes(q) || sp.objective.en.toLowerCase().includes(q);
      if (matchDe || matchEn) {
        items.push({
          id: sp.id,
          type: 'service',
          title: sp.title[language],
          subtitle: sp.objective[language],
          badge: language === 'de' ? 'Dienst' : 'Service',
          category: 'service',
        });
      }
    });

    ARTS_PROMPTS_DATA.forEach(art => {
      const matchDe = art.title.de.toLowerCase().includes(q) || art.description.de.toLowerCase().includes(q) || art.theme.de.toLowerCase().includes(q);
      const matchEn = art.title.en.toLowerCase().includes(q) || art.description.en.toLowerCase().includes(q) || art.theme.en.toLowerCase().includes(q);
      if (matchDe || matchEn) {
        items.push({
          id: art.id,
          type: 'art',
          title: art.title[language],
          subtitle: art.description[language],
          badge: language === 'de' ? 'Kunst' : 'Arts',
          category: 'arts',
        });
      }
    });

    // 5. Search Songs
    DEVOTIONAL_SONGS_DATA.forEach(song => {
      const matchDe = song.title.de.toLowerCase().includes(q) || song.theme.de.toLowerCase().includes(q);
      const matchEn = song.title.en.toLowerCase().includes(q) || song.theme.en.toLowerCase().includes(q);
      if (matchDe || matchEn) {
        items.push({
          id: song.id,
          type: 'song',
          title: song.title[language],
          subtitle: song.theme[language],
          badge: language === 'de' ? 'Lied' : 'Song',
          category: 'devotional',
        });
      }
    });

    return items.slice(0, 15);
  }, [query, language]);

  // Keyboard navigation through search results
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(results.length, 1));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        const selected = results[selectedIndex];
        onNavigate(selected.type, selected.id);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onNavigate, onClose]);

  if (!isOpen) return null;

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'game': return <Compass className="w-4 h-4 text-emerald-500" />;
      case 'quote': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'method': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'service': return <Layers className="w-4 h-4 text-teal-500" />;
      case 'art': return <Palette className="w-4 h-4 text-purple-500" />;
      case 'song': return <Music className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-70 flex items-start justify-center p-3 sm:p-6 sm:pt-20 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Schnellsuche / Command Palette"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Modal */}
      <div className="relative w-full max-w-2xl bg-surface rounded-3xl border border-border shadow-apple-modal overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-150 outline-hidden">
        {/* Input Bar */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-border-subtle gap-3">
          <Search className="w-5 h-5 text-text-tertiary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={language === 'de' ? 'Spiele, Zitate, Methoden, Dienst oder Lieder suchen...' : 'Search games, quotes, methods, service or songs...'}
            className="w-full bg-transparent text-sm sm:text-base text-text placeholder:text-text-tertiary outline-hidden"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-text-tertiary hover:text-text"
              aria-label="Suche löschen"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono bg-surface-2 text-text-tertiary border border-border-subtle">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-3 custom-scrollbar divide-y divide-border-subtle/50">
          {results.length === 0 ? (
            <div className="py-12 text-center text-text-secondary text-sm">
              <p>{language === 'de' ? 'Keine Treffer gefunden.' : 'No results found.'}</p>
              <p className="text-xs text-text-tertiary mt-1">
                {language === 'de' ? 'Versuche es mit einem anderen Begriff auf Deutsch oder Englisch.' : 'Try a different term in German or English.'}
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    onNavigate(item.type, item.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-100 ${
                    isSelected
                      ? 'bg-surface-2 text-text shadow-xs'
                      : 'hover:bg-surface-2/60 text-text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-surface border border-border-subtle flex items-center justify-center shrink-0 shadow-2xs">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-text truncate">
                          {item.title}
                        </span>
                        <Badge category={item.category || 'neutral'} size="sm">
                          {item.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-tertiary truncate font-serif italic max-w-md">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 shrink-0 transition-opacity ${isSelected ? 'opacity-100 text-accent' : 'opacity-0'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-surface-2 border-t border-border-subtle flex items-center justify-between text-2xs text-text-tertiary">
          <span>{results.length} {language === 'de' ? 'Ergebnisse' : 'results'}</span>
          <div className="hidden sm:flex items-center gap-3">
            <span>↑↓ {language === 'de' ? 'Navigieren' : 'Navigate'}</span>
            <span>↵ {language === 'de' ? 'Auswählen' : 'Select'}</span>
            <span>ESC {language === 'de' ? 'Schließen' : 'Close'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
