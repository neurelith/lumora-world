// lib/schemas/session.schema.ts — Zod validation schemas for DyutiPath
import { z } from 'zod';

export const LanguageSchema = z.enum(['en', 'hi']);
export const TriageLevelSchema = z.enum(['typical', 'watch', 'followup']);

export const SoundForestResultSchema = z.object({
  accuracy: z.number().min(0).max(1),
  meanLatencyMs: z.number().nonnegative(),
  totalTrials: z.number().int().nonnegative(),
  correctTrials: z.number().int().nonnegative(),
  confusionPairs: z.array(z.string()),
  triage: TriageLevelSchema,
});

export const StoryCastleResultSchema = z.object({
  accuracy: z.number().min(0).max(1),
  meanHesitationMs: z.number().nonnegative(),
  totalTrials: z.number().int().nonnegative(),
  correctTrials: z.number().int().nonnegative(),
  triage: TriageLevelSchema,
});

export const StrokePointSchema = z.object({
  x: z.number(),
  y: z.number(),
  t: z.number(),
  pressure: z.number(),
});

export const RuneTrialSchema = z.object({
  letter: z.string().min(1),
  language: LanguageSchema,
  points: z.array(StrokePointSchema).max(1500),
  nvi: z.number().nonnegative(),
  jerkIndex: z.number().nonnegative(),
  strokeDurationMs: z.number().nonnegative(),
  penLifts: z.number().int().nonnegative(),
  centerlineDev: z.number().nonnegative(),
  isMirrored: z.boolean(),
  score: z.number().min(0).max(100),
});

export const RuneRealmResultSchema = z.object({
  meanNvi: z.number().nonnegative(),
  meanJerkIndex: z.number().nonnegative(),
  meanDeviation: z.number().nonnegative(),
  mirrorReversalsCount: z.number().int().nonnegative(),
  triage: TriageLevelSchema,
  trials: z.array(RuneTrialSchema),
});

export const MemoryMountainsResultSchema = z.object({
  totalItems: z.number().int().positive(),
  durationSec: z.number().nonnegative(),
  ranRate: z.number().nonnegative(),
  errorCount: z.number().int().nonnegative(),
  hesitationGapsCount: z.number().int().nonnegative(),
  triage: TriageLevelSchema,
});

export const VisionValleyResultSchema = z.object({
  meanFixationDurationMs: z.number().nonnegative(),
  regressiveSaccadeRatio: z.number().min(0).max(1),
  totalFixations: z.number().int().nonnegative(),
  totalSaccades: z.number().int().nonnegative(),
  gazeDispersionScore: z.number().nonnegative(),
  triage: TriageLevelSchema,
  gazePointsSample: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
});

export const ScreeningSessionSchema = z.object({
  id: z.string().min(1),
  childInitials: z.string().min(1).max(20),
  grade: z.number().int().min(1).max(5),
  language: LanguageSchema,
  schoolCode: z.string().min(1).max(50),
  createdAt: z.number().positive(),
  soundForest: SoundForestResultSchema.optional(),
  storyCastle: StoryCastleResultSchema.optional(),
  runeRealm: RuneRealmResultSchema.optional(),
  memoryMountains: MemoryMountainsResultSchema.optional(),
  visionValley: VisionValleyResultSchema.optional(),
  overallTriage: TriageLevelSchema,
  notes: z.string().max(2000).optional(),
});

export const ScoringRequestSchema = z.object({
  grade: z.number().int().min(1).max(5),
  soundForest: z.object({ accuracy: z.number(), meanLatencyMs: z.number() }).optional(),
  storyCastle: z.object({ accuracy: z.number(), meanHesitationMs: z.number() }).optional(),
  runeRealm: z.object({ meanNvi: z.number(), meanDeviation: z.number(), mirrorCount: z.number() }).optional(),
  memoryMountains: z.object({ ranRate: z.number(), errorCount: z.number() }).optional(),
  visionValley: z.object({ meanFixationDurationMs: z.number(), regressiveSaccadeRatio: z.number() }).optional(),
});

export type ScreeningSessionInput = z.infer<typeof ScreeningSessionSchema>;
export type ScoringRequestInput = z.infer<typeof ScoringRequestSchema>;
