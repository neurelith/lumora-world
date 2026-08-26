// DyutiPath Core TypeScript Types

export type Language = 'en' | 'hi';

export type TriageLevel = 'typical' | 'watch' | 'followup';

export interface GradeBenchmark {
  grade: number;
  soundForest: { accuracyThresholds: [number, number]; latencyBenchmarkMs: number };
  storyCastle: { accuracyThresholds: [number, number]; latencyBenchmarkMs: number };
  runeRealm: { nviThreshold: number; deviationThreshold: number };
  memoryMountains: { ranRateThreshold: number };
  visionValley: { fixationThresholdMs: number; regressionRatioThreshold: number };
}

export interface ChildProfile {
  initials: string;
  grade: number; // 1 - 5
  language: Language;
  schoolCode?: string;
  sessionId: string;
  createdAt: number;
}

// 1. Sound Forest
export interface SoundForestTrial {
  id: string;
  phonemes: string[];
  targetWord: string;
  distractors: string[];
  chosenWord?: string;
  isCorrect?: boolean;
  latencyMs?: number;
  confusions?: string[];
}

export interface SoundForestResult {
  accuracy: number; // 0 - 1
  meanLatencyMs: number;
  totalTrials: number;
  correctTrials: number;
  confusionPairs: string[];
  triage: TriageLevel;
}

// 2. Story Castle
export interface StoryCastleTrial {
  id: string;
  nonword: string;
  isCorrect?: boolean;
  teacherScore?: boolean;
  speechConfidence?: number;
  hesitationMs?: number;
}

export interface StoryCastleResult {
  accuracy: number;
  meanHesitationMs: number;
  totalTrials: number;
  correctTrials: number;
  triage: TriageLevel;
}

// 3. Rune Realm
export interface StrokePoint {
  x: number;
  y: number;
  t: number;
  pressure: number;
}

export interface RuneTrial {
  letter: string;
  language: Language;
  points: StrokePoint[];
  nvi: number;
  jerkIndex: number;
  strokeDurationMs: number;
  penLifts: number;
  centerlineDev: number;
  isMirrored: boolean;
  score: number;
}

export interface RuneRealmResult {
  meanNvi: number;
  meanJerkIndex: number;
  meanDeviation: number;
  mirrorReversalsCount: number;
  triage: TriageLevel;
  trials: RuneTrial[];
}

// 4. Memory Mountains
export interface MemoryMountainsResult {
  totalItems: number; // 25
  durationSec: number;
  ranRate: number; // items/sec
  errorCount: number;
  hesitationGapsCount: number;
  triage: TriageLevel;
}

// 5. Vision Valley
export interface GazePoint {
  x: number;
  y: number;
  t: number;
}

export interface VisionValleyResult {
  meanFixationDurationMs: number;
  regressiveSaccadeRatio: number;
  totalFixations: number;
  totalSaccades: number;
  gazeDispersionScore: number;
  triage: TriageLevel;
  gazePointsSample?: { x: number; y: number }[];
}

// Complete Screening Battery Session
export interface ScreeningSession {
  id: string;
  childInitials: string;
  grade: number;
  language: Language;
  schoolCode: string;
  createdAt: number;
  soundForest?: SoundForestResult;
  storyCastle?: StoryCastleResult;
  runeRealm?: RuneRealmResult;
  memoryMountains?: MemoryMountainsResult;
  visionValley?: VisionValleyResult;
  overallTriage: TriageLevel;
  notes?: string;
}

// Haven Daily Companion
export interface HavenDaySession {
  dayId: string;
  childNickname: string;
  completedAt: number;
  stepsCompleted: number; // 3 steps
  scaffoldingUsedCount: number;
  sensoryCalmEnabled: boolean;
  soundForestCompleted: boolean;
  tracingCompleted: boolean;
  starCountCompleted: boolean;
}

// Doctor Hub & Specialist Telemetry
export interface SpecialistProfile {
  uid: string;
  email: string;
  name: string;
  role: 'specialist' | 'psychologist' | 'teacher';
  assignedSchools: string[];
}

export interface StudentCohortRecord {
  id: string;
  childInitials: string;
  grade: number;
  schoolCode: string;
  language: Language;
  screeningDate: number;
  overallTriage: TriageLevel;
  rtiTier: 1 | 2 | 3; // 1 = Typical, 2 = Targeted, 3 = Intensive
  latestAccuracy: number;
  weeklyProgress: { week: string; accuracy: number; fluency: number }[];
  latestScreening: ScreeningSession;
  iasqScore?: number; // 0 - 24
}

// Autism / IASQ 8-Item Screener
export interface IASQItem {
  id: number;
  domain: string;
  promptEn: string;
  promptHi: string;
  score: number; // 0 = Typical, 1 = Mild/Occasional, 2 = Significant/Frequent
}

export interface IASQResult {
  childInitials: string;
  grade: number;
  completedAt: number;
  items: IASQItem[];
  totalScore: number; // Max 16
  triage: 'low' | 'moderate' | 'high';
}

export type Point2D = { x: number; y: number };

