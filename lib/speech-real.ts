// lib/speech-real.ts — Robust Web Speech API wrapper with fallbacks
// Handles browser inconsistencies, timeouts, and provides speech synthesis + recognition

import { useRef, useEffect, useState, useCallback } from 'react';
import { Language } from './types';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: number;
  emma: Document | null;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onsoundstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onsoundend: (() => void) | null;
  onnomatch: ((event: SpeechRecognitionEvent) => void) | null;
};

type SpeechRecognitionConstructor = {
  new(): SpeechRecognition;
};

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || w.mozSpeechRecognition || w.msSpeechRecognition || null;
}

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis;
}

// ============================================================================
// Speech Synthesis (TTS) — with phoneme-aware pronunciation for screening
// ============================================================================

export interface PhonemePlaybackOptions {
  language: Language;
  onPhonemeActive?: (index: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  rate?: number;
  pitch?: number;
}

const PHONETIC_MAP_EN: Record<string, string> = {
  b: 'buh', c: 'kuh', d: 'duh', f: 'fuh', g: 'guh',
  h: 'huh', j: 'juh', k: 'kuh', l: 'luh', m: 'muh',
  n: 'nuh', p: 'puh', r: 'ruh', s: 'suh', t: 'tuh',
  v: 'vuh', w: 'wuh', z: 'zuh',
};

export function playPhonemeSequence(
  phonemes: string[],
  options: PhonemePlaybackOptions
) {
  const synth = getSpeechSynthesis();
  if (!synth) {
    options.onError?.(new Error('Speech synthesis not supported'));
    options.onComplete?.();
    return;
  }

  // Cancel any ongoing speech
  synth.cancel();

  let index = 0;
  let isCancelled = false;

  const cancel = () => {
    isCancelled = true;
    synth.cancel();
  };

  function speakNext() {
    if (isCancelled || index >= phonemes.length) {
      setTimeout(() => options.onComplete?.(), 400);
      return;
    }

    const currentPhoneme = phonemes[index];
    options.onPhonemeActive?.(index);

    let spokenText = currentPhoneme;
    if (options.language === 'en') {
      spokenText = PHONETIC_MAP_EN[currentPhoneme.toLowerCase()] || currentPhoneme;
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = options.rate ?? 0.7;
    utterance.pitch = options.pitch ?? 1.1;
    utterance.lang = options.language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.volume = 1.0;

    utterance.onend = () => {
      if (isCancelled) return;
      index++;
      // Brief pause between phonemes for clarity
      setTimeout(speakNext, 500);
    };

    utterance.onerror = (err) => {
      if (isCancelled) return;
      console.warn('Speech synthesis error:', err);
      index++;
      speakNext();
    };

    try {
      synth?.speak(utterance);
    } catch (err) {
      if (isCancelled) return;
      options.onError?.(err as Error);
      index++;
      speakNext();
    }
  }

  speakNext();

  return { cancel };
}

// ============================================================================
// Speech Recognition (STT) — robust, timeout-managed, with fallback
// ============================================================================

export interface SpeechRecognitionOptions {
  language: Language;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (transcript: string, isFinal: boolean, confidence: number) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
  timeoutMs?: number; // Auto-stop after silence
}

export function createSpeechRecognition(options: SpeechRecognitionOptions): SpeechRecognition | null {
  const Constructor = getSpeechRecognition();
  if (!Constructor) {
    options.onError?.('Speech recognition not supported in this browser');
    return null;
  }

  const recognition = new Constructor();
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = options.interimResults ?? true;
  recognition.lang = options.language === 'hi' ? 'hi-IN' : 'en-US';
  recognition.maxAlternatives = options.maxAlternatives ?? 1;

  let silenceTimer: ReturnType<typeof setTimeout> | null = null;
  const TIMEOUT_MS = options.timeoutMs ?? 8000;

  const resetSilenceTimer = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    if (options.timeoutMs && options.timeoutMs > 0) {
      silenceTimer = setTimeout(() => {
        try { recognition.stop(); } catch {}
      }, TIMEOUT_MS);
    }
  };

  recognition.onstart = () => {
    resetSilenceTimer();
    options.onStart?.();
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    resetSilenceTimer();

    let finalTranscript = '';
    let interimTranscript = '';
    let maxConfidence = 0;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const alt = result[0];
      if (result.isFinal) {
        finalTranscript += alt.transcript;
        maxConfidence = Math.max(maxConfidence, alt.confidence);
      } else {
        interimTranscript += alt.transcript;
      }
    }

    const transcript = finalTranscript || interimTranscript;
    const isFinal = event.results[event.results.length - 1].isFinal;

    if (transcript.trim()) {
      options.onResult?.(transcript.toLowerCase().trim(), isFinal, maxConfidence);
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (silenceTimer) clearTimeout(silenceTimer);

    // Ignore "no-speech" and "aborted" as they're normal
    const ignoredErrors = ['no-speech', 'aborted', 'audio-capture'];
    if (!ignoredErrors.includes(event.error)) {
      console.warn('Speech recognition error:', event.error, event.message);
      options.onError?.(event.error);
    }
  };

  recognition.onend = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    options.onEnd?.();
  };

  return recognition;
}

// ============================================================================
// Speech Recognition Hook for React components
// ponytail: React imports hoisted to top of file — removed mid-file duplicate

export function useSpeechRecognition(language: Language = 'en') {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const Constructor = getSpeechRecognition();
    setIsSupported(!!Constructor);

    if (!Constructor) return;

    const recognition = new Constructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript.trim()) {
        setTranscript(finalTranscript.toLowerCase().trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const ignoredErrors = ['no-speech', 'aborted', 'audio-capture'];
      if (!ignoredErrors.includes(event.error)) {
        setError(event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch {}
    };
  }, [language]);

  const start = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setError(null);
    setTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn('SpeechRecognition start error:', err);
      setError('Could not start microphone');
    }
  }, [isListening]);

  const stop = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    try {
      recognitionRef.current.stop();
    } catch {}
    setIsListening(false);
  }, [isListening]);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return { isListening, transcript, isSupported, error, start, stop, reset };
}

// ============================================================================
// One-shot Speech Recognition helper
// ============================================================================

export function startSpeechRecognition(
  language: Language,
  onResult: (transcript: string) => void,
  onEnd?: () => void
): () => void {
  const SpeechRecognitionClass = getSpeechRecognition();
  if (!SpeechRecognitionClass) {
    onEnd?.();
    return () => {};
  }

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal || result[0].transcript) {
          finalTranscript += result[0].transcript;
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript.trim());
      }
    };

    recognition.onend = () => {
      onEnd?.();
    };

    recognition.onerror = () => {
      onEnd?.();
    };

    recognition.start();

    return () => {
      try {
        recognition.abort();
      } catch {}
    };
  } catch (err) {
    console.warn('startSpeechRecognition error:', err);
    onEnd?.();
    return () => {};
  }
}

// ============================================================================
// TTS Hook
// ============================================================================

export function useSpeechSynthesis() {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const synth = getSpeechSynthesis();
    synthRef.current = synth;
    setIsSupported(!!synth);
  }, []);

  const speak = useCallback((
    text: string,
    options: { lang?: Language; rate?: number; pitch?: number; onEnd?: () => void } = {}
  ) => {
    const synth = synthRef.current;
    if (!synth) return;

    synth.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.lang = options.lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.volume = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      options.onEnd?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      options.onEnd?.();
    };

    synth.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    const synth = synthRef.current;
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, cancel, isSpeaking, isSupported };
}