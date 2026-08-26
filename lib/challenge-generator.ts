// lib/challenge-generator.ts
// Dynamic Procedural Challenge Generator for Lumora World
// Generates fresh, clinically aligned trials on every session login

import { Language, SoundForestTrial } from './types';

// ==========================================
// 1. RUNE REALM: Procedural Letter Pools
// ==========================================

export const RUNE_POOLS_EN = {
  mirrorPairs: [
    ['b', 'd'],
    ['p', 'q'],
    ['m', 'w'],
    ['u', 'n'],
    ['s', 'z'],
  ],
  standardLetters: ['c', 'g', 'h', 'k', 'r', 't', 'f', 'j', 'v', 'y'],
  gradeAdvanced: ['B', 'D', 'P', 'R', 'K', 'M', 'N', 'S'],
};

export const RUNE_POOLS_HI = {
  confusablePairs: [
    ['ब', 'व'],
    ['क', 'फ'],
    ['ड', 'ढ'],
    ['त', 'न'],
    ['ट', 'ठ'],
    ['घ', 'ध'],
    ['भ', 'म'],
    ['श', 'ष'],
  ],
  standardAksharas: ['क', 'ख', 'ग', 'च', 'छ', 'ज', 'ल', 'स', 'ह', 'र'],
};

export function generateRuneChallenges(language: Language, grade = 1, count = 6): string[] {
  const result: string[] = [];

  if (language === 'hi') {
    const pairs = [...RUNE_POOLS_HI.confusablePairs].sort(() => Math.random() - 0.5);
    const standard = [...RUNE_POOLS_HI.standardAksharas].sort(() => Math.random() - 0.5);

    // Pick 2-3 confusable pairs + random standard aksharas
    pairs.slice(0, 2).forEach((pair) => result.push(...pair));
    while (result.length < count && standard.length > 0) {
      const item = standard.pop()!;
      if (!result.includes(item)) result.push(item);
    }
  } else {
    const pairs = [...RUNE_POOLS_EN.mirrorPairs].sort(() => Math.random() - 0.5);
    const standard = [...RUNE_POOLS_EN.standardLetters].sort(() => Math.random() - 0.5);

    // Pick 2 key mirror pairs (e.g. b, d, p, q) + 2 standard letters
    pairs.slice(0, 2).forEach((pair) => result.push(...pair));
    while (result.length < count && standard.length > 0) {
      const item = standard.pop()!;
      if (!result.includes(item)) result.push(item);
    }
  }

  // Shuffle final challenge sequence
  return result.slice(0, count).sort(() => Math.random() - 0.5);
}

// ==========================================
// 2. SOUND FOREST: Procedural Blending Bank
// ==========================================

const MASTER_SOUND_BANK_EN: SoundForestTrial[] = [
  { id: 'en-cvc-1', phonemes: ['b', 'a', 't'], targetWord: 'bat', distractors: ['tab', 'pat', 'bad'] },
  { id: 'en-cvc-2', phonemes: ['s', 'u', 'n'], targetWord: 'sun', distractors: ['run', 'nut', 'sin'] },
  { id: 'en-cvc-3', phonemes: ['c', 'u', 'p'], targetWord: 'cup', distractors: ['cap', 'pup', 'cut'] },
  { id: 'en-cvc-4', phonemes: ['p', 'e', 'n'], targetWord: 'pen', distractors: ['pin', 'pan', 'pet'] },
  { id: 'en-cvc-5', phonemes: ['d', 'o', 'g'], targetWord: 'dog', distractors: ['god', 'dot', 'dig'] },
  { id: 'en-cvc-6', phonemes: ['f', 'i', 's', 'h'], targetWord: 'fish', distractors: ['dish', 'wish', 'fist'] },
  { id: 'en-cvc-7', phonemes: ['f', 'r', 'o', 'g'], targetWord: 'frog', distractors: ['fog', 'flag', 'from'] },
  { id: 'en-cvc-8', phonemes: ['s', 't', 'a', 'r'], targetWord: 'star', distractors: ['stay', 'start', 'scar'] },
  { id: 'en-cvc-9', phonemes: ['h', 'e', 'n'], targetWord: 'hen', distractors: ['pen', 'men', 'hat'] },
  { id: 'en-cvc-10', phonemes: ['m', 'a', 'p'], targetWord: 'map', distractors: ['mop', 'cap', 'mat'] },
  { id: 'en-cvc-11', phonemes: ['b', 'i', 'r', 'd'], targetWord: 'bird', distractors: ['bard', 'word', 'dirt'] },
  { id: 'en-cvc-12', phonemes: ['t', 'r', 'e', 'e'], targetWord: 'tree', distractors: ['free', 'three', 'trap'] },
  { id: 'en-cvc-13', phonemes: ['b', 'o', 'a', 't'], targetWord: 'boat', distractors: ['goat', 'coat', 'boot'] },
  { id: 'en-cvc-14', phonemes: ['m', 'o', 'o', 'n'], targetWord: 'moon', distractors: ['soon', 'spoon', 'noon'] },
  { id: 'en-cvc-15', phonemes: ['d', 'u', 'c', 'k'], targetWord: 'duck', distractors: ['dock', 'luck', 'truck'] },
];

const MASTER_SOUND_BANK_HI: SoundForestTrial[] = [
  { id: 'hi-ak-1', phonemes: ['क', 'म', 'ल'], targetWord: 'कमल', distractors: ['कलम', 'मकम', 'कपल'] },
  { id: 'hi-ak-2', phonemes: ['ब', 'स'], targetWord: 'बस', distractors: ['सब', 'दस', 'रस'] },
  { id: 'hi-ak-3', phonemes: ['घ', 'र'], targetWord: 'घर', distractors: ['पर', 'धर', 'भर'] },
  { id: 'hi-ak-4', phonemes: ['म', 'ट', 'र'], targetWord: 'मटर', distractors: ['टमर', 'मकर', 'पटर'] },
  { id: 'hi-ak-5', phonemes: ['फ', 'ल'], targetWord: 'फल', distractors: ['पल', 'कल', 'दल'] },
  { id: 'hi-ak-6', phonemes: ['स', 'ड़', 'क'], targetWord: 'सड़क', distractors: ['कड़स', 'सकड़', 'पकड़'] },
  { id: 'hi-ak-7', phonemes: ['ब', 'त', 'ख'], targetWord: 'बतख', distractors: ['खतब', 'बखत', 'पतक'] },
  { id: 'hi-ak-8', phonemes: ['ग', 'म', 'ल', 'ा'], targetWord: 'गमला', distractors: ['गलमा', 'लगमा', 'कमला'] },
  { id: 'hi-ak-9', phonemes: ['न', 'ल'], targetWord: 'नल', distractors: ['जल', 'थल', 'पल'] },
  { id: 'hi-ak-10', phonemes: ['च', 'म', 'च'], targetWord: 'चमच', distractors: ['मचम', 'चमक', 'दमन'] },
  { id: 'hi-ak-11', phonemes: ['ज', 'ल'], targetWord: 'जल', distractors: ['नल', 'फल', 'कल'] },
  { id: 'hi-ak-12', phonemes: ['प', 'त', 'ं', 'ग'], targetWord: 'पतंग', distractors: ['तपंग', 'पलंग', 'तरंग'] },
];

export function generateSoundForestChallenges(language: Language, count = 6): SoundForestTrial[] {
  const bank = language === 'hi' ? [...MASTER_SOUND_BANK_HI] : [...MASTER_SOUND_BANK_EN];
  return bank.sort(() => Math.random() - 0.5).slice(0, count);
}

// ==========================================
// 3. STORY CASTLE: Procedural DALI Nonwords
// ==========================================

const MASTER_NONWORDS_EN = [
  'dap', 'mep', 'kib', 'zot', 'vun',
  'flig', 'snop', 'clat', 'brund', 'stemp',
  'plask', 'froat', 'drimp', 'scrop', 'trant',
  'glist', 'brint', 'spelt', 'crone', 'twisp'
];

const MASTER_NONWORDS_HI = [
  'कुमट', 'बालिश', 'पिरक', 'धमच', 'गलोर',
  'सलप', 'टिमक', 'भनज', 'खटोप', 'मिसड',
  'स्पांड', 'ध्रव', 'क्लिन', 'भ्राम', 'त्रिप',
  'दिरम', 'विक्ष', 'प्रुत', 'स्थिल', 'झमट'
];

export function generateStoryCastleChallenges(language: Language, count = 6): string[] {
  const bank = language === 'hi' ? [...MASTER_NONWORDS_HI] : [...MASTER_NONWORDS_EN];
  return bank.sort(() => Math.random() - 0.5).slice(0, count);
}

// ==========================================
// 4. MEMORY MOUNTAINS: Procedural RAN Matrix
// ==========================================

export interface RANItem {
  id: number;
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'diamond' | 'cloud' | 'heart';
  color: 'amber' | 'sage' | 'terracotta' | 'ink' | 'indigo' | 'rose';
  isFlaggedError?: boolean;
}

const AVAILABLE_SHAPES: RANItem['shape'][] = ['circle', 'square', 'triangle', 'star', 'diamond'];
const AVAILABLE_COLORS: RANItem['color'][] = ['amber', 'sage', 'terracotta', 'indigo', 'rose'];

export function generateMemoryMountainsGrid(count = 25): RANItem[] {
  const items: RANItem[] = [];
  for (let i = 0; i < count; i++) {
    const shape = AVAILABLE_SHAPES[Math.floor(Math.random() * AVAILABLE_SHAPES.length)];
    const color = AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)];
    items.push({ id: i + 1, shape, color });
  }
  return items;
}
