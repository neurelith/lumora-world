/**
 * Phonetic string matching & Levenshtein distance calculator
 * for validating child voice blending responses in English & Hindi.
 */

export function calculateLevenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));

  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (b.charAt(j - 1).toLowerCase() === a.charAt(i - 1).toLowerCase()) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Compares recognized vocal transcript against target word.
 * Returns match boolean and similarity confidence (0.0 to 1.0).
 */
export function matchSpokenWord(transcript: string, targetWord: string, language: 'en' | 'hi'): {
  isMatch: boolean;
  confidence: number;
  normalizedSpoken: string;
} {
  const cleanTranscript = transcript.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
  const cleanTarget = targetWord.trim().toLowerCase();

  // 1. Direct match or substring match
  if (cleanTranscript === cleanTarget || cleanTranscript.includes(cleanTarget)) {
    return { isMatch: true, confidence: 1.0, normalizedSpoken: cleanTranscript };
  }

  // 2. Levenshtein ratio
  const maxLen = Math.max(cleanTranscript.length, cleanTarget.length);
  if (maxLen === 0) return { isMatch: false, confidence: 0, normalizedSpoken: '' };

  const dist = calculateLevenshteinDistance(cleanTranscript, cleanTarget);
  const similarity = 1 - dist / maxLen;

  // For young children (ages 5-8), allow small acoustic tolerance (similarity >= 0.65)
  const isMatch = similarity >= 0.65;

  return {
    isMatch,
    confidence: Number(similarity.toFixed(2)),
    normalizedSpoken: cleanTranscript,
  };
}
