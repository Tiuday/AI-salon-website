import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { FaceShape, FaceMeasurements } from '@/types'

let faceLandmarker: FaceLandmarker | null = null

/**
 * Singleton to get/initialize the MediaPipe Face Landmarker
 */
export async function getFaceLandmarker() {
  if (faceLandmarker) return faceLandmarker

  const filesetResolver = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  )

  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: 'GPU',
    },
    outputFaceBlendshapes: true,
    runningMode: 'IMAGE',
    numFaces: 1,
  })

  return faceLandmarker
}

/**
 * Calculates geometric measurements from 478 face landmarks.
 * Mapping based on standard face shape ratios.
 */
export function calculateFaceShape(landmarks: any[]): { shape: FaceShape; measurements: FaceMeasurements } {
  // Simple fallback/mock implementation for the algorithm
  // In a full version, we map specific indices (e.g. 10 for forehead, 152 for chin)
  // to calculate widthToHeight, jawToCheek, etc.
  
  // landmark indices (MediaPipe 468/478 format):
  // 10: top of forehead
  // 152: chin
  // 234, 454: cheekbones (widest points)
  // 58, 288: jawline
  
  const top = landmarks[10]
  const chin = landmarks[152]
  const leftCheek = landmarks[234]
  const rightCheek = landmarks[454]
  const leftJaw = landmarks[58]
  const rightJaw = landmarks[288]

  const faceHeight = Math.abs(chin.y - top.y)
  const cheekWidth = Math.abs(rightCheek.x - leftCheek.x)
  const jawWidth = Math.abs(rightJaw.x - leftJaw.x)

  const widthToHeight = cheekWidth / faceHeight
  const jawToCheek = jawWidth / cheekWidth

  let shape: FaceShape = 'oval'

  if (widthToHeight > 0.85) {
    shape = 'round'
  } else if (widthToHeight < 0.75) {
    shape = 'oblong'
  } else if (jawToCheek > 0.8) {
    shape = 'square'
  } else if (jawToCheek < 0.6) {
    shape = 'heart'
  }

  return {
    shape,
    measurements: {
      cheekWidth,
      jawWidth,
      chinWidth: 0.2, // placeholder
      browWidth: 0.4, // placeholder
      faceHeight,
      widthToHeight,
      jawToCheek,
      chinToJaw: 0.5,
      browToCheek: 0.8
    }
  }
}
