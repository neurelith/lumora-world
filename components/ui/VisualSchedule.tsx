'use client';

import React from 'react';
import { Check, Circle } from 'lucide-react';

interface Step {
  id: string | number;
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

interface VisualScheduleProps {
  steps: Step[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export const VisualSchedule: React.FC<VisualScheduleProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full bg-cream/70 border-2 border-hairline/80 rounded-3xl p-4 md:p-6 shadow-soft-sm ${className}`}>
      <div className="flex items-center justify-between gap-2 md:gap-4 relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <div
                onClick={() => onStepClick && onStepClick(index)}
                className={`flex-1 flex flex-col items-center text-center transition-all duration-300 ${
                  onStepClick ? 'cursor-pointer' : ''
                }`}
              >
                <div
                  className={`
                    w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-display font-bold text-lg md:text-xl transition-all duration-300
                    ${isCompleted ? 'bg-sage text-white shadow-sage-glow scale-100' : ''}
                    ${isCurrent ? 'bg-amber text-ink shadow-amber-glow ring-4 ring-amber-200 animate-bounce-gentle' : ''}
                    ${isUpcoming ? 'bg-white text-muted border-2 border-hairline opacity-75' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6 stroke-[3]" />
                  ) : (
                    <span>{step.icon || index + 1}</span>
                  )}
                </div>

                <span
                  className={`
                    mt-2 text-xs md:text-sm font-display font-medium leading-tight max-w-[100px] truncate
                    ${isCurrent ? 'text-ink font-bold' : isCompleted ? 'text-sage-700' : 'text-muted'}
                  `}
                >
                  {step.label}
                </span>
                {step.subtitle && (
                  <span className="hidden md:block text-[11px] text-muted font-body mt-0.5">
                    {step.subtitle}
                  </span>
                )}
              </div>

              {/* Connecting Line between steps */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    h-1.5 flex-1 rounded-full -mt-6 transition-all duration-500
                    ${index < currentStepIndex ? 'bg-sage' : 'bg-hairline'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
