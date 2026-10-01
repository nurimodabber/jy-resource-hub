import React, { useEffect, useRef } from 'react';
import { 
  Sparkles, Layers, Music, Search, Printer, 
  FileText, ShieldCheck, Moon, Sun, Monitor, Globe, ChevronRight, X 
} from 'lucide-react';
import { NavTab, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { useTheme } from '../context/ThemeContext';

export interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenBahaiSongs: () => void;
  onOpenCommandPalette: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const MoreSheet: React.FC<MoreSheetProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenBahaiSongs,
  onOpenCommandPalette,
  language,
  setLanguage,
}) => {
  const t = UI_TRANSLATIONS[language];
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  const handleNav = (tab: NavTab) => {
    onSelectTab(tab);
    onClose();
  };

  // Close on outside click for desktop dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        // Check if click was outside desktop dropdown
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Lock body scroll only on mobile when sheet is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div className="space-y-4">
      {/* 1. Sections & Utilities */}
      <div>
        <h4 className="text-2xs font-bold uppercase tracking-wider text-text-tertiary mb-1.5 px-1">
          {t.moreSectionsLabel || 'Bereiche & Werkzeuge'}
        </h4>
        <div className="bg-surface-2 rounded-2xl border border-border divide-y divide-border/60 overflow-hidden text-xs">
          {/* On mobile / tablet, show Service-Arts and Tools if hidden from main nav */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => handleNav('service-arts')}
              className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                activeTab === 'service-arts' ? 'bg-brand/10 text-brand font-semibold' : 'text-text hover:bg-surface-raised'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="font-medium">{t.tabServiceArts}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
            </button>

            <button
              type="button"
              onClick={() => handleNav('tools')}
              className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                activeTab === 'tools' ? 'bg-brand/10 text-brand font-semibold' : 'text-text hover:bg-surface-raised'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-medium">{t.tabTools}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenBahaiSongs();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 text-left transition-colors text-text hover:bg-surface-raised cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Music className="w-4 h-4 text-sage shrink-0" />
              <span className="font-medium">Bahá'í Songs</span>
            </div>
            <span className="text-2xs text-text-tertiary font-medium">bahaisongs.com</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenCommandPalette();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 text-left transition-colors text-text hover:bg-surface-raised cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-accent-text shrink-0" />
              <span className="font-medium">{t.cmdKSearch || 'Schnellsuche (⌘K)'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
          </button>

          <button
            type="button"
            onClick={() => {
              window.print();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 text-left transition-colors text-text hover:bg-surface-raised cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Printer className="w-4 h-4 text-text-tertiary shrink-0" />
              <span className="font-medium">{t.printHandout || 'Druckansicht / PDF'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
          </button>
        </div>
      </div>

      {/* 2. Settings: Language & Theme Segmented Controls */}
      <div>
        <h4 className="text-2xs font-bold uppercase tracking-wider text-text-tertiary mb-1.5 px-1">
          {t.moreSettingsLabel || 'Einstellungen'}
        </h4>
        <div className="grid grid-cols-1 gap-2.5">
          {/* Language Control */}
          <div className="p-3 bg-surface-2 rounded-2xl border border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-text">
              <Globe className="w-4 h-4 text-brand" />
              <span>{language === 'de' ? 'Sprache' : 'Language'}</span>
            </div>
            <div className="flex p-0.5 bg-surface rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setLanguage('de')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'de' ? 'bg-brand text-white shadow-xs' : 'text-text-secondary hover:text-text'
                }`}
              >
                DE
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'en' ? 'bg-brand text-white shadow-xs' : 'text-text-secondary hover:text-text'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Theme Control */}
          <div className="p-3 bg-surface-2 rounded-2xl border border-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-text">
              <Sun className="w-4 h-4 text-accent-text dark:hidden" />
              <Moon className="w-4 h-4 text-accent-text hidden dark:block" />
              <span>{language === 'de' ? 'Erscheinung' : 'Appearance'}</span>
            </div>
            <div className="flex p-0.5 bg-surface rounded-xl border border-border text-xs">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  theme === 'light' ? 'bg-brand text-white shadow-xs font-semibold' : 'text-text-secondary hover:text-text'
                }`}
                title={t.themeLight || 'Hell'}
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hell</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  theme === 'dark' ? 'bg-brand text-white shadow-xs font-semibold' : 'text-text-secondary hover:text-text'
                }`}
                title={t.themeDark || 'Dunkel'}
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dunkel</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  theme === 'system' ? 'bg-brand text-white shadow-xs font-semibold' : 'text-text-secondary hover:text-text'
                }`}
                title={t.themeSystem || 'System'}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Auto</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Legal & Privacy Links */}
      <div className="pt-2 border-t border-border flex items-center justify-between px-1 text-xs">
        <button
          type="button"
          onClick={() => handleNav('impressum')}
          className="text-text-secondary hover:text-brand font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-text-tertiary" />
          <span>{t.impressumTitle || 'Impressum'}</span>
        </button>

        <span className="text-text-tertiary">•</span>

        <button
          type="button"
          onClick={() => handleNav('datenschutz')}
          className="text-text-secondary hover:text-brand font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-text-tertiary" />
          <span>{t.datenschutzTitle || 'Datenschutz'}</span>
        </button>
      </div>
    </div>
  );

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  if (isDesktop) {
    return (
      <div className="hidden lg:block">
        {/* Transparent backdrop for outside dismiss */}
        <div 
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-2xs transition-opacity" 
          onClick={onClose} 
          aria-hidden="true" 
        />
        <div
          ref={dropdownRef}
          role="dialog"
          aria-modal="true"
          className="fixed top-16 right-6 xl:right-[calc((100vw-72rem)/2+1.5rem)] z-50 w-80 bg-surface rounded-3xl border border-border shadow-apple-modal p-4 animate-in fade-in zoom-in-95 duration-150 outline-hidden"
        >
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
            <span className="text-xs font-bold text-text">
              {t.moreSheetTitle || 'Menü & Einstellungen'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-text-tertiary hover:text-text cursor-pointer"
              aria-label="Schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:hidden">
      <div
        className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={mobileSheetRef}
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-70 bg-surface rounded-t-3xl border-t border-border shadow-apple-modal p-5 max-h-[85vh] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom duration-250 outline-hidden safe-bottom"
      >
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-black/20 dark:bg-white/20 rounded-full mx-auto mb-4 shrink-0" />

        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          <h3 className="text-sm font-bold text-text">
            {t.moreSheetTitle || 'Menü & Einstellungen'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-text-tertiary hover:text-text cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {content}
      </div>
    </div>
  );
};
