# Lumora World — Product Requirements Document

> **Version 2.0 · August 2026**
> **Purpose:** Single source of truth for AI-agent implementation. Every section is written to be directly actionable — an AI coding agent should be able to build Lumora World end-to-end from this document alone.
> **Audience:** DoraHacks hackathon submission + Product Hunt launch

---

## 1. The Problem (Lead With This)

**10 million Indian children** have learning disabilities that go undetected because there are only **12,000 specialists** to screen them — a ratio of **1 specialist per 25,000+ children**. In rural India, it's 1 per 100,000+.

The critical window for intervention is **ages 5–8**. After that, remediation takes **4× longer**. Every month a child goes unscreened is a month of neuroplasticity lost.

The tools exist (DALI — Dyslexia Assessment for Languages of India). The specialists don't. **Lumora World puts clinical-grade screening inside five game-worlds that a classroom teacher can run on a single shared tablet.**

---

## 2. Product Definition

### 2.1 One-Line Pitch

> **One tablet. No specialist required. Five worlds of learning are coming to your classroom.**

### 2.2 What Lumora World Is

A tablet-first, bilingual (English + Hindi) web platform that:
1. **Screens** children for dyslexia, dysgraphia, dyscalculia, and neurodevelopmental markers through 5 game-worlds — in 15 minutes, facilitated by a teacher.
2. **Supports** flagged children with a calm, adaptive 3-minute daily practice companion.
3. **Equips** remote specialists with longitudinal data dashboards and 1-click clinical referral packets.

### 2.3 What Lumora World Is NOT

- A clinical diagnostic tool (it is a screening triage instrument)
- A general-purpose EdTech quiz app (it extracts biological signals, not quiz scores)
- A cloud-dependent system that stores identifying information about children

### 2.4 Brand Identity

| Element | Specification |
|:---|:---|
| **Name** | Lumora World |
| **Logo** | Custom wordmark — "Lumora" with an integrated lantern icon inside the "o" |
| **Mascot** | Animated lantern character (consistent with logo) with expressions: Neutral, Encouraging, Celebrating |
| **Metaphor** | A lantern illuminating hidden potential — every child carries light |
| **Primary palette** | Ink `#2B2A33` · Amber `#E8A33D` · Paper `#F4F2F6` · Muted `#6B6875` · Hairline `#E4E1E8` |
| **Scoring palette** | Sage Green `#81B29A` (typical) · Sunshine `#F2CC8F` (watch) · Terracotta `#E07A5F` (follow-up) |
| **Typography** | Baloo 2 (headings — rounded, child-friendly, Devanagari support) · Lexend (body — high legibility, dyslexia-optimized) |

---

## 3. Target Users

| Persona | Role | Key Need |
|:---|:---|:---|
| **Asha** | Government primary school teacher, Grades 1–3 | Run a 15-min screening without clinical training; print a referral summary |
| **Riya (6)** | Student, Grade 1, Hindi-medium | A calm game that adapts to her pace and never says "wrong" |
| **Dr. Priya** | District psychologist, covers 15 schools | Remote dashboard with RTI curves, biomarkers, and DALI referral packets |

---

## 4. The Five Worlds

Each world maps to a clinical screening construct. The child never sees clinical language — only world names and game mechanics.

```
                         ┌─────────────────────────┐
                         │      LUMORA WORLD        │
                         │   ✦ Book of Worlds ✦     │
                         └────────────┬────────────┘
                                      │
       ┌──────────┬──────────┬────────┴────────┬──────────┬──────────┐
       ▼          ▼          ▼                 ▼          ▼          ▼
   Sound      Story       Rune            Memory      Vision
   Forest     Castle      Realm           Mountains   Valley
   ─────────  ─────────   ─────────      ─────────   ─────────
   Phonemic   Decoding    Motor          Rapid       Gaze &
   Awareness  & Reading   Planning       Naming      Fixation
   & Blending Fluency     & Tracing      (RAN)       Tracking
```

### 4.1 Sound Forest — Phonological Awareness

| Attribute | Specification |
|:---|:---|
| **Clinical construct** | Phonological awareness & auditory blending |
| **Gameplay** | Segmented phoneme sounds play with pulsing visual circles (e.g., /b/ /a/ /t/). Child taps the blended word from 4 illustrated answer cards. |
| **Signal extraction** | Inter-phoneme pause tolerance · response latency · confusion pair logs (b/d, p/q) |
| **Audio engine** | `SpeechSynthesis` API for phoneme playback; fallback to pre-recorded audio clips for Hindi phonemes |
| **Scoring** | Accuracy % + latency vs. grade-normed benchmarks (Grades 1–5) |
| **Hindi variant** | Devanagari aksharas and Hindi phonemes (e.g., /क/ /अ/ /म/ → कमल) |
| **Items** | 8 blending trials per session |
| **Component** | `SoundForest.tsx` |

### 4.2 Story Castle — Phonological Decoding

| Attribute | Specification |
|:---|:---|
| **Clinical construct** | Phonological decoding & word reading fluency |
| **Gameplay** | Pronounceable nonwords appear on illustrated stone tablets. Child reads aloud. Teacher taps thumbs-up/thumbs-down scoring buttons. |
| **Signal extraction** | Web Speech API transcription match · teacher binary score · voice onset hesitation latency |
| **Dual-mode** | Primary: voice capture. Fallback: teacher thumbs-up/down (guarantees 100% uptime in noisy classrooms) |
| **Hindi variant** | Hindi nonwords using valid akshara combinations |
| **Items** | 10 nonwords per session |
| **Component** | `StoryCastle.tsx` |

### 4.3 Rune Realm — Kinematic Motor Planning

| Attribute | Specification |
|:---|:---|
| **Clinical construct** | Kinematic motor planning & dysgraphia screening |
| **Gameplay** | Glowing "rune" letters/aksharas appear on a canvas. Child traces with finger or stylus. |
| **Signal extraction** | Raw `PointerEvent` arrays (x, y, t, pressure) → computed metrics: |
| | • **NVI (Number of Velocity Inversions)** — fluid writing = 1 bell curve per stroke; dysgraphic = many micro-tremors |
| | • **Stroke duration** and pen-lift count |
| | • **Centerline deviation** from ideal trajectory |
| | • **Jerk index** (smoothness of motion) |
| | • **Mirror reversal detection** (b/d, p/q, ट/ठ) via spatial trajectory vectoring |
| **Hindi variant** | Devanagari tracing templates including matra-attached forms |
| **Items** | 6 letters/aksharas per session |
| **Component** | `RuneRealm.tsx` · Utility: `lib/tracing.ts` |

### 4.4 Memory Mountains — Rapid Automatized Naming (RAN)

| Attribute | Specification |
|:---|:---|
| **Clinical construct** | Rapid Automatized Naming speed |
| **Gameplay** | 5x5 matrix of colored shapes cascades down a mountain trail. Teacher starts timer. Child names each item aloud. Teacher taps to flag errors. |
| **Signal extraction** | Items/second · error positions · hesitation gap durations |
| **Scoring** | RAN rate (items/sec) vs. grade-level benchmark |
| **Items** | 25-item grid (5 colors x 5 shapes) |
| **Component** | `MemoryMountains.tsx` |

### 4.5 Vision Valley — Oculomotor Gaze Tracking

| Attribute | Specification |
|:---|:---|
| **Clinical construct** | Oculomotor gaze tracking, visual crowding detection |
| **Gameplay** | A short sentence appears on screen. Child reads it silently while the front camera tracks their eye movements. |
| **CV approach** | **TensorFlow.js with MediaPipe Face Mesh** — 468 facial landmarks including iris positions. Runs 100% in-browser. |
| **Signal extraction** | |
| | • **Mean Fixation Duration** (>400ms indicates decoding friction) |
| | • **Regressive Saccades Ratio** (backward eye jumps — visual crowding / comprehension breakdown) |
| | • **Gaze dispersion** heat map |
| **Privacy** | Zero frames leave the device. All processing in-memory on canvas. No recording. |
| **Calibration** | 5-point calibration sequence before the reading task |
| **Items** | 3 sentences per session (grade-appropriate length) |
| **Component** | `VisionValley.tsx` · Utility: `lib/gaze.ts` |

---

## 5. Three Product Tiers

### Tier 1 — Classroom Screening (The Five Worlds)

| Requirement | Specification |
|:---|:---|
| **Duration** | 15 minutes or less per child (all 5 worlds) |
| **Facilitator** | Classroom teacher (zero clinical training required) |
| **Session flow** | Teacher enters child initials + grade + language → child plays 5 worlds in sequence → system generates triage card |
| **Output** | Per-child triage summary card with per-world scores and traffic-light indicators |
| **Threshold logic** | Rule-based, transparent, per-grade benchmarks: |
| | • Accuracy <40% OR Latency >2x benchmark → Terracotta `Recommend follow-up soon` |
| | • Accuracy 40–70% OR Latency 1.5x–2x → Sunshine `Worth a closer look` |
| | • Accuracy >=70% AND Latency <=1.5x → Sage `Typical range` |
| **Languages** | English + Hindi |
| **Data** | Pseudonymous — child initials + grade + scores synced to Firebase. No names, no emails, no photos. |
| **Printable** | 1-page summary PDF with world scores, suitable for sending to District EIC |
| **Route** | `/screening` |

### Tier 2 — Child Haven Companion ("My Haven")

| Requirement | Specification |
|:---|:---|
| **Purpose** | Daily adaptive practice for flagged children — intervention, not screening |
| **Duration** | 3 minutes per day |
| **Structure** | TEACCH visual schedule: Step 1 → Step 2 → Step 3 (predictable for neurodivergent children) |
| **Activities** | Sound Forest practice (phoneme blending) → Tracing Glade (letter tracing) → Star Count (subitizing — dot array comparison for dyscalculia) |
| **Adaptive scaffolding** | Vygotsky ZPD model — if child hesitates >2.8s, system fades in visual/phonemic hints. No scoring penalty. |
| **Sensory calm mode** | One-touch toggle that desaturates the palette and reduces visual complexity |
| **Mascot feedback** | Lantern character shows encouraging expressions. Never says "wrong" — only "let's try together" |
| **Route** | `/haven` |

### Tier 3 — Doctor & Specialist Command Center

| Requirement | Specification |
|:---|:---|
| **Purpose** | Remote specialist dashboard for monitoring screened children and managing referrals |
| **Access** | Firebase email auth required |
| **Cohort view** | Monitors children across schools, categorized by RTI tiers: Tier 1 Typical · Tier 2 Targeted · Tier 3 Intensive/Plateau |
| **RTI trajectory** | 5-week longitudinal bar charts showing Response-to-Intervention over time |
| **Biomarker inspector** | Per-child deep view: kinematic NVI waveforms · mean gaze fixation durations · saccadic regression rates · Devanagari confusion logs |
| **DALI referral packet** | 1-click printable clinical evidence summary formatted for District EIC intake |
| **Autism/IASQ module** | Accessible from Doctor Hub only (not in main nav). 8-item teacher observational checklist: Social Communication, Joint Attention, Response to Name, Peer Engagement, Sensory Reactivity, Routine Transitions, Repetitive Mannerisms, Speech Modulation. Based on IASQ + CASI. |
| **Route** | `/doctor` |

---

## 6. Technical Architecture

### 6.1 Stack

| Layer | Technology | Rationale |
|:---|:---|:---|
| **Framework** | Next.js 14+ (App Router) | SSG/SSR flexibility, file-based routing, React Server Components |
| **UI** | React 18+ | Component model, hooks for state/effects |
| **Styling** | Tailwind CSS 3+ | Utility-first, fast iteration, responsive by default |
| **Backend** | Firebase (Firestore + Auth) | Real-time sync for Doctor Hub, anonymous auth for children, email auth for specialists |
| **CV / ML** | TensorFlow.js + MediaPipe Face Mesh | 468-landmark face mesh, iris tracking, runs 100% in-browser |
| **Audio** | Web Speech API (SpeechSynthesis + SpeechRecognition) | Phoneme playback and voice capture |
| **Canvas** | HTML5 Canvas + PointerEvent API | Handwriting tracing capture |
| **Deployment** | Vercel (free tier) | Instant deploys from GitHub, perfect for Next.js |
| **i18n** | next-intl or custom JSON architecture | English + Hindi, extensible |

### 6.2 Firebase Data Model

```
firestore/
├── sessions/                     # One doc per screening session
│   └── {sessionId}/
│       ├── childInitials: string
│       ├── grade: number (1-5)
│       ├── language: "en" | "hi"
│       ├── createdAt: timestamp
│       ├── schoolCode: string
│       └── worlds/               # Subcollection
│           ├── soundForest: { accuracy, latency, confusionPairs, rawTrials[] }
│           ├── storyCastle: { accuracy, latency, teacherScores[], speechResults[] }
│           ├── runeRealm: { nvi, strokeDuration, penLifts, centerlineDev, jerkIndex, mirrorReversals[] }
│           ├── memoryMountains: { ranRate, errors[], hesitationGaps[] }
│           └── visionValley: { meanFixation, regressiveSaccadeRatio, gazeDispersion }
├── haven/                        # Haven companion progress
│   └── {childNickname}/
│       └── dailySessions[]
├── specialists/                  # Email-authed specialist profiles
│   └── {uid}/
│       ├── email
│       ├── schools: string[]
│       └── role: "specialist"
└── iasq/                         # Autism screening results
    └── {childInitials_grade}/
        └── responses: number[8]
```

### 6.3 Authentication Flow

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  CHILD / TEACHER │     │    HAVEN COMPANION   │     │   SPECIALIST        │
│  (Screening)     │     │    (Daily Practice)  │     │   (Doctor Hub)      │
├─────────────────┤     ├──────────────────────┤     ├─────────────────────┤
│ Firebase         │     │ Firebase             │     │ Firebase            │
│ Anonymous Auth   │     │ Anonymous Auth       │     │ Email/Password Auth │
│ No PII collected │     │ Nickname only        │     │ Full dashboard      │
└─────────────────┘     └──────────────────────┘     └─────────────────────┘
```

---

## 7. File Structure

```
lumora-world/
├── app/
│   ├── layout.tsx                    # Root layout — fonts, global providers, metadata
│   ├── page.tsx                      # Landing / role switcher
│   ├── screening/
│   │   ├── page.tsx                  # Screening entry: child initials + grade + language
│   │   ├── sound-forest/
│   │   │   └── page.tsx              # Sound Forest game
│   │   ├── story-castle/
│   │   │   └── page.tsx              # Story Castle game
│   │   ├── rune-realm/
│   │   │   └── page.tsx              # Rune Realm game
│   │   ├── memory-mountains/
│   │   │   └── page.tsx              # Memory Mountains game
│   │   ├── vision-valley/
│   │   │   └── page.tsx              # Vision Valley game
│   │   └── results/
│   │       └── page.tsx              # Triage summary card
│   ├── haven/
│   │   ├── page.tsx                  # Haven entry: nickname
│   │   └── session/
│   │       └── page.tsx              # 3-step TEACCH session
│   └── doctor/
│       ├── page.tsx                  # Login gate
│       ├── dashboard/
│       │   └── page.tsx              # Cohort overview + RTI charts
│       ├── child/
│       │   └── [id]/
│       │       └── page.tsx          # Deep biomarker inspector
│       └── iasq/
│           └── page.tsx              # Autism/IASQ checklist (hidden)
├── components/
│   ├── ui/                           # Shared UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── TriageIndicator.tsx       # Traffic-light component
│   │   ├── VisualSchedule.tsx        # TEACCH step indicator
│   │   └── LanternMascot.tsx         # Animated lantern SVG with expressions
│   ├── screening/
│   │   ├── SoundForest.tsx
│   │   ├── StoryCastle.tsx
│   │   ├── RuneRealm.tsx
│   │   ├── MemoryMountains.tsx
│   │   ├── VisionValley.tsx
│   │   └── ResultsCard.tsx
│   ├── haven/
│   │   ├── HavenSession.tsx
│   │   ├── PhonemePractice.tsx
│   │   ├── TracingGlade.tsx
│   │   └── StarCount.tsx
│   └── doctor/
│       ├── CohortTable.tsx
│       ├── RTIChart.tsx
│       ├── BiomarkerInspector.tsx
│       ├── DALIReferralPacket.tsx
│       └── IASQChecklist.tsx
├── lib/
│   ├── firebase.ts                   # Firebase init + auth helpers
│   ├── scoring.ts                    # Threshold logic per grade
│   ├── tracing.ts                    # PointerEvent → NVI, jerk, centerline deviation
│   ├── gaze.ts                       # TensorFlow.js + MediaPipe Face Mesh gaze pipeline
│   ├── speech.ts                     # Web Speech API wrappers
│   ├── i18n.ts                       # Locale loader
│   └── types.ts                      # TypeScript interfaces for all data models
├── locales/
│   ├── en.json                       # English strings
│   └── hi.json                       # Hindi strings
├── public/
│   ├── lumora_logo_transparent.png
│   ├── audio/                        # Pre-recorded Hindi phoneme audio clips
│   └── fonts/
├── tailwind.config.ts
├── next.config.js
├── firebase.json                     # Firestore rules
├── package.json
└── README.md
```

---

## 8. Design System

### 8.1 Visual Philosophy

**Duolingo Kids warmth + Apple design discipline.** Every screen should feel intentionally crafted — warm, playful, and alive — without looking like AI-generated generic UI. No gradients for the sake of gradients. No card-inside-card-inside-card nesting. Clean, confident, spacious.

**Anti-slop rules:**
- No generic hero sections with stock illustrations
- No "glassmorphism everywhere" — use depth sparingly and purposefully
- Every color choice must trace back to the brand palette
- Micro-animations should have physics (spring, bounce) not linear easing
- Touch targets >= 56px — these are 6-year-olds using shared tablets with small hands
- Answer cards >= 72px height

### 8.2 Color System (Tailwind Config)

```js
// tailwind.config.ts — extend theme
colors: {
  ink: '#2B2A33',
  amber: '#E8A33D',
  paper: '#F4F2F6',
  muted: '#6B6875',
  hairline: '#E4E1E8',
  sage: '#81B29A',       // Typical range indicator
  sunshine: '#F2CC8F',   // Watch indicator
  terracotta: '#E07A5F', // Follow-up indicator
  charcoal: '#3D405B',   // Dark surfaces
  cream: '#FAF7F2',      // Card backgrounds
}
```

### 8.3 Typography

| Usage | Font | Tailwind Class | Weight |
|:---|:---|:---|:---|
| World titles, headings | Baloo 2 | `font-display` | 500, 600 |
| Body text, instructions, labels | Lexend | `font-body` | 400, 500 |

Both fonts loaded via Google Fonts with `display=swap`. Both support Devanagari.

### 8.4 Lantern Mascot Specs

| State | Expression | When |
|:---|:---|:---|
| `neutral` | Soft glow, gentle idle float animation | Default, instructions |
| `encouraging` | Brighter glow, slight lean toward child | Child hesitates >2s |
| `celebrating` | Burst glow, sparkle particles | Correct answer, world complete |

The mascot is an SVG component (`LanternMascot.tsx`) with CSS transitions between states. No Lottie dependency — keep it lightweight.

### 8.5 World Visual Identity

Each world has a distinct accent color and illustrated background motif:

| World | Accent Color | Motif |
|:---|:---|:---|
| Sound Forest | Forest Green `#2F5D50` | Soft leaves, gentle fireflies |
| Story Castle | Indigo `#3E4C7A` | Stone archways, glowing runes |
| Rune Realm | Teal `#2FA8A0` | Mystical symbols, constellation dots |
| Memory Mountains | Slate `#4F5D75` | Mountain silhouettes, clouds |
| Vision Valley | Sky Blue `#3E8FB0` | Rolling hills, open eye motif |

---

## 9. Interaction Design Details

### 9.1 Screening Session Flow

```
Enter Child      →  Sound Forest  →  Story Castle  →  Rune Realm  →  Memory Mountains  →  Vision Valley  →  Triage Results
Initials/Grade                                                                                                  (Print/Save)
```

### 9.2 Transition Between Worlds

Between each world, show a brief (1.5s) illustrated transition:
- Lantern mascot floats from one world to the next
- World name fades in with its accent color
- Gentle spring animation (not linear, not bounce — ease-out with slight overshoot)

### 9.3 Error & Edge Case Language

| Situation | What NOT to say | What to say |
|:---|:---|:---|
| Wrong answer | "Wrong!" / "Incorrect" | "Let's try another one!" |
| Timeout | "Too slow" | (mascot leans in encouragingly, auto-advance) |
| Low score | "Poor performance" | "Some of these were tricky!" |
| Microphone denied | "Permission denied" | "No microphone? No problem! Teacher can help." |
| Camera denied | "Camera access required" | "We'll skip this part — the other worlds still work great!" |

---

## 10. Scoring Engine (`lib/scoring.ts`)

### 10.1 Per-Grade Benchmarks

```typescript
export interface GradeBenchmark {
  grade: number; // 1-5
  soundForest: { accuracyThresholds: [number, number]; latencyBenchmarkMs: number };
  storyCastle: { accuracyThresholds: [number, number]; latencyBenchmarkMs: number };
  runeRealm: { nviThreshold: number; deviationThreshold: number };
  memoryMountains: { ranRateThreshold: number }; // items per second
  visionValley: { fixationThresholdMs: number; regressionRatioThreshold: number };
}

export const GRADE_BENCHMARKS: Record<number, GradeBenchmark> = {
  1: {
    grade: 1,
    soundForest: { accuracyThresholds: [0.4, 0.7], latencyBenchmarkMs: 4200 },
    storyCastle: { accuracyThresholds: [0.4, 0.65], latencyBenchmarkMs: 3800 },
    runeRealm: { nviThreshold: 8, deviationThreshold: 35 },
    memoryMountains: { ranRateThreshold: 0.8 }, // ~31s for 25 items
    visionValley: { fixationThresholdMs: 450, regressionRatioThreshold: 0.30 }
  },
  2: {
    grade: 2,
    soundForest: { accuracyThresholds: [0.5, 0.75], latencyBenchmarkMs: 3500 },
    storyCastle: { accuracyThresholds: [0.5, 0.75], latencyBenchmarkMs: 3000 },
    runeRealm: { nviThreshold: 6, deviationThreshold: 28 },
    memoryMountains: { ranRateThreshold: 1.1 }, // ~23s for 25 items
    visionValley: { fixationThresholdMs: 400, regressionRatioThreshold: 0.25 }
  },
  3: {
    grade: 3,
    soundForest: { accuracyThresholds: [0.6, 0.8], latencyBenchmarkMs: 2800 },
    storyCastle: { accuracyThresholds: [0.6, 0.8], latencyBenchmarkMs: 2400 },
    runeRealm: { nviThreshold: 5, deviationThreshold: 22 },
    memoryMountains: { ranRateThreshold: 1.4 }, // ~18s for 25 items
    visionValley: { fixationThresholdMs: 350, regressionRatioThreshold: 0.22 }
  },
  4: {
    grade: 4,
    soundForest: { accuracyThresholds: [0.7, 0.85], latencyBenchmarkMs: 2200 },
    storyCastle: { accuracyThresholds: [0.7, 0.85], latencyBenchmarkMs: 1900 },
    runeRealm: { nviThreshold: 4, deviationThreshold: 18 },
    memoryMountains: { ranRateThreshold: 1.7 }, // ~15s for 25 items
    visionValley: { fixationThresholdMs: 300, regressionRatioThreshold: 0.18 }
  },
  5: {
    grade: 5,
    soundForest: { accuracyThresholds: [0.75, 0.9], latencyBenchmarkMs: 1800 },
    storyCastle: { accuracyThresholds: [0.75, 0.9], latencyBenchmarkMs: 1500 },
    runeRealm: { nviThreshold: 3, deviationThreshold: 15 },
    memoryMountains: { ranRateThreshold: 2.0 }, // ~12.5s for 25 items
    visionValley: { fixationThresholdMs: 280, regressionRatioThreshold: 0.15 }
  }
};
```

### 10.2 Triage Classification

```typescript
export type TriageLevel = 'typical' | 'watch' | 'followup';

export function classifyWorld(accuracy: number, latency: number, benchmarkLatency: number): TriageLevel {
  if (accuracy < 0.4 || latency > benchmarkLatency * 2.0) return 'followup';    // Terracotta (#E07A5F)
  if (accuracy < 0.7 || latency > benchmarkLatency * 1.4) return 'watch';       // Sunshine (#F2CC8F)
  return 'typical';                                                             // Sage (#81B29A)
}
```

### 10.3 Overall Triage

- If **any single world** returns `followup` → overall is `followup` (🟠 `Recommend clinical evaluation`).
- If **2 or more worlds** return `watch` → overall is `watch` (🟡 `Worth a closer look / targeted practice`).
- Otherwise → `typical` (🟢 `Within typical developmental range`).


---

## 11. Devanagari / Hindi-Specific Specifications

### 11.1 Akshara-Matra Confusion Matrix

Indian scripts (alpha-syllabaries) have a unique challenge: vowel modifiers (matras) are spatially transposed. The short 'i' matra is written to the LEFT of the consonant but pronounced AFTER it.

**Tracked confusion pairs:**
- Matra transpositions: short-i / long-i, short-u / long-u, e / ai, o / au
- Stroke-similar aksharas: ba/va, pa/sha, bha/ma, ta/tha, da/dha

### 11.2 Hindi Phoneme Set for Sound Forest

Implement blending with Hindi CV (consonant-vowel) and CVC combinations:
- Example: /ka/ + /a/ + /ma/ → kamal (lotus)
- Example: /ba/ + /a/ + /la/ → bal (strength)

### 11.3 Hindi Nonwords for Story Castle

Generate valid-sounding Hindi pseudowords using permitted akshara combinations that are not real words (e.g., kumat, baalish, pirak).

---

## 12. Privacy & Ethics

### 12.1 Data Ethics

| Principle | Implementation |
|:---|:---|
| **Pseudonymous only** | Child initials + grade only. No full names, no photos, no emails, no phone numbers. |
| **Camera frames ephemeral** | Gaze tracking processes frames in-memory on canvas. No recording, no storage, no transmission. |
| **Audio buffers ephemeral** | Speech recognition buffers processed in-memory only. |
| **Firebase minimal** | Firestore stores only: initials, grade, language, scores, timestamps. |
| **No third-party analytics** | No Google Analytics, no tracking pixels, no ad SDKs. |

### 12.2 Mandatory Clinical Disclaimer

This text must appear on every results page and printable summary:

> *Lumora World is a first-pass screening triage tool and developmental practice companion, not a clinical diagnostic instrument. For formal evaluation, children must be assessed by a certified clinical psychologist or special educator using standardized batteries such as DALI (Dyslexia Assessment for Languages of India by NBRC).*

---

## 13. Deployment

| Step | Detail |
|:---|:---|
| **Repository** | GitHub (public or private) |
| **Hosting** | Vercel — connect to GitHub repo for auto-deploys |
| **Firebase project** | Create via Firebase Console; add web app config to `.env.local` |
| **Environment variables** | `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` |
| **Domain** | `lumoraworld.vercel.app` (or custom domain) |

---

## 14. Success Metrics

| Category | Metric | Target |
|:---|:---|:---|
| **Screening** | Sensitivity vs. DALI gold standard | >=85% |
| **Screening** | Specificity | >=75% |
| **Screening** | Completion rate (all 5 worlds) | >=90% |
| **Screening** | Time per child | <=15 min |
| **Haven** | Daily return rate | >=60% within 3 days |
| **Doctor Hub** | Referral-to-evaluation conversion | >=70% within 60 days |
| **Hackathon** | Working demo with all 5 worlds | Yes |
| **Product Hunt** | Top 5 on launch day | Goal |

---

## 15. Phased Build Checklist (AI Agent Implementation Order)

> **Build order rationale:** Lead with the hardest, most impressive pieces (Vision Valley, Rune Realm) so the demo has maximum wow factor early. Then build the simpler worlds, then the support tiers.

### Phase 0 — Project Scaffold
- [ ] Initialize Next.js 14+ app with App Router, Tailwind CSS, TypeScript
- [ ] Configure Tailwind with Lumora color palette and font families
- [ ] Load Baloo 2 + Lexend from Google Fonts
- [ ] Set up Firebase project and add config to `.env.local`
- [ ] Initialize Firebase in `lib/firebase.ts` (Firestore + Auth)
- [ ] Create `lib/types.ts` with all TypeScript interfaces
- [ ] Create i18n structure with `locales/en.json` and `locales/hi.json`
- [ ] Build shared UI primitives: `Button`, `Card`, `ProgressBar`, `TriageIndicator`
- [ ] Build `LanternMascot.tsx` SVG with 3 expression states
- [ ] Build root layout with metadata, fonts, and global styles
- [ ] Build landing page with role switcher (Screening / Haven / Doctor Hub)

### Phase 1 — Vision Valley (Gaze Tracking)
- [ ] Set up TensorFlow.js + MediaPipe Face Mesh dependencies
- [ ] Build `lib/gaze.ts`: webcam init, face mesh loading, iris landmark extraction
- [ ] Implement 5-point calibration sequence
- [ ] Implement fixation detection algorithm (mean fixation duration)
- [ ] Implement saccade detection (regressive saccade ratio)
- [ ] Build `VisionValley.tsx` game component with 3 grade-appropriate sentences
- [ ] Add gaze dispersion visualization (heat map overlay)
- [ ] Handle camera permission denied gracefully
- [ ] Wire scores to Firestore

### Phase 2 — Rune Realm (Handwriting Tracing)
- [ ] Build `lib/tracing.ts`: PointerEvent capture → velocity, acceleration, jerk computation
- [ ] Implement NVI (Number of Velocity Inversions) calculation
- [ ] Implement centerline deviation scoring
- [ ] Implement mirror reversal detection (b/d, p/q)
- [ ] Create English letter tracing templates (6 letters)
- [ ] Create Devanagari akshara tracing templates (6 aksharas)
- [ ] Build `RuneRealm.tsx` canvas-based tracing game
- [ ] Add visual feedback: trace path coloring, completion animation
- [ ] Wire scores to Firestore

### Phase 3 — Sound Forest (Phoneme Blending)
- [ ] Build `lib/speech.ts`: SpeechSynthesis wrapper for phoneme playback
- [ ] Create English phoneme blending stimuli (8 trials)
- [ ] Create Hindi phoneme blending stimuli (8 trials)
- [ ] Record/source fallback Hindi phoneme audio clips
- [ ] Build `SoundForest.tsx` with pulsing phoneme circles and 4-option answer cards
- [ ] Implement confusion pair logging
- [ ] Wire scores to Firestore

### Phase 4 — Story Castle (Word Reading)
- [ ] Generate English pronounceable nonwords (10 items)
- [ ] Generate Hindi pseudowords using valid akshara combinations (10 items)
- [ ] Build `StoryCastle.tsx` with word display + teacher scoring buttons
- [ ] Implement Web Speech API recognition with confidence scoring
- [ ] Implement teacher fallback mode (thumbs-up/down buttons)
- [ ] Wire scores to Firestore

### Phase 5 — Memory Mountains (RAN)
- [ ] Build `MemoryMountains.tsx` with 5x5 color/shape grid
- [ ] Implement teacher timer controls (start/stop)
- [ ] Implement error tap-to-flag
- [ ] Calculate RAN rate (items/sec)
- [ ] Wire scores to Firestore

### Phase 6 — Screening Flow & Results
- [ ] Build screening entry page (child initials + grade + language selection)
- [ ] Implement world-to-world navigation with transition animations
- [ ] Build `lib/scoring.ts` with per-grade benchmarks and threshold logic
- [ ] Build `ResultsCard.tsx` triage summary with per-world traffic lights
- [ ] Implement overall triage classification
- [ ] Implement PDF print layout for summary
- [ ] Save complete session to Firestore

### Phase 7 — Haven Companion
- [ ] Build haven entry page (nickname)
- [ ] Build `VisualSchedule.tsx` (TEACCH 3-step indicator)
- [ ] Build `PhonemePractice.tsx` (simplified Sound Forest with scaffolding)
- [ ] Build `TracingGlade.tsx` (simplified tracing with fading hints)
- [ ] Build `StarCount.tsx` (subitizing — dot array comparison)
- [ ] Implement adaptive scaffolding: fade-in hints after 2.8s hesitation
- [ ] Implement sensory calm mode toggle
- [ ] Save daily progress to Firestore

### Phase 8 — Doctor Hub
- [ ] Build Firebase email auth login gate
- [ ] Build `CohortTable.tsx` — sortable/filterable child roster by RTI tier
- [ ] Build `RTIChart.tsx` — 5-week longitudinal bar chart (use Recharts or Chart.js)
- [ ] Build `BiomarkerInspector.tsx` — deep per-child view with NVI waveforms, gaze metrics, Devanagari confusion logs
- [ ] Build `DALIReferralPacket.tsx` — 1-click printable clinical summary
- [ ] Build `IASQChecklist.tsx` — 8-item autism screening (accessible from Doctor Hub only)

### Phase 9 — Polish & Launch Prep
- [ ] Add micro-animations: world transitions, mascot expressions, button feedback
- [ ] Responsive design audit: ensure all screens work on tablet (768px+) and desktop
- [ ] Accessibility pass: keyboard nav, screen reader labels, focus management
- [ ] Complete Hindi translations in `hi.json`
- [ ] Add clinical disclaimer to all results pages
- [ ] Deploy to Vercel
- [ ] Create README.md with setup instructions
- [ ] Record demo video for DoraHacks submission
- [ ] Prepare Product Hunt launch assets

---

*This document is the complete implementation specification for Lumora World. An AI coding agent should be able to build the entire product by following the file structure, component specs, and phased checklist above.*
