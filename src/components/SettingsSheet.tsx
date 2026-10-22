import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Upload,
  Trash2,
  Printer,
  Music,
  CheckCircle2,
  Users,
  ChevronRight,
  Sparkles,
  Palette,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { useTheme, Theme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { exportLocalData, importLocalData, clearLocalData, downloadText } from '../utils/backup';
import { loadGroupTitle, loadGroupNames, loadGroupPresent } from '../utils/groupNames';
import { Sheet, SegmentedControl } from './ui';
import { GroupManager } from './tools/GroupManager';

export interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenBahaiSongs?: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  onOpenBahaiSongs,
}) => {
  const t = UI_TRANSLATIONS[language];
  const { theme, setTheme, glassOpacity, setGlassOpacity } = useTheme();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isGroupExpanded, setIsGroupExpanded] = useState(false);

  // Offline service worker state
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setIsOfflineReady(true)).catch(() => {});
    }
  }, []);

  const handleExport = () => {
    downloadText(`jy-hub-backup-${new Date().toISOString().slice(0, 10)}.json`, exportLocalData());
    showToast({ text: language === 'de' ? 'Sicherung heruntergeladen' : 'Backup downloaded' });
  };

  const handleImport = async (file?: File | null) => {
    if (!file) return;
    try {
      const n = importLocalData(await file.text());
      showToast({
        text: language === 'de' ? `${n} Einträge wiederhergestellt. Seite lädt neu...` : `${n} entries restored. Reloading...`,
      });
      setTimeout(() => window.location.reload(), 800);
    } catch {
      showToast({ text: language === 'de' ? 'Datei nicht lesbar' : 'File unreadable' });
    }
  };

  const handleClear = () => {
    if (window.confirm(t.settingsDeleteConfirm)) {
      clearLocalData();
      window.location.reload();
    }
  };

  // Group summary
  const groupTitle = loadGroupTitle();
  const groupNames = loadGroupNames();
  const groupPresent = loadGroupPresent();
  const presentCount = groupNames.filter((n) => groupPresent[n] !== false).length;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={t.tabSettings}
      description={language === 'de' ? 'App-Einstellungen, Gruppe & Datensicherung' : 'App preferences, group & backup'}
      position="bottom"
    >
      <div className="space-y-4 max-w-xl mx-auto pb-4">
        {/* ================================================================= */}
        {/* SECTION 1: DARSTELLUNG & SPRACHE (IN EINEM EINHEITLICHEN BLOCK)    */}
        {/* ================================================================= */}
        <section className="space-y-1.5 text-left">
          <h3 className="text-2xs font-bold uppercase tracking-wider text-text-tertiary px-3">
            {language === 'de' ? 'Darstellung & Sprache' : 'Appearance & Language'}
          </h3>
          <div className="bg-surface rounded-card border border-border/80 divide-y divide-border/60 overflow-hidden shadow-1">
            {/* Theme 4-segment selector */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text flex items-center gap-2">
                  <Palette className="w-4 h-4 text-accent shrink-0" strokeWidth={1.75} />
                  <span>{t.settingsAppearance}</span>
                </span>
                <span className="text-2xs font-medium text-text-secondary capitalize">
                  {theme === 'light'
                    ? (language === 'de' ? 'Hell' : 'Light')
                    : theme === 'dark'
                    ? (language === 'de' ? 'Dunkel' : 'Dark')
                    : theme === 'contrast'
                    ? (language === 'de' ? 'Kontrast' : 'Contrast')
                    : (language === 'de' ? 'System' : 'System')}
                </span>
              </div>
              <SegmentedControl
                options={[
                  { id: 'light', label: language === 'de' ? 'Hell' : 'Light' },
                  { id: 'dark', label: language === 'de' ? 'Dunkel' : 'Dark' },
                  { id: 'contrast', label: language === 'de' ? 'Kontrast' : 'Contrast' },
                  { id: 'system', label: language === 'de' ? 'System' : 'System' },
                ]}
                value={theme}
                onChange={(v) => setTheme(v as Theme)}
                fullWidth
                size="sm"
              />
            </div>

            {/* Simple Transparenz Slider - unified, no extra subheaders or borders */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent shrink-0" strokeWidth={1.75} />
                  <span>{language === 'de' ? 'Transparenz' : 'Transparency'}</span>
                </span>
                <span className="text-2xs font-bold text-accent tabular-nums bg-accent-subtle px-2 py-0.5 rounded-chip">
                  {glassOpacity} %
                </span>
              </div>
              <input
                id="glass-slider"
                type="range"
                min="0"
                max="100"
                step="5"
                value={glassOpacity}
                onChange={(e) => setGlassOpacity(Number(e.target.value))}
                className="w-full h-2 bg-surface-2 rounded-full appearance-none cursor-pointer accent-accent focus-visible:outline-hidden"
                aria-label={language === 'de' ? 'Transparenz' : 'Transparency'}
              />
            </div>

            {/* Language 2-segment switch */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent shrink-0" strokeWidth={1.75} />
                  <span>{t.settingsLanguage}</span>
                </span>
                <span className="text-2xs font-medium text-text-secondary">
                  {language === 'de' ? 'Deutsch' : 'English'}
                </span>
              </div>
              <SegmentedControl
                options={[
                  { id: 'de', label: 'Deutsch' },
                  { id: 'en', label: 'English' },
                ]}
                value={language}
                onChange={(v) => setLanguage(v as Language)}
                fullWidth
                size="sm"
              />
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 2: INHALTE & GRUPPE                                       */}
        {/* ================================================================= */}
        <section className="space-y-1.5 text-left">
          <h3 className="text-2xs font-bold uppercase tracking-wider text-text-tertiary px-3">
            {language === 'de' ? 'Inhalte & Gruppe' : 'Content & Group'}
          </h3>
          <div className="bg-surface rounded-card border border-border/80 divide-y divide-border/60 overflow-hidden shadow-1">
            {/* Group member status row with a chevron */}
            <div className="p-3.5 space-y-3">
              <div
                onClick={() => setIsGroupExpanded((prev) => !prev)}
                className="flex items-center justify-between gap-3 cursor-pointer select-none group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsGroupExpanded((prev) => !prev);
                  }
                }}
                aria-expanded={isGroupExpanded}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-control bg-accent-subtle flex items-center justify-center shrink-0 text-accent-text group-hover:bg-accent/20 transition-colors">
                    <Users className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-text truncate">
                      {groupTitle || (language === 'de' ? 'Meine Gruppe' : 'My Group')}
                    </span>
                    <span className="block text-2xs text-text-secondary truncate">
                      {groupNames.length > 0
                        ? (language === 'de'
                            ? `${presentCount} von ${groupNames.length} Personen anwesend`
                            : `${presentCount} of ${groupNames.length} members present`)
                        : (language === 'de'
                            ? 'Noch keine Namen hinterlegt'
                            : 'No group members added yet')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-2xs font-semibold text-accent hidden sm:inline">
                    {isGroupExpanded
                      ? (language === 'de' ? 'Schließen' : 'Close')
                      : (language === 'de' ? 'Verwalten' : 'Manage')}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${
                      isGroupExpanded ? 'rotate-90 text-accent' : 'group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </div>

              {isGroupExpanded && (
                <div className="pt-2 border-t border-border/60 animate-in fade-in duration-150">
                  <GroupManager language={language} compact={true} />
                </div>
              )}
            </div>

            {/* Admin Dashboard Entry */}
            <Link
              to="/admin"
              onClick={onClose}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-2 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-control bg-accent/15 flex items-center justify-center shrink-0 text-accent group-hover:bg-accent/25 transition-colors">
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-text truncate">
                    {language === 'de' ? 'Admin-Dashboard' : 'Admin Dashboard'}
                  </span>
                  <span className="block text-2xs text-text-secondary truncate">
                    {language === 'de' ? 'Revisionssichere Verwaltung & Live-Sync' : 'Versioned CRUD & Live Sync'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 4: DATEN & SICHERUNG                                      */}
        {/* ================================================================= */}
        <section className="space-y-1.5 text-left">
          <h3 className="text-2xs font-bold uppercase tracking-wider text-text-tertiary px-3">
            {language === 'de' ? 'Daten & Sicherung' : 'Data & Backup'}
          </h3>
          <div className="bg-surface rounded-card border border-border/80 divide-y divide-border/60 overflow-hidden shadow-1">
            {/* Symmetrical Flat Action Buttons (2-column grid) */}
            <div className="p-3.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border/70 text-xs font-semibold text-text transition-colors cursor-pointer active:scale-[0.99]"
                >
                  <Download className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{language === 'de' ? 'Sichern' : 'Backup'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border/70 text-xs font-semibold text-text transition-colors cursor-pointer active:scale-[0.99]"
                >
                  <Upload className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{language === 'de' ? 'Einspielen' : 'Restore'}</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => handleImport(e.target.files?.[0])}
                />

                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border/70 text-xs font-semibold text-text transition-colors cursor-pointer active:scale-[0.99]"
                >
                  <Printer className="w-3.5 h-3.5 text-text-secondary shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{language === 'de' ? 'Drucken' : 'Print'}</span>
                </button>

                {onOpenBahaiSongs ? (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenBahaiSongs();
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border/70 text-xs font-semibold text-text transition-colors cursor-pointer active:scale-[0.99]"
                  >
                    <Music className="w-3.5 h-3.5 text-text-secondary shrink-0" strokeWidth={1.75} />
                    <span className="truncate">Bahá'í Songs</span>
                  </button>
                ) : (
                  <div className="hidden" />
                )}
              </div>
            </div>

            {/* Subtle Red Danger Action at the bottom */}
            <div className="p-3 bg-danger/5">
              <button
                type="button"
                onClick={handleClear}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 min-h-[40px] rounded-control text-xs font-semibold text-danger hover:bg-danger/10 transition-colors cursor-pointer active:scale-[0.99]"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                <span>{language === 'de' ? 'Alle lokalen Daten zurücksetzen' : 'Reset all local data'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* FOOTER: ÜBER DIE SEITE, OFFLINE STATUS & RECHTLICHES              */}
        {/* ================================================================= */}
        <footer className="pt-2 border-t border-border/60 space-y-2 text-left">
          <div className="flex items-center justify-between text-2xs text-text-secondary px-2">
            <span>{t.settingsVersion}</span>
            <div className="flex items-center gap-1.5 text-success font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{isOfflineReady ? t.settingsOfflineReady : t.settingsOfflineDesc}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-2xs text-text-secondary px-2">
            <div className="flex items-center gap-2.5">
              <Link to="/impressum" onClick={onClose} className="hover:text-text">
                {t.impressumTitle}
              </Link>
              <span>·</span>
              <Link to="/datenschutz" onClick={onClose} className="hover:text-text">
                {t.datenschutzTitle}
              </Link>
            </div>
            <Link to="/vorschlagen" onClick={onClose} className="hover:text-accent font-medium">
              {t.settingsSubmitProposal}
            </Link>
          </div>
        </footer>
      </div>
    </Sheet>
  );
};