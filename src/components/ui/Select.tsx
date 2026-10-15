import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  children,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-text mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`w-full appearance-none bg-surface-2 text-text text-sm rounded-control min-h-[44px] py-2.5 pl-4 pr-10 transition-colors duration-150 ease-out border-0 outline-hidden focus:ring-2 focus:ring-accent focus:bg-surface cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'ring-2 ring-danger' : ''
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-surface text-text">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <span className="absolute right-3.5 text-text-tertiary pointer-events-none flex items-center justify-center shrink-0">
          <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
        </span>
      </div>
      {error && (
        <p className="text-xs text-danger mt-1.5">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
