'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Wand2, X, Sparkles, Flame } from 'lucide-react';
import { cameraService } from '@/lib/camera-service';

interface UniversalAirWandProps {
  active?: boolean;
  onToggle?: (active: boolean) => void;
  accentColor?: string;
  className?: string;
}

export const UniversalAirWand: React.FC<UniversalAirWandProps> = ({
  active = false,
  onToggle,
  accentColor = '#E8A33D',
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaPipeCamRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isActive, setIsActive] = useState(active);
  const [handDetected, setHandDetected] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [wandPos, setWandPos] = useState({ x: -100, y: -100, visible: false });
  const [dwellProgress, setDwellProgress] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const wasPinchingRef = useRef(false);
  const lastTargetElemRef = useRef<HTMLElement | null>(null);
  const dwellTimerRef = useRef<number | null>(null);
  const dwellStartRef = useRef<number>(0);

  // Sync prop changes
  useEffect(() => {
    if (active && !isActive && !isStarting) {
      void startTracking();
    } else if (!active && isActive) {
      stopTracking();
    }
  }, [active]);

  const stopTracking = useCallback(() => {
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
      console.warn('[UniversalAirWand] Stop error:', err);
    } finally {
      if (streamRef.current) {
        cameraService.releaseStream();
        streamRef.current = null;
      }
      setIsActive(false);
      setHandDetected(false);
      setIsPinching(false);
      setWandPos({ x: -100, y: -100, visible: false });
      setDwellProgress(0);
      setIsStarting(false);
      onToggle?.(false);
    }
  }, [onToggle]);

  const startTracking = async () => {
    if (isActive || isStarting) return;
    setCameraError(null);
    setIsStarting(true);

    try {
      const stream = await cameraService.acquireStream({ width: 480, height: 360, facingMode: 'user' });
      streamRef.current = stream;
      setIsActive(true);
      onToggle?.(true);

      setTimeout(async () => {
        if (videoRef.current) {
          await cameraService.attachToVideo(videoRef.current, stream);
          setIsStarting(false);
          void initHandDetector();
        }
      }, 100);
    } catch (err: any) {
      console.warn('[UniversalAirWand] Start error:', err);
      setIsStarting(false);
      setCameraError('Camera access needed for Magic Wand.');
    }
  };

  const triggerAirClick = (screenX: number, screenY: number) => {
    const elem = document.elementFromPoint(screenX, screenY) as HTMLElement | null;
    if (!elem) return;

    // Find clickable button or interactive target
    const target = elem.closest('button, [role="button"], a, input') as HTMLElement | null;
    if (target && !target.hasAttribute('disabled')) {
      // Visual click ripple & trigger
      target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      target.click();
    }
  };

  const initHandDetector = async () => {
    if (typeof window === 'undefined') return;
    try {
      const { Hands } = await import('@mediapipe/hands');
      const { Camera: MPCam } = await import('@mediapipe/camera_utils');

      const hands = new Hands({
        locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${f}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });
      handsRef.current = hands;

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
            pipCtx.lineWidth = 2.2;
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

            // Tip Highlights
            const tip = lm[8];
            const thumb = lm[4];
            pipCtx.fillStyle = '#E8A33D';
            pipCtx.beginPath();
            pipCtx.arc(tip.x * pipCanvas.width, tip.y * pipCanvas.height, 4.5, 0, Math.PI * 2);
            pipCtx.arc(thumb.x * pipCanvas.width, thumb.y * pipCanvas.height, 4, 0, Math.PI * 2);
            pipCtx.fill();
          }
        }

        if (!results.multiHandLandmarks?.[0]) {
          setHandDetected(false);
          setIsPinching(false);
          setWandPos((prev) => ({ ...prev, visible: false }));
          setDwellProgress(0);
          return;
        }

        setHandDetected(true);
        const lm = results.multiHandLandmarks[0];
        const indexTip = lm[8];
        const thumbTip = lm[4];
        const wrist = lm[0];
        const middleMcp = lm[9];

        // 3D Distance for Pinch
        const dx = thumbTip.x - indexTip.x;
        const dy = thumbTip.y - indexTip.y;
        const dz = (thumbTip.z || 0) - (indexTip.z || 0);
        const pinchDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const handScale = Math.hypot(wrist.x - middleMcp.x, wrist.y - middleMcp.y);
        const pinchRatio = pinchDist / Math.max(handScale, 0.08);

        const pinching = wasPinchingRef.current
          ? pinchRatio < PINCH_RELEASE
          : pinchRatio < PINCH_ENGAGE;

        setIsPinching(pinching);

        // Screen Coordinate Mapping (Mirrored X)
        const screenX = (1 - indexTip.x) * window.innerWidth;
        const screenY = indexTip.y * window.innerHeight;

        setWandPos({ x: screenX, y: screenY, visible: true });

        // Dispatch custom event for Lumi pupils & components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wand-move', { detail: { x: screenX, y: screenY } }));
        }

        // Air Click on Pinch Down
        if (pinching && !wasPinchingRef.current) {
          triggerAirClick(screenX, screenY);
        }
        wasPinchingRef.current = pinching;

        // Dwell Hover Selection Logic
        const hoveredElem = document.elementFromPoint(screenX, screenY) as HTMLElement | null;
        const targetBtn = hoveredElem?.closest('button, [role="button"]') as HTMLElement | null;

        if (targetBtn && !targetBtn.hasAttribute('disabled')) {
          if (lastTargetElemRef.current !== targetBtn) {
            lastTargetElemRef.current = targetBtn;
            dwellStartRef.current = performance.now();
          } else {
            const elapsed = performance.now() - dwellStartRef.current;
            const progress = Math.min(1, elapsed / 1100);
            setDwellProgress(progress);

            if (progress >= 1) {
              triggerAirClick(screenX, screenY);
              dwellStartRef.current = performance.now() + 500; // debounce
              setDwellProgress(0);
            }
          }
        } else {
          lastTargetElemRef.current = null;
          setDwellProgress(0);
        }
      });

      if (videoRef.current) {
        const cam = new MPCam(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current && videoRef.current.readyState >= 2 && !videoRef.current.paused) {
              try {
                await handsRef.current.send({ image: videoRef.current });
              } catch {}
            }
          },
          width: 480,
          height: 360,
        });
        mediaPipeCamRef.current = cam;
        await cam.start();
      }
    } catch (e) {
      console.warn('[UniversalAirWand] Detection error:', e);
      setCameraError('Magic Air Wand unavailable.');
    }
  };

  useEffect(() => {
    return () => {
      stopTracking();
      if (dwellTimerRef.current) cancelAnimationFrame(dwellTimerRef.current);
    };
  }, [stopTracking]);

  return (
    <>
      {/* Floating Magic Wand Activation Toggle Button (Bottom Right) */}
      <div className={`fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 ${className}`}>
        {!isActive ? (
          <button
            type="button"
            onClick={startTracking}
            disabled={isStarting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-ink dark:bg-slate-900 text-amber dark:text-amber-400 hover:bg-ink/90 dark:hover:bg-slate-800 border border-amber/30 dark:border-amber-500/40 shadow-soft-lg transition-all active:scale-95 font-display font-bold text-xs cursor-pointer"
          >
            <Wand2 className={`w-4 h-4 text-amber dark:text-amber-400 ${isStarting ? 'animate-spin' : ''}`} />
            <span>{isStarting ? 'Connecting Camera...' : '🪄 Turn On Magic Air Wand'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-ink/90 dark:bg-slate-900/90 backdrop-blur-md text-white border border-white/20 text-xs font-display font-bold flex items-center gap-2 shadow-soft-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Magic Air Wand Active</span>
            </div>
            <button
              type="button"
              onClick={stopTracking}
              className="p-2 rounded-full bg-white dark:bg-slate-800 border border-hairline dark:border-slate-700 text-ink dark:text-white hover:bg-sand/60 dark:hover:bg-slate-700 shadow-soft-xs cursor-pointer"
              title="Turn off Magic Wand"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Hidden/PiP Webcam Feed and Pointer Overlay */}
      {isActive && (
        <>
          {/* Live PiP Mirror Preview (Top Right of Screen) */}
          <div className="fixed top-4 right-4 w-28 h-20 rounded-2xl overflow-hidden border-2 border-white/95 shadow-soft-lg bg-black/85 z-50 pointer-events-none">
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
              className="absolute inset-0 w-full h-full -scale-x-100"
            />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/80 text-[8px] font-display font-bold text-white whitespace-nowrap">
              {handDetected ? (isPinching ? '✍️ Air Click' : '🪄 Hovering') : 'Show hand'}
            </div>
          </div>

          {/* Floating Magic Wand Star Pointer following Finger across Entire Screen */}
          {wandPos.visible && (
            <div
              className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
              style={{
                left: wandPos.x,
                top: wandPos.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Dwell Progress Halo */}
              {dwellProgress > 0 && (
                <svg className="absolute -inset-4 w-14 h-14 -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    fill="none"
                    stroke="rgba(232, 163, 61, 0.25)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    fill="none"
                    stroke="#E8A33D"
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 22}
                    strokeDashoffset={2 * Math.PI * 22 * (1 - dwellProgress)}
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Glowing Golden Star Cursor */}
              <div
                className={`relative w-8 h-8 flex items-center justify-center rounded-full transition-transform ${
                  isPinching ? 'scale-125' : 'scale-100'
                }`}
              >
                <div
                  className="absolute inset-0 rounded-full blur-md opacity-80"
                  style={{ backgroundColor: isPinching ? '#FFD700' : accentColor }}
                />
                {isPinching ? (
                  <Flame className="w-6 h-6 text-amber fill-amber animate-bounce-gentle" />
                ) : (
                  <Sparkles className="w-6 h-6 text-white fill-amber drop-shadow-md" />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
