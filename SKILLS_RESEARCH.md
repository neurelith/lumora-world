# Lumora World — Skills & Reference Research

> All reference repos downloaded to `references/` in the project directory.

---

## 1. Vision Valley — Gaze Tracking (HARDEST)

### NPM Packages Required
```
@mediapipe/face_mesh          # FaceMesh model (468 landmarks + iris)
@mediapipe/camera_utils       # Webcam frame loop helper
@mediapipe/drawing_utils      # Debug overlay drawing
@tensorflow/tfjs              # For optional regression model (calibration)
```

### Downloaded Reference Repos

| Repo | Path | What to Learn |
|:---|:---|:---|
| **GazePointSDK-Web** | `references/GazePointSDK-Web/` | **Primary reference.** Clean TypeScript architecture: `GazeTracker` → `FaceDetector` → `GazeEstimator` → `KalmanFilter`. Production-quality with calibration, blink detection, and Kalman smoothing. |
| **HueVision** | `references/hue-vision/` | Simpler implementation. Shows MediaPipe FaceMesh init + iris center extraction. Uses TF.js regression model to map eye features → screen coordinates. Has heatmap visualization. |
| **WebGazer** | `references/WebGazer/` | Mature library (Brown University). Comprehensive but large. Good for understanding calibration approaches. End-of-maintenance (v3.5.3, July 2025) but fully functional. |

### Key Implementation Patterns (from GazePointSDK-Web)

**Iris landmark indices (MediaPipe):**
- Left iris: indices `468, 469, 470, 471, 472` (center = 468)
- Right iris: indices `473, 474, 475, 476, 477` (center = 473)
- Left eye corners: inner=`133`, outer=`33`
- Right eye corners: inner=`362`, outer=`263`

**Gaze estimation formula** (from `GazeEstimator.ts`):
```typescript
// Iris ratio = where iris sits within the eye opening (0=inner, 1=outer)
const rx = (irisRatioX(leftIris, leftInner, leftOuter) + 
            irisRatioX(rightIris, rightInner, rightOuter)) / 2;
const ry = (irisRatioY(leftIris, leftTop, leftBottom) + 
            irisRatioY(rightIris, rightTop, rightBottom)) / 2;

// Map to screen coordinates with head pose compensation
const lookX = mirrored ? 1 - rx : rx;
const lookY = 0.5 + (ry - 0.5) * 0.35;
x += ((headPose.yaw) / 45) * width * 0.12;
y -= ((headPose.pitch - 8) / 45) * height * 0.12;
```

**Blink detection** (Eye Aspect Ratio):
```typescript
const EAR = (v1 + v2) / (2.0 * h);  // vertical / horizontal ratio
const isBlinking = EAR < 0.22;       // threshold
```

**Kalman filter** for smoothing gaze jitter — essential for usable tracking.

### Fixation & Saccade Detection (for Lumora)
This is NOT in the reference repos — we need to build it:
```typescript
// Fixation: gaze stays within ~50px radius for >100ms
// Saccade: rapid gaze jump between fixations
// Regressive saccade: saccade going RIGHT-to-LEFT (backward reading)
// Mean fixation duration >400ms = decoding friction indicator
```

### Gotchas
- **MUST** set `refineLandmarks: true` to get iris indices 468-477
- FaceMesh init takes 2-4 seconds — show loading state
- Camera permission can be denied — Vision Valley must degrade gracefully
- Works poorly in low light — add a "make sure the room is well-lit" prompt
- The `@mediapipe/face_mesh` CDN approach uses WASM under the hood

---

## 2. Rune Realm — Handwriting Tracing (COMPLEX)

### NPM Packages Required
```
# No external packages needed — uses raw browser APIs
# PointerEvent API is native (supported in all modern browsers)
# Canvas API is native
```

### Downloaded Reference Repos

| Repo | Path | What to Learn |
|:---|:---|:---|
| **atrament.js** | `references/atrament/` | Lightweight canvas drawing library. Shows clean PointerEvent setup (`pointerdown`, `pointermove`, `pointerup`) and smooth stroke rendering with Bézier curves. |
| **dysgraphia-detection** | `references/dysgraphia-detection/` | Academic ML approach to dysgraphia. Python/PyTorch — not directly usable, but shows feature extraction methodology (what metrics matter clinically). |

### Key Implementation Patterns

**PointerEvent capture** (from atrament's `pointer-events.js`):
```typescript
canvas.addEventListener('pointermove', (e) => {
  if (!e.isPrimary) return;  // Ignore multi-touch
  e.preventDefault();
  const point = {
    x: e.clientX - canvas.getBoundingClientRect().left,
    y: e.clientY - canvas.getBoundingClientRect().top,
    t: e.timeStamp,
    p: e.pressure  // 0-1, available on stylus/touch
  };
  strokePoints.push(point);
});
```

**NVI (Number of Velocity Inversions)** — must build from scratch:
```typescript
function computeNVI(points: StrokePoint[]): number {
  const velocities = [];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i-1].x;
    const dy = points[i].y - points[i-1].y;
    const dt = points[i].t - points[i-1].t;
    velocities.push(Math.sqrt(dx*dx + dy*dy) / Math.max(dt, 1));
  }
  
  // Count sign changes in velocity derivative (acceleration)
  let inversions = 0;
  for (let i = 2; i < velocities.length; i++) {
    const accelPrev = velocities[i-1] - velocities[i-2];
    const accelCurr = velocities[i] - velocities[i-1];
    if (accelPrev * accelCurr < 0) inversions++;  // Sign change
  }
  return inversions;
}
```

**Centerline deviation** — measure distance from ideal trajectory:
```typescript
function centerlineDeviation(actual: Point[], template: Point[]): number {
  // For each actual point, find nearest template point
  // Return mean distance
}
```

**Mirror reversal detection** (b↔d, p↔q):
```typescript
// Compare stroke trajectory direction against template
// If horizontal component is inverted → mirror reversal
```

### Gotchas
- Apply smoothing (moving average, window=3) to raw pointer data before velocity calculation
- Pen-lift count = number of `pointerup` events during a single character trace
- Pressure data (`e.pressure`) is only meaningful on touch/stylus — mouse always returns 0.5
- Use `touch-action: none` CSS on canvas to prevent scroll interference

---

## 3. Sound Forest — Phoneme Blending

### NPM Packages Required
```
react-speech-recognition     # Clean React hooks for SpeechRecognition API
# SpeechSynthesis is native — no package needed
```

### Key Implementation Patterns

**Phoneme playback via SpeechSynthesis:**
```typescript
function speakPhoneme(phoneme: string, lang: string = 'en-US') {
  const utterance = new SpeechSynthesisUtterance(phoneme);
  utterance.rate = 0.7;   // Slow for clarity
  utterance.pitch = 1.0;
  utterance.lang = lang;  // 'hi-IN' for Hindi
  window.speechSynthesis.speak(utterance);
}
```

### Gotchas
- **SpeechSynthesis does NOT support phoneme-level SSML** (`<phoneme>` tags are stripped)
- **Workaround for phonemes**: Use phonetic spellings ("buh", "aah", "tuh") or pre-recorded audio clips
- **Hindi phonemes**: SpeechSynthesis quality for Hindi varies by browser — prepare fallback audio clips in `public/audio/`
- Don't run SpeechSynthesis and SpeechRecognition simultaneously — audio conflicts
- Chrome has a bug where `speechSynthesis.speak()` silently fails after ~15 seconds of inactivity — call `speechSynthesis.cancel()` before each new utterance

---

## 4. Story Castle — Word Reading

### NPM Packages Required
```
react-speech-recognition     # Same as Sound Forest
```

### Key Implementation Patterns

**Speech Recognition in React:**
```typescript
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

// Start listening for child's voice
SpeechRecognition.startListening({ language: 'en-US' });

// Compare transcript to target nonword
const isCorrect = transcript.toLowerCase().includes(targetWord.toLowerCase());
```

### Gotchas
- SpeechRecognition requires HTTPS (or localhost) — works on Vercel but not `http://`
- Requires microphone permission — must handle denial gracefully
- Teacher fallback mode (thumbs-up/down buttons) should be the DEFAULT in noisy classrooms
- `react-speech-recognition` auto-handles vendor prefixes (`webkitSpeechRecognition`)
- Hindi speech recognition (`hi-IN` locale) works in Chrome but quality varies

---

## 5. Memory Mountains — RAN

### NPM Packages Required
```
# No external packages — pure React component with timer
```

### Implementation Notes
- Simplest world to build — 5×5 grid of colored shapes + teacher timer
- Use `performance.now()` for precise timing
- Calculate: `ranRate = 25 / (endTime - startTime) * 1000` (items per second)
- Teacher taps grid items to flag naming errors

---

## 6. Doctor Hub — Dashboard & Charts

### NPM Packages Required
```
recharts                     # SVG chart library for React
react-to-print              # PDF/print generation for DALI referral packet
```

### Key Implementation Patterns

**Recharts in Next.js App Router** — MUST use `'use client'` directive:
```tsx
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RTIChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="accuracy" fill="#81B29A" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### Gotchas
- Recharts uses SVG — will cause hydration errors without `'use client'`
- Wrap ALL chart components in `<ResponsiveContainer>` for proper sizing
- Use `React.memo()` on chart components to prevent unnecessary re-renders

---

## 7. Project Scaffold — Next.js + Firebase + Tailwind

### NPM Packages Required (Full List)
```bash
# Core
npx create-next-app@latest lumora-world --typescript --tailwind --app --no-eslint

# Firebase
npm install firebase

# Gaze tracking
npm install @mediapipe/face_mesh @mediapipe/camera_utils @mediapipe/drawing_utils
npm install @tensorflow/tfjs

# Speech
npm install react-speech-recognition
npm install --save-dev @types/dom-speech-recognition

# Charts (Doctor Hub)
npm install recharts

# Print (DALI referral packet)
npm install react-to-print

# Fonts
# Loaded via Google Fonts link in layout.tsx — no npm package needed
```

### Firebase Setup
```typescript
// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Anonymous Auth (for Screening)
```typescript
import { signInAnonymously } from "firebase/auth";
const userCredential = await signInAnonymously(auth);
// Use userCredential.user.uid to key session data
```

---

## 8. Summary: Complete Package List

```json
{
  "dependencies": {
    "firebase": "^11.x",
    "@mediapipe/face_mesh": "^0.4.x",
    "@mediapipe/camera_utils": "^0.3.x",
    "@mediapipe/drawing_utils": "^0.3.x",
    "@tensorflow/tfjs": "^4.x",
    "react-speech-recognition": "^3.x",
    "recharts": "^2.x",
    "react-to-print": "^3.x"
  },
  "devDependencies": {
    "@types/dom-speech-recognition": "^0.0.4"
  }
}
```

---

## 9. Reference Repos Downloaded

| Repo | GitHub URL | Local Path | Purpose |
|:---|:---|:---|:---|
| GazePointSDK-Web | `Tareq-Ghassan/GazePointSDK-Web` | `references/GazePointSDK-Web/` | **Primary** gaze tracking reference — TypeScript, clean architecture |
| HueVision | `simplysuvi/hue-vision` | `references/hue-vision/` | Simpler gaze tracking with TF.js regression + heatmap |
| WebGazer | `brownhci/WebGazer` | `references/WebGazer/` | Mature calibration approach, academic-grade |
| atrament.js | `jakubfiala/atrament` | `references/atrament/` | Canvas drawing with PointerEvent handling |
| dysgraphia-detection | `AILab-UniFI/dysgraphia-detection` | `references/dysgraphia-detection/` | Academic feature extraction for dysgraphia |

---

## 10. Key Files to Study Before Building

| File | Why |
|:---|:---|
| `references/GazePointSDK-Web/src/core/GazeEstimator.ts` | Iris-ratio → screen-coordinate mapping with calibration |
| `references/GazePointSDK-Web/src/core/GazeTracker.ts` | Full tracking loop: FaceDetector → GazeEstimator → Kalman filter |
| `references/GazePointSDK-Web/src/utils/KalmanFilter.ts` | Kalman smoothing implementation for gaze jitter |
| `references/hue-vision/js/facetracker.js` | MediaPipe FaceMesh init + iris center extraction |
| `references/hue-vision/js/training.js` | TF.js regression model training for gaze mapping |
| `references/atrament/src/pointer-events.js` | Clean PointerEvent setup pattern |
