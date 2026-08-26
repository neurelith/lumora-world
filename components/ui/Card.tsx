'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'elevated'
    | 'interactive'
    | 'outlined'
    | 'forest'
    | 'realm'
    | 'castle'
    | 'valley'
    | 'mountains'
    | 'gold';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-8',
  xl: 'p-8 md:p-10',
};

const variantStyles = {
  default:
    'bg-white/95 backdrop-blur-md border-2 border-b-4 border-slate-200 rounded-3xl shadow-soft-sm',
  elevated:
    'bg-white border-2 border-b-4 border-slate-200 rounded-3xl shadow-soft-md',
  interactive:
    'bg-white/95 backdrop-blur-md border-2 border-b-4 border-slate-200 rounded-3xl shadow-soft-sm transition-all duration-200 ease-out hover:shadow-soft-lg hover:-translate-y-1 hover:border-amber-400 focus-visible:ring-4 focus-visible:ring-amber-300 cursor-pointer',
  outlined:
    'bg-white/60 backdrop-blur-sm border-2 border-dashed border-amber-300 rounded-3xl',
  forest:
    'bg-gradient-to-br from-[#F0FDF4] via-[#DCFCE7] to-white border-2 border-b-4 border-emerald-400 rounded-3xl shadow-candy-emerald',
  realm:
    'bg-gradient-to-br from-[#F0FDFA] via-[#CCFBF1] to-white border-2 border-b-4 border-teal-400 rounded-3xl shadow-candy-cyan',
  castle:
    'bg-gradient-to-br from-[#FAF5FF] via-[#EDE9FE] to-white border-2 border-b-4 border-purple-400 rounded-3xl shadow-candy-purple',
  valley:
    'bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-white border-2 border-b-4 border-blue-400 rounded-3xl shadow-soft-md',
  mountains:
    'bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-white border-2 border-b-4 border-orange-400 rounded-3xl shadow-candy-coral',
  gold:
    'bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-white border-2 border-b-4 border-amber-400 rounded-3xl shadow-candy-amber',
};

/** A colorful, tactile container with rich world gradients and bouncy elevation. */
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