import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Upload,
  Trash2,
  Printer,
  Music,
  Users,
  ChevronRight,
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
  const { theme, setTheme } = useTheme();
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
        text:
          language === 'de'
            ? `${n} Einträge wiederhergestellt. Seite lädt neu...`
            : `${n} entries restored. Reloading...`,
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
      description={
        language === 'de'
          ? 'App-Einstellungen, Gruppe & Datensicherung'
          : 'App preferences, group & backup'
      }
      position="bottom"
    >
      <div className="space-y-4 max-w-xl mx-auto pb-4">
        {/* ================================================================= */}
        {/* SECTION 1: DARSTELLUNG & SPRACHE                                  */}
        {/* ================================================================= */}
        <section className="text-left">
          <div className="bg-surface/90 border border-border/80 rounded-card p-4 space-y-4 overflow-hidden shadow-xs">
            {/* Theme 4-segment selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text flex items-center gap-2">
                  <Palette className="w-4 h-4 text-accent shrink-0" strokeWidth={1.75} />
                  <span>{t.settingsAppearance}</span>
                </span>
                <span className="text-2xs font-medium text-text-secondary capitalize">
                  {theme === 'light'
                    ? language === 'de'
                      ? 'Hell'
                      : 'Light'
                    : theme === 'dark'
                      ? language === 'de'
                        ? 'Dunkel'
                        : 'Dark'
                      : language === 'de'
                        ? 'System'
                        : 'System'}
                </span>
              </div>
              <SegmentedControl
                options={[
                  { id: 'light', label: language === 'de' ? 'Hell' : 'Light' },
                  { id: 'dark', label: language === 'de' ? 'Dunkel' : 'Dark' },
                  { id: 'system', label: language === 'de' ? 'System' : 'System' },
                ]}
                value={theme}
                onChange={(v) => setTheme(v as Theme)}
                fullWidth
                size="sm"
              />
            </div>

            {/* Language 2-segment switch */}
            <div className="space-y-2">
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
        {/* SECTION 2: GRUPPE                                                 */}
        {/* ================================================================= */}
        <section className="text-left">
          <div className="bg-surface/90 border border-border/80 rounded-card overflow-hidden shadow-xs">
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
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-control bg-surface-2 border border-border/60 flex items-center justify-center shrink-0 text-text group-hover:text-accent group-hover:bg-accent-subtle transition-colors">
                    <Users className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-text truncate">
                      {groupTitle || (language === 'de' ? 'Meine Gruppe' : 'My Group')}
                    </span>
                    <span className="block text-2xs text-text-secondary truncate mt-0.5">
                      {groupNames.length > 0
                        ? language === 'de'
                          ? `${presentCount} von ${groupNames.length} Personen anwesend`
                          : `${presentCount} of ${groupNames.length} members present`
                        : language === 'de'
                          ? 'Noch keine Namen hinterlegt'
                          : 'No group members added yet'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-2xs font-semibold text-accent hidden sm:inline">
                    {isGroupExpanded
                      ? language === 'de'
                        ? 'Schließen'
                        : 'Close'
                      : language === 'de'
                        ? 'Verwalten'
                        : 'Manage'}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${
                      isGroupExpanded ? 'rotate-90 text-accent' : 'group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </div>

              {isGroupExpanded && (
                <div className="pt-3 border-t border-border/60 animate-in fade-in duration-150">
                  <GroupManager language={language} compact={true} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 3: DATEN & SICHERUNG                                      */}
        {/* ================================================================= */}
        <section className="text-left">
          <div className="bg-surface/90 border border-border/80 rounded-card divide-y divide-border/60 overflow-hidden shadow-xs">
            {/* Symmetrical Flat Action Buttons (2-column grid) */}
            <div className="p-3.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border/70 text-xs font-semibold text-text transition-all cursor-pointer active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Download className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{language === 'de' ? 'Sichern' : 'Backup'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border/70 text-xs font-semibold text-text transition-all cursor-pointer active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
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
                  className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border/70 text-xs font-semibold text-text transition-all cursor-pointer active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Printer
                    className="w-3.5 h-3.5 text-text-secondary shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className="truncate">{language === 'de' ? 'Drucken' : 'Print'}</span>
                </button>

                {onOpenBahaiSongs ? (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenBahaiSongs();
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border/70 text-xs font-semibold text-text transition-all cursor-pointer active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Music
                      className="w-3.5 h-3.5 text-text-secondary shrink-0"
                      strokeWidth={1.75}
                    />
                    <span className="truncate">Bahá'í Songs</span>
                  </button>
                ) : (
                  <div className="hidden" />
                )}
              </div>
            </div>

            {/* Subtle Danger Action at the bottom */}
            <div className="p-3 bg-surface-2/30">
              <button
                type="button"
                onClick={handleClear}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-control text-xs font-semibold text-danger/80 hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all cursor-pointer active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-danger"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                <span>
                  {language === 'de' ? 'Alle lokalen Daten zurücksetzen' : 'Reset all local data'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* FOOTER: ÜBER DIE SEITE, OFFLINE STATUS & RECHTLICHES              */}
        {/* ================================================================= */}
        <footer className="pt-4 border-t border-border/50 text-center space-y-3 select-none">
          {/* Row 1: Legal & Nav Links + Dedicated Subtle Admin Badge */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-text-secondary">
            <Link
              to="/impressum"
              onClick={onClose}
              className="hover:text-text transition-colors py-1 min-h-[44px] inline-flex items-center"
            >
              {t.impressumTitle}
            </Link>
            <Link
              to="/datenschutz"
              onClick={onClose}
              className="hover:text-text transition-colors py-1 min-h-[44px] inline-flex items-center"
            >
              {t.datenschutzTitle}
            </Link>
            <Link
              to="/vorschlagen"
              onClick={onClose}
              className="hover:text-accent font-medium transition-colors py-1 min-h-[44px] inline-flex items-center"
            >
              {t.settingsSubmitProposal}
            </Link>
            <Link
              to="/admin"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 hover:bg-surface-raised border border-border/70 text-text-tertiary hover:text-text transition-colors text-xs font-medium min-h-[44px]"
              title={language === 'de' ? 'Admin-Dashboard' : 'Admin Dashboard'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-text-tertiary" strokeWidth={1.75} />
              <span>Admin</span>
            </Link>
          </div>

          {/* Row 2: Version & Offline Readiness */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 text-2xs text-text-tertiary">
            <span>
              {t.siteTitle} · {t.settingsVersion}
            </span>
            <span className="hidden sm:inline text-border-strong select-none">·</span>
            <div className="inline-flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isOfflineReady ? 'bg-emerald-500' : 'bg-emerald-500/80'} inline-block shrink-0`}
              />
              <span>{isOfflineReady ? t.settingsOfflineReady : t.settingsOfflineDesc}</span>
            </div>
          </div>
        </footer>
      </div>
    </Sheet>
  );
};
