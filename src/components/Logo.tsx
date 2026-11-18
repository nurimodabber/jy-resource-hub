import React from 'react';
// Inlined as data URL (5.6 KB, above Vite's 4 KB default): the logo appears with the first render
// instead of after a separate request, during which the browser showed the alt text.
import logoPng from '../assets/logo.png?inline';

interface LogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'w-6 h-6',
  size,
  // Decorative: every use sits next to the site name or inside a labelled link.
  alt = '',
}) => {
  return (
    <img
      src={logoPng}
      alt={alt}
      className={`object-contain select-none pointer-events-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
      draggable={false}
    />
  );
};
