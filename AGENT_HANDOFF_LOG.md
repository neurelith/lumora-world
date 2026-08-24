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

---

## 📂 Key File Map

| Path | Purpose |
| :--- | :--- |
| `app/page.tsx` | Main Homepage (Hero, 5 Worlds Explorer, 3 Tiers, Live Telemetry) |
| `app/screening/page.tsx` | 15-Minute Gamified Battery Intake Flow |
| `app/haven/page.tsx` | My Haven Daily Practice Companion with Sensory Calm Mode |
| `app/doctor/page.tsx` | Specialist Command Center, RTI Curves, DALI PDF Export & IASQ |
| `components/ui/HarmonicFlowCanvas.tsx` | Camera Air-Wand Tracking Canvas |
| `components/ui/CustomCursor.tsx` | GPU-Accelerated Cursor with Subpixel Particle Physics |
| `components/ui/LanternMascot.tsx` | Lumi the Lantern Mascot SVG Animation Component |
| `lib/firebase.ts` & `lib/storage.ts` | Dual-layer IndexedDB + Firestore Data Sync Layer |
| `lib/dtw.ts` & `lib/oneEuroFilter.ts` | Kinematic Trajectory Matching & Smoothing Algorithms |
| `locales/en.json` & `locales/hi.json` | Bilingual Localization Dictionaries |
| `PRD_Lumora_World.md` | Single Source of Truth Product Requirement Document |

---

## 🛠️ Commands for Future Agents

```bash
# Start local development server (Port 5000)
npx next dev -p 5000 -H 0.0.0.0

# Run full TypeScript & production build validation
npx next build

# Start public Cloudflare tunnel
npx -y cloudflared tunnel --url http://localhost:5000

# Push updates to GitHub master
git push origin master
```
