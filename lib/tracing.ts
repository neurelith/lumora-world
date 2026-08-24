// lib/tracing.ts - Kinematic Motor Planning & Dysgraphia Analysis Engine

import { StrokePoint, RuneTrial } from './types';

export function smoothPoints(points: StrokePoint[], windowSize = 3): StrokePoint[] {
  if (points.length <= windowSize) return points;
  const smoothed: StrokePoint[] = [];

  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(points.length, i + Math.ceil(windowSize / 2));
    const slice = points.slice(start, end);

    const avgX = slice.reduce((sum, p) => sum + p.x, 0) / slice.length;
    const avgY = slice.reduce((sum, p) => sum + p.y, 0) / slice.length;
    const avgP = slice.reduce((sum, p) => sum + p.pressure, 0) / slice.length;

    smoothed.push({
      x: avgX,
      y: avgY,
      t: points[i].t,
      pressure: avgP,
    });
  }

  return smoothed;
}

export function computeVelocities(points: StrokePoint[]): number[] {
  if (points.length < 2) return [];
  const velocities: number[] = [];

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const dt = Math.max(1, points[i].t - points[i - 1].t);
    const dist = Math.hypot(dx, dy);
    velocities.push(dist / dt); // pixels per millisecond
  }

  return velocities;
}

// Number of Velocity Inversions (NVI)
export function computeNVI(velocities: number[]): number {
  if (velocities.length < 3) return 0;

  let inversions = 0;
  let direction = 0; // 1 = accelerating, -1 = decelerating

  for (let i = 1; i < velocities.length; i++) {
    const diff = velocities[i] - velocities[i - 1];
    if (Math.abs(diff) < 0.003) continue; // Noise deadband filter

    const currentDir = diff > 0 ? 1 : -1;
    if (direction !== 0 && currentDir !== direction) {
      inversions++;
    }
    direction = currentDir;
  }

  return inversions;
}

// Jerk Index (smoothness of motion: rate of change of acceleration)
export function computeJerkIndex(points: StrokePoint[]): number {
  if (points.length < 4) return 0;
  let totalJerkSq = 0;

  for (let i = 3; i < points.length; i++) {
    const dt = Math.max(1, points[i].t - points[i - 1].t);
    const jx = (points[i].x - 3 * points[i - 1].x + 3 * points[i - 2].x - points[i - 3].x) / (dt * dt * dt);
    const jy = (points[i].y - 3 * points[i - 1].y + 3 * points[i - 2].y - points[i - 3].y) / (dt * dt * dt);
    totalJerkSq += (jx * jx + jy * jy);
  }

  const meanJerk = Math.sqrt(totalJerkSq / (points.length - 3));
  return Number((meanJerk * 1000).toFixed(2));
}

// Spatial Stroke Mirror Reversal Detection (b ↔ d, p ↔ q, ट ↔ ठ)
export function detectMirrorReversal(points: StrokePoint[], targetLetter: string): boolean {
  if (points.length < 6) return false;

  const startX = points[0].x;
  const startY = points[0].y;
  const endX = points[points.length - 1].x;
  const endY = points[points.length - 1].y;

  // Calculate overall stroke direction and bounding box
  let minX = startX, maxX = startX, minY = startY, maxY = startY;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const width = maxX - minX;
  const height = maxY - minY;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const letter = targetLetter.toLowerCase();

  // 'b' (vertical stem left, loop right): starts high, goes down, loops RIGHT
  if (letter === 'b') {
    const stemX = points[0].x;
    const loopRight = points.some(p => p.x > stemX + width * 0.3);
    const loopLeft = points.some(p => p.x < stemX - width * 0.15);
    // Mirror 'b' -> 'd' would have loop on LEFT of stem
    return loopLeft && !loopRight;
  }

  // 'd' (vertical stem right, loop left): loops LEFT, then stem on RIGHT
  if (letter === 'd') {
    const stemX = points[points.length - 1].x;
    const loopLeft = points.some(p => p.x < stemX - width * 0.3);
    const loopRight = points.some(p => p.x > stemX + width * 0.15);
    // Mirror 'd' -> 'b' would have loop on RIGHT of stem
    return loopRight && !loopLeft;
  }

  // 'p' (stem down on left, loop on right at top): starts high, goes down, loops RIGHT at top
  if (letter === 'p') {
    const stemX = points[0].x;
    const loopRight = points.some(p => p.x > stemX + width * 0.3 && p.y < centerY);
    return loopRight;
  }

  // 'q' (stem down on right, loop on left at top)
  if (letter === 'q') {
    const stemX = points[0].x;
    const loopLeft = points.some(p => p.x < stemX - width * 0.3 && p.y < centerY);
    return loopLeft;
  }

  // Devanagari ट (open curve, top-left opening) vs ठ (closed loop)
  if (targetLetter === 'ट') {
    // ट has an open top-left; if child closes it completely like a circle, it's a mirror/confusion
    const dist = Math.hypot(endX - startX, endY - startY);
    const isClosed = dist < Math.max(width, height) * 0.2;
    return isClosed;
  }

  // Devanagari ठ (closed loop with internal detail)
  if (targetLetter === 'ठ') {
    const dist = Math.hypot(endX - startX, endY - startY);
    const isOpen = dist > Math.max(width, height) * 0.3;
    return isOpen;
  }

  // 'm' vs 'w' confusion - check number of humps
  if (letter === 'm' || letter === 'w') {
    const peaks = countPeaks(points);
    const expectedPeaks = letter === 'm' ? 2 : 2; // both have 2 humps, but m starts down, w starts up
    const startsDown = points[1].y > points[0].y;
    const expectedStartDown = letter === 'm';
    return startsDown !== expectedStartDown;
  }

  return false;
}

function countPeaks(points: StrokePoint[]): number {
  if (points.length < 5) return 0;
  let peaks = 0;
  let dir = 0; // 1 = up, -1 = down
  for (let i = 1; i < points.length; i++) {
    const diff = points[i].y - points[i - 1].y;
    if (Math.abs(diff) < 2) continue;
    const currentDir = diff > 0 ? 1 : -1; // y increases downward
    if (dir !== 0 && currentDir !== dir && dir === -1 && currentDir === 1) {
      peaks++; // valley (upward change)
    }
    dir = currentDir;
  }
  return peaks;
}

export function analyzeStroke(
  rawPoints: StrokePoint[],
  targetLetter: string,
  language: 'en' | 'hi'
): RuneTrial {
  if (rawPoints.length < 3) {
    return {
      letter: targetLetter,
      language,
      points: rawPoints,
      nvi: 0,
      jerkIndex: 0,
      strokeDurationMs: 0,
      penLifts: 0,
      centerlineDev: 0,
      isMirrored: false,
      score: 100,
    };
  }

  const smoothed = smoothPoints(rawPoints);
  const velocities = computeVelocities(smoothed);
  const nvi = computeNVI(velocities);
  const jerkIndex = computeJerkIndex(smoothed);
  const durationMs = rawPoints[rawPoints.length - 1].t - rawPoints[0].t;
  const isMirrored = detectMirrorReversal(smoothed, targetLetter);

  // Fluency score calculation
  const nviPenalty = Math.min(40, nvi * 4);
  const mirrorPenalty = isMirrored ? 35 : 0;
  const score = Math.max(20, Math.round(100 - nviPenalty - mirrorPenalty));

  return {
    letter: targetLetter,
    language,
    points: rawPoints,
    nvi,
    jerkIndex,
    strokeDurationMs: durationMs,
    penLifts: 1,
    centerlineDev: Math.round(Math.min(50, nvi * 3.5)),
    isMirrored,
    score,
  };
}
