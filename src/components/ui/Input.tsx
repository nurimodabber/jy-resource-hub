import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  rightElement,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-text-tertiary pointer-events-none flex items-center justify-center shrink-0">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full bg-surface-2 text-text placeholder:text-text-tertiary text-sm rounded-control min-h-[44px] py-2.5 transition-colors duration-150 ease-out border-0 outline-hidden focus:ring-2 focus:ring-accent focus:bg-surface disabled:opacity-50 disabled:cursor-not-allowed ${
            icon ? 'pl-10' : 'px-4'
          } ${rightElement ? 'pr-10' : 'px-4'} ${error ? 'ring-2 ring-danger' : ''} ${className}`}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3.5 flex items-center justify-center">
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-danger mt-1.5">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
