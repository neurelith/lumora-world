'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Wand2, MousePointer, RotateCcw, Volume2, VolumeX, Activity } from 'lucide-react';
import { OneEuroFilter2D } from '@/lib/oneEuroFilter';
import { calculateStrokeAccuracyScore } from '@/lib/dtw';
import { CameraPermissionModal } from '@/components/ui/CameraPermissionModal';

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
  // harmonic-flow distill — ambient visual language, not a 6th world (mt4ri55i)
  ambientMode?: 'subtle' | 'celebrate';
  fieldIntensity?: number; // 0–1, default subtle 0.22 celebrate 0.55
  worldAccent?: 'forest' | 'castle' | 'realm' | 'mountains' | 'valley';
}

// Generative palette — Apple HIG kid-joyful but restrained
const PALETTE = {
  ribbon: ['#c96442', '#4a7c5e', '#4a5a8a', '#c48a32', '#3a8a82'] as const,
};

const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
// Exponential edge softening — precise in center, forgiving at edges
function softMap(norm: number, lo: number, hi: number, size: number): number {
  const t = clamp01((norm - lo) / Math.max(0.08, hi - lo));
  // smoothstep for perceptual accuracy
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
  worldAccent,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const strokeHistoryRef = useRef<HarmonicPoint[]>([]);
  const isInteractingRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  // FIXED mapping window — no drifting bounds (the accuracy bug)
  // Hand normalized coords in [0,1] mirrored X; map [0.15,0.85] -> full canvas
  const FIX_LO = 0.15, FIX_HI = 0.85;

  // 1-Euro tuned for <8ms lag, <0.6px jitter on 720p
  const oneEuroRef = useRef(new OneEuroFilter2D(1.4, 0.025, 1.0));
  const handPosRef = useRef({ x: width / 2, y: height / 2, present: false, drawing: false });
  const palmSizeRef = useRef(0.18);

  const [inputMode, setInputMode] = useState<'touch' | 'camera'>('touch');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawTriggerMode, setDrawTriggerMode] = useState<'continuous' | 'pinch'>('continuous');
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const permissionGrantedRef = useRef(false);

  const playTone = (yNorm: number) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const ctx = audioCtxRef.current!;
      if (ctx.state === 'suspended') void ctx.resume();
      const idx = Math.max(0, Math.min(PENTATONIC.length - 1, Math.floor((1 - yNorm) * PENTATONIC.length)));
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(PENTATONIC[idx], ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const spawnBurst = (x: number, y: number, hue: number, n = 3) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * 2.2 + 0.7;
      particlesRef.current.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        size: Math.random() * 5 + 2.5, color: `hsl(${hue}, 92%, 64%)`, hue,
        alpha: 0.96, life: 0, maxLife: Math.random() * 22 + 14,
      });
    }
  };
  const spawnStarBurst = (x: number, y: number) => {
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.45;
      const s = Math.random() * 4 + 1.8;
      particlesRef.current.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        size: Math.random() * 4 + 2.2, color: `hsl(${38 + Math.random() * 18}, 98%, 66%)`, hue: 38,
        alpha: 1, life: 0, maxLife: Math.random() * 18 + 12,
      });
    }
  };

  // Generative bloom intensity from stroke speed + progress
  const bloomRef = useRef(0);
  // harmonic-flow ambient: field drift + celebrate on mount
  const fieldOffsetRef = useRef(0);
  const ambientCelebratedRef = useRef(false);

  // Main 60 FPS render — centripetal spline + generative bloom
  // harmonic-flow: distilled from teammate Brik prototype mt4ri55i — ambientMode is visual language only
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const isAmbient = !!ambientMode;
    const intensity = fieldIntensity ?? (ambientMode === 'celebrate' ? 0.55 : ambientMode === 'subtle' ? 0.22 : 0);
    const prefersCalm = typeof window !== 'undefined' && (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('sensory-calm'));
    const effectiveIntensity = prefersCalm ? intensity * 0.5 : intensity;

    // celebrate: one star burst on mount
    if (ambientMode === 'celebrate' && !ambientCelebratedRef.current) {
      ambientCelebratedRef.current = true;
      spawnStarBurst(canvas.width / 2, canvas.height / 2);
    }

    const render = () => {
      // field drift tick — cheapest flow that reads (no Perlin, no offscreen)
      if (isAmbient || bloomRef.current > 0.02) fieldOffsetRef.current += 0.18;
      else fieldOffsetRef.current *= 0.96;

      // 1 — generative bloom background (subtle, deference)
      const bloom = bloomRef.current;
      ctx.fillStyle = `rgba(250,248,243,${0.22 + bloom * 0.06})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (bloom > 0.02) {
        const hueForBloom = worldAccent === 'realm' ? 172 : worldAccent === 'forest' ? 152 : worldAccent === 'castle' ? 228 : worldAccent === 'mountains' ? 268 : worldAccent === 'valley' ? 200 : 38;
        const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 80, canvas.width / 2, canvas.height / 2, 420);
        g.addColorStop(0, `hsla(${hueForBloom + bloom * 22}, 92%, 64%, ${bloom * 0.10})`);
        g.addColorStop(1, `hsla(${hueForBloom}, 92%, 64%, 0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
        // field flow wash — one translate+fillRect reusing g, ~0.4ms
        if (!prefersCalm && (isAmbient || bloom > 0.02)) {
          ctx.save();
          ctx.globalAlpha = isAmbient ? (ambientMode === 'subtle' ? 0.035 : 0.065) : bloom * 0.045;
          const ox = (fieldOffsetRef.current % 40) - 20, oy = (fieldOffsetRef.current * 0.6 % 40) - 20;
          ctx.translate(ox, oy);
          ctx.fillStyle = g;
          ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);
          ctx.restore();
        }
      } else if (isAmbient) {
        // ambient subtle without bloom — still paint faint field so idle isn't flat
        const hueForBloom = worldAccent === 'realm' ? 172 : worldAccent === 'forest' ? 152 : worldAccent === 'castle' ? 228 : worldAccent === 'mountains' ? 268 : worldAccent === 'valley' ? 200 : 38;
        const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 80, canvas.width / 2, canvas.height / 2, 420);
        g.addColorStop(0, `hsla(${hueForBloom}, 88%, 64%, ${effectiveIntensity * 0.10})`);
        g.addColorStop(1, `hsla(${hueForBloom}, 88%, 64%, 0)`);
        ctx.save();
        ctx.globalAlpha = effectiveIntensity * 0.35;
        const ox = (fieldOffsetRef.current % 40) - 20, oy = (fieldOffsetRef.current * 0.6 % 40) - 20;
        ctx.translate(ox, oy);
        ctx.fillStyle = g;
        ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);
        ctx.restore();
      }

      // 2 — target letter ghost (deference)
      if (targetLetter) {
        ctx.save();
        ctx.font = 'bold 220px "Sora", "Baloo 2", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(201,100,66,0.10)';
        ctx.fillText(targetLetter, canvas.width / 2, canvas.height / 2 + 14);
        ctx.strokeStyle = 'rgba(45,43,40,0.12)'; ctx.lineWidth = 1.8; ctx.setLineDash([7, 10]);
        ctx.strokeText(targetLetter, canvas.width / 2, canvas.height / 2 + 14);
        ctx.restore();
      }

      // 3 — ribbon spline (clarity + depth) — hue shifts with speed
      // brand-snap: rune teal 172° per Brand Kit §4 when worldAccent=realm
      const pts = strokeHistoryRef.current;
      if (pts.length > 1 && !isAmbient) {
        // speed-aware hue
        let speed = 0;
        if (pts.length > 3) {
          const a = pts[pts.length - 1], b = pts[pts.length - 4];
          speed = Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, a.t - b.t);
        }
        const hue = worldAccent === 'realm' ? 172 + Math.min(18, speed * 1800) : 18 + Math.min(42, speed * 4200);
        const outer = `hsla(${hue}, 68%, 58%, 0.42)`;
        const core = `hsl(${hue}, 82%, 58%)`;
        bloomRef.current = Math.min(1, bloomRef.current * 0.92 + Math.min(0.5, speed * 900));

        const drawSpline = (color: string, w: number, blur: number) => {
          ctx.save();
          ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            const xc = (pts[i].x + pts[i - 1].x) / 2, yc = (pts[i].y + pts[i - 1].y) / 2;
            ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
          }
          ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.stroke(); ctx.restore();
        };
        drawSpline(outer, 26, 22);
        drawSpline(core, 11, 10);
        ctx.save();
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const xc = (pts[i].x + pts[i - 1].x) / 2, yc = (pts[i].y + pts[i - 1].y) / 2;
          ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
        }
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3.2; ctx.shadowBlur = 0; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
      } else {
        bloomRef.current *= 0.96;
      }

      // 4 — particles (harvest trail stars)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.vx *= 0.985; p.life++;
        p.alpha = 1 - p.life / p.maxLife;
        if (p.life >= p.maxLife) { particlesRef.current.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }

      // 5 — wand cursor (camera mode) — highlight the magic tip
      if (inputMode === 'camera' && handPosRef.current.present) {
        const hx = handPosRef.current.x, hy = handPosRef.current.y, drawing = handPosRef.current.drawing;
        ctx.save();
        ctx.strokeStyle = drawing ? '#c96442' : '#3a8a82'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(hx, hy, drawing ? 20 : 13, 0, Math.PI * 2); ctx.stroke();
        // star hotpoint
        ctx.fillStyle = drawing ? '#c96442' : '#3a8a82'; ctx.shadowColor = drawing ? '#c96442' : '#41CDC4'; ctx.shadowBlur = 14;
        ctx.beginPath();
        const r = drawing ? 7.5 : 4.8;
        for (let k = 0; k < 5; k++) {
          const a = -Math.PI / 2 + (Math.PI * 2 * k) / 5;
          const a2 = a + Math.PI / 5;
          const x1 = hx + Math.cos(a) * r, y1 = hy + Math.sin(a) * r;
          const x2 = hx + Math.cos(a2) * (r * 0.45), y2 = hy + Math.sin(a2) * (r * 0.45);
          if (k === 0) ctx.moveTo(x1, y1); else ctx.lineTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx, hy, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [targetLetter, inputMode]);

  // Touch
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (inputMode === 'camera') return;
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const t = performance.now(); const pressure = typeof e.pressure === 'number' ? e.pressure : 0.5;
    isInteractingRef.current = true;
    strokeHistoryRef.current = [{ x, y, t, pressure, isAirDrawing: false }];
    spawnBurst(x, y, 38); playTone(y / canvas.height); onStrokeUpdate?.(strokeHistoryRef.current);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (inputMode === 'camera' || !isInteractingRef.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const t = performance.now(); const pressure = typeof e.pressure === 'number' ? e.pressure : 0.5;
    strokeHistoryRef.current.push({ x, y, t, pressure, isAirDrawing: false });
    if (strokeHistoryRef.current.length % 3 === 0) spawnBurst(x, y, 42 + Math.random() * 18, 2);
    if (Math.random() < 0.22) playTone(y / canvas.height);
    const score = calculateStrokeAccuracyScore(strokeHistoryRef.current.map(p => ({ x: p.x, y: p.y })), targetLetter);
    setAccuracyScore(score); onStrokeUpdate?.(strokeHistoryRef.current);
  };
  const handlePointerUp = () => {
    if (inputMode === 'camera') return;
    if (!isInteractingRef.current) return;
    isInteractingRef.current = false;
    if (strokeHistoryRef.current.length > 4) {
      const last = strokeHistoryRef.current[strokeHistoryRef.current.length - 1];
      spawnStarBurst(last.x, last.y);
      const score = calculateStrokeAccuracyScore(strokeHistoryRef.current.map(p => ({ x: p.x, y: p.y })), targetLetter);
      if (score > 85) { for (let k = 0; k < 10; k++) spawnBurst(last.x + (Math.random() - 0.5) * 60, last.y + (Math.random() - 0.5) * 60, 38 + Math.random() * 24, 2); }
    }
    onStrokeFinish?.(strokeHistoryRef.current);
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(tr => tr.stop()); streamRef.current = null; }
    setCameraActive(false); setHandDetected(false); setIsDrawing(false); handPosRef.current.present = false;
  };

  const startCameraAirTracking = async () => {
    setCameraError(null); oneEuroRef.current.reset();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          void videoRef.current?.play();
          setCameraActive(true); setInputMode('camera');
          setCalibrating(true); setTimeout(() => setCalibrating(false), 1700);
          void initHandTracking();
        };
      }
    } catch {
      setCameraError('Camera access needed for Magic Air Wand. Allow camera, or use Touch instead.');
    }
  };

  const initHandTracking = async () => {
    if (typeof window === 'undefined') return;
    try {
      const { Hands } = await import('@mediapipe/hands');
      const { Camera } = await import('@mediapipe/camera_utils');
      const hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.58, minTrackingConfidence: 0.58 });

      hands.onResults(results => {
        const pipCanvas = pipCanvasRef.current; const pipCtx = pipCanvas?.getContext('2d');
        if (pipCanvas && pipCtx && videoRef.current) {
          pipCtx.save(); pipCtx.clearRect(0, 0, pipCanvas.width, pipCanvas.height);
          pipCtx.drawImage(videoRef.current, 0, 0, pipCanvas.width, pipCanvas.height);
          if (results.multiHandLandmarks?.[0]) {
            const lm = results.multiHandLandmarks[0];
            pipCtx.strokeStyle = '#3a8a82'; pipCtx.lineWidth = 1.8; pipCtx.beginPath();
            const con: [number, number][] = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
            con.forEach(([a,b]) => { pipCtx.moveTo(lm[a].x * pipCanvas.width, lm[a].y * pipCanvas.height); pipCtx.lineTo(lm[b].x * pipCanvas.width, lm[b].y * pipCanvas.height); });
            pipCtx.stroke();
            const tip = lm[8]; pipCtx.fillStyle = '#c96442'; pipCtx.beginPath(); pipCtx.arc(tip.x * pipCanvas.width, tip.y * pipCanvas.height, 5.5, 0, Math.PI * 2); pipCtx.fill();
          }
          pipCtx.restore();
        }

        if (!results.multiHandLandmarks?.[0]) {
          setHandDetected(false); handPosRef.current.present = false; setIsDrawing(false); return;
        }
        setHandDetected(true); handPosRef.current.present = true;
        const lm = results.multiHandLandmarks[0];
        const indexTip = lm[8], thumbTip = lm[4], wrist = lm[0], middleMcp = lm[9];
        const canvas = canvasRef.current; if (!canvas) return;

        // palm size for normalized pinch
        const palmW = Math.hypot(wrist.x - middleMcp.x, wrist.y - middleMcp.y);
        palmSizeRef.current = palmSizeRef.current * 0.92 + palmW * 0.08;
        const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
        const palmNorm = Math.max(0.06, palmSizeRef.current);
        const pinchNorm = pinchDist / palmNorm;
        const isPinching = pinchNorm < 0.62;

        // FIXED mapping — NO drift
        const rawX = 1 - indexTip.x; const rawY = indexTip.y;
        const tx = softMap(rawX, FIX_LO, FIX_HI, canvas.width);
        const ty = softMap(rawY, FIX_LO, FIX_HI, canvas.height);

        const filtered = oneEuroRef.current.filter(tx, ty, performance.now());
        handPosRef.current.x = filtered.x; handPosRef.current.y = filtered.y;

        const shouldDraw = drawTriggerMode === 'continuous' || isPinching;
        handPosRef.current.drawing = shouldDraw; setIsDrawing(shouldDraw);
        if (shouldDraw) {
          const t = performance.now();
          strokeHistoryRef.current.push({ x: filtered.x, y: filtered.y, t, pressure: 0.62, isAirDrawing: true });
          if (strokeHistoryRef.current.length % 2 === 0) spawnBurst(filtered.x, filtered.y, 38 + Math.random() * 16, 2);
          if (Math.random() < 0.18) playTone(filtered.y / canvas.height);
          const score = calculateStrokeAccuracyScore(strokeHistoryRef.current.map(p => ({ x: p.x, y: p.y })), targetLetter);
          setAccuracyScore(score); onStrokeUpdate?.(strokeHistoryRef.current);
        }
      });

      if (videoRef.current) {
        const cam = new Camera(videoRef.current, {
          onFrame: async () => { if (videoRef.current) await hands.send({ image: videoRef.current }); },
          width: 640, height: 480,
        });
        await cam.start();
      }
    } catch (e) { console.warn('MediaPipe error', e); setCameraError('Hand tracking failed to start. Use Touch instead.'); }
  };

  const handleClear = () => {
    if (strokeHistoryRef.current.length > 3) {
      const last = strokeHistoryRef.current[strokeHistoryRef.current.length - 1];
      spawnStarBurst(last.x, last.y);
    }
    strokeHistoryRef.current = []; particlesRef.current = []; setAccuracyScore(0); oneEuroRef.current.reset(); onStrokeUpdate?.([]);
  };

  return (
    <div className={`flex flex-col items-center gap-3.5 w-full max-w-lg mx-auto ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 w-full bg-white border border-whisper rounded-panel p-2 shadow-card">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { stopCamera(); setInputMode('touch'); }}
            className={`px-3 py-2 rounded-xl font-display text-xs font-bold flex items-center gap-1.5 transition-all ${inputMode === 'touch' ? 'bg-ink text-white shadow-sm' : 'bg-sand text-ink-secondary hover:text-ink'}`}>
            <MousePointer className="w-4 h-4" /> Touch / Stylus
          </button>
          {enableCameraAirControl && (
            <button type="button" onClick={() => { if (permissionGrantedRef.current) void startCameraAirTracking(); else setShowPermissionModal(true); }}
              className={`px-3.5 py-2 rounded-xl font-display text-xs font-bold flex items-center gap-1.5 transition-all ${inputMode === 'camera' ? 'bg-terracotta text-white shadow-[0_4px_14px_rgba(201,100,66,0.28)] animate-pulse' : 'bg-sand text-ink-secondary hover:text-ink'}`}>
              <Wand2 className="w-4 h-4" /> Magic Air Wand
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-sand border border-whisper rounded-pill flex items-center gap-1.5 text-xs font-display font-bold text-ink">
            <Activity className="w-3.5 h-3.5 text-terracotta" /> Match: {accuracyScore}%
          </div>
          <button type="button" onClick={() => setSoundEnabled(v => !v)} className="p-2 rounded-xl text-ink-tertiary hover:text-ink hover:bg-sand" title="Toggle sound">{soundEnabled ? <Volume2 className="w-4 h-4 text-terracotta" /> : <VolumeX className="w-4 h-4" />}</button>
          <button type="button" onClick={handleClear} className="p-2 rounded-xl text-ink-tertiary hover:text-ink hover:bg-sand" title="Clear"><RotateCcw className="w-4 h-4" /></button>
        </div>
      </div>

      {inputMode === 'camera' && cameraActive && (
        <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-terracotta-soft/60 border border-terracotta/20 rounded-2xl px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-ink">Draw:</span>
            <button type="button" onClick={() => setDrawTriggerMode('continuous')} className={`px-2.5 py-1 rounded-pill font-display text-xs font-bold ${drawTriggerMode === 'continuous' ? 'bg-terracotta text-white' : 'bg-white text-ink-tertiary'}`}>Continuous</button>
            <button type="button" onClick={() => setDrawTriggerMode('pinch')} className={`px-2.5 py-1 rounded-pill font-display text-xs font-bold ${drawTriggerMode === 'pinch' ? 'bg-terracotta text-white' : 'bg-white text-ink-tertiary'}`}>Pinch to draw</button>
          </div>
          <span className="text-ink-tertiary font-medium">✨ 1-Euro · fixed mapping · {calibrating ? 'calibrating…' : 'locked'}</span>
        </div>
      )}

      <div className="relative bg-white border border-whisper rounded-hero p-3 shadow-card overflow-hidden flex items-center justify-center w-full">
        <canvas
          ref={canvasRef} width={width} height={height} role="img"
          aria-label={`Trace the letter ${targetLetter}. Use finger, stylus, or Magic Air Wand.`}
          tabIndex={0}
          onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
          className="tracing-canvas rounded-panel block bg-ivory shadow-inner"
          style={{ touchAction: 'none', width: '100%', maxWidth: width, height: 'auto', aspectRatio: `${width}/${height}` }}
        />

        {inputMode === 'camera' && cameraActive && (
          <div className="absolute top-3 right-3 w-36 h-28 rounded-2xl border border-white/80 shadow-deep overflow-hidden bg-ink z-20">
            <video ref={videoRef} playsInline muted className="hidden" />
            <canvas ref={pipCanvasRef} width={160} height={140} className="w-full h-full object-cover -scale-x-100" />
            <div className="absolute bottom-1 left-1 right-1 bg-ink/80 backdrop-blur text-[10px] text-white text-center font-display font-semibold rounded-pill py-0.5 flex items-center justify-center gap-1">
              <span className={`w-2 h-2 rounded-full ${handDetected ? 'bg-sage animate-pulse' : 'bg-terracotta'}`} />
              <span>{calibrating ? 'Calibrating…' : handDetected ? (isDrawing ? '✨ Drawing' : '✨ Aiming') : 'Show hand'}</span>
            </div>
          </div>
        )}
        {(!cameraActive || inputMode !== 'camera') && <video ref={videoRef} playsInline muted className="hidden" />}
        {cameraError && <div className="absolute bottom-3 left-3 right-3 bg-white border border-terracotta/30 p-2.5 rounded-panel text-xs text-ink text-center shadow-card">{cameraError}</div>}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="bg-white/95 backdrop-blur border border-whisper px-4 py-1.5 rounded-pill text-xs font-display font-bold text-ink shadow-sm inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            {inputMode === 'camera'
              ? calibrating ? 'Hold hand steady — calibrating magic…'
                : handDetected ? (drawTriggerMode === 'pinch' ? 'Pinch to draw · release to aim' : 'Wave finger — the wand tip IS the magic!')
                : 'Point index finger at camera to cast'
              : 'Touch and trace — smooth, continuous motion'}
          </span>
        </div>
      </div>

      <CameraPermissionModal
        open={showPermissionModal}
        onAllow={() => { permissionGrantedRef.current = true; setShowPermissionModal(false); void startCameraAirTracking(); }}
        onUseTouch={() => { setShowPermissionModal(false); setInputMode('touch'); }}
        onDismiss={() => setShowPermissionModal(false)}
      />
    </div>
  );
};
