import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Junior Youth Empowerment Logo"
    >
      <defs>
        <linearGradient id="jy-empower-left" x1="8" y1="6" x2="16" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="jy-empower-right" x1="24" y1="6" x2="16" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="jy-spark-grad" x1="16" y1="2" x2="16" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Upward soaring wings / flame of youth empowerment */}
      {/* Left wing */}
      <path
        d="M16 25C11.8 25 8.5 21.2 8.5 16.2C8.5 12.2 11.2 8.8 16 5.8C14.6 9 14.2 12.3 15 15.2C15.5 17.2 16 18.8 16 25Z"
        fill="url(#jy-empower-left)"
        opacity="0.95"
      />
      {/* Right wing */}
      <path
        d="M16 25C20.2 25 23.5 21.2 23.5 16.2C23.5 12.2 20.8 8.8 16 5.8C17.4 9 17.8 12.3 17 15.2C16.5 17.2 16 18.8 16 25Z"
        fill="url(#jy-empower-right)"
      />
      {/* Central ascending spark */}
      <path
        d="M16 24.5C15 21 14.8 17.5 16 12.5C17.2 17.5 17 21 16 24.5Z"
        fill="#ffffff"
        opacity="0.9"
      />
      {/* Summit star / radiant light of potential */}
      <circle cx="16" cy="4.8" r="2.2" fill="url(#jy-spark-grad)" />
      {/* Base arc of community & unity */}
      <path
        d="M9.5 27C11.5 28 13.7 28.5 16 28.5C18.3 28.5 20.5 28 22.5 27"
        stroke="#10b981"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};
