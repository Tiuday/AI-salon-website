import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import type { FaceShape, FaceMeasurements } from '@/types'

// Pin version so the WASM bundle never changes unexpectedly
const MEDIAPIPE_VERSION = '0.10.34'
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

let faceLandmarker: FaceLandmarker | null = null
// Deduplicates concurrent calls — only one network fetch in flight at a time
let inflightPromise: Promise<FaceLandmarker> | null = null

export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarker) return faceLandmarker
  if (inflightPromise) return inflightPromise

  inflightPromise = (async (): Promise<FaceLandmarker> => {
    const filesetResolver = await FilesetResolver.forVisionTasks(WASM_URL)

    const baseOptions = {
      modelAssetPath: MODEL_URL,
    }

    const opts = {
      baseOptions: { ...baseOptions, delegate: 'GPU' as const },
      outputFaceBlendshapes: false,
      runningMode: 'IMAGE' as const,
      numFaces: 1,
    }

    try {
      faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, opts)
    } catch {
      // GPU unavailable on this device — fall back to CPU
      faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        ...opts,
        baseOptions: { ...baseOptions, delegate: 'CPU' as const },
      })
    }

    return faceLandmarker!
  })()

  // Reset on failure so the next call retries from scratch
  inflightPromise.catch(() => {
    inflightPromise = null
    faceLandmarker = null
  })

  return inflightPromise
}

/**
 * Resets the singleton — call this if you need to force a fresh load.
 */
export function resetFaceLandmarker() {
  faceLandmarker = null
  inflightPromise = null
}

/**
 * Derives face shape + measurements from 478 MediaPipe landmarks.
 * Indices: 10 = forehead top, 152 = chin, 234/454 = cheekbones, 58/288 = jawline,
 *          70/300 = outer brow, 107/336 = inner brow, 61/291 = mouth corners.
 */
export function calculateFaceShape(landmarks: { x: number; y: number; z: number }[]): {
  shape: FaceShape
  measurements: FaceMeasurements
} {
  const top       = landmarks[10]
  const chin      = landmarks[152]
  const leftCheek = landmarks[234]
  const rightCheek= landmarks[454]
  const leftJaw   = landmarks[58]
  const rightJaw  = landmarks[288]
  const leftBrow  = landmarks[70]
  const rightBrow = landmarks[300]

  const faceHeight  = Math.abs(chin.y - top.y)
  const cheekWidth  = Math.abs(rightCheek.x - leftCheek.x)
  const jawWidth    = Math.abs(rightJaw.x  - leftJaw.x)
  const browWidth   = Math.abs(rightBrow.x - leftBrow.x) * 1.05

  const safeHeight  = faceHeight  || 1
  const safeChecks  = cheekWidth  || 1

  const widthToHeight = cheekWidth / safeHeight
  const jawToCheek    = jawWidth   / safeChecks
  const browToCheek   = browWidth  / safeChecks
  const chinToJaw     = Math.abs(chin.y - landmarks[288].y) / safeHeight

  let shape: FaceShape = 'oval'

  if (widthToHeight > 0.88) {
    shape = 'round'
  } else if (widthToHeight < 0.72) {
    shape = 'oblong'
  } else if (jawToCheek > 0.82) {
    shape = 'square'
  } else if (browToCheek > jawToCheek + 0.12) {
    shape = 'heart'
  }

  return {
    shape,
    measurements: {
      cheekWidth,
      jawWidth,
      chinWidth:    jawWidth * 0.6,
      browWidth,
      faceHeight,
      widthToHeight,
      jawToCheek,
      chinToJaw,
      browToCheek,
    },
  }
}
