import React from 'react';
import { 
  Sparkles, Layers, Music, Search, Printer, 
  FileText, ShieldCheck, Moon, Sun, Monitor, Globe, ChevronRight 
} from 'lucide-react';
import { Sheet } from './ui/Sheet';
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

  const handleNav = (tab: NavTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={t.moreSheetTitle || 'Menü & Einstellungen'}
      position="bottom"
    >
      <div className="space-y-6 pb-6">
        {/* Sections & Utilities */}
        <div>
          <h4 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary mb-2 px-1">
            {t.moreSectionsLabel || 'Bereiche & Werkzeuge'}
          </h4>
          <div className="bg-surface-2 rounded-2xl border border-border-subtle divide-y divide-border-subtle/50 overflow-hidden">
            <button
              onClick={() => handleNav('service-arts')}
              className={`w-full flex items-center justify-between p-3.5 text-left transition-colors ${
                activeTab === 'service-arts' ? 'bg-accent/10 text-accent font-semibold' : 'text-text hover:bg-surface-raised'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-medium block">{t.tabServiceArts}</span>
                  <span className="text-2xs text-text-tertiary block">
                    {language === 'de' ? 'Gemeinnützige Projekte & kreative Künste' : 'Community projects & creative arts'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary" />
            </button>

            <button
              onClick={() => handleNav('tools')}
              className={`w-full flex items-center justify-between p-3.5 text-left transition-colors ${
                activeTab === 'tools' ? 'bg-accent/10 text-accent font-semibold' : 'text-text hover:bg-surface-raised'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-medium block">{t.tabTools}</span>
                  <span className="text-2xs text-text-tertiary block">
                    {language === 'de' ? 'Gruppenteiler, Timer & Reflexionskarten' : 'Team splitters, timer & reflection cards'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary" />
            </button>

            <button
              onClick={() => {
                onOpenBahaiSongs();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 text-left transition-colors text-text hover:bg-surface-raised"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-medium block">Bahá'í Songs</span>
                  <span className="text-2xs text-text-tertiary block">
                    {language === 'de' ? 'Lieder & Chords (bahaisongs.com)' : 'Songs & chords (bahaisongs.com)'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary" />
            </button>

            <button
              onClick={() => {
                onOpenCommandPalette();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 text-left transition-colors text-text hover:bg-surface-raised"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-accent flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-medium block">{t.cmdKSearch || 'Schnellsuche (⌘K)'}</span>
                  <span className="text-2xs text-text-tertiary block">
                    {language === 'de' ? 'Alle Inhalte blitzschnell durchsuchen' : 'Search all content in a flash'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary" />
            </button>

            <button
              onClick={() => {
                window.print();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 text-left transition-colors text-text hover:bg-surface-raised"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-500/10 text-text-secondary flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-medium block">{t.printHandout}</span>
                  <span className="text-2xs text-text-tertiary block">
                    {language === 'de' ? 'Druckversion für Camp oder Vorbereitung' : 'Printable version for camp or prep'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary" />
            </button>
          </div>
        </div>

        {/* Settings: Language & Theme */}
        <div>
          <h4 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary mb-2 px-1">
            {t.moreSettingsLabel || 'Einstellungen'}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Language */}
            <div className="p-3 bg-surface-2 rounded-2xl border border-border-subtle flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'de' ? 'Sprache' : 'Language'}</span>
              </div>
              <div className="flex p-0.5 bg-surface rounded-xl border border-border-subtle">
                <button
                  onClick={() => setLanguage('de')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    language === 'de' ? 'bg-accent text-accent-contrast shadow-xs' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  DE
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    language === 'en' ? 'bg-accent text-accent-contrast shadow-xs' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Theme */}
            <div className="p-3 bg-surface-2 rounded-2xl border border-border-subtle flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                <Sun className="w-3.5 h-3.5 dark:hidden" />
                <Moon className="w-3.5 h-3.5 hidden dark:block" />
                <span>{language === 'de' ? 'Erscheinungsbild' : 'Appearance'}</span>
              </div>
              <div className="flex p-0.5 bg-surface rounded-xl border border-border-subtle">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    theme === 'light' ? 'bg-accent text-accent-contrast shadow-xs' : 'text-text-secondary hover:text-text'
                  }`}
                  title={t.themeLight || 'Hell'}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    theme === 'dark' ? 'bg-accent text-accent-contrast shadow-xs' : 'text-text-secondary hover:text-text'
                  }`}
                  title={t.themeDark || 'Dunkel'}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    theme === 'system' ? 'bg-accent text-accent-contrast shadow-xs' : 'text-text-secondary hover:text-text'
                  }`}
                  title={t.themeSystem || 'System'}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & About */}
        <div>
          <h4 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary mb-2 px-1">
            {t.moreLegalLabel || 'Rechtliches'}
          </h4>
          <div className="bg-surface-2 rounded-2xl border border-border-subtle divide-y divide-border-subtle/50 overflow-hidden">
            <button
              onClick={() => handleNav('impressum')}
              className="w-full flex items-center justify-between p-3.5 text-left text-text hover:bg-surface-raised transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-text-tertiary" />
                <span className="text-xs font-medium">{t.impressumTitle || 'Impressum'}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
            </button>
            <button
              onClick={() => handleNav('datenschutz')}
              className="w-full flex items-center justify-between p-3.5 text-left text-text hover:bg-surface-raised transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-text-tertiary" />
                <span className="text-xs font-medium">{t.datenschutzTitle || 'Datenschutzerklärung'}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
            </button>
          </div>
        </div>

        {/* Footer micro info */}
        <div className="text-center text-2xs text-text-tertiary pt-2">
          <span>{t.siteTitle} • Version 2.0</span>
        </div>
      </div>
    </Sheet>
  );
};
