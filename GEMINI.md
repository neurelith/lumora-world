# Lumora World — Workspace Rules

## Project Overview
You are building **Lumora World** — a tablet-first, bilingual (English + Hindi) web platform that screens children (ages 5-8) for dyslexia, dysgraphia, and neurodevelopmental markers through 5 game-worlds.

## Mandatory First Steps
1. **Read the PRD first**: `PRD_Lumora_World.md` is the single source of truth. It contains the complete file structure, component specs, data model, and phased build checklist. Follow it exactly.
2. **Read the relevant skill BEFORE building each component**:
   - Building Vision Valley? → Read `.agents/skills/lumora-gaze-tracking/SKILL.md`
   - Building Rune Realm? → Read `.agents/skills/lumora-handwriting-kinematics/SKILL.md`
   - Building Sound Forest or Story Castle? → Read `.agents/skills/lumora-speech-phonetics/SKILL.md`
   - Building any UI? → Read `.agents/skills/lumora-child-ui-ux/SKILL.md`
3. **Reference repos** are in `references/` — study `GazePointSDK-Web/src/core/` for gaze tracking patterns and `atrament/src/pointer-events.js` for canvas input handling.

## Tech Stack (Non-Negotiable)
- **Framework**: Next.js 14+ with App Router, TypeScript strict mode
- **Styling**: Tailwind CSS 3+ with the Lumora color palette defined in PRD Section 8.2
- **Backend**: Firebase (Firestore + Auth) — Anonymous auth for children, Email auth for specialists
- **CV/ML**: TensorFlow.js + MediaPipe Face Mesh (`refineLandmarks: true`)
- **Audio**: Web Speech API (SpeechSynthesis + SpeechRecognition) via `react-speech-recognition`
- **Canvas**: HTML5 Canvas + PointerEvent API (native, no library)
- **Charts**: Recharts (with `'use client'` directive)
- **Deploy**: Vercel
- **Fonts**: Baloo 2 (headings, Devanagari) + Lexend (body, dyslexia-optimized) via Google Fonts

## Build Order (Follow Exactly)
Phase 0 → Phase 1 (Vision Valley) → Phase 2 (Rune Realm) → Phase 3 (Sound Forest) → Phase 4 (Story Castle) → Phase 5 (Memory Mountains) → Phase 6 (Screening Flow) → Phase 7 (Haven) → Phase 8 (Doctor Hub) → Phase 9 (Polish)

## Design Rules
- **Duolingo Kids warmth + Apple design discipline** — warm, playful, intentional. NOT generic AI-slop.
- Touch targets >= 56px. Answer cards >= 72px height.
- Never say "Wrong" to a child — use encouraging language (see PRD Section 9.3).
- The Lumora Lantern is the mascot — an SVG with 3 moods: neutral, encouraging, celebrating.
- Use the brand palette ONLY: Ink `#2B2A33`, Amber `#E8A33D`, Paper `#F4F2F6`, plus world accents.
- Micro-animations use spring/bounce physics, not linear easing.

## Firebase Rules
- Children: Anonymous auth, pseudonymous data only (initials + grade, no names/photos/emails).
- Specialists: Email/password auth for Doctor Hub.
- IASQ autism screening: Hidden from main nav, accessible only from Doctor Hub.

## i18n
- Bilingual from day one: English (`en.json`) + Hindi (`hi.json`).
- All user-facing strings must go through the locale system.
- Fonts (Baloo 2, Lexend) support both Latin and Devanagari.

## Privacy (Hard Constraint)
- Camera frames: processed in-memory only, never stored or transmitted.
- Audio buffers: processed in-memory only, never stored.
- No third-party analytics, tracking pixels, or ad SDKs.

## Key Dependencies
```json
{
  "firebase": "^11.x",
  "@mediapipe/face_mesh": "^0.4.x",
  "@mediapipe/camera_utils": "^0.3.x",
  "@mediapipe/drawing_utils": "^0.3.x",
  "@tensorflow/tfjs": "^4.x",
  "react-speech-recognition": "^3.x",
  "recharts": "^2.x",
  "react-to-print": "^3.x"
}
```

## Assets Available
- `lumora_logo_transparent.png` — transparent logo, copy to `public/` during scaffold
- `lumora_logo.png` — logo with background
- `logo.png` — original source logo

## Clinical Disclaimer (Must Include)
Every results page and printable summary must display:
> *Lumora World is a first-pass screening triage tool and developmental practice companion, not a clinical diagnostic instrument. For formal evaluation, children must be assessed by a certified clinical psychologist or special educator using standardized batteries such as DALI (Dyslexia Assessment for Languages of India by NBRC).*
