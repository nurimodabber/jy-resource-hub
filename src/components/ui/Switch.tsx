import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className = '',
}) => {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`inline-flex items-center justify-between gap-4 select-none ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      {(label || description) && (
        <label htmlFor={switchId} onClick={handleToggle} className="cursor-pointer">
          {label && <span className="block text-sm font-medium text-text">{label}</span>}
          {description && <span className="block text-xs text-text-secondary mt-0.5">{description}</span>}
        </label>
      )}
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        aria-label={label || 'Schalter'}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex items-center h-7 w-12 min-h-[28px] max-h-[28px] min-w-[48px] shrink-0 cursor-pointer rounded-chip transition-colors duration-150 ease-out outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
          checked ? 'bg-accent' : 'bg-surface-2 ring-1 ring-border'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-1 transition-transform duration-150 ease-out ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};
