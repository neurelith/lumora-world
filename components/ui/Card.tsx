'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6 md:p-8',
  lg: 'p-8 md:p-10',
  xl: 'p-10 md:p-12',
};

const variantStyles = {
  default: 'bg-ivory border border-whisper rounded-card shadow-card',
  elevated: 'bg-ivory border border-whisper rounded-card shadow-float',
  interactive: 'bg-ivory border border-whisper rounded-card shadow-card transition-all duration-base ease-out-expo hover:shadow-float hover:-translate-y-0.5 focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_#3898ec] cursor-pointer',
  outlined: 'bg-transparent border border-border-soft rounded-card',
};

/** A versatile container with consistent elevation and interaction states. */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};