'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanternMascot } from '@/components/ui/LanternMascot';
import { Eye, Camera, Check, Sparkles, Play, VideoOff, RefreshCw } from 'lucide-react';
import { VisionValleyResult, Language } from '@/lib/types';
import { RealGazeTracker, GazeAnalyzer, GazeSample } from '@/lib/gaze-real';
import { classifyVisionValley } from '@/lib/scoring';
import { cameraService } from '@/lib/camera-service';

const READING_PASSAGES_EN = [
  'The little yellow bird sang a sweet song in the green tree.',
  'Three happy dogs ran across the sunny meadow to catch the red ball.',
  'A tiny golden star was shining bright above the quiet mountain trail.'
];

const READING_PASSAGES_HI = [
  'पेड़ की हरी डाली पर एक छोटी चिड़िया मीठा गाना गा रही थी।',
  'तीन सुंदर बत्तखें नीले तालाब के पानी में खुशी से तैर रही थीं।',
  'पहाड़ के ऊपर एक चमकता हुआ प्यारा तारा रोशनी फैला रहा था।'
];

interface CalibrationTarget {
  x: number; // percentage 0-100
  y: number;
}

export const VisionValley: React.FC<VisionValleyProps> = ({
  grade,
  language,
  onComplete,
}) => {
  const { t } = useTranslation();
  const passages = language === 'hi' ? READING_PASSAGES_HI : READING_PASSAGES_EN;

  const [step, setStep] = useState<'permission' | 'calibrating' | 'reading' | 'analyzing'>('permission');
  const [currentPassageIdx, setCurrentPassageIdx] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [calibrationPointIdx, setCalibrationPointIdx] = useState(0);
  const [showSimulatedFallback, setShowSimulatedFallback] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [liveGaze, setLiveGaze] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gazeTrackerRef = useRef<RealGazeTracker | null>(null);
  const gazeAnalyzerRef = useRef<GazeAnalyzer>(new GazeAnalyzer());
  const streamRef = useRef<MediaStream | null>(null);
  const simGazeRafRef = useRef<number | null>(null);

  const calibrationTargets: CalibrationTarget[] = [
    { x: 15, y: 20 }, // Top-Left
    { x: 85, y: 20 }, // Top-Right
    { x: 50, y: 50 }, // Center
    { x: 15, y: 80 }, // Bottom-Left
    { x: 85, y: 80 }, // Bottom-Right
  ];

  // Initialize real gaze tracker
  useEffect(() => {
    if (step !== 'calibrating' || showSimulatedFallback) return;

    let isMounted = true;
    const initTracker = async () => {
      if (!videoRef.current || !overlayCanvasRef.current) return;

      const tracker = new RealGazeTracker();
      gazeTrackerRef.current = tracker;
      const success = await tracker.initialize(videoRef.current, overlayCanvasRef.current);

      if (!isMounted) {
        await tracker.stop();
        return;
      }

      if (!success) {
        setCameraError('Real gaze tracking unavailable. Using simulated demo mode.');
        setShowSimulatedFallback(true);
        return;
      }

      // Receive real gaze samples
      tracker.onGaze((gaze: GazeSample) => {
        if (!isMounted) return;
        setLiveGaze({ x: gaze.x, y: gaze.y });
        gazeAnalyzerRef.current.addSample(gaze.x, gaze.y, gaze.t);
      });

      // Update calibration progress
      const progressInterval = setInterval(() => {
        if (gazeTrackerRef.current && isMounted) {
          setCalibrationProgress(gazeTrackerRef.current.getCalibrationProgress());
        }
      }, 200);
      return () => clearInterval(progressInterval);
    };

    initTracker();

    return () => {
      isMounted = false;
      if (gazeTrackerRef.current) {
        gazeTrackerRef.current.stop();
        gazeTrackerRef.current = null;
      }
    };
  }, [step, showSimulatedFallback]);

  // Initialize webcam with CameraService
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await cameraService.acquireStream({
        width: 480,
        height: 360,
        facingMode: 'user',
      });

      streamRef.current = stream;
      if (videoRef.current) {
        await cameraService.attachToVideo(videoRef.current, stream);
        setStep('calibrating');
      }
    } catch (err: any) {
      console.warn('[VisionValley] Camera access error:', err);
      setCameraError('Camera not available. Using simulated demo mode.');
      setShowSimulatedFallback(true);
    }
  };

  // Handle smooth star pursuit progression
  useEffect(() => {
    if (step !== 'calibrating') return;

    const interval = setInterval(() => {
      setCalibrationPointIdx((prev) => {
        const nextIdx = prev + 1;
        if (nextIdx < calibrationTargets.length) {
          // Capture calibration point for current target
          if (gazeTrackerRef.current) {
            const target = calibrationTargets[nextIdx];
            gazeTrackerRef.current.addCalibrationPoint(target.x / 100, target.y / 100);
          }
          return nextIdx;
        } else {
          clearInterval(interval);
          setStep('reading');
          gazeAnalyzerRef.current.reset();
          if (showSimulatedFallback || !gazeTrackerRef.current) {
            startSimulatedGazeLoop();
          }
          return prev;
        }
      });
    }, 1400);

    return () => clearInterval(interval);
  }, [step, showSimulatedFallback]);

  // Simulated gaze loop for fallback with rAF cancel ref
  const startSimulatedGazeLoop = () => {
    const loop = (now: number) => {
      // Realistic reading scanpath simulation
      const screenW = typeof window !== 'undefined' ? window.innerWidth : 800;
      const screenH = typeof window !== 'undefined' ? window.innerHeight : 600;

      const cycleTime = (now % 3000) / 3000;
      const rawX = screenW * 0.25 + cycleTime * (screenW * 0.5) + (Math.random() - 0.5) * 20;
      const rawY = screenH * 0.45 + Math.sin(now / 800) * 15;

      setLiveGaze({ x: rawX, y: rawY });
      gazeAnalyzerRef.current.addSample(rawX, rawY, now);

      simGazeRafRef.current = requestAnimationFrame(loop);
    };

    simGazeRafRef.current = requestAnimationFrame(loop);
  };

  // Finish Reading Passage
  const handleFinishPassage = () => {
    if (currentPassageIdx < passages.length - 1) {
      setCurrentPassageIdx((prev) => prev + 1);
    } else {
      if (simGazeRafRef.current) {
        cancelAnimationFrame(simGazeRafRef.current);
        simGazeRafRef.current = null;
      }
      if (streamRef.current) {
        cameraService.releaseStream();
        streamRef.current = null;
      }
      if (gazeTrackerRef.current) {
        gazeTrackerRef.current.stop();
        gazeTrackerRef.current = null;
      }

      setStep('analyzing');

      setTimeout(() => {
        const metrics = gazeAnalyzerRef.current.getMetrics();
        const triage = classifyVisionValley(
          metrics.meanFixationDurationMs,
          metrics.regressiveSaccadeRatio,
          grade
        );

        onComplete({
          meanFixationDurationMs: metrics.meanFixationDurationMs,
          regressiveSaccadeRatio: metrics.regressiveSaccadeRatio,
          totalFixations: metrics.totalFixations,
          totalSaccades: metrics.totalSaccades,
          gazeDispersionScore: metrics.gazeDispersionScore,
          triage,
          gazePointsSample: gazeAnalyzerRef.current.getPointsSample(),
        });
      }, 1000);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simGazeRafRef.current) {
        cancelAnimationFrame(simGazeRafRef.current);
        simGazeRafRef.current = null;
      }
      if (streamRef.current) {
        cameraService.releaseStream();
        streamRef.current = null;
      }
      if (gazeTrackerRef.current) {
        gazeTrackerRef.current.stop();
        gazeTrackerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 bg-white border-2 border-hairline rounded-3xl p-4 md:p-6 shadow-soft-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-valley text-white rounded-2xl">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl md:text-2xl text-ink">
              {t('worlds.visionValley')}
            </h2>
            <p className="text-xs font-body text-muted">
              {t('worlds.visionValleySubtitle')}
            </p>
          </div>
        </div>

        {step === 'reading' && (
          <span className="px-3 py-1 bg-valley-light/20 text-valley border border-valley/30 rounded-xl text-xs font-display font-bold">
            Passage {currentPassageIdx + 1}/{passages.length}
          </span>
        )}

        {(step === 'calibrating' || step === 'reading') && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2 h-2 rounded-full bg-valley animate-ping" />
            <span>{showSimulatedFallback ? 'Simulated' : 'Real Gaze Active'}</span>
          </div>
        )}
      </div>

      {/* Main Vision Stage */}
      <Card className="bg-gradient-to-b from-valley-light/10 via-white to-cream border-2 border-valley/30 p-6 md:p-10 pt-12 md:pt-14 shadow-soft-md min-h-[420px] flex flex-col justify-center">
        {/* Step 1: Camera Permission Screen */}
        {step === 'permission' && (
          <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
            <div className="pt-2 pb-1 flex justify-center">
              <LanternMascot mood="neutral" size={80} speechBubble="Let's check our eye tracking light!" />
            </div>

            <div className="p-4 bg-white border-2 border-hairline rounded-2xl text-sm font-body text-muted leading-relaxed">
              <strong className="text-ink">100% In-Memory Privacy:</strong> Camera frames are analyzed in real time on this tablet to detect gaze fixations and line reading smoothness using MediaPipe Face Mesh. No video is ever recorded or uploaded.
            </div>

            {cameraError && (
              <div className="p-3 bg-sunshine-50 border border-sunshine rounded-xl text-xs text-ink">
                {cameraError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={startCamera}
                leftIcon={<Camera className="w-5 h-5" />}
              >
                Enable Camera & Calibrate
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowSimulatedFallback(true);
                  setStep('calibrating');
                }}
              >
                Simulated Demo Mode
              </Button>
            </div>

            {/* Hidden video element for feed */}
            <video ref={videoRef} className="hidden" playsInline muted />
          </div>
        )}

        {/* Step 2: Smooth Constellation Star Pursuit */}
        {step === 'calibrating' && (
          <div className="relative w-full h-[360px] bg-gradient-to-b from-valley-light/10 via-white to-paper border-2 border-hairline rounded-3xl overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <p className="text-xs sm:text-sm font-display font-extrabold tracking-wide text-valley flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber animate-spin-slow" />
                <span>Follow the glowing guide star with your eyes!</span>
                <span className="ml-1 px-2 py-0.5 bg-valley/10 rounded-full text-xs font-bold">({calibrationPointIdx + 1}/5)</span>
              </p>
              <div className="w-28 sm:w-36 h-3.5 bg-paper border border-hairline rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-valley to-amber rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${calibrationProgress}%` }}
                />
              </div>
            </div>

            {/* Constellation Path Guide Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <polyline
                points={calibrationTargets.map(t => `${t.x}%,${t.y}%`).join(' ')}
                fill="none"
                stroke="#3E8FB0"
                strokeWidth="3"
                strokeDasharray="6 8"
              />
            </svg>

            {/* Gliding Celestial Star Target */}
            <div
              style={{
                position: 'absolute',
                left: `${calibrationTargets[calibrationPointIdx].x}%`,
                top: `${calibrationTargets[calibrationPointIdx].y}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'left 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), top 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="w-16 h-16 bg-gradient-to-tr from-amber to-amber-300 text-ink rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(232,163,61,0.6)] animate-pulse border-2 border-white select-none z-20"
              aria-label={`Constellation guide star at checkpoint ${calibrationPointIdx + 1} of 5`}
            >
              <Sparkles className="w-8 h-8 fill-white text-ink animate-spin-slow" />
            </div>

            {/* Live gaze indicator (real only) */}
            {!showSimulatedFallback && liveGaze && (
              <div
                style={{
                  position: 'absolute',
                  left: `${liveGaze.x * 100}%`,
                  top: `${liveGaze.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="w-6 h-6 bg-valley/60 rounded-full pointer-events-none animate-ping"
                aria-hidden="true"
              />
            )}

            {/* Canvas overlay for debug */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%' }}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Step 3: Sentence Reading Tracking */}
        {step === 'reading' && (
          <div className="flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto">
            <LanternMascot
              mood="encouraging"
              size={70}
              speechBubble={
                language === 'hi'
                  ? 'इस वाक्य को मन में धीरे-धीरे पढ़ो!'
                  : 'Read this sentence silently with your eyes!'
              }
            />

            {/* Reading Box */}
            <div className="w-full bg-cream border-2 border-amber/30 rounded-3xl p-8 shadow-soft-sm relative">
              <p className="font-display font-bold text-2xl md:text-3xl text-ink leading-relaxed select-none">
                {passages[currentPassageIdx]}
              </p>

              {/* Live gaze indicator during reading */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-body text-valley">
                <span
                  className={`w-2 h-2 rounded-full animate-ping ${
                    showSimulatedFallback ? 'bg-amber' : 'bg-valley'
                  }`}
                />
                <span>
                  {showSimulatedFallback
                    ? 'Simulated Oculomotor Tracking'
                    : 'Real-time MediaPipe Iris Tracking Active'}
                </span>
              </div>
            </div>

            <Button
              variant="sage"
              size="lg"
              onClick={handleFinishPassage}
              rightIcon={<Check className="w-5 h-5" />}
            >
              {language === 'hi' ? 'पढ़ लिया (I finished reading)' : 'Finished Reading'}
            </Button>
          </div>
        )}

        {/* Step 4: Analyzing State */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center text-center space-y-4 py-8">
            <LanternMascot mood="celebrating" size={90} />
            <h3 className="font-display font-bold text-2xl text-ink">
              Calculating Gaze Fixation & Reading Metrics...
            </h3>
            <div className="w-8 h-8 border-4 border-valley border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </Card>
    </div>
  );
};

interface VisionValleyProps {
  grade: number;
  language: Language;
  onComplete: (result: VisionValleyResult) => void;
}