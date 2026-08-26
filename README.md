# Lumora World ✦

> **A tablet-first, bilingual (English + Hindi) developmental screening triage & practice platform for primary schoolchildren (ages 5–8), aligned with DALI (Dyslexia Assessment for Languages of India by NBRC).**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

---

## 🌟 Overview

In India, an estimated **~8% of primary schoolchildren** experience Specific Learning Disabilities (SLD) such as dyslexia and dysgraphia. With only **3,890 registered clinical psychologists** nationwide (RCI, 2024), specialized clinical evaluations face severe bottleneck delays.

**Lumora World** bridges the early identification gap by transforming standard classroom tablets into non-stigmatizing, gamified triage environments. Children complete 15-minute multi-sensory activities across five exploratory worlds while the platform captures granular motor, phonemic, and naming practice indicators directly on-device.

```
                    ┌───────────────────────────────┐
                    │       Lumora World v2.0       │
                    └───────────────┬───────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│    Tier 1     │           │    Tier 2     │           │    Tier 3     │
│   Classroom   │           │   My Haven    │           │  Specialist   │
│   Screening   │           │   Companion   │           │ Telemetry Hub │
│ (15 min/child)│           │ (3 min/daily) │           │ (DALI Intake) │
└───────┬───────┘           └───────────────┘           └───────┬───────┘
        │                                                       │
        └───────────────────► Longitudinal Data ◄───────────────┘
```

---

## 📦 Reusable Interactive Cookbook & Architecture Archive

Looking to drop the custom **webcam hand tracking**, **star-to-fire morphing cursor**, **living mascot pupil gaze**, or **kinematic handwriting engines** into your own React / Next.js projects?

👉 **[Read the Full Interactive Architecture & UI Cookbook (`LUMORA_ARCHIVE_RECIPES.md`)](./LUMORA_ARCHIVE_RECIPES.md)**

### What's included in the cookbook:
- 🎨 **Anti-AI-Slop Design Taste System**: Duolingo Kids warmth + Apple HIG discipline, physical 3D button press physics, typography pairing (`Baloo 2` + `Lexend`), and warm paper color palettes.
- 📹 **Centralized Camera Singleton (`CameraService`)**: Reference-counted stream lifecycle manager preventing duplicate webcam locks and thermal throttling.
- 🪄 **Magic Air Wand & Morphing Cursor (`UniversalAirWand`)**: Full MediaPipe Hands 3D pinch detection formula ($\text{pinchRatio} = \frac{\sqrt{\Delta x^2 + \Delta y^2 + \Delta z^2}}{\max(\text{handSpan}, 0.08)}$), golden star-to-flame morph animation, 1.1s circular dwell progress halo, and global `wand-move` event dispatcher.
- 🐱 **Living Mascot Companion (`LanternMascot` & `InteractiveLumiCompanion`)**: Multi-frequency biological blinking loops ($2.4s + \text{rand}(0..2.2s)$) and 2D pupil gaze tracking following both mouse and webcam air wand.
- ✍️ **Kinematic Dysgraphia Engine (`lib/tracing.ts`)**: Number of Velocity Inversions (NVI), Normalized Jerk Index ($d^3x/dt^3$), and Latin & Devanagari spatial mirror letter reversal detection ($b \leftrightarrow d$, $p \leftrightarrow q$, $ट \leftrightarrow ठ$).
- 🚀 **5-Minute Copy-Paste Starter Template**: Ready-to-use self-contained code.

---

## 🗺️ The Five Exploratory Game Worlds

| World | Domain / Construct | Primary Practice Indicators Captured | Input Modality |
| :--- | :--- | :--- | :--- |
| **🪄 Rune Realm** | Motor Planning & Dysgraphia | Number of Velocity Inversions (NVI), Jerk Index, mirror letter reversals ($b \leftrightarrow d$, $p \leftrightarrow q$, $ट \leftrightarrow ठ$) | Camera Air-Wand (MediaPipe Hands) or Touch/Stylus Canvas |
| **🌿 Sound Forest** | Phonological Blending | Inter-phoneme pause tolerance, synthetic auditory blending latency, acoustic confusion pairs | Web Audio Synth & Tap Cards |
| **🏰 Story Castle** | Decoding Fluency | Voice onset hesitation latency, pronounceable nonword decoding accuracy, Akshara-Matra binding | Web Speech API (STT) + Teacher Verification |
| **🏔️ Memory Mountains** | Rapid Automatized Naming (RAN) | RAN naming pace (items/sec), hesitation gaps, sequencing error recovery | Precision Timed 5×5 Matrix Grid |
| **👁️ Vision Valley** | Visual Flow & Attention | Reading pacing flow, regression duration, visual progression cadence | Interactive Reading Tracker |

---

## 🏛️ Closed-Loop Support Architecture

### 1. Tier 1 · Classroom Screening Battery (`/screening`)
- Standardized 15-minute gamified battery administered by classroom teachers.
- Supports both **English** and **Devanagari Hindi** natively.
- Evaluates against grade-level normative thresholds (Grades 1–5).
- Generates an immediate 3-tier triage recommendation: **Typical Range**, **Worth a Closer Look (Watch)**, or **Recommend Follow-Up Soon**.

### 2. Tier 2 · My Haven Practice Companion (`/haven`)
- 3-minute self-guided daily practice quests with the **Lumora Lantern mascot**.
- Predictable **TEACCH visual schedule** structure with fading prompts based on Vygotsky's Zone of Proximal Development (ZPD).
- Includes **Sensory Calm Mode** (reduced motion, muted pastels, ambient brown-noise frequencies) for neurodiverse comfort.

### 3. Tier 3 · Specialist Telemetry Hub (`/doctor`)
- Password-protected portal for Clinical Psychologists and Special Educators.
- Cohort roster with 5-week **Response-to-Intervention (RTI)** longitudinal progress tracking.
- 1-Click **DALI Intake Packet generation** with printable clinical referral summaries.
- Integrated **Indian Autism Screening Questionnaire (IASQ)** 8-item behavioral screener.

---

## 🔒 Privacy & Clinical Ethics (By Design)

- **100% In-Memory Client-Side Processing**: Camera frames and audio buffers are processed in volatile memory only. No video, audio, or biometric media is ever recorded, stored, or transmitted.
- **Pseudonymous Student Records**: Only child initials and school/UDISE codes are collected. Zero PII (names, dates of birth, photos, emails) is required.
- **Offline-First Architecture**: Uses IndexedDB for reliable local classroom caching with optional Firebase cloud sync for district deployments.
- **Regulatory Alignment**: Designed to respect Indian Digital Personal Data Protection (DPDP) Act 2023 principles and international FERPA/COPPA student privacy standards.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router, React 18, TypeScript strict mode)
- **Styling**: Tailwind CSS 3+ with warm paper/amber/terracotta/sage clinical palette
- **Computer Vision / Kinematics**:
  - MediaPipe Hands (`@mediapipe/hands`, `@mediapipe/camera_utils`)
  - 1-Euro Adaptive Low-Pass Filter (Casiez et al., CHI 2012)
  - Dynamic Time Warping (DTW) & Modified Hausdorff Distance (MHD) Trajectory Matching
- **Speech & Audio**: Web Speech API (`SpeechSynthesis` + `SpeechRecognition`) & Web Audio API
- **Charts & Data Visualization**: Recharts (with `'use client'` SSR boundary)
- **Database & Auth**: Dual-layer architecture (IndexedDB primary + Firebase Firestore / Anonymous Auth)

---

## 🚀 Getting Started

### Prerequisites
- Node.js `18.17.0` or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/neurelith/lumora-world.git
cd lumora-world

# Install dependencies
npm install

# (Optional) Set up environment variables for Firebase Cloud Sync
cp .env.example .env.local
```

### Running Locally

```bash
# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

### Production Build

```bash
# Build optimized standalone production bundle
npm run build

# Start production server
npm run start
```

---

## 📁 Repository Structure

```
├── app/
│   ├── doctor/              # Specialist Telemetry Hub & DALI Export
│   ├── haven/               # My Haven 3-Minute Daily Practice Companion
│   ├── screening/           # 15-Minute Gamified Battery & Standalone Worlds
│   │   ├── rune-realm/      # Motor Planning Air-Wand Tracing
│   │   ├── sound-forest/    # Auditory Blending Module
│   │   ├── story-castle/    # Nonword Decoding & STT Module
│   │   ├── memory-mountains/# Timed RAN Matrix Grid
│   │   └── vision-valley/   # Visual Flow & Attention Tracker
│   ├── globals.css          # Design System & Custom Cursor CSS
│   ├── layout.tsx           # Root Layout & Metadata
│   └── page.tsx             # Interactive Homepage
├── components/
│   ├── screening/           # World Game Engines & Results Summary
│   └── ui/                  # Accessible Button, Card, Lantern Mascot, Custom Cursor
├── lib/
│   ├── dtw.ts               # Dynamic Time Warping & Hausdorff Trajectory Engine
│   ├── firebase.ts          # Dual-layer IndexedDB / Firestore Data Layer
│   ├── i18n.tsx             # Bilingual English/Hindi Localization Context
│   ├── oneEuroFilter.ts     # 1-Euro Adaptive Kinematic Filter
│   ├── storage.ts           # IndexedDB Local Persistence Engine
│   └── types.ts             # Strict TypeScript Domain Schemas
├── locales/
│   ├── en.json              # English strings
│   └── hi.json              # Devanagari Hindi strings
└── public/                  # Static assets & Service Worker
```

---

## ⚖️ Clinical Disclaimer

> **Lumora World is a first-pass screening triage tool and developmental practice companion, not a clinical diagnostic instrument.** For formal evaluation, children must be assessed by a certified clinical psychologist or special educator using standardized diagnostic batteries such as **DALI** (*Dyslexia Assessment for Languages of India* by National Brain Research Centre, NBRC).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
