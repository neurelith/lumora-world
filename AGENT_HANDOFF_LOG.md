# 🤖 Lumora World — Agent Collaboration & Handoff Log

> **Note for Hermes / Future AI Agents:**  
> This log documents the architectural decisions, recent changes, active ports, tunnels, and repository synchronization details for **Lumora World**. Read this document to understand the codebase state and continue seamlessly.

---

## 📌 Project Quick Reference

- **Project Name**: Lumora World
- **Description**: Tablet-first, bilingual (English + Hindi) developmental screening triage & adaptive practice platform for primary schoolchildren (ages 5–8), aligned with DALI (*Dyslexia Assessment for Languages of India* by NBRC).
- **GitHub Repository**: [https://github.com/neurelith/lumora-world](https://github.com/neurelith/lumora-world)
- **Active Dev Server**: `http://localhost:5000` (`next dev -p 5000 -H 0.0.0.0`)
- **Active Public Cloudflare Tunnel**: `https://tracy-scientists-could-quotes.trycloudflare.com`

---

## 🕒 Chronological Changelog & Key Decisions

### 1. Content Accuracy & Clinical Guardrails
- **Removed Overclaiming Language**: Replaced unverified diagnostic claims ("iris gaze tracking", "biomarkers", "clinical signals") with accurate screening triage terminology:
  - Top Badge: `"Camera Air-Tracing · Works on Any Classroom Tablet"`
  - Hero Subtext: `"Five gentle game worlds that paint letters, blend sounds and time naming in the air — capturing practice signals that help teachers flag a child who could benefit from a closer look."`
  - Stat 1: `"3,890"` — *"Registered clinical psychologists in India (RCI, 2024)"*
  - Stat 2: `"~8%"` — *"Pooled SLD prevalence in Indian schoolchildren (meta-analysis)"*
  - Stat 3: `"Ages 5–8"` — *"Critical primary window for early classroom triage"*
- **Mandatory Clinical Disclaimer**: Embedded across all result summaries and reports:
  > *"Lumora World is a first-pass screening triage tool and developmental practice companion, not a clinical diagnostic instrument. For formal evaluation, children must be assessed by a certified clinical psychologist or special educator using standardized batteries such as DALI (Dyslexia Assessment for Languages of India by NBRC)."*

### 2. Upgraded Design System & UX
- **Apple HIG Discipline + Duolingo Kids Warmth**: Warm cream palette (`--paper: #F4F2F6`, `--ink: #2B2A33`, `--terracotta: #C96442`, `--amber: #E8A33D`, `--sage: #4E6B50`).
- **Lumi Lantern Mascot**: Dynamic SVG companion with 3 responsive moods (`neutral`, `encouraging`, `celebrating`).
- **Hardware-Accelerated GPU Cursor**: DPR-compensated subpixel trail in `components/ui/CustomCursor.tsx`.
- **Large Touch Ergonomics**: Minimum $56\text{px}$ interactive buttons, $72\text{px}$ answer tiles for primary school tablet use.

### 3. Five DALI-Aligned Game Worlds
1. **Rune Realm (`/screening/rune-realm`)**: Camera air-wand kinematic trajectory tracking, Number of Velocity Inversions (NVI), Jerk Index, spatial mirror reversal detection ($b \leftrightarrow d$, $p \leftrightarrow q$, $ट \leftrightarrow ठ$).
2. **Sound Forest (`/screening/sound-forest`)**: Auditory phonemic blending trials, synthetic speech synthesis, acoustic confusion pairs.
3. **Story Castle (`/screening/story-castle`)**: Pronounceable nonword decoding, Akshara-Matra binding, Web Speech STT.
4. **Memory Mountains (`/screening/memory-mountains`)**: Rapid Automatized Naming (RAN) timed 5×5 grid matrix.
5. **Vision Valley (`/screening/vision-valley`)**: Reading flow tracking, visual pacing, regression cadence.

### 4. 3-Tier Closed-Loop Architecture
- **Tier 1 (Screening)**: 15-minute gamified battery (`/screening`) with 3-tier triage (`typical`, `watch`, `follow-up`).
- **Tier 2 (My Haven)**: 3-minute self-guided daily practice (`/haven`) with TEACCH visual schedule and Sensory Calm Mode.
- **Tier 3 (Specialist Hub)**: Password-protected telemetry dashboard (`/doctor`) with 5-week RTI longitudinal graphs, DALI intake packets, and IASQ screener.

### 5. Offline-First & Privacy Constraints
- **100% In-Memory Processing**: Camera frames & audio buffers processed client-side only (never saved/uploaded).
- **Zero PII**: Pseudonymous student initials + grade only.
- **Dual Persistence**: Encrypted local IndexedDB primary storage + optional Firebase Firestore sync.

### 6. GitHub Commit History Organization
Re-structured repository into 9 clean, human conventional commits:
1. `chore: scaffold Next.js 14 App Router project with Tailwind CSS and TypeScript`
2. `feat(core): implement 1-Euro adaptive kinematic filter, DTW trajectory matcher, and speech synthesis`
3. `feat(ui): design system tokens, accessible components, Lumora Lantern mascot and GPU cursor`
4. `feat(screening): implement 5 exploratory worlds (Rune Realm, Sound Forest, Story Castle, Memory Mountains, Vision Valley)`
5. `feat(haven): add daily practice companion with TEACCH visual schedule and sensory calm mode`
6. `feat(doctor): specialist command center with longitudinal RTI curves, DALI intake packets and IASQ screener`
7. `feat(home): landing experience with camera air-wand, live telemetry and responsive layout`
8. `docs: add comprehensive architecture guide, getting started docs and clinical disclaimer`
9. `docs(specs): add brand kit, clinical research references and project specifications`

### 7. Mobile UX & Bundle Pruning (Ponytail Audit)
- Fixed mobile CSS loading by serving from static production build (`next start -p 5000`).
- Pruned 8 unused legacy dependencies (`@tensorflow/tfjs`, `canvas-confetti`, etc.), saving ~3MB from bundle.
- Added responsive slide-out mobile navigation drawer with backdrop blur.

### 8. Backend Architecture & Mobile Camera Stability (Senior Backend Upgrade)
- **Packaged 3 Specialized Agent Skills**:
  1. `.agents/skills/lumora-backend-architecture/SKILL.md` (Clean architecture, service layer, Zod validation, `/api/v1/*` routes)
  2. `.agents/skills/lumora-mobile-camera-cv/SKILL.md` (Hardware stream singleton, zero-leak MediaPipe loop cleanup, adaptive 360p resolution)
  3. `.agents/skills/lumora-firebase-security/SKILL.md` (Declarative Firestore rules, multi-tenancy scoping, exponential backoff sync queue)
- **Eliminated Mobile Camera Hang / Crash Root Cause**:
  - Built `lib/camera-service.ts` singleton with reference counting and adaptive resolution (480x360 for tablets/mobile) to prevent OOM.
  - Added clean MediaPipe `Camera` and `Hands` teardown on unmount in `HarmonicFlowCanvas.tsx`.
  - Added `simGazeRafRef` animation frame cancellation in `VisionValley.tsx`.
- **Production API Layer & Clean Service Architecture**:
  - `/api/v1/health` — Health check & runtime telemetry.
  - `/api/v1/scoring` — Clinical scoring service computing verified DALI triage with grade benchmarks.
  - `/api/v1/sessions` — Validated session creation and listing with tamper detection.
  - Zod schemas in `lib/schemas/session.schema.ts`.
  - Domain services in `lib/services/scoring.service.ts` and `lib/services/session.service.ts`.
- **Security & Storage Hardening**:
  - Added `firestore.rules` for role-based specialist access and session protection.
  - Connected real Firebase Auth in `lib/firebase.ts` and `app/doctor/page.tsx` with sandbox fallback.
  - Separated React hooks into `lib/use-storage.ts` to allow SSR-safe execution of `lib/storage.ts`.
  - Added exponential backoff (1s, 2s, 4s... max 30s) and max 5 retry dead-letter policy in `lib/storage.ts`.
  - Wrapped app in React `ErrorBoundary` in `app/layout.tsx`.

### 9. Immersive Child UI/UX & Gamified Haven Upgrade
- **Magic Air Wand & Camera Hardware Fix**:
  - Fixed dangling `getUserMedia` stream in `CameraPermissionModal.tsx` that previously locked camera hardware on mobile/laptop.
  - Rendered active video feed inside PiP box with overlaid teal hand skeleton joints and glowing wand tip — zero black screens on laptop/mobile.
  - Removed developer debug switches (`1-Euro locked`, `Continuous/Pinch`) from child screen.
- **Vision Valley Smooth Star Pursuit**:
  - Upgraded calibration from manual button taps to **Constellation Star Glide**: celestial glowing star glides along smooth curves while tracking gaze fixation and pursuit smoothness automatically.
- **My Haven Gamified 5-World Quest Hub**:
  - Transformed into a 5-world daily adventure camp (Sound Forest, Rune Realm, Vision Valley, Story Castle, Memory Mountains).
  - Added 🔥 Duolingo-style daily streak counter and weekly Mon–Sun streak tracker.
  - Added **Sensory Calm Mode**: single-tap header toggle providing soothing pastels, 50% slower motion, and peaceful chimes.
  - Added **"That's Enough for Today" Fatigue Guard**: displays cozy bedtime scene with sleepy Lumi mascot rewarding the child after completing daily goals.
  - Added **1-Click Printable Developmental Report Card** (`components/ui/PrintableReportCard.tsx`): print-optimized PDF certificate for parents, teachers, and specialists.

---

## 📂 Key File Map

| Path | Purpose |
| :--- | :--- |
| `app/page.tsx` | Main Homepage (Hero, 5 Worlds Explorer, 3 Tiers, Live Telemetry) |
| `app/screening/page.tsx` | 15-Minute Gamified Battery Intake Flow |
| `app/haven/page.tsx` | My Haven Gamified 5-World Daily Quest Camp |
| `app/doctor/page.tsx` | Specialist Command Center, RTI Curves, DALI PDF Export & IASQ |
| `components/ui/HarmonicFlowCanvas.tsx` | Camera Air-Wand Tracking Canvas with live PiP video & skeleton |
| `components/ui/PrintableReportCard.tsx` | 1-Click Printable PDF Developmental Report Card & Certificate |
| `components/screening/VisionValley.tsx` | Vision Valley with Smooth Constellation Star Pursuit |
| `components/screening/RuneRealm.tsx` | Child-optimized Rune Realm drawing arena |
| `components/ui/LanternMascot.tsx` | Animated SVG mascot with `sleepy`, `celebrating`, `encouraging` moods |

---

## 🛠️ Commands for Future Agents

```bash
# Start production server (Port 5000)
npx next start -p 5000

# Run full TypeScript & production build validation
npx next build

# Start public Cloudflare tunnel
npx -y cloudflared tunnel --url http://localhost:5000
```
