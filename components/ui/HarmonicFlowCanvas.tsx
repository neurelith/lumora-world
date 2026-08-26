'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RefreshCw, Wand2, Sparkles, Flame, Hand } from 'lucide-react';
import { cameraService } from '@/lib/camera-service';

export interface HarmonicPoint {
  x: number;
  y: number;
  t: number;
  pressure?: number;
  isAirDrawing?: boolean;
  isNewStroke?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  hue: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface CosmicMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseHue: number;
}

interface HarmonicFlowCanvasProps {
  width?: number;
  height?: number;
  targetLetter?: string;
  onStrokeUpdate?: (points: HarmonicPoint[]) => void;
  onStrokeFinish?: (points: HarmonicPoint[]) => void;
  worldAccent?: 'realm' | 'forest' | 'castle' | 'valley' | 'mountains';
  ambientMode?: 'subtle' | 'celebrate';
  fieldIntensity?: number;
  enableCameraAirControl?: boolean;
  className?: string;
}

// 1-Euro Adaptive Low-Pass Filter for Jitter-Free Air Writing
class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xPrev: number | null = null;
  private dxPrev: number | null = null;
  private yPrev: number | null = null;
  private dyPrev: number | null = null;
  private tPrev: number | null = null;

  constructor(minCutoff = 0.8, beta = 0.015, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  private smoothingFactor(tDiff: number, cutoff: number): number {
    const r = 2 * Math.PI * cutoff * tDiff;
    return r / (r + 1);
  }

  private exponentialSmoothing(alpha: number, x: number, xPrev: number): number {
    return alpha * x + (1 - alpha) * xPrev;
  }

  filter(x: number, y: number, t: number): { x: number; y: number } {
    if (this.xPrev === null || this.yPrev === null || this.tPrev === null) {
      this.xPrev = x;
      this.dxPrev = 0;
      this.yPrev = y;
      this.dyPrev = 0;
      this.tPrev = t;
      return { x, y };
    }
    const tDiff = Math.max((t - this.tPrev) / 1000.0, 0.001);

    // X axis filtering
    const dx = (x - this.xPrev) / tDiff;
    const aDx = this.smoothingFactor(tDiff, this.dCutoff);
    const dxHat = this.exponentialSmoothing(aDx, dx, this.dxPrev ?? 0);
    const cutoffX = this.minCutoff + this.beta * Math.abs(dxHat);
    const ax = this.smoothingFactor(tDiff, cutoffX);
    const xHat = this.exponentialSmoothing(ax, x, this.xPrev);

    // Y axis filtering
    const dy = (y - this.yPrev) / tDiff;
    const aDy = this.smoothingFactor(tDiff, this.dCutoff);
    const dyHat = this.exponentialSmoothing(aDy, dy, this.dyPrev ?? 0);
    const cutoffY = this.minCutoff + this.beta * Math.abs(dyHat);
    const ay = this.smoothingFactor(tDiff, cutoffY);
    const yHat = this.exponentialSmoothing(ay, y, this.yPrev);

    this.xPrev = xHat;
    this.dxPrev = dxHat;
    this.yPrev = yHat;
    this.dyPrev = dyHat;
    this.tPrev = t;
    return { x: xHat, y: yHat };
  }

  reset() {
    this.xPrev = null;
    this.dxPrev = null;
    this.yPrev = null;
    this.dyPrev = null;
    this.tPrev = null;
  }
}

// Smooth Sigmoid Coordinate Mapping with Outer Deadzone
function softMap(v: number, lo: number, hi: number, max: number): number {
  const norm = (v - lo) / (hi - lo);
  const clamped = Math.max(0, Math.min(1, norm));
  // Smooth cubic ease for natural arm ergonomics
  const eased = clamped < 0.5 ? 2 * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 2) / 2;
  return eased * max;
}

export const HarmonicFlowCanvas: React.FC<HarmonicFlowCanvasProps> = ({
  width = 380,
  height = 380,
  targetLetter,
  onStrokeUpdate,
  onStrokeFinish,
  worldAccent = 'realm',
  ambientMode,
  fieldIntensity,
  enableCameraAirControl = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaPipeCamRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [inputMode, setInputMode] = useState<'touch' | 'camera'>('touch');
  const [cameraActive, setCameraActive] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  // References for live 60fps tracking & particles
  const strokeHistoryRef = useRef<HarmonicPoint[]>([]);
  const strokeOpacityRef = useRef(1.0);
  const isInteractingRef = useRef(false);
  const wasPinchingRef = useRef(false);
  const handPosRef = useRef({ x: 190, y: 190, present: false, pinching: false });
  const particlesRef = useRef<Particle[]>([]);
  const cosmicMotesRef = useRef<CosmicMote[]>([]);
  const oneEuroRef = useRef(new OneEuroFilter(0.8, 0.015, 1.0));
  const rafRef = useRef<number | null>(null);
  const bloomRef = useRef(0);

  // Automatically reset canvas and stroke history when targetLetter changes
  useEffect(() => {
    strokeHistoryRef.current = [];
    strokeOpacityRef.current = 1.0;
    particlesRef.current = [];
    oneEuroRef.current.reset();
  }, [targetLetter]);

  // Pentatonic Resonator (Audio Synthesis)
  const playTone = useCallback((normY: number) => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume?.();
      }
      if (!ctx) return;

      const pentatonic = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C4, D4, E4, G4, A4, C5
      const noteIdx = Math.max(0, Math.min(pentatonic.length - 1, Math.floor((1 - normY) * pentatonic.length)));
      const freq = pentatonic[noteIdx];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Initialize Cosmic Ambient Motes
  useEffect(() => {
    const motes: CosmicMote[] = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.2 + 1.2,
        alpha: Math.random() * 0.45 + 0.2,
        baseHue: worldAccent === 'realm' ? 172 : 38,
      });
    }
    cosmicMotesRef.current = motes;
  }, [width, height, worldAccent]);

  // Particle Generators
  const spawnBurst = (x: number, y: number, hue = 172, count = 3) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.8 + 0.8;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.8,
        color: `hsl(${hue + (Math.random() - 0.5) * 20}, 95%, 65%)`,
        hue,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 22 + 14,
      });
    }
  };

  const spawnStarBurst = (x: number, y: number) => {
    for (let i = 0; i < 22; i++) {
      const angle = (Math.PI * 2 * i) / 22;
      const speed = Math.random() * 4.5 + 1.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4.5 + 2.5,
        color: `hsl(${38 + Math.random() * 20}, 98%, 66%)`,
        hue: 38,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 28 + 18,
      });
    }
  };

  // 60 FPS Render Loop (Harmonic Flow Engine)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animTime = 0;

    const render = () => {
      animTime += 0.02;

      // 1. Soft Canvas Background Trail
      const bloom = bloomRef.current;
      ctx.fillStyle = `rgba(252, 250, 246, ${0.28 + bloom * 0.04})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Cosmic Ambient Motes
      const motes = cosmicMotesRef.current;
      for (const m of motes) {
        m.x += m.vx + Math.sin(animTime + m.y * 0.01) * 0.2;
        m.y += m.vy + Math.cos(animTime + m.x * 0.01) * 0.2;
        if (m.x < 0) m.x = canvas.width;
        if (m.x > canvas.width) m.x = 0;
        if (m.y < 0) m.y = canvas.height;
        if (m.y > canvas.height) m.y = 0;

        ctx.fillStyle = `hsla(${m.baseHue}, 80%, 65%, ${m.alpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Target Letter Silhouette
      if (targetLetter) {
        ctx.save();
        ctx.font = 'bold 210px "Baloo 2", "Lexend", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(201, 100, 66, 0.12)';
        ctx.fillText(targetLetter, canvas.width / 2, canvas.height / 2 + 10);
        ctx.strokeStyle = 'rgba(43, 42, 51, 0.15)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 12]);
        ctx.strokeText(targetLetter, canvas.width / 2, canvas.height / 2 + 10);
        ctx.restore();
      }

      // 4. Multi-Segment Neon Spline Strokes (with Opacity Fading)
      const pts = strokeHistoryRef.current;
      const opacity = strokeOpacityRef.current;

      if (pts.length > 1 && opacity > 0.01) {
        const segments: HarmonicPoint[][] = [];
        let cur: HarmonicPoint[] = [];

        for (const p of pts) {
          if (p.isNewStroke && cur.length > 0) {
            segments.push(cur);
            cur = [];
          }
          cur.push(p);
        }
        if (cur.length > 0) segments.push(cur);

        segments.forEach((seg) => {
          if (seg.length < 2) return;

          const hue = worldAccent === 'realm' ? 172 : 28;
          const outerColor = `hsla(${hue}, 85%, 60%, ${0.45 * opacity})`;
          const coreColor = `hsla(${hue}, 95%, 62%, ${opacity})`;

          // Outer Neon Glow
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(seg[0].x, seg[0].y);
          for (let i = 1; i < seg.length; i++) {
            const xc = (seg[i].x + seg[i - 1].x) / 2;
            const yc = (seg[i].y + seg[i - 1].y) / 2;
            ctx.quadraticCurveTo(seg[i - 1].x, seg[i - 1].y, xc, yc);
          }
          ctx.strokeStyle = outerColor;
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = `hsl(${hue}, 90%, 60%)`;
          ctx.shadowBlur = 18;
          ctx.stroke();

          // Inner Bright Core
          ctx.strokeStyle = coreColor;
          ctx.lineWidth = 5.5;
          ctx.shadowBlur = 4;
          ctx.stroke();

          // White Centerline
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 0;
          ctx.stroke();
          ctx.restore();
        });
      }

      // 5. Active Particles (Stardust Fireworks)
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.alpha <= 0.01) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Magic Wand Tip & Hover Reticle (Camera Air Mode)
      if (inputMode === 'camera' && handPosRef.current.present) {
        const hx = handPosRef.current.x;
        const hy = handPosRef.current.y;
        const pinching = handPosRef.current.pinching;

        ctx.save();
        if (pinching) {
          // PINCHING (DRAWING MODE) — Flaming Cosmic Wand Tip
          ctx.strokeStyle = '#E8A33D';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(hx, hy, 18, 0, Math.PI * 2);
          ctx.stroke();

          // Pulsing Golden Star
          ctx.fillStyle = '#FFD700';
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 22;
          ctx.beginPath();
          const r = 11;
          for (let k = 0; k < 5; k++) {
            const a = -Math.PI / 2 + (Math.PI * 2 * k) / 5;
            const a2 = a + Math.PI / 5;
            const x1 = hx + Math.cos(a) * r;
            const y1 = hy + Math.sin(a) * r;
            const x2 = hx + Math.cos(a2) * (r * 0.45);
            const y2 = hy + Math.sin(a2) * (r * 0.45);
            if (k === 0) ctx.moveTo(x1, y1);
            else ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // HOVERING MODE (PEN UP) — Targeting Reticle (0 ink drawn)
          ctx.strokeStyle = 'rgba(201, 100, 66, 0.7)';
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(hx, hy, 14, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#2FA8A0';
          ctx.shadowColor = '#2FA8A0';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetLetter, inputMode, worldAccent]);

  // Touch Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (inputMode === 'camera') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const t = performance.now();
    isInteractingRef.current = true;

    strokeHistoryRef.current.push({ x, y, t, pressure: 0.8, isAirDrawing: false, isNewStroke: true });
    spawnBurst(x, y, 172, 5);
    playTone(y / canvas.height);
    onStrokeUpdate?.(strokeHistoryRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (inputMode === 'camera' || !isInteractingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const t = performance.now();

    strokeHistoryRef.current.push({ x, y, t, pressure: 0.8, isAirDrawing: false });
    if (strokeHistoryRef.current.length % 2 === 0) spawnBurst(x, y, 172, 2);
    if (Math.random() < 0.22) playTone(y / canvas.height);
    onStrokeUpdate?.(strokeHistoryRef.current);
  };

  const handlePointerUp = () => {
    if (inputMode === 'camera') return;
    isInteractingRef.current = false;
    if (strokeHistoryRef.current.length > 5) {
      const last = strokeHistoryRef.current[strokeHistoryRef.current.length - 1];
      spawnStarBurst(last.x, last.y);
    }
  };

  // Camera Teardown
  const stopCamera = () => {
    try {
      if (mediaPipeCamRef.current) {
        mediaPipeCamRef.current.stop();
        mediaPipeCamRef.current = null;
      }
      if (handsRef.current) {
        handsRef.current.close?.();
        handsRef.current = null;
      }
    } catch (err) {
      console.warn('[HarmonicFlowCanvas] Teardown error:', err);
    } finally {
      if (streamRef.current) {
        cameraService.releaseStream();
        streamRef.current = null;
      }
      setCameraActive(false);
      setHandDetected(false);
      setIsPinching(false);
      setIsStartingCamera(false);
      handPosRef.current.present = false;
      handPosRef.current.pinching = false;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const startCameraAirTracking = async () => {
    setCameraError(null);
    setIsStartingCamera(true);
    oneEuroRef.current.reset();

    try {
      const stream = await cameraService.acquireStream({ width: 480, height: 360, facingMode: 'user' });
      streamRef.current = stream;
      setCameraActive(true);
      setInputMode('camera');

      // Allow DOM to render video element then attach
      setTimeout(async () => {
        if (videoRef.current) {
          await cameraService.attachToVideo(videoRef.current, stream);
          setIsStartingCamera(false);
          void initHandTracking();
        }
      }, 100);
    } catch (err: any) {
      console.warn('[HarmonicFlowCanvas] Camera start error:', err);
      setIsStartingCamera(false);
      setCameraError('Camera access needed for Magic Air Wand. You can also draw with Touch!');
    }
  };

  // MediaPipe Hand Landmark & Pinch Tracking with Hysteresis & Sub-Pixel Smoothing
  const initHandTracking = async () => {
    if (typeof window === 'undefined') return;
    try {
      const { Hands } = await import('@mediapipe/hands');
      const { Camera: MPCam } = await import('@mediapipe/camera_utils');

      const hands = new Hands({
        locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${f}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, // Lite 60fps model
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });
      handsRef.current = hands;

      // Hysteresis thresholds for jitter-free pinch stability
      const PINCH_ENGAGE = 0.32;
      const PINCH_RELEASE = 0.44;

      hands.onResults((results) => {
        const pipCanvas = pipCanvasRef.current;
        const pipCtx = pipCanvas?.getContext('2d');
        if (pipCanvas && pipCtx) {
          pipCtx.clearRect(0, 0, pipCanvas.width, pipCanvas.height);
          if (results.multiHandLandmarks?.[0]) {
            const lm = results.multiHandLandmarks[0];
            pipCtx.strokeStyle = '#2FA8A0';
            pipCtx.lineWidth = 2.5;
            pipCtx.beginPath();
            const con: [number, number][] = [
              [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
              [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15],
              [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
            ];
            con.forEach(([a, b]) => {
              pipCtx.moveTo(lm[a].x * pipCanvas.width, lm[a].y * pipCanvas.height);
              pipCtx.lineTo(lm[b].x * pipCanvas.width, lm[b].y * pipCanvas.height);
            });
            pipCtx.stroke();

            // Index tip & thumb tip highlights
            const tip = lm[8];
            const thumb = lm[4];
            pipCtx.fillStyle = '#E8A33D';
            pipCtx.beginPath();
            pipCtx.arc(tip.x * pipCanvas.width, tip.y * pipCanvas.height, 5, 0, Math.PI * 2);
            pipCtx.arc(thumb.x * pipCanvas.width, thumb.y * pipCanvas.height, 4, 0, Math.PI * 2);
            pipCtx.fill();
          }
        }

        if (!results.multiHandLandmarks?.[0]) {
          setHandDetected(false);
          setIsPinching(false);
          handPosRef.current.present = false;
          handPosRef.current.pinching = false;
          return;
        }

        setHandDetected(true);
        handPosRef.current.present = true;
        const lm = results.multiHandLandmarks[0];
        const indexTip = lm[8];
        const thumbTip = lm[4];
        const wrist = lm[0];
        const middleMcp = lm[9];
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 3D Euclidean distance between thumb and index
        const dx = thumbTip.x - indexTip.x;
        const dy = thumbTip.y - indexTip.y;
        const dz = (thumbTip.z || 0) - (indexTip.z || 0);
        const pinchDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const handScale = Math.hypot(wrist.x - middleMcp.x, wrist.y - middleMcp.y);
        const pinchRatio = pinchDist / Math.max(handScale, 0.08);

        // Hysteresis state machine (eliminates stutter & disjointed lines)
        const pinching = wasPinchingRef.current
          ? pinchRatio < PINCH_RELEASE
          : pinchRatio < PINCH_ENGAGE;

        setIsPinching(pinching);
        handPosRef.current.pinching = pinching;

        // Mirrored coordinate mapping with deadzone
        const rawX = 1 - indexTip.x;
        const rawY = indexTip.y;
        const tx = softMap(rawX, 0.18, 0.82, canvas.width);
        const ty = softMap(rawY, 0.18, 0.82, canvas.height);

        const filtered = oneEuroRef.current.filter(tx, ty, performance.now());
        handPosRef.current.x = filtered.x;
        handPosRef.current.y = filtered.y;

        const t = performance.now();

        if (pinching) {
          // PEN IS DOWN — DRAWING INK
          const isNewStroke = !wasPinchingRef.current;
          const lastPoint = strokeHistoryRef.current[strokeHistoryRef.current.length - 1];

          // Sub-pixel threshold: only push if moved >= 2.5px or new stroke
          if (isNewStroke || !lastPoint || Math.hypot(filtered.x - lastPoint.x, filtered.y - lastPoint.y) >= 2.5) {
            strokeHistoryRef.current.push({
              x: filtered.x,
              y: filtered.y,
              t,
              pressure: 0.85,
              isAirDrawing: true,
              isNewStroke,
            });
            spawnBurst(filtered.x, filtered.y, 172, 2);
            if (Math.random() < 0.2) playTone(filtered.y / canvas.height);
            onStrokeUpdate?.(strokeHistoryRef.current);
          }
        } else {
          // PEN IS UP — HOVERING ONLY (Zero ink drawn!)
          if (wasPinchingRef.current && strokeHistoryRef.current.length > 5) {
            spawnBurst(filtered.x, filtered.y, 38, 5);
          }
        }
        wasPinchingRef.current = pinching;
      });

      if (videoRef.current) {
        const cam = new MPCam(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current && videoRef.current.readyState >= 2 && !videoRef.current.paused) {
              try {
                await handsRef.current.send({ image: videoRef.current });
              } catch {
                // Silently skip frame
              }
            }
          },
          width: 480,
          height: 360,
        });
        mediaPipeCamRef.current = cam;
        await cam.start();
      }
    } catch (e) {
      console.warn('[HarmonicFlowCanvas] MediaPipe error:', e);
      setCameraError('Magic Air Wand unavailable. You can also draw with Touch/Stylus!');
    }
  };

  const handleClear = () => {
    strokeHistoryRef.current = [];
    strokeOpacityRef.current = 1.0;
    particlesRef.current = [];
    oneEuroRef.current.reset();
    onStrokeUpdate?.([]);
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Mode Selector & Controls Bar */}
      <div className="flex items-center justify-between gap-3 w-full max-w-[380px] pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-sand/60 border border-hairline rounded-2xl shadow-soft-xs">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setInputMode('touch');
            }}
            className={`min-h-[40px] px-3.5 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 transition-all ${
              inputMode === 'touch'
                ? 'bg-ink text-white shadow-soft-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Touch</span>
          </button>

          {enableCameraAirControl && (
            <button
              type="button"
              disabled={isStartingCamera}
              onClick={() => {
                if (inputMode !== 'camera') void startCameraAirTracking();
              }}
              className={`min-h-[40px] px-3.5 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 transition-all ${
                inputMode === 'camera'
                  ? 'bg-amber text-ink shadow-soft-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Wand2 className={`w-3.5 h-3.5 ${isStartingCamera ? 'animate-spin' : ''}`} />
              <span>{isStartingCamera ? 'Starting...' : 'Magic Air Wand'}</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleClear}
          title="Clear canvas"
          className="p-2 text-muted hover:text-ink rounded-xl hover:bg-sand/60 border border-transparent hover:border-hairline transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Drawing Canvas Arena */}
      <div
        className="relative rounded-3xl overflow-hidden border-2 border-realm/30 bg-[#FCFAF6] shadow-soft-md"
        style={{ width, height }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="block w-full h-full cursor-crosshair touch-none"
        />

        {/* Live PiP Webcam Feed of Child's Face & Hand (Top Right) */}
        {inputMode === 'camera' && cameraActive && (
          <div className="absolute top-2.5 right-2.5 w-28 h-20 rounded-2xl overflow-hidden border-2 border-white/95 shadow-soft-md bg-black/80 z-20">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover -scale-x-100 block"
            />
            <canvas
              ref={pipCanvasRef}
              width={112}
              height={80}
              className="absolute inset-0 w-full h-full pointer-events-none -scale-x-100"
            />

            {/* Hand Status Pill in PiP */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-xs flex items-center gap-1 text-[8px] font-display font-bold text-white whitespace-nowrap shadow-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${handDetected ? (isPinching ? 'bg-amber animate-ping' : 'bg-emerald-400') : 'bg-amber-400 animate-pulse'}`} />
              <span>{handDetected ? (isPinching ? '✍️ Drawing' : '🪄 Hovering') : 'Show hand'}</span>
            </div>
          </div>
        )}

        {/* Dynamic Instructional Banner at Canvas Bottom */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <div className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-hairline shadow-soft-xs flex items-center gap-1.5 text-[11px] font-display font-bold text-ink">
            {inputMode === 'touch' ? (
              <>
                <Sparkles className="w-3 h-3 text-realm fill-realm" />
                <span>Touch and trace with your finger</span>
              </>
            ) : isPinching ? (
              <>
                <Flame className="w-3 h-3 text-amber fill-amber animate-bounce-gentle" />
                <span className="text-amber-800">✨ Drawing magic ink!</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3 text-realm" />
                <span>Pinch thumb & index to draw &middot; Release to hover</span>
              </>
            )}
          </div>
        </div>
      </div>

      {cameraError && (
        <p className="text-xs font-body text-terracotta mt-1.5 text-center max-w-sm">
          {cameraError}
        </p>
      )}
    </div>
  );
};
