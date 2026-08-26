'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: 'forest' | 'castle' | 'realm' | 'mountains' | 'valley' | 'terracotta' | 'sage' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
};

const colorStyles = {
  forest: 'bg-forest',
  castle: 'bg-castle',
  realm: 'bg-realm',
  mountains: 'bg-mountains',
  valley: 'bg-valley',
  terracotta: 'bg-terracotta',
  sage: 'bg-sage',
  amber: 'bg-amber',
};

/** Accessible progress bar with spring animation and semantic colors. */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'terracotta',
  size = 'md',
  height,
  showLabel = false,
  label,
  animated = true,
  className = '',
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const resolvedSize = height ?? size;
  
  return (
    <div className={`w-full ${className}`} role="progressbar" aria-valuenow={clampedProgress} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progress'}>
      <div className={`progress-track ${sizeStyles[resolvedSize]}`}>
        <div
          className={`${colorStyles[color]} progress-fill ${animated ? 'animate-spring-in' : ''}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mt-1.5 text-xs font-body text-ink-tertiary">
          <span>{label || `Step ${Math.round(clampedProgress / 20) || 1} of 5`}</span>
          <span className="font-display font-bold text-ink">{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  );
};