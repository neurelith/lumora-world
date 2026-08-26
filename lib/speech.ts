// lib/speech.ts - Speech Stimuli (constants only)
// ponytail: playPhonemeSequence deduped — canonical lives in lib/speech-real.ts (cancel guard, PhonemePlaybackOptions)
import { SoundForestTrial } from './types';

// English Phoneme Blending Trials
export const SOUND_FOREST_TRIALS_EN: SoundForestTrial[] = [
  { id: 'en-1', phonemes: ['b', 'a', 't'], targetWord: 'bat', distractors: ['tab', 'pat', 'bad'] },
  { id: 'en-2', phonemes: ['s', 'u', 'n'], targetWord: 'sun', distractors: ['run', 'nut', 'sin'] },
  { id: 'en-3', phonemes: ['c', 'u', 'p'], targetWord: 'cup', distractors: ['cap', 'pup', 'cut'] },
  { id: 'en-4', phonemes: ['p', 'e', 'n'], targetWord: 'pen', distractors: ['pin', 'pan', 'pet'] },
  { id: 'en-5', phonemes: ['d', 'o', 'g'], targetWord: 'dog', distractors: ['god', 'dot', 'dig'] },
  { id: 'en-6', phonemes: ['f', 'i', 's', 'h'], targetWord: 'fish', distractors: ['dish', 'wish', 'fist'] },
  { id: 'en-7', phonemes: ['f', 'r', 'o', 'g'], targetWord: 'frog', distractors: ['fog', 'flag', 'from'] },
  { id: 'en-8', phonemes: ['s', 't', 'a', 'r'], targetWord: 'star', distractors: ['stay', 'start', 'scar'] },
];

// Hindi Phoneme Blending Trials (Devanagari Aksharas)
export const SOUND_FOREST_TRIALS_HI: SoundForestTrial[] = [
  { id: 'hi-1', phonemes: ['क', 'म', 'ल'], targetWord: 'कमल', distractors: ['कलम', 'मकम', 'कपल'] },
  { id: 'hi-2', phonemes: ['ब', 'स'], targetWord: 'बस', distractors: ['सब', 'दस', 'रस'] },
  { id: 'hi-3', phonemes: ['घ', 'र'], targetWord: 'घर', distractors: ['पर', 'धर', 'भर'] },
  { id: 'hi-4', phonemes: ['म', 'ट', 'र'], targetWord: 'मटर', distractors: ['टमर', 'मकर', 'पटर'] },
  { id: 'hi-5', phonemes: ['फ', 'ल'], targetWord: 'फल', distractors: ['पल', 'कल', 'दल'] },
  { id: 'hi-6', phonemes: ['स', 'ड़', 'क'], targetWord: 'सड़क', distractors: ['कड़स', 'सकड़', 'पकड़'] },
  { id: 'hi-7', phonemes: ['ब', 'त', 'ख'], targetWord: 'बतख', distractors: ['खतब', 'बखत', 'पतक'] },
  { id: 'hi-8', phonemes: ['ग', 'म', 'ल', 'ा'], targetWord: 'गमला', distractors: ['गलमा', 'लगमा', 'कमला'] },
];

// Pronounceable Nonwords for Story Castle
export const STORY_CASTLE_NONWORDS_EN = [
  'dap', 'mep', 'kib', 'zot', 'vun',
  'flig', 'snop', 'clat', 'brund', 'stemp'
];

export const STORY_CASTLE_NONWORDS_HI = [
  'कुमट', 'बालिश', 'पिरक', 'धमच', 'गलोर',
  'सलप', 'टिमक', 'भनज', 'खटोप', 'मिसड'
];

// Tracing Templates for Rune Realm
export const RUNE_LETTERS_EN = ['b', 'd', 'p', 'q', 'm', 's'];
export const RUNE_LETTERS_HI = ['क', 'म', 'ट', 'ठ', 'ब', 'व'];
