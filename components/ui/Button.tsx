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
    'inline-flex items-center justify-center whitespace-nowrap font-display font-extrabold tracking-wide transition-all duration-150 ease-out select-none active:translate-y-[3px] focus-visible:ring-4 focus-visible:ring-amber-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';

  const sizeStyles = {
    sm: 'min-h-[40px] gap-1.5 px-4 py-2 text-xs rounded-2xl',
    md: 'min-h-[50px] gap-2 px-5 py-2.5 text-sm rounded-2xl',
    lg: 'min-h-[56px] gap-2.5 px-6 py-3 text-base rounded-2xl',
    hero: 'min-h-[64px] gap-3 px-8 py-4 text-lg rounded-3xl',
  };

  const variantStyles: Record<string, string> = {
    primary:
      'bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] text-amber-950 border-b-4 border-[#D97706] shadow-md shadow-amber-500/20 hover:brightness-105 active:border-b-0',
    secondary:
      'bg-white text-ink border-2 border-b-4 border-slate-200 shadow-xs hover:bg-slate-50 hover:border-slate-300 active:border-b-2',
    ghost:
      'bg-transparent text-ink-secondary border-0 hover:bg-amber-100 hover:text-ink active:translate-y-0',
    outline:
      'bg-white/90 backdrop-blur-sm text-ink border-2 border-b-4 border-amber-300 hover:bg-amber-50 active:border-b-2',
    success:
      'bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white border-b-4 border-[#15803D] shadow-md shadow-emerald-500/25 hover:brightness-105 active:border-b-0',
    sage:
      'bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white border-b-4 border-[#15803D] shadow-md shadow-emerald-500/25 hover:brightness-105 active:border-b-0',
    terracotta:
      'bg-gradient-to-b from-[#F43F5E] to-[#E11D48] text-white border-b-4 border-[#BE123C] shadow-md shadow-rose-500/25 hover:brightness-105 active:border-b-0',
    amber:
      'bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] text-amber-950 font-extrabold border-b-4 border-[#D97706] shadow-md shadow-amber-500/25 hover:brightness-105 active:border-b-0',
    forest:
      'bg-gradient-to-b from-[#22C55E] to-[#15803D] text-white border-b-4 border-[#166534] shadow-md shadow-emerald-500/25 hover:brightness-105 active:border-b-0',
    realm:
      'bg-gradient-to-b from-[#06B6D4] to-[#0891B2] text-white border-b-4 border-[#0E7490] shadow-md shadow-cyan-500/25 hover:brightness-105 active:border-b-0',
    castle:
      'bg-gradient-to-b from-[#A855F7] to-[#7E22CE] text-white border-b-4 border-[#6B21A8] shadow-md shadow-purple-500/25 hover:brightness-105 active:border-b-0',
    mountains:
      'bg-gradient-to-b from-[#FB923C] to-[#EA580C] text-white border-b-4 border-[#C2410C] shadow-md shadow-orange-500/25 hover:brightness-105 active:border-b-0',
    rainbow:
      'bg-gradient-to-r from-[#F59E0B] via-[#10B981] to-[#06B6D4] text-white border-b-4 border-[#0891B2] shadow-md shadow-cyan-500/25 hover:brightness-105 active:border-b-0 animate-pulse-gentle',
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