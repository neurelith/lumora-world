// lib/gaze-real.ts — Real MediaPipe Face Mesh Gaze Estimation
// Replaces simulated gaze with actual iris/pupil tracking using 468 face landmarks

export type Point2D = { x: number; y: number };

const IRIS_LANDMARKS = {
  LEFT_IRIS: [468, 469, 470, 471], // MediaPipe Iris indices (left eye)
  RIGHT_IRIS: [473, 474, 475, 476], // right eye
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_OUTER: 362,
  RIGHT_EYE_INNER: 263,
  NOSE_TIP: 1,
};

interface FaceMeshResult {
  multiFaceLandmarks: any[][]; // [face][landmark]
}

interface GazeCalibrationPoint {
  screenX: number;
  screenY: number;
  irisCenterNorm: { x: number; y: number };
  timestamp: number;
}

interface GazeSample {
  x: number;
  y: number;
  t: number;
  confidence: number;
}

export class RealGazeTracker {
  private faceMesh: any = null;
  private camera: any = null;
  private videoRef: HTMLVideoElement | null = null;
  private calibrationPoints: GazeCalibrationPoint[] = [];
  private isCalibrated = false;
  private gazeCallback: ((gaze: GazeSample) => void) | null = null;
  private canvasOverlay: HTMLCanvasElement | null = null;
  private lastGaze: GazeSample | null = null;
  private smoothingBuffer: GazeSample[] = [];
  private readonly SMOOTH_WINDOW = 5;
  private readonly CONFIDENCE_THRESHOLD = 0.6;

  async initialize(videoElement: HTMLVideoElement, canvasOverlay?: HTMLCanvasElement): Promise<boolean> {
    this.videoRef = videoElement;
    this.canvasOverlay = canvasOverlay || null;

    try {
      // Dynamic import MediaPipe Face Mesh
      const { FaceMesh } = await import('@mediapipe/face_mesh');
      const { Camera } = await import('@mediapipe/camera_utils');

      this.faceMesh = new FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true, // Critical for iris landmarks (468-477)
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      this.faceMesh.onResults((results: FaceMeshResult) => this.onFaceMeshResults(results));

      this.camera = new Camera(this.videoRef, {
        onFrame: async () => {
          if (this.faceMesh && this.videoRef) {
            await this.faceMesh.send({ image: this.videoRef });
          }
        },
        width: 640,
        height: 480,
      });

      await this.camera.start();
      return true;
    } catch (err) {
      console.error('RealGazeTracker init failed:', err);
      return false;
    }
  }

  private onFaceMeshResults(results: FaceMeshResult) {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];

    // Extract iris centers (normalized 0-1)
    const leftIris = this.getIrisCenter(landmarks, IRIS_LANDMARKS.LEFT_IRIS);
    const rightIris = this.getIrisCenter(landmarks, IRIS_LANDMARKS.RIGHT_IRIS);

    if (!leftIris || !rightIris) return;

    // Average both eyes for robust gaze
    const avgIris = {
      x: (leftIris.x + rightIris.x) / 2,
      y: (leftIris.y + rightIris.y) / 2,
    };

    // Eye corner references for normalization
    const leftEyeOuter = landmarks[IRIS_LANDMARKS.LEFT_EYE_OUTER];
    const leftEyeInner = landmarks[IRIS_LANDMARKS.LEFT_EYE_INNER];
    const rightEyeOuter = landmarks[IRIS_LANDMARKS.RIGHT_EYE_OUTER];
    const rightEyeInner = landmarks[IRIS_LANDMARKS.RIGHT_EYE_INNER];

    if (!leftEyeOuter || !leftEyeInner || !rightEyeOuter || !rightEyeInner) return;

    // Normalize iris position within eye bounding box
    const eyeWidth = Math.max(
      Math.abs(rightEyeInner.x - leftEyeOuter.x),
      Math.abs(leftEyeInner.x - rightEyeOuter.x)
    );

    const normalizedX = (avgIris.x - leftEyeOuter.x) / Math.max(0.01, eyeWidth);
    const normalizedY = (avgIris.y - leftEyeOuter.y) / Math.max(0.01, eyeWidth);

    // Clamp
    const gazeX = Math.max(0, Math.min(1, normalizedX));
    const gazeY = Math.max(0, Math.min(1, normalizedY));

    // If calibrated, map to screen coordinates
    if (this.isCalibrated && this.calibrationPoints.length >= 4) {
      const screenGaze = this.mapToScreen(gazeX, gazeY);
      if (screenGaze) {
        const sample: GazeSample = {
          x: screenGaze.x,
          y: screenGaze.y,
          t: performance.now(),
          confidence: 0.85,
        };
        this.addSmoothedSample(sample);
      }
    }

    // Debug overlay
    if (this.canvasOverlay && this.videoRef) {
      this.drawDebugOverlay(landmarks, leftIris, rightIris);
    }
  }

  private getIrisCenter(landmarks: any[], irisIndices: number[]): { x: number; y: number } | null {
    const valid = irisIndices.filter(i => landmarks[i]).map(i => landmarks[i]);
    if (valid.length === 0) return null;
    return {
      x: valid.reduce((sum, p) => sum + (typeof p.x === 'number' ? p.x : p[0]), 0) / valid.length,
      y: valid.reduce((sum, p) => sum + (typeof p.y === 'number' ? p.y : p[1]), 0) / valid.length,
    };
  }

  private addSmoothedSample(sample: GazeSample) {
    this.smoothingBuffer.push(sample);
    if (this.smoothingBuffer.length > this.SMOOTH_WINDOW) {
      this.smoothingBuffer.shift();
    }

    // Weighted average (newer samples weigh more)
    const totalWeight = this.smoothingBuffer.reduce((sum, _, i) => sum + (i + 1), 0);
    const weighted = this.smoothingBuffer.reduce(
      (acc, s, i) => {
        const w = (i + 1) / totalWeight;
        return { x: acc.x + s.x * w, y: acc.y + s.y * w };
      },
      { x: 0, y: 0 }
    );

    this.lastGaze = { ...sample, x: weighted.x, y: weighted.y };
    this.gazeCallback?.(this.lastGaze);
  }

  // Calibration: collect iris positions at known screen points
  addCalibrationPoint(screenX: number, screenY: number): boolean {
    if (!this.lastGaze || this.lastGaze.confidence < this.CONFIDENCE_THRESHOLD) {
      return false;
    }

    this.calibrationPoints.push({
      screenX,
      screenY,
      irisCenterNorm: { x: this.lastGaze.x, y: this.lastGaze.y },
      timestamp: Date.now(),
    });

    if (this.calibrationPoints.length >= 4) {
      this.isCalibrated = true;
    }
    return true;
  }

  // Bilinear interpolation from calibration points
  private mapToScreen(normX: number, normY: number): { x: number; y: number } | null {
    if (this.calibrationPoints.length < 4) return null;

    // Find 4 corners: TL, TR, BL, BR
    const corners = this.calibrationPoints.slice(-5); // Last 5 calibration points
    const tl = corners.find(p => p.screenX < 0.5 && p.screenY < 0.5);
    const tr = corners.find(p => p.screenX >= 0.5 && p.screenY < 0.5);
    const bl = corners.find(p => p.screenX < 0.5 && p.screenY >= 0.5);
    const br = corners.find(p => p.screenX >= 0.5 && p.screenY >= 0.5);

    if (!tl || !tr || !bl || !br) return null;

    // Interpolate in normalized iris space
    const xRatio = (normX - tl.irisCenterNorm.x) / (tr.irisCenterNorm.x - tl.irisCenterNorm.x);
    const yRatio = (normY - tl.irisCenterNorm.y) / (bl.irisCenterNorm.y - tl.irisCenterNorm.y);

    const screenX = tl.screenX + xRatio * (tr.screenX - tl.screenX);
    const screenY = tl.screenY + yRatio * (bl.screenY - tl.screenY);

    return { x: Math.max(0, Math.min(1, screenX)), y: Math.max(0, Math.min(1, screenY)) };
  }

  private drawDebugOverlay(
    landmarks: any[],
    leftIris: { x: number; y: number },
    rightIris: { x: number; y: number }
  ) {
    if (!this.canvasOverlay || !this.videoRef) return;
    const ctx = this.canvasOverlay.getContext('2d');
    if (!ctx) return;

    const vw = this.videoRef.videoWidth;
    const vh = this.videoRef.videoHeight;
    const cw = this.canvasOverlay.width;
    const ch = this.canvasOverlay.height;
    const scaleX = cw / vw;
    const scaleY = ch / vh;

    ctx.clearRect(0, 0, cw, ch);

    // Draw iris markers
    [leftIris, rightIris].forEach(iris => {
      ctx.beginPath();
      ctx.arc(iris.x * cw, iris.y * ch, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(47, 168, 160, 0.9)';
      ctx.fill();
      ctx.strokeStyle = '#2B2A33';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw last gaze point on canvas
    if (this.lastGaze) {
      ctx.beginPath();
      ctx.arc(this.lastGaze.x * cw, this.lastGaze.y * ch, 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#E8A33D';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  onGaze(callback: (gaze: GazeSample) => void) {
    this.gazeCallback = callback;
  }

  getLastGaze(): GazeSample | null {
    return this.lastGaze;
  }

  isReady(): boolean {
    return this.isCalibrated && this.faceMesh !== null;
  }

  getCalibrationProgress(): number {
    return Math.min(100, (this.calibrationPoints.length / 5) * 100);
  }

  async stop() {
    if (this.camera) {
      await this.camera.stop();
    }
    this.faceMesh = null;
    this.camera = null;
  }
}

// ============================================================================
// Reading Scanpath Analyzer (unchanged API, now fed by real gaze)
// ============================================================================

interface Fixation {
  x: number;
  y: number;
  startTime: number;
  endTime: number;
  duration: number;
}

interface Saccade {
  from: { x: number; y: number };
  to: { x: number; y: number };
  amplitude: number;
  duration: number;
  isRegressive: boolean;
}

export class GazeAnalyzer {
  private samples: GazeSample[] = [];
  private fixations: Fixation[] = [];
  private saccades: Saccade[] = [];
  private readonly FIXATION_RADIUS_PX = 40; // ~1.5 deg visual angle
  private readonly MIN_FIXATION_DURATION = 80; // ms
  private readonly MAX_SACCADE_VELOCITY = 500; // px/s

  reset() {
    this.samples = [];
    this.fixations = [];
    this.saccades = [];
  }

  addSample(x: number, y: number, t: number) {
    this.samples.push({ x, y, t, confidence: 1 });
  }

  getMetrics() {
    if (this.samples.length < 10) {
      return this.getEmptyMetrics();
    }

    this.detectFixationsAndSaccades();

    const fixationDurations = this.fixations.map(f => f.duration);
    const meanFixationDuration = fixationDurations.length > 0
      ? fixationDurations.reduce((a, b) => a + b, 0) / fixationDurations.length
      : 0;

    const regressiveSaccades = this.saccades.filter(s => s.isRegressive);
    const regressiveRatio = this.saccades.length > 0
      ? regressiveSaccades.length / this.saccades.length
      : 0;

    // Dispersion = spatial spread of fixations
    const xs = this.fixations.map(f => f.x);
    const ys = this.fixations.map(f => f.y);
    const dispersion = Math.sqrt(
      Math.pow(Math.max(...xs) - Math.min(...xs), 2) +
      Math.pow(Math.max(...ys) - Math.min(...ys), 2)
    );

    return {
      meanFixationDurationMs: Math.round(meanFixationDuration),
      regressiveSaccadeRatio: Number(regressiveRatio.toFixed(3)),
      totalFixations: this.fixations.length,
      totalSaccades: this.saccades.length,
      gazeDispersionScore: Number(dispersion.toFixed(1)),
    };
  }

  private detectFixationsAndSaccades() {
    if (this.samples.length < 3) return;

    let currentFixation: { points: GazeSample[]; startTime: number } | null = null;

    for (let i = 0; i < this.samples.length; i++) {
      const sample = this.samples[i];

      if (!currentFixation) {
        currentFixation = { points: [sample], startTime: sample.t };
        continue;
      }

      const centroid = this.getCentroid(currentFixation.points);
      const dist = Math.hypot(sample.x - centroid.x, sample.y - centroid.y);

      if (dist <= this.FIXATION_RADIUS_PX) {
        currentFixation.points.push(sample);
      } else {
        // End fixation
        const duration = sample.t - currentFixation.startTime;
        if (duration >= this.MIN_FIXATION_DURATION) {
          this.fixations.push({
            x: centroid.x,
            y: centroid.y,
            startTime: currentFixation.startTime,
            endTime: sample.t,
            duration,
          });

          // Detect saccade from previous fixation
          if (this.fixations.length >= 2) {
            const prev = this.fixations[this.fixations.length - 2];
            const curr = this.fixations[this.fixations.length - 1];
            const amp = Math.hypot(curr.x - prev.x, curr.y - prev.y);
            const dur = curr.startTime - prev.endTime;
            const velocity = amp / Math.max(1, dur) * 1000; // px/s

            if (velocity > 50 && velocity < this.MAX_SACCADE_VELOCITY) {
              // Regressive = right-to-left (for LTR reading)
              const isRegressive = curr.x < prev.x - 10;
              this.saccades.push({
                from: { x: prev.x, y: prev.y },
                to: { x: curr.x, y: curr.y },
                amplitude: amp,
                duration: dur,
                isRegressive,
              });
            }
          }
        }
        currentFixation = { points: [sample], startTime: sample.t };
      }
    }

    // Handle final fixation
    if (currentFixation && currentFixation.points.length > 2) {
      const lastSample = this.samples[this.samples.length - 1];
      const duration = lastSample.t - currentFixation.startTime;
      if (duration >= this.MIN_FIXATION_DURATION) {
        const centroid = this.getCentroid(currentFixation.points);
        this.fixations.push({
          x: centroid.x,
          y: centroid.y,
          startTime: currentFixation.startTime,
          endTime: lastSample.t,
          duration,
        });
      }
    }
  }

  private getCentroid(points: GazeSample[]): { x: number; y: number } {
    return {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
    };
  }

  getPointsSample(maxPoints = 50): { x: number; y: number }[] {
    if (this.samples.length <= maxPoints) {
      return this.samples.map(s => ({ x: s.x, y: s.y }));
    }
    const step = this.samples.length / maxPoints;
    return Array.from({ length: maxPoints }, (_, i) => {
      const idx = Math.floor(i * step);
      return { x: this.samples[idx].x, y: this.samples[idx].y };
    });
  }

  private getEmptyMetrics() {
    return {
      meanFixationDurationMs: 0,
      regressiveSaccadeRatio: 0,
      totalFixations: 0,
      totalSaccades: 0,
      gazeDispersionScore: 0,
    };
  }
}

// Legacy KalmanFilter export for backward compat
export class KalmanFilter {
  private x = 0;
  private p = 1;
  private readonly q = 0.001;
  private readonly r = 0.1;

  filter(z: number): number {
    // Predict
    this.p += this.q;
    // Update
    const k = this.p / (this.p + this.r);
    this.x += k * (z - this.x);
    this.p *= (1 - k);
    return this.x;
  }

  reset() {
    this.x = 0;
    this.p = 1;
  }
}

export type { GazeSample };