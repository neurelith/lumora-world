# 🐱 PhonoRemed — Neurodevelopmental Clinical Triage & Adaptive Companion Platform

> **A Dual-Sided, Multilingual Platform for Early Screening, Daily Adaptive Practice, and Specialist Cohort Telemetry for Specific Learning Disabilities (Dyslexia, Dysgraphia, Dyscalculia) and Neurodevelopmental Markers (Autism/Sensory) in Primary Schoolchildren.**

---

## 📌 Executive Summary

Millions of schoolchildren in India and low-resource environments miss the critical **ages 5–8 (Grades 1–3)** early-intervention window. Standardized clinical tools like **DALI (Dyslexia Assessment for Languages of India by NBRC)** exist, but face a crippling bottleneck: **a specialist deficit ratio exceeding 1 child psychologist per 25,000+ children**.

**PhonoRemed** solves this structural access bottleneck by delivering a 3-tier closed-loop system:
1. **Tier 1 (Classroom Screening)**: A 15-minute, teacher-facilitated gamified triage battery that reliably flags children needing professional evaluation without requiring a clinical specialist in the classroom.
2. **Tier 2 (Child Haven Companion)**: A calm, sensory-adaptive daily 3-minute practice space utilizing **Vygotsky's Zone of Proximal Development (ZPD)** with fading scaffolding and TEACCH visual schedules for neurodivergent children (Autism/Dyslexia).
3. **Tier 3 (Doctor & Specialist Command Center)**: A district-level dashboard providing remote psychologists with quantitative **Response-to-Intervention (RTI)** curves, kinematic handwriting waveforms, gaze oculomotor metrics, and 1-click DALI clinical referral packets.

---

## 📊 The Epidemiological Context & Numbers (India)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           EPIDEMIOLOGICAL LANDSCAPE IN INDIAN PRIMARY SCHOOLS                     │
├──────────────────────────────────────┬────────────────────────────────┬───────────────────────────┤
│ Condition / Metric                   │ Prevalence & Ratios            │ Impact on 120M Primary Kids│
├──────────────────────────────────────┼────────────────────────────────┼───────────────────────────┤
│ 📖 Specific Learning Disabilities    │ 8% – 12% pooled prevalence     │ ~10 to 15 Million children │
│    (Dyslexia, Dysgraphia, Dyscalculia)│ (AIIMS / NBRC / DALI studies)  │ miss early intervention   │
├──────────────────────────────────────┼────────────────────────────────┼───────────────────────────┤
│ 🧩 Autism Spectrum Disorder (ASD)    │ 1 in 68 to 1 in 100 children   │ ~1.8 to 2 Million children│
│                                      │ (INCLEN / IASQ validation)     │ largely under-diagnosed   │
├──────────────────────────────────────┼────────────────────────────────┼───────────────────────────┤
│ 👩‍⚕️ Specialist Shortage              │ 1 specialist per 25,000+ kids  │ Rural deficit exceeds     │
│    (Clinical Psychologists / Sp. Ed) │ (~12,000 specialists total)    │ 1 per 100,000+ children   │
├──────────────────────────────────────┼────────────────────────────────┼───────────────────────────┤
│ ⏳ Neuroplasticity Window            │ Ages 5 to 8 (Grades 1 to 3)    │ Remediation takes 4× more │
│                                      │ (Critical phonological period) │ time after Grade 3        │
└──────────────────────────────────────┴────────────────────────────────┴───────────────────────────┘
```

---

## 🔬 Core Technical Moats & Signal Extraction

PhonoRemed avoids generic "quiz wrappers" by extracting four deep, proprietary biological and linguistic signal layers directly in the browser:

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │               PHONOREMED DEEP ENGINE                   │
                                    └──────────────────────────┬─────────────────────────────┘
                                                               │
        ┌──────────────────────────────┬───────────────────────┴───────────────────────┬──────────────────────────────┐
        ▼                              ▼                                               ▼                              ▼
┌────────────────────────┐   ┌────────────────────────┐                    ┌────────────────────────┐   ┌────────────────────────┐
│  MOAT 1: ACOUSTIC      │   │  MOAT 2: KINEMATIC     │                    │  MOAT 3: AKSHARA       │   │  MOAT 4: OCULOMOTOR   │
│  PHONETIC TIMING       │   │  MOTOR PHYSICS         │                    │  ORTHOGRAPHIC MATRIX   │   │  GAZE TRACKING ENGINE  │
├────────────────────────┤   ├────────────────────────┤                    ├────────────────────────┤   ├────────────────────────┤
│ • Inter-phoneme pauses │   │ • Velocity Inversions  │                    │ • Matra spatial splits │   │ • Fixation duration ms │
│ • Voice Onset Time     │   │ • Sub-movement peaks   │                    │ • Conjunct confusion   │   │ • Regressive saccades  │
│ • Speech fallback      │   │ • Pointer pressure/SNR │                    │ • Devanagari phonemes  │   │ • Gaze dispersion      │
└────────────────────────┘   └────────────────────────┘                    └────────────────────────┘   └────────────────────────┘
```

### 1. Acoustic Phonemic Timing Engine
- Measures micro-temporal auditory processing gaps during phonological blending ($/b/ \rightarrow /a/ \rightarrow /t/$).
- Quantifies hesitation latencies and speech confidence with immediate teacher-operated scoring fallback to guarantee 100% operational uptime in noisy municipal classrooms.

### 2. Kinematic Neuromotor Handwriting Physics (`lib/tracing.ts`)
- Rather than checking bounding-box intersections, PhonoRemed captures raw `PointerEvent` arrays ($x, y, t, \text{pressure}$).
- Computes **NVI (Number of Velocity Inversions)**: fluid handwriting exhibits single bell-shaped velocity profiles per stroke, whereas dysgraphic handwriting exhibits high micro-tremor NVI counts.
- Detects **stroke mirror reversals** ($b \leftrightarrow d, p \leftrightarrow q, \text{Devanagari } ट \leftrightarrow ठ$) based on spatial trajectory vectoring.

### 3. Devanagari Akshara-Matra Orthographic Error Matrix
- Indian scripts (Alpha-syllabaries) feature vowel modifiers (*matras*) that are spatially transposed (e.g., short 'i' matra $ि$ is written to the left but pronounced after the consonant).
- Systematically catalogs matra transpositions ($ि \leftrightarrow ी$) and stroke-similar aksharas ($ब \leftrightarrow व, प \leftrightarrow ष, भ \leftrightarrow म$).

### 4. Real-Time On-Device Eye/Gaze Tracking (`lib/gaze.ts`)
- Uses WebRTC and corneal/pupil dark-pixel centroid estimation on raw canvas frames.
- Calculates **Mean Fixation Duration** ($>400\text{ms}$ indicates decoding friction) and **Regressive Saccades Ratio** (backward eye jumps indicating visual crowding or comprehension breakdown in dyslexia).
- 100% client-side: no video frames leave the device.

---

## 🕹️ System Architecture & Four Core Modules

The platform is organized into 4 distinct operational modes accessible via the top-level **Role Switcher**:

```
                       ┌────────────────────────────────────────────────────────┐
                       │                   PHONOREMED PLATFORM                  │
                       └──────────────────────────┬─────────────────────────────┘
                                                  │
          ┌───────────────────────┬───────────────┴───────────────┬───────────────────────┐
          ▼                       ▼                               ▼                       ▼
┌──────────────────┐    ┌──────────────────┐            ┌──────────────────┐    ┌──────────────────┐
│  1. CLASSROOM    │    │   2. CHILD       │            │   3. DOCTOR      │    │   4. AUTISM      │
│     SCREENING    │    │      HAVEN       │            │      HUB         │    │      (IASQ)      │
├──────────────────┤    ├──────────────────┤            ├──────────────────┤    ├──────────────────┤
│ • 5 Triage games │    │ • 3-min quests   │            │ • Cohort roster  │    │ • 8-item screener│
│ • Pseudonymous   │    │ • TEACCH routine │            │ • 30-day RTI     │    │ • Non-verbal     │
│ • DALI Tiers     │    │ • Fading hints   │            │ • Waveforms/NVI  │    │ • Sensory triage │
│ • Print summary  │    │ • Calm mode      │            │ • DALI Export    │    │ • Referral notes │
└──────────────────┘    └──────────────────┘            └──────────────────┘    └──────────────────┘
```

---

### Module 1: Classroom Triage Screening Battery (5 Tasks)

| Task | Clinical Construct | Implementation & Signal |
| :--- | :--- | :--- |
| **1. Sound Match** | Orthographic mapping & letter-sound retrieval | Displays large letter/akshara, audio playback via speech synthesis, latency tracking, confusion pair logging ($b/d, p/q$). |
| **2. Word Reading** | Phonological decoding | Invented pronounceable nonwords. Voice capture via Web Speech API with dual-mode teacher thumbs-up/down scoring buttons. |
| **3. Sound Blending** | Phonological awareness | Plays segmented sounds ($/b/ /a/ /t/$) with pulsing visual phoneme circles; child taps blended word from 4 options. |
| **4. Quick Naming (RAN)** | Rapid automatized naming speed | 25-item $5\times5$ color/shape matrix with teacher timer and tap-to-flag error markers; calculates items/second. |
| **5. Letter Tracing** | Kinematic motor planning & dysgraphia | Canvas pointer capture calculating stroke duration, pen-lift count, centerline deviation, jerk index, and mirrored stroke detection. |

#### Scoring Threshold Logic (`lib/scoring.ts`)
Transparent, rule-based benchmarks per grade level (Grades 1–5):
- **Accuracy $< 40\%$** or **Latency $> 2\times$ benchmark** $\rightarrow$ `Recommend follow-up soon` (Terracotta `#E07A5F`)
- **Accuracy $40\%–70\%$** or **Latency $1.5\times–2\times$ benchmark** $\rightarrow$ `Worth a closer look` (Sunshine `#F2CC8F`)
- **Accuracy $\ge 70\%$** and **Latency $\le 1.5\times$ benchmark** $\rightarrow$ `Typical range` (Sage Green `#81B29A`)

---

### Module 2: Daily Adaptive Practice Companion ("Haven")

Designed specifically for neurodivergent learners (Autism, Dyslexia, ADHD):
- **TEACCH Visual Schedule**: 3-step structured routine (1. Sound Forest $\rightarrow$ 2. Tracing Glade $\rightarrow$ 3. Star Count).
- **Dynamic Scaffolding (ZPD)**: If a child hesitates for $>2.8\text{s}$, the system automatically fades in visual/phonemic hints without penalizing them.
- **Sensory Calm Mode**: One-touch palette desaturation to eliminate sensory overwhelm.
- **Dyscalculia Subitizing Quest**: Rapid non-symbolic dot array comparisons to strengthen the Approximate Number System (ANS).

---

### Module 3: Doctor & Specialist Command Center (`DoctorHub.tsx`)

Designed for District Early Intervention Center (DEIC) psychologists:
- **Cohort Overview**: Monitors up to 500 children across 15 schools categorized by RTI Tiers (Tier 1 Typical, Tier 2 Targeted, Tier 3 Intensive/Plateau).
- **Longitudinal RTI Trajectory**: 5-week historical bar chart showing response to intervention.
- **Deep Biomarker Inspector**: Kinematic NVI peaks, mean gaze fixations, saccadic regression rates, and Devanagari confusion logs.
- **1-Click DALI Clinical Referral Packet**: Instant printable medical evidence summary.

---

### Module 4: IASQ / CASI Autism & Sensory Triage (`AutismScreener.tsx`)

Standardized 8-question teacher observational checklist grounded in the **Indian Autism Screening Questionnaire (IASQ)** and **Chandigarh Autism Screening Instrument (CASI)**:
1. Social Communication & Eye Contact
2. Joint Attention & Index Pointing
3. Response to Name
4. Peer Engagement & Cooperative Play
5. Sensory Reactivity (Auditory/Tactile distress)
6. Routine & Transition Meltdowns
7. Repetitive Motor Mannerisms (Flapping/Spinning)
8. Speech Modulation & Echolalia

---

## 🎨 Visual & UX Design System

- **Warm Illustrated Playground**: Avoids cold clinical sterile styling. Built with Terracotta (`#E07A5F`), Sage Green (`#81B29A`), Sunshine Yellow (`#F2CC8F`), Warm Charcoal (`#3D405B`), and Off-White (`#FAF7F2`).
- **Animated Cartoon Cat Mascot** (`CatMascot.tsx`): Friendly SVG companion with dynamic expressions (Neutral, Encouraging, Celebrating) and speech bubbles.
- **Ergonomic Tablet Touch Targets**: Controls $\ge 56\text{px}$, answer cards $72\text{px}+$ height for small hands on shared tablets.
- **Non-Stigmatizing Visual Language**: No red alerts or alarming labels.
- **Bilingual i18n Engine**: Full **English + हिन्दी (Hindi)** toggle with JSON architecture extensible to Marathi and Kannada.

---

## 🔒 Data Privacy & Zero-PII Guarantee

- **100% Client-Side Execution**: Runs entirely in the browser via Next.js + React + Tailwind CSS.
- **Pseudonymous Session Storage**: Only nicknames/initials, grade levels, and language selections are stored in `localStorage`.
- **Zero Server Uploads**: Gaze camera frames and audio buffers are processed in memory and never leave the device.

---

## 🚀 Running the Platform Locally

```bash
# 1. Navigate to the project directory
cd "C:\Users\sujoy\.gemini\antigravity-ide\scratch\phonoremed"

# 2. Install dependencies (if needed)
npm install

# 3. Start the Next.js development server
npx next dev -p 3005

# 4. Open in your browser
# URL: http://localhost:3005
```

---

## ⚖️ Mandatory Clinical Disclaimer

*This application is a first-pass screening triage tool and developmental practice companion, not a clinical diagnostic instrument. For a formal evaluation and diagnostic certification, children must be evaluated by a certified clinical psychologist or special educator using standardized diagnostic batteries such as DALI (Dyslexia Assessment for Languages of India by NBRC).*
