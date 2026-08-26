/**
 * Dynamic Time Warping (DTW) & Modified Hausdorff Distance (MHD) Engine
 * For Clinical Letter Shape & Kinematic Trajectory Matching
 */

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Resample a stroke trajectory to N equidistant points
 */
export function resampleStroke(points: Point2D[], n: number = 64): Point2D[] {
  if (points.length === 0) return [];
  if (points.length === 1) return Array(n).fill({ ...points[0] });

  // 1. Calculate total path length
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    totalLength += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }

  if (totalLength === 0) return Array(n).fill({ ...points[0] });

  const interval = totalLength / (n - 1);
  const resampled: Point2D[] = [{ ...points[0] }];
  let currentDist = 0;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const segmentLength = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    if (segmentLength === 0) continue;

    if (currentDist + segmentLength >= interval) {
      const t = (interval - currentDist) / segmentLength;
      const newPt: Point2D = {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y),
      };
      resampled.push(newPt);
      points.splice(i, 0, newPt);
      currentDist = 0;
    } else {
      currentDist += segmentLength;
    }
  }

  while (resampled.length < n) {
    resampled.push({ ...points[points.length - 1] });
  }

  return resampled.slice(0, n);
}

/**
 * Normalize stroke to unit bounding box [0, 1]
 */
export function normalizeStroke(points: Point2D[]): Point2D[] {
  if (points.length === 0) return [];

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  points.forEach((p) => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });

  const width = Math.max(1e-5, maxX - minX);
  const height = Math.max(1e-5, maxY - minY);
  const scale = Math.max(width, height);

  return points.map((p) => ({
    x: (p.x - minX) / scale,
    y: (p.y - minY) / scale,
  }));
}

/**
 * Compute Dynamic Time Warping (DTW) Distance between two trajectories
 */
export function computeDTWDistance(strokeA: Point2D[], strokeB: Point2D[]): number {
  const n = strokeA.length;
  const m = strokeB.length;
  if (n === 0 || m === 0) return 1.0;

  const dtw: number[][] = Array(n + 1)
    .fill(0)
    .map(() => Array(m + 1).fill(Infinity));

  dtw[0][0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = Math.hypot(
        strokeA[i - 1].x - strokeB[j - 1].x,
        strokeA[i - 1].y - strokeB[j - 1].y
      );
      dtw[i][j] = cost + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
    }
  }

  return dtw[n][m] / (n + m);
}

/**
 * Compute Modified Hausdorff Distance (MHD) for spatial shape similarity
 */
export function computeHausdorffDistance(strokeA: Point2D[], strokeB: Point2D[]): number {
  if (strokeA.length === 0 || strokeB.length === 0) return 1.0;

  const distAtoB = strokeA.map((a) => {
    let minDist = Infinity;
    strokeB.forEach((b) => {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      minDist = Math.min(minDist, d);
    });
    return minDist;
  });

  const distBtoA = strokeB.map((b) => {
    let minDist = Infinity;
    strokeA.forEach((a) => {
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      minDist = Math.min(minDist, d);
    });
    return minDist;
  });

  const meanA = distAtoB.reduce((acc, d) => acc + d, 0) / strokeA.length;
  const meanB = distBtoA.reduce((acc, d) => acc + d, 0) / strokeB.length;

  return Math.max(meanA, meanB);
}

/**
 * Generate standard canonical stroke reference for common letters
 */
export function getCanonicalLetterTrajectory(letter: string): Point2D[] {
  const pts: Point2D[] = [];
  const char = letter.toLowerCase();

  if (char === 'b') {
    // Top-to-bottom stem
    for (let y = 0.1; y <= 0.9; y += 0.05) pts.push({ x: 0.25, y });
    // Bottom loop
    for (let a = -Math.PI / 2; a <= Math.PI / 2; a += 0.1) {
      pts.push({ x: 0.25 + 0.3 * Math.cos(a), y: 0.65 + 0.25 * Math.sin(a) });
    }
  } else if (char === 'd') {
    // Circle loop
    for (let a = 0; a <= Math.PI * 2; a += 0.1) {
      pts.push({ x: 0.45 + 0.25 * Math.cos(a), y: 0.65 + 0.25 * Math.sin(a) });
    }
    // Right stem
    for (let y = 0.1; y <= 0.9; y += 0.05) pts.push({ x: 0.7, y });
  } else if (char === 'p') {
    for (let y = 0.2; y <= 0.95; y += 0.05) pts.push({ x: 0.25, y });
    for (let a = -Math.PI / 2; a <= Math.PI / 2; a += 0.1) {
      pts.push({ x: 0.25 + 0.3 * Math.cos(a), y: 0.4 + 0.2 * Math.sin(a) });
    }
  } else {
    // Default circle / curve
    for (let a = 0; a <= Math.PI * 2; a += 0.1) {
      pts.push({ x: 0.5 + 0.35 * Math.cos(a), y: 0.5 + 0.35 * Math.sin(a) });
    }
  }

  return normalizeStroke(pts);
}

/**
 * Calculate Stroke Accuracy Score (0 - 100%)
 */
export function calculateStrokeAccuracyScore(drawnPoints: Point2D[], targetLetter: string): number {
  if (drawnPoints.length < 5) return 0;

  const resampled = resampleStroke(drawnPoints, 64);
  const normalized = normalizeStroke(resampled);
  const canonical = getCanonicalLetterTrajectory(targetLetter);

  const dtw = computeDTWDistance(normalized, canonical);
  const mhd = computeHausdorffDistance(normalized, canonical);

  const combinedError = dtw * 0.6 + mhd * 0.4;
  // Error of 0 -> 100%, Error of 0.4 -> 0%
  const score = Math.max(0, Math.min(100, Math.round((1 - combinedError / 0.35) * 100)));
  return score;
}
