// lib/announcer.ts — ARIA Live Region Hook for Screen Reader Announcements

import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook for announcing messages to screen readers via ARIA live regions.
 * Usage:
 *   const announce = useAnnouncer();
 *   announce('Screening complete. Results ready.');
 */
export function useAnnouncer(regionId = 'global-announcer') {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Ensure the live region exists
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let region = document.getElementById(regionId);
    if (!region) {
      region = document.createElement('div');
      region.id = regionId;
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      region.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
      document.body.appendChild(region);
    }
    return () => {
      // Don't remove on unmount - other components may need it
    };
  }, [regionId]);

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (typeof document === 'undefined') return;

      const region = document.getElementById(regionId);
      if (!region) return;

      // Clear any pending announcement
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Set priority
      region.setAttribute('aria-live', priority);

      // Clear and set new message
      region.textContent = '';
      // Force reflow for screen readers
      timeoutRef.current = setTimeout(() => {
        region.textContent = message;
      }, 50);
    },
    [regionId]
  );

  const clear = useCallback(() => {
    if (typeof document === 'undefined') return;
    const region = document.getElementById(regionId);
    if (region) region.textContent = '';
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [regionId]);

  return { announce, clear };
}

/**
 * Hook for announcing world transitions and progress in screening
 */
export function useScreeningAnnouncer() {
  const { announce } = useAnnouncer('screening-announcer');

  const announceWorldStart = useCallback(
    (worldName: string, worldNumber: number, totalWorlds: number) => {
      announce(`Starting ${worldName}, world ${worldNumber} of ${totalWorlds}.`);
    },
    [announce]
  );

  const announceWorldComplete = useCallback(
    (worldName: string, worldNumber: number, totalWorlds: number) => {
      announce(
        `Completed ${worldName}. ${
          worldNumber < totalWorlds
            ? `Moving to world ${worldNumber + 1} of ${totalWorlds}.`
            : 'All worlds complete. Calculating results.'
        }`
      );
    },
    [announce]
  );

  const announceResults = useCallback(
    (triage: 'typical' | 'watch' | 'followup') => {
      const messages = {
        typical: 'Screening complete. Performance is within typical limits for this age.',
        watch: 'Screening complete. Some areas need monitoring. Daily practice recommended.',
        followup: 'Screening complete. Multiple areas flagged. Specialist referral recommended.',
      };
      announce(messages[triage], 'assertive');
    },
    [announce]
  );

  const announceError = useCallback(
    (message: string) => {
      announce(`Error: ${message}`, 'assertive');
    },
    [announce]
  );

  return { announceWorldStart, announceWorldComplete, announceResults, announceError };
}

/**
 * Hook for announcing Haven daily practice steps
 */
export function useHavenAnnouncer() {
  const { announce } = useAnnouncer('haven-announcer');

  const announceStepStart = useCallback(
    (stepName: string, stepNumber: number, totalSteps: number) => {
      announce(`Starting ${stepName}, step ${stepNumber} of ${totalSteps}.`);
    },
    [announce]
  );

  const announceStepComplete = useCallback(
    (stepName: string, stepNumber: number, totalSteps: number) => {
      announce(
        `Completed ${stepName}. ${
          stepNumber < totalSteps
            ? `Moving to step ${stepNumber + 1} of ${totalSteps}.`
            : 'Daily quest complete. Well done!'
        }`
      );
    },
    [announce]
  );

  const announceHint = useCallback(
    (hint: string) => {
      announce(`Hint: ${hint}`);
    },
    [announce]
  );

  return { announceStepStart, announceStepComplete, announceHint };
}

/**
 * Hook for announcing specialist hub actions
 */
export function useDoctorAnnouncer() {
  const { announce } = useAnnouncer('doctor-announcer');

  const announceStudentSelected = useCallback(
    (initials: string) => {
      announce(`Viewing telemetry for student ${initials}.`);
    },
    [announce]
  );

  const announcePacketGenerated = useCallback(() => {
    announce('DALI intake packet generated and ready for printing.');
  }, [announce]);

  const announceIasqSaved = useCallback(
    (initials: string, triage: 'low' | 'moderate' | 'high') => {
      announce(
        `IASQ autism screener saved for ${initials}. Risk level: ${triage}.`,
        'assertive'
      );
    },
    [announce]
  );

  return { announceStudentSelected, announcePacketGenerated, announceIasqSaved };
}