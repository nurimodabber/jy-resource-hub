import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Bookmark, Music, Printer, Download, Upload, Trash2, X } from 'lucide-react';
import { NavTab, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { useTheme, Theme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { exportLocalData, importLocalData, clearLocalData, downloadText } from '../utils/backup';

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

const Segmented: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  label: string;
}> = ({ value, onChange, options, label }) => (
  <div role="group" aria-label={label} className="grid gap-1 p-1 rounded-xl bg-surface-2 border border-border" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
    {options.map((o) => (
      <button
        key={o.id}
        type="button"
        aria-pressed={value === o.id}
        onClick={() => onChange(o.id)}
        className={`h-9 rounded-lg text-sm transition-colors ${
          value === o.id ? 'bg-surface border border-border text-text font-semibold' : 'text-text-secondary hover:text-text'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const Row: React.FC<{ icon: React.ReactNode; label: string; hint?: string; onClick?: () => void; to?: string }> = ({ icon, label, hint, onClick, to }) => {
  const cls = 'w-full flex items-center gap-3 min-h-[44px] px-3 rounded-xl text-sm text-text hover:bg-surface-2 transition-colors text-left';
  const inner = (
    <>
      <span className="text-text-tertiary shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint && <span className="text-xs text-text-tertiary">{hint}</span>}
    </>
  );
  return to ? (
    <Link to={to} onClick={onClick} className={cls}>{inner}</Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>{inner}</button>
  );
};

export const MoreSheet: React.FC<MoreSheetProps> = ({
  isOpen,
  onClose,
  onOpenBahaiSongs,
  language,
  setLanguage,
}) => {
  const t = UI_TRANSLATIONS[language];
  const de = language === 'de';
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const panelRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExport = () => {
    downloadText(`jy-hub-backup-${new Date().toISOString().slice(0, 10)}.json`, exportLocalData());
    showToast({ text: de ? 'Sicherung heruntergeladen' : 'Backup downloaded' });
  };

  const handleImport = async (file?: File | null) => {
    if (!file) return;
    try {
      const n = importLocalData(await file.text());
      showToast({ text: de ? `${n} Einträge wiederhergestellt. Seite wird neu geladen.` : `${n} entries restored. Reloading.` });
      setTimeout(() => window.location.reload(), 900);
    } catch {
      showToast({ text: de ? 'Datei nicht lesbar' : 'File not readable' });
    }
  };

  const handleClear = () => {
    if (window.confirm(de ? 'Alle Merkliste, Pläne und Einstellungen auf diesem Gerät löschen?' : 'Delete all saved items, plans and settings on this device?')) {
      clearLocalData();
      window.location.reload();
    }
  };

  const heading = 'text-2xs font-semibold uppercase tracking-wider text-text-tertiary px-3 mb-1';

  return (
    <div className="print:hidden">
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t.tabSettings}
        className="fixed z-60 bg-surface border border-border shadow-apple-modal outline-hidden inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl safe-bottom lg:inset-x-auto lg:bottom-auto lg:top-14 lg:right-6 lg:w-[22rem] lg:rounded-2xl lg:max-h-[calc(100vh-5rem)]"
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-border sticky top-0 bg-surface">
          <h2 className="text-sm font-semibold text-text">{t.tabSettings}</h2>
          <button type="button" onClick={onClose} aria-label={t.close || 'Schließen'} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:bg-surface-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 space-y-4">
          <div className="lg:hidden">
            <p className={heading}>{de ? 'Bereiche' : 'Sections'}</p>
            <Row to="/service-arts" onClick={onClose} icon={<Palette className="w-4 h-4" />} label={t.tabServiceArts} />
            <Row to="/saved" onClick={onClose} icon={<Bookmark className="w-4 h-4" />} label={t.savedItems} />
          </div>

          <div className="space-y-2 px-1">
            <p className={heading.replace('px-3', 'px-2')}>{de ? 'Darstellung' : 'Appearance'}</p>
            <Segmented
              label={de ? 'Darstellung' : 'Appearance'}
              value={theme}
              onChange={(v) => setTheme(v as Theme)}
              options={[
                { id: 'light', label: de ? 'Hell' : 'Light' },
                { id: 'dark', label: de ? 'Dunkel' : 'Dark' },
                { id: 'system', label: 'Auto' },
              ]}
            />
            <p className={heading.replace('px-3', 'px-2') + ' pt-2'}>{de ? 'Sprache' : 'Language'}</p>
            <Segmented
              label={de ? 'Sprache' : 'Language'}
              value={language}
              onChange={(v) => setLanguage(v as Language)}
              options={[
                { id: 'de', label: 'Deutsch' },
                { id: 'en', label: 'English' },
              ]}
            />
          </div>

          <div>
            <p className={heading}>{de ? 'Dieses Gerät' : 'This device'}</p>
            <Row onClick={() => { window.print(); onClose(); }} icon={<Printer className="w-4 h-4" />} label={t.printHandout} />
            <Row onClick={handleExport} icon={<Download className="w-4 h-4" />} label={de ? 'Daten sichern' : 'Back up data'} />
            <Row onClick={() => fileRef.current?.click()} icon={<Upload className="w-4 h-4" />} label={de ? 'Sicherung einlesen' : 'Restore backup'} />
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => handleImport(e.target.files?.[0])} />
            <Row onClick={handleClear} icon={<Trash2 className="w-4 h-4" />} label={de ? 'Alles auf diesem Gerät löschen' : 'Delete everything on this device'} />
          </div>

          <div>
            <p className={heading}>{de ? 'Weitere Ressourcen' : 'More resources'}</p>
            <Row onClick={() => { onOpenBahaiSongs(); onClose(); }} icon={<Music className="w-4 h-4" />} label="Bahá'í Songs" hint="bahaisongs.com" />
          </div>

          <div className="flex items-center justify-center gap-4 pt-2 border-t border-border text-xs text-text-secondary">
            <Link to="/impressum" onClick={onClose} className="py-2 hover:text-text">{t.impressumTitle}</Link>
            <span aria-hidden="true">·</span>
            <Link to="/datenschutz" onClick={onClose} className="py-2 hover:text-text">{t.datenschutzTitle}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
