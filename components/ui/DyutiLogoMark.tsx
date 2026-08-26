'use client';

import React from 'react';

interface DyutiLogoMarkProps {
  size?: number;
  className?: string;
}

export const DyutiLogoMark: React.FC<DyutiLogoMarkProps> = ({ size = 36, className = '' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="DyutiPath Logo"
    >
      <defs>
        <radialGradient id="dyuti-mark-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="dyuti-mark-cap" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="45%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>

        <linearGradient id="dyuti-mark-spark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        <linearGradient id="dyuti-mark-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.65" />
        </linearGradient>

        <filter id="dyuti-mark-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#D97706" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Ambient Halo */}
      <circle cx="60" cy="62" r="52" fill="url(#dyuti-mark-halo)" />

      {/* Lantern Silhouette */}
      <g filter="url(#dyuti-mark-shadow)">
        <circle cx="60" cy="18" r="9" stroke="url(#dyuti-mark-cap)" strokeWidth="4.5" fill="none" />
        <path d="M38 34 C38 27, 82 27, 82 34 L88 42 C88 44, 32 44, 32 42 Z" fill="url(#dyuti-mark-cap)" />
        <rect x="30" y="41" width="60" height="5" rx="2.5" fill="#FBBF24" />

        <path d="M34 46 L38 86 C39 90, 81 90, 82 86 L86 46 Z" fill="url(#dyuti-mark-glass)" stroke="#FCD34D" strokeWidth="2" />

        {/* Central Spark */}
        <g transform="translate(60, 66)">
          <path d="M0 -18 C6 -8, 14 0, 14 8 C14 16, 8 20, 0 20 C-8 20, -14 16, -14 8 C-14 0, -6 -8, 0 -18 Z" fill="url(#dyuti-mark-spark)" />
          <ellipse cx="0" cy="8" rx="6" ry="8" fill="#FFFFFF" opacity="0.9" />
          <path d="M0 -7 L2 -1 L8 0 L2 1 L0 7 L-2 1 L-8 0 L-2 -1 Z" fill="#FFFFFF" />
        </g>

        <path d="M34 46 Q44 66 38 86" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75" />
        <path d="M86 46 Q76 66 82 86" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75" />

        <path d="M36 88 L34 96 C34 99, 86 99, 86 96 L84 88 Z" fill="url(#dyuti-mark-cap)" />
        <rect x="32" y="95" width="56" height="5" rx="2.5" fill="#C2410C" />
      </g>
    </svg>
  );
};
