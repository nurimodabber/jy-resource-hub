import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Minus, Plus, Users, Pencil, ChevronDown } from 'lucide-react';
import { Language } from '../../types';
import { loadPresentNames } from '../../utils/groupNames';

/** Inline DE/EN pair. Both strings are always provided, so parity is guaranteed. */
export const tr = (language: Language) => (de: string, en: string) => (language === 'de' ? de : en);

export const ToolHeader: React.FC<{
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel: string;
  actions?: React.ReactNode;
}> = ({
  title,
  subtitle,
  onBack,
  backLabel,
  actions,
}) => (
  <div className="mb-2 sm:mb-4 print:hidden">
    {/* Desktop/Tablet view (sm and up) */}
    <div className="hidden sm:block">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 -ml-2 px-3 min-h-[44px] rounded-control text-sm text-text-secondary hover:text-text hover:bg-surface-2 transition-colors duration-150 ease-out cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        {backLabel}
      </button>
      <div className="flex items-start justify-between gap-4 mt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">{title}</h1>
          {subtitle && <p className="text-sm text-text-secondary mt-1 max-w-prose">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>

    {/* Mobile compact view (< sm) */}
    <div className="sm:hidden flex items-center justify-between gap-2 min-h-[44px]">
      <div className="flex items-center gap-1.5 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 p-2 min-h-[44px] min-w-[44px] rounded-control text-text-secondary hover:text-text hover:bg-surface-2 transition-colors duration-150 ease-out flex items-center justify-center shrink-0 cursor-pointer"
          aria-label={backLabel}
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-text truncate">
          {title}
        </h1>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  </div>
);

export const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-surface shadow-1 rounded-card p-5 sm:p-6 border-0 ${className}`}>{children}</div>
);

export const Label: React.FC<{ children: React.ReactNode; htmlFor?: string }> = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-text mb-1.5">
    {children}
  </label>
);

export const Stepper: React.FC<{ value: number; min: number; max: number; onChange: (n: number) => void; label: string }> = ({
  value,
  min,
  max,
  onChange,
  label,
}) => (
  <div className="inline-flex items-center bg-surface-2 rounded-control p-1 gap-1 border-0" role="group" aria-label={label}>
    <button
      type="button"
      className="w-10 h-10 rounded-control bg-surface text-text hover:bg-surface/80 flex items-center justify-center font-semibold disabled:opacity-40 shadow-1 transition-colors duration-150 ease-out cursor-pointer disabled:cursor-not-allowed"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      aria-label={`${label} −`}
    >
      <Minus className="w-4 h-4" strokeWidth={1.75} />
    </button>
    <span className="w-12 text-center text-sm font-semibold tabular-nums text-text" aria-live="polite">
      {value}
    </span>
    <button
      type="button"
      className="w-10 h-10 rounded-control bg-surface text-text hover:bg-surface/80 flex items-center justify-center font-semibold disabled:opacity-40 shadow-1 transition-colors duration-150 ease-out cursor-pointer disabled:cursor-not-allowed"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      aria-label={`${label} +`}
    >
      <Plus className="w-4 h-4" strokeWidth={1.75} />
    </button>
  </div>
);

export const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      onChange(!checked);
    }}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-40 select-none p-0.5 ${
      checked ? 'bg-accent border border-accent' : 'bg-surface-2 border border-border-strong dark:border-border'
    }`}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const ChoiceChips: React.FC<{
  options: { id: string; label: string }[];
  value: string | null;
  onChange: (id: string | null) => void;
  allLabel?: string;
}> = ({ options, value, onChange, allLabel }) => (
  <div className="flex flex-wrap gap-2">
    {allLabel && (
      <button type="button" aria-pressed={value === null} onClick={() => onChange(null)} className={chipCls(value === null)}>
        {allLabel}
      </button>
    )}
    {options.map((o) => (
      <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(value === o.id ? null : o.id)} className={chipCls(value === o.id)}>
        {o.label}
      </button>
    ))}
  </div>
);

export const chipCls = (selected: boolean) =>
  `min-h-[40px] px-4 rounded-chip text-sm font-medium transition-colors duration-150 ease-out border-0 ${
    selected
      ? 'bg-accent-subtle text-accent-text font-semibold'
      : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-surface-2/80'
  }`;

export const primaryBtn =
  'liquid-pill-primary min-h-[48px] px-6 text-base font-semibold gap-2 select-none disabled:opacity-50 disabled:pointer-events-none';
export const secondaryBtn =
  'liquid-pill-secondary min-h-[44px] px-5 text-sm font-medium gap-2 select-none disabled:opacity-50 disabled:pointer-events-none';

export const JY_SAMPLE_NAMES = [
  'Musonda', 'Rose', 'Chishimba', 'Godwin',
  'Habib', 'Maya', 'Alain', 'Li',
  'Diego', 'Marta', 'Rosa', 'Carlos',
  'Kibomi', 'Tendai', 'Navid', 'Shirin'
];

export function getSamplePlayerName(index: number): string {
  return JY_SAMPLE_NAMES[index % JY_SAMPLE_NAMES.length];
}

/**
 * Standardized player list hook:
 * Seamlessly manages playerCount and editable playerNames.
 * Automatically loads present names from localStorage, pads additional slots
 * with canonical JY book character names (Musonda, Rose, Chishimba...), allows inline renaming,
 * and supports reload from group.
 */
export function usePlayerList(defaultCount: number, language: Language, minPlayers = 2) {
  const storedNames = useMemo(() => loadPresentNames(), []);
  const initialCount = Math.max(minPlayers, storedNames.length >= minPlayers ? storedNames.length : defaultCount);
  const [playerCount, setPlayerCount] = useState<number>(initialCount);

  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    const list: string[] = [];
    for (let i = 0; i < initialCount; i++) {
      list.push(storedNames[i]?.trim() || getSamplePlayerName(i));
    }
    return list;
  });

  // Keep playerNames synced when playerCount changes
  useEffect(() => {
    setPlayerNames((prev) => {
      if (playerCount === prev.length) return prev;
      if (playerCount > prev.length) {
        const next = [...prev];
        for (let i = prev.length; i < playerCount; i++) {
          next.push(storedNames[i]?.trim() || getSamplePlayerName(i));
        }
        return next;
      }
      return prev.slice(0, playerCount);
    });
  }, [playerCount, storedNames]);

  const handleRename = (index: number, newName: string) => {
    setPlayerNames((prev) => {
      const next = [...prev];
      next[index] = newName;
      return next;
    });
  };

  const handleResetToGroup = () => {
    const group = loadPresentNames();
    const count = Math.max(minPlayers, group.length);
    setPlayerCount(count);
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(group[i]?.trim() || getSamplePlayerName(i));
    }
    setPlayerNames(list);
  };

  return {
    playerCount,
    setPlayerCount,
    playerNames,
    setPlayerNames,
    handleRename,
    handleResetToGroup,
    hasGroupNames: storedNames.length > 0,
  };
}

/**
 * Standardized single-column player setup UI:
 * Flat, accessible, high-contrast, zero-emoji, with unified right-aligned Stepper.
 * Names section is collapsed by default to minimize scrolling, and expands cleanly
 * on demand with inline editable inputs and group loading.
 */
export const PlayerSetupSection: React.FC<{
  language: Language;
  playerCount: number;
  playerNames: string[];
  minPlayers?: number;
  maxPlayers?: number;
  onCountChange: (count: number) => void;
  onRename: (index: number, newName: string) => void;
  onResetToGroup?: () => void;
  hasGroupNames?: boolean;
  countLabel?: string;
  countSubtitle?: string;
  defaultExpanded?: boolean;
}> = ({
  language,
  playerCount,
  playerNames,
  minPlayers = 2,
  maxPlayers = 25,
  onCountChange,
  onRename,
  onResetToGroup,
  hasGroupNames = false,
  countLabel,
  countSubtitle,
  defaultExpanded = false,
}) => {
  const L = tr(language);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-3">
      {/* 1. Player Count Row */}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-border/50">
        <div className="min-w-0 flex-1 space-y-0.5">
          <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-accent" />
            <span>{countLabel || L('Spielende', 'Players')}</span>
          </span>
          <p className="text-2xs text-text-tertiary">
            {countSubtitle || L('Gesamtzahl der Personen in der Runde', 'Total number of players in this round')}
          </p>
        </div>
        <div className="w-36 shrink-0 flex justify-end">
          <Stepper
            value={playerCount}
            min={minPlayers}
            max={maxPlayers}
            onChange={onCountChange}
            label={countLabel || L('Personenanzahl', 'Player count')}
          />
        </div>
      </div>

      {/* 2. Collapsible Names Trigger */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="w-full flex items-center justify-between py-2 px-3 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
            <Pencil className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="font-bold shrink-0">{L('Namen anpassen', 'Player Names')}</span>
            <span className="text-2xs text-text-tertiary truncate">
              ({playerNames.slice(0, 3).join(', ')}{playerNames.length > 3 ? '…' : ''})
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-2xs font-semibold text-accent">
              {isExpanded ? L('Zuklappen', 'Collapse') : L('Bearbeiten', 'Edit')}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* 3. Expanded Names List */}
        {isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-border/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-secondary">
                {L('Einzelne Namen bearbeiten:', 'Edit individual names:')}
              </span>
              {hasGroupNames && onResetToGroup && (
                <button
                  type="button"
                  onClick={onResetToGroup}
                  className="text-2xs text-accent font-semibold hover:underline cursor-pointer"
                >
                  {L('Gruppenliste laden', 'Load group list')}
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {playerNames.map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-2xs font-semibold text-text-tertiary w-16 shrink-0 text-left tabular-nums">
                    {language === 'de' ? 'Person' : 'Player'} {i + 1}
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => onRename(i, e.target.value)}
                      placeholder={getSamplePlayerName(i)}
                      className="w-full px-3 py-1.5 pr-8 rounded-control bg-surface-2 border border-border/80 text-xs font-semibold text-text focus:border-accent focus:bg-surface focus:outline-hidden transition-colors"
                    />
                    <Pencil className="w-3 h-3 text-text-tertiary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

