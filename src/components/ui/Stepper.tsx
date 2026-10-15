import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  label,
  className = '',
}) => {
  const canDecrement = value - step >= min;
  const canIncrement = value + step <= max;

  return (
    <div
      className={`inline-flex items-center bg-surface-2 rounded-control p-1 gap-1 border-0 select-none ${className}`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        disabled={!canDecrement}
        onClick={() => onChange(Math.max(min, value - step))}
        aria-label={`${label} verringern`}
        className="w-10 h-10 rounded-control bg-surface text-text hover:bg-surface/80 flex items-center justify-center font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-1 transition-colors duration-150 ease-out outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Minus className="w-4 h-4" strokeWidth={1.75} />
      </button>

      <span className="w-12 text-center text-sm font-semibold tabular-nums text-text" aria-live="polite">
        {value}
      </span>

      <button
        type="button"
        disabled={!canIncrement}
        onClick={() => onChange(Math.min(max, value + step))}
        aria-label={`${label} erhöhen`}
        className="w-10 h-10 rounded-control bg-surface text-text hover:bg-surface/80 flex items-center justify-center font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-1 transition-colors duration-150 ease-out outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Plus className="w-4 h-4" strokeWidth={1.75} />
      </button>
    </div>
  );
};
