import React from 'react';
import { Switch as GlisseSwitch } from 'glisse';

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

  // Das label hat bewusst kein eigenes onClick: htmlFor leitet den Klick schon an den Schalter (button) weiter,
  // ein zweiter Handler schaltete doppelt, also gar nicht.
  return (
    <div className={`inline-flex items-center justify-between gap-4 select-none ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      {(label || description) && (
        <label htmlFor={switchId} className="cursor-pointer">
          {label && <span className="block text-sm font-medium text-text">{label}</span>}
          {description && <span className="block text-xs text-text-secondary mt-0.5">{description}</span>}
        </label>
      )}
      <GlisseSwitch
        id={switchId}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={label || 'Schalter'}
      />
    </div>
  );
};
