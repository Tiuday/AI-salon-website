/**
 * Face Shape Classifier
 *
 * Input:  68 facial landmarks from face-api.js (iBUG 300-W convention)
 * Output: FaceShapeResult — classified shape + confidence + raw measurements
 *
 * ── Landmark index reference (68-point model) ──────────────────
 *
 *   0–16   Jaw/face outline (left → right)
 *     0  far-left jaw
 *     4  left mid-jaw
 *     6  left chin-edge
 *     8  chin tip (bottom of face)
 *    10  right chin-edge
 *    12  right mid-jaw
 *    16  far-right jaw
 *
 *   2, 14  Cheekbone (widest point of face outline)
 *
 *   17–21  Right eyebrow (inner → outer)
 *   22–26  Left eyebrow  (inner → outer)
 *   17     outer-right brow   26  outer-left brow
 *
 *   27     Nose bridge (top) — used as face-height anchor
 *   30     Nose tip
 *
 *   36–41  Right eye
 *   42–47  Left eye
 *
 * ── Classification logic ───────────────────────────────────────
 *
 *  Three primary ratios drive the decision:
 *
 *  1. widthToHeight  = cheekWidth / faceHeight
 *     Low  (<0.68)  → Oblong (tall narrow face)
 *     High (>0.88)  → Round  (wide short face)
 *     Mid           → Oval / Square / Heart
 *
 *  2. jawToCheek  = jawWidth / cheekWidth
 *     Low  (<0.72)  → Heart (narrow jaw, wide cheeks)
 *     High (>0.88)  → Square / Round (strong, wide jaw)
 *     Mid           → Oval / Oblong
 *
 *  3. browToCheek = browWidth / cheekWidth
 *     High (>1.02)  → Heart (wide forehead overhangs cheeks)
 *     Low  (<0.88)  → Oval (forehead narrower than cheeks)
 */

import type { FaceShapeResult, FaceMeasurements, FaceShape, Point } from '@/types'

// ── Geometry helpers ───────────────────────────────────────────

function dist(a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

// ── Measurement extraction ─────────────────────────────────────

/**
 * Derive geometric measurements from 68 landmark points.
 * All widths/heights are in the same pixel coordinate space
 * so ratios are scale-invariant.
 */
export function extractMeasurements(pts: Point[]): FaceMeasurements {
  if (pts.length < 68) {
    throw new Error(`Expected 68 landmarks, got ${pts.length}`)
  }

  // Face width — cheekbone level (widest part of face outline)
  const cheekWidth = dist(pts[2], pts[14])

  // Jaw width — mid-jaw (below cheekbones, above chin)
  const jawWidth = dist(pts[4], pts[12])

  // Chin width — narrowest horizontal span of the chin
  const chinWidth = dist(pts[6], pts[10])

  // Eyebrow span — proxy for forehead width
  // Outer right brow to outer left brow, scaled up slightly
  // (eyebrows sit a bit inside the actual forehead edges)
  const rawBrowWidth = dist(pts[17], pts[26])
  const browWidth = rawBrowWidth * 1.08  // empirical scale factor

  // Face height — from nose bridge (pt 27) to chin tip (pt 8)
  // We don't use the forehead top because face-api.js doesn't landmark it.
  // The brow-to-chin height gives us a consistent, detectable span.
  const faceHeight = dist(pts[27], pts[8])

  // Derived ratios
  const widthToHeight = cheekWidth / faceHeight
  const jawToCheek    = jawWidth   / cheekWidth
  const chinToJaw     = chinWidth  / jawWidth
  const browToCheek   = browWidth  / cheekWidth

  return {
    cheekWidth,
    jawWidth,
    chinWidth,
    browWidth,
    faceHeight,
    widthToHeight,
    jawToCheek,
    chinToJaw,
    browToCheek,
  }
}

// ── Scoring functions ──────────────────────────────────────────
// Each function returns 0–1: how closely the measurements match that shape.
// A sigmoid-like response centered on the ideal ratio range.

function gaussian(x: number, mean: number, sigma: number): number {
  return Math.exp(-0.5 * ((x - mean) / sigma) ** 2)
}

function scoreOval(m: FaceMeasurements): number {
  // Oval: moderately tall (W/H ~0.72), tapered jaw, forehead ≈ cheeks
  return (
    gaussian(m.widthToHeight, 0.72, 0.07) * 0.40 +
    gaussian(m.jawToCheek,    0.80, 0.08) * 0.35 +
    gaussian(m.browToCheek,   0.96, 0.06) * 0.25
  )
}

function scoreRound(m: FaceMeasurements): number {
  // Round: wide (W/H ~0.90), full jaw, soft chin, forehead ≈ cheeks
  return (
    gaussian(m.widthToHeight, 0.90, 0.07) * 0.40 +
    gaussian(m.jawToCheek,    0.90, 0.07) * 0.35 +
    gaussian(m.chinToJaw,     0.85, 0.08) * 0.25
  )
}

function scoreSquare(m: FaceMeasurements): number {
  // Square: moderate height (W/H ~0.80), very strong/wide jaw, flat chin
  return (
    gaussian(m.widthToHeight, 0.80, 0.07) * 0.35 +
    gaussian(m.jawToCheek,    0.92, 0.06) * 0.40 +
    gaussian(m.chinToJaw,     0.88, 0.07) * 0.25
  )
}

function scoreHeart(m: FaceMeasurements): number {
  // Heart: wide forehead > cheeks, narrow jaw, pointed chin
  return (
    gaussian(m.browToCheek,   1.06, 0.06) * 0.40 +
    gaussian(m.jawToCheek,    0.68, 0.07) * 0.35 +
    gaussian(m.chinToJaw,     0.68, 0.08) * 0.25
  )
}

function scoreOblong(m: FaceMeasurements): number {
  // Oblong: tall and narrow (W/H ~0.62), moderate jaw
  return (
    gaussian(m.widthToHeight, 0.62, 0.07) * 0.50 +
    gaussian(m.jawToCheek,    0.82, 0.08) * 0.30 +
    gaussian(m.browToCheek,   0.96, 0.06) * 0.20
  )
}

// ── Main classifier ────────────────────────────────────────────

/**
 * Classify face shape from 68 landmark points.
 *
 * Returns the highest-scoring shape with its confidence (0–1)
 * and the full score breakdown for debug UI.
 */
export function classifyFaceShape(landmarks: Point[]): FaceShapeResult {
  const m = extractMeasurements(landmarks)

  const rawScores: Record<FaceShape, number> = {
    oval:   scoreOval(m),
    round:  scoreRound(m),
    square: scoreSquare(m),
    heart:  scoreHeart(m),
    oblong: scoreOblong(m),
  }

  // Normalise so scores sum to 1 (soft-max style, but simpler linear normalisation)
  const total = Object.values(rawScores).reduce((sum, v) => sum + v, 0)
  const scores = (
    Object.fromEntries(
      Object.entries(rawScores).map(([k, v]) => [k, v / total])
    )
  ) as Record<FaceShape, number>

  // Pick winner
  const shape = (
    Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0]
  ) as FaceShape

  const confidence = scores[shape]

  return { shape, confidence, measurements: m, scores }
}

// ── Fallback for manual selection ─────────────────────────────

/**
 * Build a stub FaceShapeResult when the user manually selects
 * their face shape (no camera detection). Confidence = 1.0
 */
export function manualShapeResult(shape: FaceShape): FaceShapeResult {
  const equalScores = {
    oval: 0, round: 0, square: 0, heart: 0, oblong: 0,
    [shape]: 1.0,
  } as Record<FaceShape, number>

  return {
    shape,
    confidence: 1.0,
    measurements: {
      cheekWidth: 0, jawWidth: 0, chinWidth: 0,
      browWidth: 0, faceHeight: 0,
      widthToHeight: 0, jawToCheek: 0,
      chinToJaw: 0, browToCheek: 0,
    },
    scores: equalScores,
  }
}

// ── Hairstyle why-it-works copy ───────────────────────────────

export const SHAPE_ADVICE: Record<FaceShape, {
  label:       string
  description: string
  avoid:       string
  love:        string
}> = {
  oval: {
    label:       'Oval',
    description: 'Balanced proportions — the most versatile face shape. Almost any style works beautifully.',
    avoid:       'Nothing is off-limits, but very voluminous sides can make the face appear wider.',
    love:        'Blunt bobs, curtain bangs, layered waves, sleek ponytails.',
  },
  round: {
    label:       'Round',
    description: 'Full cheeks and a soft jaw line. Styles that elongate and add height are most flattering.',
    avoid:       'Blunt bobs at chin length, very short crops, full fringes — these widen the face.',
    love:        'Long layers, side-swept bangs, high ponytails, textured waves starting below the chin.',
  },
  square: {
    label:       'Square',
    description: 'A strong jaw and defined angles. Soft, textured styles that frame the face balance the structure.',
    avoid:       'Blunt-cut bobs, geometric shapes, severe centre parts — these echo the squareness.',
    love:        'Soft layers, side parts, beachy waves, long bobs with movement.',
  },
  heart: {
    label:       'Heart',
    description: 'Wider forehead and cheekbones that taper to a narrow jaw and pointed chin. Volume near the jaw is your friend.',
    avoid:       'Very short crops, volume at the crown, sleek off-the-face styles.',
    love:        'Side-swept bangs, chin-length bobs, full waves from the jaw down, curtain bangs.',
  },
  oblong: {
    label:       'Oblong',
    description: 'Long and narrow — length and angularity are already there. Add width and break up the vertical length.',
    avoid:       'Very long, straight styles with no width; centre parts with no layers.',
    love:        'Blunt fringes, bobs, shoulder-length waves, volume at the sides.',
  },
}
