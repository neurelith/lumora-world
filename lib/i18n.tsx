'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import { Language } from './types';

const translations: Record<Language, any> = { en, hi };

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (path: string) => path,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = (localStorage.getItem('dyutipath_lang') || localStorage.getItem('lumora_lang')) as Language;
    if (saved === 'en' || saved === 'hi') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dyutipath_lang', lang);
    }
  };

  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let current = translations[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if missing in Hindi
        let enFallback = translations.en;
        for (const k of keys) {
          if (enFallback && typeof enFallback === 'object' && k in enFallback) {
            enFallback = enFallback[k];
          } else {
            return fallback || path;
          }
        }
        return typeof enFallback === 'string' ? enFallback : (fallback || path);
      }
    }
    return typeof current === 'string' ? current : (fallback || path);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
