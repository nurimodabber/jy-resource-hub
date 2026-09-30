import React from 'react';
import logoPng from '../assets/logo.png';

interface LogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'w-6 h-6',
  size,
  alt = 'Junior Youth Hub Logo',
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
