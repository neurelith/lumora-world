'use client';

import { useEffect } from 'react';

/**
 * Registers the DyutiPath service worker for offline classroom resilience.
 * No-ops gracefully in development and on unsupported browsers.
 */
export const ServiceWorkerRegistrar: React.FC = () => {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' ||
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('SW registration failed:', err));
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
};
