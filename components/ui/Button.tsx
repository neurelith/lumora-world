'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'outline'
    | 'success'
    | 'sage'
    | 'terracotta'
    | 'amber'
    | 'forest'
    | 'realm'
    | 'castle'
    | 'mountains'
    | 'rainbow';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

/** A vibrant, touch-friendly 3D candy action control with bouncy micro-interactions. */
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
  const baseStyles =
    'inline-flex items-center justify-center whitespace-nowrap font-display font-bold tracking-[-0.015em] transition-all duration-200 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber disabled:pointer-events-none disabled:opacity-45';

  const sizeStyles = {
    sm: 'min-h-[40px] gap-1.5 px-3.5 py-2 text-sm rounded-xl',
    md: 'min-h-[48px] gap-2 px-5 py-2.5 text-[15px] rounded-2xl',
    lg: 'min-h-[54px] gap-2.5 px-6 py-3 text-[17px] rounded-2xl shadow-soft-sm',
    hero: 'min-h-[62px] gap-3 px-8 py-4 text-[19px] rounded-3xl shadow-soft-md',
  };

  const variantStyles: Record<string, string> = {
    primary:
      'bg-gradient-to-r from-[#E8A33D] to-[#D97706] text-ink border border-amber/40 shadow-candy-amber hover:brightness-105',
    secondary:
      'bg-white text-ink border-2 border-hairline shadow-soft-xs hover:bg-sand/70 hover:border-ink/20',
    ghost:
      'bg-transparent text-ink-secondary border-0 hover:bg-amber/10 hover:text-ink',
    outline:
      'bg-white/80 backdrop-blur-sm text-ink border-2 border-hairline hover:bg-sand hover:border-amber/40',
    success:
      'bg-gradient-to-r from-[#10B981] to-[#059669] text-white border border-emerald-400/40 shadow-candy-emerald hover:brightness-105',
    sage:
      'bg-gradient-to-r from-[#10B981] to-[#059669] text-white border border-emerald-400/40 shadow-candy-emerald hover:brightness-105',
    terracotta:
      'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white border border-orange-400/40 shadow-candy-coral hover:brightness-105',
    amber:
      'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-ink font-extrabold border border-amber/40 shadow-candy-amber hover:brightness-105',
    forest:
      'bg-gradient-to-r from-[#10B981] to-[#047857] text-white border border-emerald-400/40 shadow-candy-emerald hover:brightness-105',
    realm:
      'bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white border border-cyan-400/40 shadow-candy-cyan hover:brightness-105',
    castle:
      'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white border border-purple-400/40 shadow-candy-purple hover:brightness-105',
    mountains:
      'bg-gradient-to-r from-[#F97316] to-[#C2410C] text-white border border-orange-400/40 shadow-candy-coral hover:brightness-105',
    rainbow:
      'bg-gradient-to-r from-[#F59E0B] via-[#10B981] to-[#06B6D4] text-white border border-white/40 shadow-candy-cyan hover:brightness-105 animate-pulse-gentle',
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