import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const variantStyles = {
    text: 'h-4 rounded-control w-full',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-control w-full',
    card: 'rounded-card w-full shadow-1 min-h-[120px]',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      aria-hidden="true"
      style={style}
      className={`bg-surface-2 animate-pulse ${variantStyles[variant]} ${className}`}
    />
  );
};
