import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Language } from '../../types';

/** Inline DE/EN pair. Both strings are always provided, so parity is guaranteed. */
export const tr = (language: Language) => (de: string, en: string) => (language === 'de' ? de : en);

export const ToolHeader: React.FC<{ title: string; subtitle?: string; onBack: () => void; backLabel: string; actions?: React.ReactNode }> = ({
  title,
  subtitle,
  onBack,
  backLabel,
  actions,
}) => (
  <div className="mb-6 print:hidden">
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 -ml-2 px-2 min-h-[40px] rounded-lg text-sm text-text-secondary hover:text-text"
    >
      <ArrowLeft className="w-4 h-4" />
      {backLabel}
    </button>
    <div className="flex items-start justify-between gap-4 mt-1">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
        {subtitle && <p className="text-sm text-text-secondary mt-1 max-w-prose">{subtitle}</p>}
      </div>
      {actions}
    </div>
  </div>
);

export const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-surface border border-border rounded-2xl p-4 sm:p-6 ${className}`}>{children}</div>
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
  <div className="inline-flex items-center border border-border rounded-xl bg-surface" role="group" aria-label={label}>
    <button
      type="button"
      className="w-11 h-11 text-lg text-text-secondary hover:text-text disabled:opacity-40"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      aria-label={`${label} −`}
    >
      −
    </button>
    <span className="w-12 text-center text-base font-semibold tabular-nums" aria-live="polite">
      {value}
    </span>
    <button
      type="button"
      className="w-11 h-11 text-lg text-text-secondary hover:text-text disabled:opacity-40"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      aria-label={`${label} +`}
    >
      +
    </button>
  </div>
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
  `h-9 px-3 rounded-lg text-sm border transition-colors ${
    selected ? 'bg-accent-subtle border-accent text-accent-text font-semibold' : 'border-border text-text-secondary hover:text-text bg-surface'
  }`;

export const primaryBtn =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl bg-accent text-accent-contrast font-semibold hover:bg-accent-hover disabled:opacity-50 transition-colors';
export const secondaryBtn =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-border bg-surface text-text text-sm font-medium hover:bg-surface-2 disabled:opacity-50 transition-colors';
