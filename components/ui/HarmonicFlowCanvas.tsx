'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Wand2, MousePointer, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { OneEuroFilter2D } from '@/lib/oneEuroFilter';
import { calculateStrokeAccuracyScore } from '@/lib/dtw';
import { CameraPermissionModal } from '@/components/ui/CameraPermissionModal';
import { cameraService } from '@/lib/camera-service';

export interface HarmonicPoint {
  x: number;
  y: number;
  t: number;
  pressure: number;
  isAirDrawing: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  hue: number;
}

interface HarmonicFlowCanvasProps {
  width?: number;
  height?: number;
  targetLetter?: string;
  onStrokeUpdate?: (points: HarmonicPoint[]) => void;
  onStrokeFinish?: (points: HarmonicPoint[]) => void;
  enableCameraAirControl?: boolean;
  className?: string;
  ambientMode?: 'subtle' | 'celebrate';
  fieldIntensity?: number;
  worldAccent?: 'forest' | 'castle' | 'realm' | 'mountains' | 'valley';
}

const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function softMap(norm: number, lo: number, hi: number, size: number): number {
  const t = clamp01((norm - lo) / Math.max(0.08, hi - lo));
  const s = t * t * (3 - 2 * t);
  return s * size;
}

export const HarmonicFlowCanvas: React.FC<HarmonicFlowCanvasProps> = ({
  width = 440,
  height = 440,
  targetLetter = 'b',
  onStrokeUpdate,
  onStrokeFinish,
  enableCameraAirControl = true,
  ambientMode,
  fieldIntensity,
  worldAccent = 'realm',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaPipeCamRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const particlesRef = useRef<Particle[]>([]);
  const strokeHistoryRef = useRef<HarmonicPoint[]>([]);
  const isInteractingRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  // Normalization boundaries
  const FIX_LO = 0.12;
  const FIX_HI = 0.88;

  // 1-Euro tuned for responsive <8ms lag, smooth curve
  const oneEuroRef = useRef(new OneEuroFilter2D(1.4, 0.025, 1.0));
  const handPosRef = useRef({ x: width / 2, y: height / 2, present: false, drawing: false });

  const [inputMode, setInputMode] = useState<'touch' | 'camera'>('touch');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const permissionGrantedRef = useRef(false);

  const playTone = (yNorm: number) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current!;
      if (ctx.state === 'suspended') void ctx.resume();
      const idx = Math.max(0, Math.min(PENTATONIC.length - 1, Math.floor((1 - yNorm) * PENTATONIC.length)));
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(PENTATONIC[idx], ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch {}
  };

  const spawnBurst = (x: number, y: number, hue: number, n = 3) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 2.2 + 0.7;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        size: Math.random() * 5 + 2.5,
        color: `hsl(${hue}, 92%, 64%)`,
        hue,
        alpha: 0.96,
        life: 0,
        maxLife: Math.random() * 20 + 12,
      });
    }
  };

  const spawnStarBurst = (x: number, y: number) => {
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.4;
      const s = Math.random() * 3.8 + 1.6;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        size: Math.random() * 4 + 2.2,
        color: `hsl(${38 + Math.random() * 18}, 98%, 66%)`,
        hue: 38,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 18 + 12,
      });
    }
  };

  const bloomRef = useRef(0);
  const fieldOffsetRef = useRef(0);
  const ambientCelebratedRef = useRef(false);

  // Main 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isAmbient = !!ambientMode;
    const intensity = fieldIntensity ?? (ambientMode === 'celebrate' ? 0.55 : ambientMode === 'subtle' ? 0.22 : 0);
    const prefersCalm =
      typeof window !== 'undefined' &&
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        document.documentElement.classList.contains('sensory-calm'));
    const effectiveIntensity = prefersCalm ? intensity * 0.5 : intensity;

    if (ambientMode === 'celebrate' && !ambientCelebratedRef.current) {
      ambientCelebratedRef.current = true;
      spawnStarBurst(canvas.width / 2, canvas.height / 2);
    }

    const render = () => {
      if (isAmbient || bloomRef.current > 0.02) fieldOffsetRef.current += 0.18;
      else fieldOffsetRef.current *= 0.96;

      // 1. Soft Warm Canvas Background
      const bloom = bloomRef.current;
      ctx.fillStyle = `rgba(250, 248, 243, ${0.25 + bloom * 0.05})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (bloom > 0.02 || isAmbient) {
        const hueForBloom =
          worldAccent === 'realm' ? 172 : worldAccent === 'forest' ? 152 : worldAccent === 'castle' ? 228 : 38;
        const g = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          80,
          canvas.width / 2,
          canvas.height / 2,
          400
        );
        g.addColorStop(0, `hsla(${hueForBloom}, 90%, 65%, ${effectiveIntensity * 0.12 + bloom * 0.1})`);
        g.addColorStop(1, `hsla(${hueForBloom}, 90%, 65%, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Target Letter Guide (Clean, Dyslexia-Optimized)
      if (targetLetter) {
        ctx.save();
        ctx.font = 'bold 230px "Sora", "Baloo 2", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(201, 100, 66, 0.11)';
        ctx.fillText(targetLetter, canvas.width / 2, canvas.height / 2 + 10);
        ctx.strokeStyle = 'rgba(43, 42, 51, 0.14)';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([8, 12]);
        ctx.strokeText(targetLetter, canvas.width / 2, canvas.height / 2 + 10);
        ctx.restore();
      }

      // 3. Fluid Ribbon Stroke with Glowing Splines
      const pts = strokeHistoryRef.current;
      if (pts.length > 1 && !isAmbient) {
        let speed = 0;
        if (pts.length > 3) {
          const a = pts[pts.length - 1],
            b = pts[pts.length - 4];
          speed = Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, a.t - b.t);
        }
        const hue = worldAccent === 'realm' ? 172 + Math.min(20, speed * 1800) : 24 + Math.min(36, speed * 3600);
        const outer = `hsla(${hue}, 70%, 58%, 0.45)`;
        const core = `hsl(${hue}, 85%, 58%)`;
        bloomRef.current = Math.min(1, bloomRef.current * 0.92 + Math.min(0.5, speed * 900));

        const drawSpline = (color: string, w: number, blur: number) => {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            const xc = (pts[i].x + pts[i - 1].x) / 2;
            const yc = (pts[i].y + pts[i - 1].y) / 2;
            ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
          }
          ctx.strokeStyle = color;
          ctx.lineWidth = w;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = color;
          ctx.shadowBlur = blur;
          ctx.stroke();
          ctx.restore();
        };

        drawSpline(outer, 24, 20);
        drawSpline(core, 10, 8);

        // Bright Center Highlight
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const xc = (pts[i].x + pts[i - 1].x) / 2;
          const yc = (pts[i].y + pts[i - 1].y) / 2;
          ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
        }
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
      } else {
        bloomRef.current *= 0.96;
      }

      // 4. Sparkling Particle Trail
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.vx *= 0.985;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;
        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Magic Wand Tip (Camera Air Mode)
      if (inputMode === 'camera' && handPosRef.current.present) {
        const hx = handPosRef.current.x;
        const hy = handPosRef.current.y;
        ctx.save();
        ctx.strokeStyle = '#c96442';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(hx, hy, 16, 0, Math.PI * 2);
        ctx.stroke();

        // Glowing Star Hotpoint
        ctx.fillStyle = '#E8A33D';
        ctx.shadowColor = '#E8A33D';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        const r = 8;
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
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(hx, hy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetLetter, inputMode, worldAccent, ambientMode, fieldIntensity]);

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
    const pressure = typeof e.pressure === 'number' ? e.pressure : 0.5;
    isInteractingRef.current = true;
    strokeHistoryRef.current = [{ x, y, t, pressure, isAirDrawing: false }];
    spawnBurst(x, y, 38);
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
    const pressure = typeof e.pressure === 'number' ? e.pressure : 0.5;
    strokeHistoryRef.current.push({ x, y, t, pressure, isAirDrawing: false });
    if (strokeHistoryRef.current.length % 3 === 0) spawnBurst(x, y, 42 + Math.random() * 18, 2);
    if (Math.random() < 0.22) playTone(y / canvas.height);
    onStrokeUpdate?.(strokeHistoryRef.current);
  };

  const handlePointerUp = () => {
    if (inputMode === 'camera') return;
    if (!isInteractingRef.current) return;
    isInteractingRef.current = false;
    if (strokeHistoryRef.current.length > 4) {
      const last = strokeHistoryRef.current[strokeHistoryRef.current.length - 1];
      spawnStarBurst(last.x, last.y);
      const score = calculateStrokeAccuracyScore(
        strokeHistoryRef.current.map((p) => ({ x: p.x, y: p.y })),
        targetLetter
      );
      if (score > 80) {
        for (let k = 0; k < 8; k++) {
          spawnBurst(
            last.x + (Math.random() - 0.5) * 60,
            last.y + (Math.random() - 0.5) * 60,
            38 + Math.random() * 24,
            2
          );
        }
      }
    }
    onStrokeFinish?.(strokeHistoryRef.current);
  };

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
      console.warn('[HarmonicFlowCanvas] Error stopping MediaPipe:', err);
    } finally {
      if (streamRef.current) {
        cameraService.releaseStream();
        streamRef.current = null;
      }
      setCameraActive(false);
      setHandDetected(false);
      handPosRef.current.present = false;
      handPosRef.current.drawing = false;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const startCameraAirTracking = async () => {
    setCameraError(null);
    oneEuroRef.current.reset();
    try {
      const stream = await cameraService.acquireStream({ width: 480, height: 360, facingMode: 'user' });
      streamRef.current = stream;

      if (videoRef.current) {
        await cameraService.attachToVideo(videoRef.current, stream);
        setCameraActive(true);
        setInputMode('camera');
        setCalibrating(true);
        setTimeout(() => setCalibrating(false), 1500);
        void initHandTracking();
      }
    } catch (err: any) {
      console.warn('[HarmonicFlowCanvas] Camera start error:', err);
      setCameraError('Camera access needed for Magic Air Wand. You can also draw with Touch!');
    }
  };

  const initHandTracking = async () => {
    if (typeof window === 'undefined') return;
    try {
      const { Hands } = await import('@mediapipe/hands');
      const { Camera } = await import('@mediapipe/camera_utils');
      const hands = new Hands({
        locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });
      handsRef.current = hands;

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

            // Glowing index fingertip
            const tip = lm[8];
            pipCtx.fillStyle = '#E8A33D';
            pipCtx.shadowColor = '#E8A33D';
            pipCtx.shadowBlur = 10;
            pipCtx.beginPath();
            pipCtx.arc(tip.x * pipCanvas.width, tip.y * pipCanvas.height, 6, 0, Math.PI * 2);
            pipCtx.fill();
          }
        }

        if (!results.multiHandLandmarks?.[0]) {
          setHandDetected(false);
          handPosRef.current.present = false;
          return;
        }

        setHandDetected(true);
        handPosRef.current.present = true;
        const lm = results.multiHandLandmarks[0];
        const indexTip = lm[8];
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Mirrored coordinate mapping
        const rawX = 1 - indexTip.x;
        const rawY = indexTip.y;
        const tx = softMap(rawX, FIX_LO, FIX_HI, canvas.width);
        const ty = softMap(rawY, FIX_LO, FIX_HI, canvas.height);

        const filtered = oneEuroRef.current.filter(tx, ty, performance.now());
        handPosRef.current.x = filtered.x;
        handPosRef.current.y = filtered.y;

        const t = performance.now();
        strokeHistoryRef.current.push({ x: filtered.x, y: filtered.y, t, pressure: 0.7, isAirDrawing: true });
        if (strokeHistoryRef.current.length % 2 === 0) spawnBurst(filtered.x, filtered.y, 38 + Math.random() * 16, 2);
        if (Math.random() < 0.2) playTone(filtered.y / canvas.height);
        onStrokeUpdate?.(strokeHistoryRef.current);
      });

      if (videoRef.current) {
        const cam = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current) {
              await handsRef.current.send({ image: videoRef.current });
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
      setCameraError('Magic Air Wand unavailable. Please use Touch/Stylus.');
    }
  };

  const handleClear = () => {
    if (strokeHistoryRef.current.length > 3) {
      const last = strokeHistoryRef.current[strokeHistoryRef.current.length - 1];
      spawnStarBurst(last.x, last.y);
    }
    strokeHistoryRef.current = [];
    particlesRef.current = [];
    oneEuroRef.current.reset();
    onStrokeUpdate?.([]);
  };

  return (
    <div className={`flex flex-col items-center gap-4 w-full max-w-lg mx-auto select-none ${className}`}>
      {/* Top Playful Mode Switcher */}
      <div className="flex items-center justify-between gap-2 w-full bg-white border-2 border-hairline rounded-2xl p-2 shadow-soft-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setInputMode('touch');
            }}
            className={`min-h-[48px] px-4 py-2 rounded-xl font-display text-sm font-bold flex items-center gap-2 transition-all ${
              inputMode === 'touch'
                ? 'bg-ink text-white shadow-soft-sm scale-[1.02]'
                : 'bg-paper text-muted hover:text-ink hover:bg-hairline/60'
            }`}
          >
            <MousePointer className="w-4 h-4" /> Touch
          </button>
          {enableCameraAirControl && (
            <button
              type="button"
              onClick={() => {
                if (permissionGrantedRef.current) void startCameraAirTracking();
                else setShowPermissionModal(true);
              }}
              className={`min-h-[48px] px-4 py-2 rounded-xl font-display text-sm font-bold flex items-center gap-2 transition-all ${
                inputMode === 'camera'
                  ? 'bg-amber text-ink shadow-amber-glow scale-[1.02] animate-pulse font-extrabold'
                  : 'bg-paper text-muted hover:text-ink hover:bg-hairline/60'
              }`}
            >
              <Wand2 className="w-4 h-4 text-amber-800" /> Magic Air Wand
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className="w-10 h-10 rounded-xl text-muted hover:text-ink hover:bg-paper flex items-center justify-center transition-colors"
            title="Sound"
            aria-label="Toggle audio effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="w-10 h-10 rounded-xl text-muted hover:text-ink hover:bg-paper flex items-center justify-center transition-colors"
            title="Clear"
            aria-label="Clear canvas"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Arena */}
      <div className="relative bg-white border-2 border-hairline rounded-3xl p-3 shadow-soft-md overflow-hidden flex items-center justify-center w-full aspect-square max-w-[440px]">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          role="img"
          aria-label={`Trace the letter ${targetLetter}.`}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="tracing-canvas rounded-2xl block bg-ivory shadow-inner cursor-crosshair w-full h-full object-contain"
          style={{ touchAction: 'none' }}
        />

        {/* Live Camera Video Feed inside PiP box with overlaid skeleton */}
        <div
          className={`absolute top-4 right-4 w-32 h-24 sm:w-36 sm:h-28 rounded-2xl border-2 border-white/90 shadow-soft-lg overflow-hidden bg-ink z-20 transition-all duration-300 ${
            inputMode === 'camera' && cameraActive ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover -scale-x-100 absolute inset-0"
          />
          <canvas
            ref={pipCanvasRef}
            width={160}
            height={140}
            className="w-full h-full object-cover absolute inset-0 z-10 pointer-events-none -scale-x-100"
          />
          <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-ink/80 backdrop-blur-sm text-[10px] text-white text-center font-display font-semibold rounded-full py-0.5 z-20 flex items-center justify-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${handDetected ? 'bg-sage animate-pulse' : 'bg-amber'}`} />
            <span>{calibrating ? 'Calibrating…' : handDetected ? '✨ Wand Active' : 'Wave your hand'}</span>
          </div>
        </div>

        {/* Error overlay if camera fails */}
        {cameraError && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 border border-amber/40 p-3 rounded-2xl text-xs font-body text-ink text-center shadow-soft-sm z-30">
            {cameraError}
          </div>
        )}

        {/* Dynamic Instructional Chip */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 pointer-events-none z-10 w-max max-w-[90%]">
          <span className="bg-white/90 backdrop-blur-md border border-hairline px-4 py-1.5 rounded-full text-xs font-display font-bold text-ink shadow-soft-xs inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber" />
            {inputMode === 'camera'
              ? handDetected
                ? '✨ Wave finger — the magic wand tip follows you!'
                : 'Point index finger at camera to cast'
              : 'Touch and trace with your finger'}
          </span>
        </div>
      </div>

      <CameraPermissionModal
        open={showPermissionModal}
        onAllow={() => {
          permissionGrantedRef.current = true;
          setShowPermissionModal(false);
          void startCameraAirTracking();
        }}
        onUseTouch={() => {
          setShowPermissionModal(false);
          setInputMode('touch');
        }}
        onDismiss={() => setShowPermissionModal(false)}
      />
    </div>
  );
};
