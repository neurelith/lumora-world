'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'success' | 'sage' | 'terracotta';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

/** A high-contrast, touch-friendly action control with a quiet visual hierarchy. */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap font-body font-medium tracking-[-0.015em] transition-[background-color,color,border-color,transform,box-shadow] duration-base ease-out-expo active:scale-[0.97] focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_#3898ec] disabled:pointer-events-none disabled:opacity-45';

  const sizeStyles = {
    sm: 'min-h-[40px] gap-1.5 px-3.5 py-2 text-sm rounded-button',
    md: 'min-h-[48px] gap-2 px-5 py-2.5 text-[16px] rounded-button',
    lg: 'min-h-[52px] gap-2 px-6 py-3 text-[17px] rounded-button',
    hero: 'min-h-[60px] gap-3 px-8 py-4 text-[19px] rounded-panel',
  };

  const variantStyles: Record<string, string> = {
    primary: 'bg-terracotta text-white border-0 shadow-[0_0_0_1px_rgba(201,100,66,0.35)] hover:bg-terracotta-hover hover:shadow-[0_4px_14px_rgba(201,100,66,0.24)]',
    secondary: 'bg-sand text-ink border border-border-soft hover:bg-sand/80 hover:shadow-sm',
    ghost: 'bg-transparent text-ink-secondary border-0 hover:bg-terracotta-soft hover:text-terracotta',
    outline: 'bg-transparent text-ink border border-border-soft hover:bg-sand hover:border-ink/30',
    // ponytail: sage == success, terracotta == primary — collapsed duplicates
    success: 'bg-sage text-white border-0 shadow-[0_0_0_1px_rgba(74,124,94,0.35)] hover:bg-sage/90 hover:shadow-[0_4px_14px_rgba(74,124,94,0.24)]',
    sage: 'bg-sage text-white border-0 shadow-[0_0_0_1px_rgba(74,124,94,0.35)] hover:bg-sage/90 hover:shadow-[0_4px_14px_rgba(74,124,94,0.24)]',
    terracotta: 'bg-terracotta text-white border-0 shadow-[0_0_0_1px_rgba(201,100,66,0.35)] hover:bg-terracotta-hover hover:shadow-[0_4px_14px_rgba(201,100,66,0.24)]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin-slow h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : leftIcon ? (
        <span className="flex shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!loading && rightIcon && <span className="flex shrink-0">{rightIcon}</span>}
    </button>
  );
};