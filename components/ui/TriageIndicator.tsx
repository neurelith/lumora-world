'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type TriageLevel = 'typical' | 'watch' | 'followup';

interface TriageIndicatorProps {
  level: TriageLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showDescription?: boolean;
  className?: string;
}

const CONFIG = {
  typical: {
    label: 'Typical Range',
    icon: CheckCircle2,
    bg: 'bg-sage-soft',
    border: 'border-sage/30',
    text: 'text-sage',
    ring: 'ring-sage',
  },
  watch: {
    label: 'Worth a Closer Look',
    icon: Info,
    bg: 'bg-amber-soft',
    border: 'border-amber/30',
    text: 'text-amber',
    ring: 'ring-amber',
  },
  followup: {
    label: 'Recommend Follow-up',
    icon: AlertCircle,
    bg: 'bg-terracotta-soft',
    border: 'border-terracotta/30',
    text: 'text-terracotta',
    ring: 'ring-terracotta',
  },
};

const sizeStyles = {
  sm: 'gap-1.5 px-2.5 py-1 text-xs',
  md: 'gap-2 px-3 py-1.5 text-sm',
  lg: 'gap-2.5 px-4 py-2 text-base',
};

const iconSizes = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

/** Accessible triage level indicator with semantic colors and icons. */
export const TriageIndicator: React.FC<TriageIndicatorProps> = ({
  level,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const config = CONFIG[level];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center ${sizeStyles[size]} rounded-pill border font-body font-medium ${config.bg} ${config.border} ${config.text} ${className}`}
      role="status"
      aria-label={config.label}
    >
      <Icon className={`${iconSizes[size]} flex-shrink-0`} aria-hidden="true" />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};