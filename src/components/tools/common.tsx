import React from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { Language } from '../../types';

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
  <div className="mb-6 print:hidden">
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-2 -ml-2 px-3 min-h-[44px] rounded-control text-sm text-text-secondary hover:text-text hover:bg-surface-2 transition-colors duration-150 ease-out"
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
      className="w-10 h-10 rounded-control bg-surface text-text hover:bg-surface/80 flex items-center justify-center font-semibold disabled:opacity-40 shadow-1 transition-colors duration-150 ease-out"
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
      className="w-10 h-10 rounded-control bg-surface text-text hover:bg-surface/80 flex items-center justify-center font-semibold disabled:opacity-40 shadow-1 transition-colors duration-150 ease-out"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      aria-label={`${label} +`}
    >
      <Plus className="w-4 h-4" strokeWidth={1.75} />
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
  `min-h-[40px] px-4 rounded-chip text-sm font-medium transition-colors duration-150 ease-out border-0 ${
    selected
      ? 'bg-accent-subtle text-accent-text font-semibold'
      : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-surface-2/80'
  }`;

export const primaryBtn =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-control bg-accent text-accent-contrast font-semibold shadow-1 hover:bg-accent-hover disabled:opacity-50 transition-colors duration-150 ease-out border-0';
export const secondaryBtn =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-control bg-surface-2 text-text text-sm font-medium hover:bg-surface-2/80 disabled:opacity-50 transition-colors duration-150 ease-out border-0';
