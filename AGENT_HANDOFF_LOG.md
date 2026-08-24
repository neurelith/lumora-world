# 🤖 Lumora World — Agent Collaboration & Handoff Log

> **Note for Hermes / Future AI Agents:**  
> This log documents the architectural decisions, recent changes, active ports, tunnels, and repository synchronization details for **Lumora World**. Read this document to understand the codebase state and continue seamlessly.

---

## 📌 Project Quick Reference

- **Project Name**: Lumora World
- **Description**: Tablet-first, bilingual (English + Hindi) developmental screening triage & adaptive practice platform for primary schoolchildren (ages 5–8), aligned with DALI (*Dyslexia Assessment for Languages of India* by NBRC).
- **GitHub Repository**: [https://github.com/neurelith/lumora-world](https://github.com/neurelith/lumora-world)
- **Active Production Server**: `http://localhost:5000` (`next start -p 5000` — compiled static production mode)
- **Active Public Cloudflare Tunnel**: `https://agent-policies-worldwide-alternate.trycloudflare.com`

---

## 🕒 Chronological Changelog & Key Decisions

### 1. Production Build & Mobile CSS Fix (Latest)
- **Root Cause of Mobile Unstyled Glitch**: The previous dev server (`next dev`) rotated CSS version timestamps on every request, resulting in HTTP 404 for CSS assets over Cloudflare tunnels. Switched to `next start -p 5000` with static hashed CSS bundles (`1d80b516771237d3.css` - 70 KB), resolving all styling and unstyled font issues.
- **Mobile Hamburger Navigation**: Implemented clean responsive header with mobile drawer toggle for Worlds, 3-Tier Approach, Privacy, EN/हि language switch, and Specialist Hub.
- **Mobile Touch Sizing & Typography**: Responsive H1 typography (`text-3xl sm:text-5xl md:text-[4.25rem]`), visible mobile stat badges (`3,890`, `5–8 yrs`, `~8%`), and centered mascot island.
- **Ponytail Dependency Cleanup**: Pruned 8 unused npm packages (`@tensorflow/tfjs`, `canvas-confetti`, `react-to-print`, `react-speech-recognition`, `tailwind-merge`, `clsx`, etc.) saving ~3MB bundle footprint.

### 2. Content Accuracy & Clinical Guardrails
- **Removed Overclaiming Language**: Replaced unverified diagnostic claims ("iris gaze tracking", "biomarkers", "clinical signals") with accurate screening triage terminology:
  - Top Badge: `"Camera Air-Tracing · Works on Any Classroom Tablet"`
  - Hero Subtext: `"Five gentle game worlds that paint letters, blend sounds and time naming in the air — capturing practice signals that help teachers flag a child who could benefit from a closer look."`
  - Stat 1: `"3,890"` — *"Registered clinical psychologists in India (RCI, 2024)"*
  - Stat 2: `"~8%"` — *"Pooled SLD prevalence in Indian schoolchildren (meta-analysis)"*
  - Stat 3: `"Ages 5–8"` — *"Critical primary window for early classroom triage"*
- **Mandatory Clinical Disclaimer**: Embedded across all result summaries and reports:
  > *"Lumora World is a first-pass screening triage tool and developmental practice companion, not a clinical diagnostic instrument. For formal evaluation, children must be assessed by a certified clinical psychologist or special educator using standardized batteries such as DALI (Dyslexia Assessment for Languages of India by NBRC)."*

### 3. Upgraded Design System & UX
- **Apple HIG Discipline + Duolingo Kids Warmth**: Warm cream palette (`--paper: #F4F2F6`, `--ink: #2B2A33`, `--terracotta: #C96442`, `--amber: #E8A33D`, `--sage: #4E6B50`).
- **Lumi Lantern Mascot**: Dynamic SVG companion with responsive mood animations.
- **Hardware-Accelerated GPU Cursor**: DPR-compensated subpixel trail in `components/ui/CustomCursor.tsx`.
- **Large Touch Ergonomics**: Minimum $56\text{px}$ interactive buttons, $72\text{px}$ answer tiles for primary school tablet use.

### 4. Five DALI-Aligned Game Worlds
1. **Rune Realm (`/screening/rune-realm`)**: Camera air-wand kinematic trajectory tracking, Number of Velocity Inversions (NVI), Jerk Index, spatial mirror reversal detection ($b \leftrightarrow d$, $p \leftrightarrow q$, $ट \leftrightarrow ठ$).
2. **Sound Forest (`/screening/sound-forest`)**: Auditory phonemic blending trials, synthetic speech synthesis, acoustic confusion pairs.
3. **Story Castle (`/screening/story-castle`)**: Pronounceable nonword decoding, Akshara-Matra binding, Web Speech STT.
4. **Memory Mountains (`/screening/memory-mountains`)**: Rapid Automatized Naming (RAN) timed 5×5 grid matrix.
5. **Vision Valley (`/screening/vision-valley`)**: Reading flow tracking, visual pacing, regression cadence.

### 5. 3-Tier Closed-Loop Architecture
- **Tier 1 (Screening)**: 15-minute gamified battery (`/screening`) with 3-tier triage (`typical`, `watch`, `follow-up`).
- **Tier 2 (My Haven)**: 3-minute self-guided daily practice (`/haven`) with TEACCH visual schedule and Sensory Calm Mode.
- **Tier 3 (Specialist Hub)**: Password-protected telemetry dashboard (`/doctor`) with 5-week RTI longitudinal graphs, DALI intake packets, and IASQ screener.

---

## 📂 Key File Map

| Path | Purpose |
| :--- | :--- |
| `app/page.tsx` | Main Homepage (Hero, 5 Worlds Explorer, 3 Tiers, Mobile Nav Drawer) |
| `app/screening/page.tsx` | 15-Minute Gamified Battery Intake Flow |
| `app/haven/page.tsx` | My Haven Daily Practice Companion with Sensory Calm Mode |
| `app/doctor/page.tsx` | Specialist Command Center, RTI Curves, DALI PDF Export & IASQ |
| `components/ui/HarmonicFlowCanvas.tsx` | Camera Air-Wand Tracking Canvas |
| `components/ui/CustomCursor.tsx` | GPU-Accelerated Cursor with Subpixel Particle Physics |
| `components/ui/LanternMascot.tsx` | Lumi the Lantern Mascot SVG Animation Component |
| `lib/firebase.ts` & `lib/storage.ts` | Dual-layer IndexedDB + Firestore Data Sync Layer |
| `lib/dtw.ts` & `lib/oneEuroFilter.ts` | Kinematic Trajectory Matching & Smoothing Algorithms |
| `locales/en.json` & `locales/hi.json` | Bilingual Localization Dictionaries |

---

## 🛠️ Commands for Future Agents

```bash
# Build production bundle
npx next build

# Start production server (Port 5000)
npx next start -p 5000

# Start public Cloudflare tunnel
npx -y cloudflared tunnel --url http://localhost:5000

# Push updates to GitHub master
git push origin master
```
