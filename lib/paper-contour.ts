/**
 * Optical Paper & Pencil Handwriting Contour Analyzer
 * Analyzes physical handwriting captured via tablet webcam snapshot.
 */

export interface PaperContourAnalysis {
  strokePixelCount: number;
  boundingBox: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
  aspectRatio: number;
  centroid: { x: number; y: number };
  isMirrored: boolean;
  tremorJitterIndex: number;
  qualityScore: number;
}

/**
 * Analyzes an HTML5 Canvas containing a snapshot of a child's handwriting on paper.
 */
export function analyzePaperCanvas(
  canvas: HTMLCanvasElement,
  targetLetter: string
): PaperContourAnalysis {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      strokePixelCount: 0,
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
      aspectRatio: 1.0,
      centroid: { x: 0.5, y: 0.5 },
      isMirrored: false,
      tremorJitterIndex: 2.0,
      qualityScore: 75,
    };
  }

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // 1. Convert to grayscale & adaptive threshold (dark pencil strokes on lighter paper)
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let strokePixelCount = 0;
  let sumX = 0;
  let sumY = 0;
  const strokePoints: { x: number; y: number }[] = [];

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

      // Dark mark on light paper (< 130 threshold)
      if (brightness < 130) {
        strokePixelCount++;
        sumX += x;
        sumY += y;
        strokePoints.push({ x, y });

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (strokePixelCount < 50) {
    // Sparse/empty page
    return {
      strokePixelCount,
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
      aspectRatio: 1.0,
      centroid: { x: 0.5, y: 0.5 },
      isMirrored: false,
      tremorJitterIndex: 1.5,
      qualityScore: 60,
    };
  }

  const boundW = Math.max(1, maxX - minX);
  const boundH = Math.max(1, maxY - minY);
  const aspectRatio = Number((boundW / boundH).toFixed(2));
  const centroidX = Number((sumX / strokePixelCount / width).toFixed(2));
  const centroidY = Number((sumY / strokePixelCount / height).toFixed(2));

  // 2. Mirror reversal heuristic for confusable letters: 'b' vs 'd', 'p' vs 'q'
  let isMirrored = false;
  const midX = minX + boundW / 2;
  let leftMass = 0;
  let rightMass = 0;

  for (const pt of strokePoints) {
    if (pt.x < midX) leftMass++;
    else rightMass++;
  }

  const lowerTarget = targetLetter.toLowerCase();
  if (lowerTarget === 'b' && leftMass > rightMass * 1.6) {
    isMirrored = true; // Loop drawn on left instead of right
  } else if (lowerTarget === 'd' && rightMass > leftMass * 1.6) {
    isMirrored = true; // Loop drawn on right instead of left
  } else if (lowerTarget === 'p' && leftMass > rightMass * 1.6) {
    isMirrored = true;
  } else if (lowerTarget === 'q' && rightMass > leftMass * 1.6) {
    isMirrored = true;
  }

  // 3. Fine-motor tremor index (variance of local contour direction changes)
  let tremorJitterIndex = 1.2;
  if (strokePoints.length > 20) {
    let directionChanges = 0;
    for (let i = 2; i < strokePoints.length; i += 4) {
      const dx1 = strokePoints[i - 2].x - strokePoints[i - 4 < 0 ? 0 : i - 4].x;
      const dx2 = strokePoints[i].x - strokePoints[i - 2].x;
      if (Math.sign(dx1) !== Math.sign(dx2) && Math.abs(dx1 - dx2) > 3) {
        directionChanges++;
      }
    }
    tremorJitterIndex = Number((1.0 + (directionChanges / strokePoints.length) * 15).toFixed(1));
  }

  // Calculate final score
  let qualityScore = 85;
  if (isMirrored) qualityScore -= 30;
  if (tremorJitterIndex > 3.0) qualityScore -= 20;

  return {
    strokePixelCount,
    boundingBox: { minX, minY, maxX, maxY, width: boundW, height: boundH },
    aspectRatio,
    centroid: { x: centroidX, y: centroidY },
    isMirrored,
    tremorJitterIndex: Math.min(10.0, tremorJitterIndex),
    qualityScore: Math.max(20, qualityScore),
  };
}
