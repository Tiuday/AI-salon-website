/**
 * Face Detection Web Worker
 *
 * Runs face-api.js inference OFF the main thread, keeping the UI
 * smooth (camera feed + Framer animations) during ML inference.
 *
 * ── Why a Web Worker? ─────────────────────────────────────────
 * face-api.js with SSD MobileNet takes ~80–150ms per frame on
 * mid-range devices. That's 5–9 dropped frames at 60fps if run
 * on the main thread. The Worker keeps inference async.
 *
 * ── Message Protocol (WorkerInMessage / WorkerOutMessage) ─────
 *
 * → INIT                   load models (once on mount)
 * ← READY                  models loaded, ready to detect
 *
 * → DETECT { imageData }   send a captured canvas frame
 * ← RESULT { result }      face detected + classified
 * ← NO_FACE                no face in frame
 * ← ERROR { message }      something went wrong
 *
 * ── Model files ───────────────────────────────────────────────
 * Served from /public/models/face-api/
 * Required:
 *   ssd_mobilenetv1_model-weights_manifest.json  + shards
 *   face_landmark_68_model-weights_manifest.json + shards
 *
 * Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
 */

// Web Workers don't support ES module imports from `next/` or relative imports
// via Webpack's normal path. We use a self-contained import.
// This file is loaded as: new Worker(new URL('./faceWorker.ts', import.meta.url))

import * as faceapi from 'face-api.js'
import { classifyFaceShape } from './classifyShape'
import type { WorkerInMessage, WorkerOutMessage, Point } from '@/types'

// ── State ──────────────────────────────────────────────────────
let modelsLoaded = false

// ── Model loading ──────────────────────────────────────────────
async function loadModels(): Promise<void> {
  const MODEL_URL = '/models/face-api'

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  ])

  modelsLoaded = true
}

// ── Detection + classification ─────────────────────────────────
async function detectAndClassify(
  imageData: ImageData,
  width: number,
  height: number
): Promise<void> {
  // Reconstruct an OffscreenCanvas from the ImageData
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)

  // face-api.js accepts HTMLCanvasElement or OffscreenCanvas
  const detection = await faceapi
    .detectSingleFace(canvas as unknown as HTMLCanvasElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()

  if (!detection) {
    postMessage({ type: 'NO_FACE' } satisfies WorkerOutMessage)
    return
  }

  // Extract the 68 landmark positions
  const rawPositions = detection.landmarks.positions
  const pts: Point[] = rawPositions.map((p) => ({ x: p.x, y: p.y }))

  const result = classifyFaceShape(pts)
  postMessage({ type: 'RESULT', result } satisfies WorkerOutMessage)
}

// ── Message handler ────────────────────────────────────────────
self.addEventListener('message', async (event: MessageEvent<WorkerInMessage>) => {
  const msg = event.data

  try {
    switch (msg.type) {
      case 'INIT': {
        await loadModels()
        postMessage({ type: 'READY' } satisfies WorkerOutMessage)
        break
      }

      case 'DETECT': {
        if (!modelsLoaded) {
          postMessage({
            type: 'ERROR',
            message: 'Models not loaded yet. Send INIT first.',
          } satisfies WorkerOutMessage)
          return
        }
        await detectAndClassify(msg.imageData, msg.width, msg.height)
        break
      }

      default: {
        const _exhaustive: never = msg
        void _exhaustive
      }
    }
  } catch (err) {
    postMessage({
      type: 'ERROR',
      message: err instanceof Error ? err.message : 'Unknown face detection error',
    } satisfies WorkerOutMessage)
  }
})

export {}  // Make this a module (required for TypeScript worker files)
